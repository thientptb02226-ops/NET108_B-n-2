using Microsoft.EntityFrameworkCore;
using Net108Khai.Api.Data;
using Net108Khai.Api.Domain;
using Net108Khai.Api.Features;

namespace Net108Khai.Api.Infrastructure;

public sealed class OrderExpiryWorker(IServiceScopeFactory scopes, ILogger<OrderExpiryWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ExpireBatchAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { logger.LogError(ex, "Failed to expire pending orders"); }
            try { if (!await timer.WaitForNextTickAsync(stoppingToken)) break; }
            catch (OperationCanceledException) { break; }
        }
    }

    private async Task ExpireBatchAsync(CancellationToken ct)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<CommerceDbContext>();
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var orders = await db.Orders.FromSqlRaw("""
            SELECT * FROM commerce."Orders"
            WHERE "Status" = 'pending_payment' AND "ExpiresAt" <= now()
            ORDER BY "ExpiresAt" LIMIT 50 FOR UPDATE SKIP LOCKED
            """).ToListAsync(ct);
        foreach (var order in orders)
        {
            await CommerceEndpoints.RestoreStock(db, order, ct);
            order.Status = OrderStatuses.Expired;
        }
        var cutoff = DateTimeOffset.UtcNow.AddDays(-1);
        var removedTickets = await db.ExternalLoginTickets
            .Where(x => x.ExpiresAt < cutoff || (x.RedeemedAt != null && x.RedeemedAt < cutoff))
            .ExecuteDeleteAsync(ct);
        if (orders.Count == 0 && removedTickets == 0) return;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        logger.LogInformation("Expired {Count} pending orders", orders.Count);
    }
}
