using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Net108Khai.Api.Data;

public sealed class CommerceDbContextFactory : IDesignTimeDbContextFactory<CommerceDbContext>
{
    public CommerceDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Commerce")
            ?? "Server=localhost,1433;Database=net108khai;User Id=sa;Password=Net108Khai!2026Dev;Encrypt=True;TrustServerCertificate=True";
        return new CommerceDbContext(new DbContextOptionsBuilder<CommerceDbContext>().UseSqlServer(connection).Options);
    }
}
