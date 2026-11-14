using System.Threading.RateLimiting;
using Lab3.Data;
using Lab3.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Lab4.Web.Utilities;

if (args.Contains("--verify-file-util"))
{
    await VerifyFileUtil();
    return;
}

var builder = WebApplication.CreateBuilder(args);
var connection = Environment.GetEnvironmentVariable("LAB3_SQL_CONNECTION")
    ?? throw new InvalidOperationException("LAB3_SQL_CONNECTION is required.");

builder.Services.AddSingleton(new DBUtil(connection));
builder.Services.AddScoped<CategoryDal>();
builder.Services.AddScoped<UserDal>();
builder.Services.AddControllersWithViews();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login/Login";
        options.AccessDeniedPath = "/Home/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("EmployeeOrManager", policy => policy.RequireRole("Employee", "Manager"));
    options.AddPolicy("ManagerOnly", policy => policy.RequireRole("Manager"));
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0
        }));
});

var app = builder.Build();

if (args.Contains("--seed-users"))
{
    using var scope = app.Services.CreateScope();
    var users = scope.ServiceProvider.GetRequiredService<UserDal>();
    var hasher = new PasswordHasher<User>();
    foreach (var (role, emailKey, passwordKey, isManager) in new[]
    {
        ("Manager", "LAB4_MANAGER_EMAIL", "LAB4_MANAGER_PASSWORD", true),
        ("Employee", "LAB4_EMPLOYEE_EMAIL", "LAB4_EMPLOYEE_PASSWORD", false)
    })
    {
        var email = Environment.GetEnvironmentVariable(emailKey);
        var password = Environment.GetEnvironmentVariable(passwordKey);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) ||
            password.Length < 12 || !password.Any(char.IsUpper) ||
            !password.Any(char.IsLower) || !password.Any(char.IsDigit))
            throw new InvalidOperationException($"Set {emailKey} and a strong {passwordKey} (12+ chars, upper/lower/digit).");
        if (users.GetByEmail(email) is not null)
        {
            Console.WriteLine($"{role} already exists: {email}");
            continue;
        }
        var draft = new User(0, email, "", role, null, isManager, true);
        users.Insert(draft with { Password = hasher.HashPassword(draft, password) });
        Console.WriteLine($"Created {role}: {email}");
    }
    return;
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");
app.Run();

static async Task VerifyFileUtil()
{
    var directory = Path.Combine(Path.GetTempPath(), $"Net108KhaiLab4-{Guid.NewGuid():N}");
    try
    {
        var png = new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 };
        var valid = new FormFile(new MemoryStream(png), 0, png.Length, "image", "../unsafe.png")
        { Headers = new HeaderDictionary(), ContentType = "image/png" };
        var name = await FileUtil.SaveImageAsync(valid, directory);
        if (name.Contains("unsafe") || !File.Exists(Path.Combine(directory, name)))
            throw new InvalidOperationException("FileUtil did not save a safe random name.");
        File.Delete(Path.Combine(directory, name));

        var invalid = new FormFile(new MemoryStream([1, 2, 3, 4]), 0, 4, "image", "fake.png")
        { Headers = new HeaderDictionary(), ContentType = "image/png" };
        try
        {
            await FileUtil.SaveImageAsync(invalid, directory);
            throw new InvalidOperationException("FileUtil accepted a fake PNG.");
        }
        catch (InvalidDataException) { }
        Console.WriteLine("PASS: FileUtil saves a PNG safely and rejects a fake PNG.");
    }
    finally
    {
        if (Directory.Exists(directory)) Directory.Delete(directory);
    }
}

public partial class Program;
