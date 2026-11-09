using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Net108Khai.Api.Data;

public sealed class CommerceDbContextFactory : IDesignTimeDbContextFactory<CommerceDbContext>
{
    public CommerceDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Commerce")
            ?? "Host=localhost;Database=net108khai;Username=net108khai;Password=local-dev-only";
        return new CommerceDbContext(new DbContextOptionsBuilder<CommerceDbContext>().UseNpgsql(connection).Options);
    }
}
