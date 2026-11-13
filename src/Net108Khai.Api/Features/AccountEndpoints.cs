using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Net108Khai.Api.Data;
using Net108Khai.Api.Domain;

namespace Net108Khai.Api.Features;

public static class AccountEndpoints
{
    public static void MapAccountEndpoints(this WebApplication app)
    {
        var auth = app.MapGroup("/api/v1/auth").RequireRateLimiting("auth");
        auth.MapPost("/confirm-email-code", ConfirmEmailCode);
        auth.MapGet("/external/{provider}/start", StartExternal);
        auth.MapGet("/external/{provider}/callback", ExternalCallback);
        auth.MapPost("/external/exchange", ExchangeExternalCode);
        auth.MapGet("/me", Me).RequireAuthorization();
        auth.MapPost("/logout", Logout).RequireAuthorization();
    }

    private static async Task<IResult> ConfirmEmailCode(
        ConfirmEmailCodeRequest request, UserManager<CommerceUser> users)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Code) || request.Code.Length > 4096)
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["code"] = ["Email and code are required."] });
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null) return Results.BadRequest(new { error = "invalid_code" });
        string token;
        try { token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code)); }
        catch (Exception ex) when (ex is FormatException or ArgumentException)
        { return Results.BadRequest(new { error = "invalid_code" }); }
        var result = await users.ConfirmEmailAsync(user, token);
        return result.Succeeded ? Results.Ok(new { status = "email_confirmed" }) : Results.BadRequest(new { error = "invalid_or_expired_code" });
    }

    private static async Task<IResult> StartExternal(string provider, IAuthenticationSchemeProvider schemes, IConfiguration config)
    {
        var scheme = NormalizeProvider(provider);
        if (scheme is null || await schemes.GetSchemeAsync(scheme) is null)
            return Results.NotFound(new { error = "provider_not_configured" });
        if (string.IsNullOrWhiteSpace(config["Frontend:AuthCallbackUrl"]))
            return Results.Problem("Frontend:AuthCallbackUrl is required.", statusCode: 503);
        var properties = new AuthenticationProperties
        {
            RedirectUri = $"/api/v1/auth/external/{scheme.ToLowerInvariant()}/callback"
        };
        properties.Items["provider"] = scheme;
        return Results.Challenge(properties, [scheme]);
    }

    private static async Task<IResult> ExternalCallback(
        string provider, HttpContext context, UserManager<CommerceUser> users,
        IEmailSender<CommerceUser> sender, CommerceDbContext db, IConfiguration config)
    {
        var scheme = NormalizeProvider(provider);
        var callbackUrl = config["Frontend:AuthCallbackUrl"];
        if (scheme is null || string.IsNullOrWhiteSpace(callbackUrl)) return Results.BadRequest();
        var external = await context.AuthenticateAsync("ExternalCookie");
        await context.SignOutAsync("ExternalCookie");
        if (!external.Succeeded || external.Principal is null ||
            !external.Properties!.Items.TryGetValue("provider", out var actualProvider) || actualProvider != scheme)
            return RedirectError(callbackUrl, "external_auth_failed");
        var providerId = external.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = external.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(providerId) || string.IsNullOrWhiteSpace(email))
            return RedirectError(callbackUrl, "provider_email_required");

        var user = await users.FindByLoginAsync(scheme, providerId);
        if (user is null)
        {
            if (await users.FindByEmailAsync(email) is not null)
                return RedirectError(callbackUrl, "account_exists_use_password");
            user = new CommerceUser { UserName = email, Email = email, EmailConfirmed = false };
            await using var tx = await db.Database.BeginTransactionAsync();
            try
            {
                var created = await users.CreateAsync(user);
                if (!created.Succeeded) return RedirectError(callbackUrl, "account_creation_failed");
                var linked = await users.AddLoginAsync(user, new UserLoginInfo(scheme, providerId, scheme));
                if (!linked.Succeeded) return RedirectError(callbackUrl, "account_link_failed");
                await tx.CommitAsync();
            }
            catch (DbUpdateException)
            {
                return RedirectError(callbackUrl, "account_exists_use_password");
            }
        }
        if (!await users.IsEmailConfirmedAsync(user))
        {
            var token = await users.GenerateEmailConfirmationTokenAsync(user);
            var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var link = $"{context.Request.Scheme}://{context.Request.Host}/api/v1/auth/confirmEmail?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(encoded)}";
            await sender.SendConfirmationLinkAsync(user, email, link);
            return Results.Redirect(AppendQuery(callbackUrl, "status", "verify_email"));
        }
        if (await users.IsLockedOutAsync(user)) return RedirectError(callbackUrl, "account_locked");

        var code = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        db.ExternalLoginTickets.Add(new ExternalLoginTicket
        {
            CodeHash = Hash(code), UserId = user.Id, ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(2)
        });
        await db.SaveChangesAsync();
        return Results.Redirect(AppendQuery(callbackUrl, "code", code));
    }

    private static async Task<IResult> ExchangeExternalCode(
        ExchangeExternalCodeRequest request, HttpContext context, CommerceDbContext db,
        UserManager<CommerceUser> users, SignInManager<CommerceUser> signIn)
    {
        if (string.IsNullOrWhiteSpace(request.Code) || request.Code.Length > 200)
            return Results.BadRequest(new { error = "invalid_code" });
        await using var tx = await db.Database.BeginTransactionAsync();
        var hash = Hash(request.Code);
        var ticket = await db.ExternalLoginTickets.FromSqlInterpolated(
            $"SELECT * FROM [commerce].[ExternalLoginTickets] WITH (UPDLOCK, HOLDLOCK, ROWLOCK) WHERE [CodeHash] = {hash}").SingleOrDefaultAsync();
        if (ticket is null || ticket.RedeemedAt is not null || ticket.ExpiresAt <= DateTimeOffset.UtcNow)
            return Results.BadRequest(new { error = "invalid_or_expired_code" });
        var user = await users.FindByIdAsync(ticket.UserId);
        if (user is null || !await users.IsEmailConfirmedAsync(user) || await users.IsLockedOutAsync(user))
            return Results.Forbid();
        ticket.RedeemedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        await context.SignInAsync(IdentityConstants.BearerScheme, await signIn.CreateUserPrincipalAsync(user));
        return Results.Empty;
    }

    private static async Task<IResult> Me(ClaimsPrincipal principal, UserManager<CommerceUser> users)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null) return Results.Unauthorized();
        return Results.Ok(new { user.Id, user.Email, user.EmailConfirmed, roles = await users.GetRolesAsync(user) });
    }

    private static async Task<IResult> Logout(ClaimsPrincipal principal, UserManager<CommerceUser> users)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null) return Results.Unauthorized();
        var result = await users.UpdateSecurityStampAsync(user);
        return result.Succeeded ? Results.NoContent() : Results.Problem("logout_failed", statusCode: 500);
    }

    private static string? NormalizeProvider(string provider) => provider.ToLowerInvariant() switch
    {
        "google" => "Google", "facebook" => "Facebook", _ => null
    };
    private static string Hash(string code) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code)));
    private static IResult RedirectError(string url, string error) => Results.Redirect(AppendQuery(url, "error", error));
    private static string AppendQuery(string url, string key, string value) =>
        QueryHelpers.AddQueryString(url, key, value);

    public sealed record ConfirmEmailCodeRequest(string Email, string Code);
    public sealed record ExchangeExternalCodeRequest(string Code);
}
