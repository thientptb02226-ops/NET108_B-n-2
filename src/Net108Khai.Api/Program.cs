using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using System.Security.Cryptography.X509Certificates;
using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Net108Khai.Api.Data;
using Net108Khai.Api.Domain;
using Net108Khai.Api.Features;
using Net108Khai.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var trustedProxies = builder.Configuration.GetSection("ReverseProxy:KnownProxies").Get<string[]>() ?? [];
if (trustedProxies.Length > 0)
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        foreach (var proxy in trustedProxies)
        {
            if (!IPAddress.TryParse(proxy, out var address))
                throw new InvalidOperationException($"Invalid trusted proxy address: {proxy}");
            options.KnownProxies.Add(address);
        }
    });
}
var connectionString = builder.Configuration.GetConnectionString("Commerce")
    ?? throw new InvalidOperationException("ConnectionStrings:Commerce is required.");
var keyPath = builder.Configuration["DataProtection:KeyPath"]
    ?? (builder.Environment.IsDevelopment() ? ".artifacts/keys" : throw new InvalidOperationException("Production requires DataProtection:KeyPath."));
Directory.CreateDirectory(keyPath);
var protection = builder.Services.AddDataProtection().SetApplicationName("Net108Khai.Commerce")
    .PersistKeysToFileSystem(new DirectoryInfo(keyPath));
if (!builder.Environment.IsDevelopment())
{
    var certificatePath = builder.Configuration["DataProtection:CertificatePath"];
    var certificatePassword = builder.Configuration["DataProtection:CertificatePassword"];
    if (string.IsNullOrWhiteSpace(certificatePath) || string.IsNullOrWhiteSpace(certificatePassword))
        throw new InvalidOperationException("Production requires a DataProtection PKCS#12 certificate and password.");
    protection.ProtectKeysWithCertificate(X509CertificateLoader.LoadPkcs12FromFile(certificatePath, certificatePassword));
    var authCallback = builder.Configuration["Frontend:AuthCallbackUrl"];
    if (!string.IsNullOrWhiteSpace(authCallback) &&
        (!Uri.TryCreate(authCallback, UriKind.Absolute, out var callbackUri) || callbackUri.Scheme != Uri.UriSchemeHttps))
        throw new InvalidOperationException("Production frontend auth callback must use HTTPS.");
}

builder.Services.AddDbContext<CommerceDbContext>(options => options.UseSqlServer(connectionString));
var authentication = builder.Services.AddAuthentication(IdentityConstants.BearerScheme)
    .AddBearerToken(IdentityConstants.BearerScheme)
    .AddCookie("ExternalCookie", options =>
    {
        options.Cookie.Name = "Net108Khai.External";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
    });
builder.Services.Configure<Microsoft.AspNetCore.Authentication.BearerToken.BearerTokenOptions>(
    IdentityConstants.BearerScheme, options =>
    {
        options.BearerTokenExpiration = TimeSpan.FromMinutes(15);
        options.RefreshTokenExpiration = TimeSpan.FromDays(7);
    });
foreach (var provider in new[] { "Google", "Facebook" })
{
    var clientId = builder.Configuration[$"OAuth:{provider}:ClientId"];
    var clientSecret = builder.Configuration[$"OAuth:{provider}:ClientSecret"];
    if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret)) continue;
    if (provider == "Google") authentication.AddGoogle("Google", options =>
    {
        options.ClientId = clientId;
        options.ClientSecret = clientSecret;
        options.SignInScheme = "ExternalCookie";
        options.CallbackPath = "/signin-google";
    });
    else authentication.AddFacebook("Facebook", options =>
    {
        options.AppId = clientId;
        options.AppSecret = clientSecret;
        options.SignInScheme = "ExternalCookie";
        options.CallbackPath = "/signin-facebook";
        options.Fields.Add("email");
    });
}
builder.Services.AddAuthorization();
builder.Services.AddIdentityCore<CommerceUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 12;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.SignIn.RequireConfirmedEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<CommerceDbContext>()
    .AddApiEndpoints();
builder.Services.AddTransient<IEmailSender<CommerceUser>, SmtpIdentityEmailSender>();
builder.Services.Configure<Microsoft.AspNetCore.Identity.DataProtectionTokenProviderOptions>(options => options.TokenLifespan = TimeSpan.FromMinutes(15));
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHttpClient("ai", client => client.Timeout = TimeSpan.FromSeconds(30));
builder.Services.AddHostedService<OrderExpiryWorker>();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("assistant", context => RateLimitPartition.GetFixedWindowLimiter(
        context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
if (origins.Length > 0)
    builder.Services.AddCors(options => options.AddPolicy("frontend", policy =>
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

if (args.Contains("--migrate", StringComparer.OrdinalIgnoreCase))
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<CommerceDbContext>();
    await db.Database.MigrateAsync();
    if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("Demo:SeedProducts"))
        await DemoData.SeedAsync(db);
    return;
}

if (args.Contains("--bootstrap-admin", StringComparer.OrdinalIgnoreCase))
{
    await using var scope = app.Services.CreateAsyncScope();
    await AdminBootstrap.RunAsync(scope.ServiceProvider, app.Configuration);
    return;
}

if (args.Contains("--grant-role", StringComparer.OrdinalIgnoreCase))
{
    await using var scope = app.Services.CreateAsyncScope();
    await AdminBootstrap.GrantRoleAsync(scope.ServiceProvider, app.Configuration);
    return;
}

if (string.IsNullOrWhiteSpace(app.Configuration["Smtp:Host"]) ||
    string.IsNullOrWhiteSpace(app.Configuration["Smtp:From"]) ||
    (!app.Environment.IsDevelopment() &&
     (string.IsNullOrWhiteSpace(app.Configuration["Smtp:User"]) || string.IsNullOrWhiteSpace(app.Configuration["Smtp:Password"]))))
    throw new InvalidOperationException("SMTP Host and From are required; production also requires User and Password.");

if (!app.Environment.IsDevelopment()) app.UseExceptionHandler();

if (trustedProxies.Length > 0) app.UseForwardedHeaders();
if (origins.Length > 0) app.UseCors("frontend");
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapGet("/health/live", () => Results.Ok(new { status = "live" }));
app.MapGet("/health/ready", async (CommerceDbContext db, CancellationToken ct) =>
{
    try
    {
        await db.Products.AnyAsync(ct);
        return Results.Ok(new { status = "ready" });
    }
    catch { return Results.StatusCode(StatusCodes.Status503ServiceUnavailable); }
});
if (app.Environment.IsDevelopment()) app.MapOpenApi();

var identityRoutes = app.MapGroup("/api/v1/auth").RequireRateLimiting("auth");
identityRoutes.AddEndpointFilter(async (invocation, next) =>
{
    var query = invocation.HttpContext.Request.Query;
    if (query.ContainsKey("useCookies") || query.ContainsKey("useSessionCookies"))
        return Results.BadRequest(new { error = "cookie_mode_unsupported" });
    return await next(invocation);
});
identityRoutes.MapIdentityApi<CommerceUser>();
app.MapAccountEndpoints();
app.MapCommerceEndpoints();
app.MapAssistantEndpoints();

app.Run();

public partial class Program;
