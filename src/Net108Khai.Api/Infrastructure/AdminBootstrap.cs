using Microsoft.AspNetCore.Identity;
using Net108Khai.Api.Domain;

namespace Net108Khai.Api.Infrastructure;

public static class AdminBootstrap
{
    public static readonly string[] StaffRoles = ["Admin", "CatalogManager", "InventoryManager", "SupportAgent"];

    public static async Task RunAsync(IServiceProvider services, IConfiguration config)
    {
        var email = config["Bootstrap:AdminEmail"];
        var password = config["Bootstrap:AdminPassword"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Bootstrap:AdminEmail and Bootstrap:AdminPassword are required.");
        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        var users = services.GetRequiredService<UserManager<CommerceUser>>();
        foreach (var role in StaffRoles)
        {
            if (await roles.RoleExistsAsync(role)) continue;
            var roleResult = await roles.CreateAsync(new IdentityRole(role));
            if (!roleResult.Succeeded) throw new InvalidOperationException(string.Join("; ", roleResult.Errors.Select(x => x.Description)));
        }
        var user = await users.FindByEmailAsync(email);
        if (user is not null && !await users.IsInRoleAsync(user, "Admin"))
            throw new InvalidOperationException("This email is already registered. Use a new admin email; an existing customer cannot be promoted by bootstrap.");
        if (user is null)
        {
            user = new CommerceUser { UserName = email, Email = email, EmailConfirmed = true };
            var result = await users.CreateAsync(user, password);
            if (!result.Succeeded) throw new InvalidOperationException(string.Join("; ", result.Errors.Select(x => x.Description)));
        }
        if (!await users.IsInRoleAsync(user, "Admin"))
        {
            var result = await users.AddToRoleAsync(user, "Admin");
            if (!result.Succeeded) throw new InvalidOperationException(string.Join("; ", result.Errors.Select(x => x.Description)));
        }
    }

    public static async Task GrantRoleAsync(IServiceProvider services, IConfiguration config)
    {
        var email = config["Bootstrap:GrantEmail"];
        var role = config["Bootstrap:GrantRole"];
        if (string.IsNullOrWhiteSpace(email) || role is not ("CatalogManager" or "InventoryManager" or "SupportAgent"))
            throw new InvalidOperationException("GrantEmail and GrantRole (CatalogManager, InventoryManager or SupportAgent) are required.");
        var users = services.GetRequiredService<UserManager<CommerceUser>>();
        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        var user = await users.FindByEmailAsync(email) ?? throw new InvalidOperationException("User does not exist.");
        if (!await users.IsEmailConfirmedAsync(user)) throw new InvalidOperationException("Email must be confirmed before staff role grant.");
        if (!await roles.RoleExistsAsync(role))
        {
            var created = await roles.CreateAsync(new IdentityRole(role));
            if (!created.Succeeded) throw new InvalidOperationException(string.Join("; ", created.Errors.Select(x => x.Description)));
        }
        if (await users.IsInRoleAsync(user, role)) return;
        var result = await users.AddToRoleAsync(user, role);
        if (!result.Succeeded) throw new InvalidOperationException(string.Join("; ", result.Errors.Select(x => x.Description)));
    }
}
