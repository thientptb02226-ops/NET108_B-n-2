using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Net108Khai.Api.Data;
using Net108Khai.Api.Domain;
using Npgsql;

namespace Net108Khai.Api.Features;

public static class CommerceEndpoints
{
    public static void MapCommerceEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api/v1");
        api.MapGet("/products", GetProducts);
        api.MapGet("/products/{id:guid}", GetProduct);
        var catalogAdmin = api.MapGroup("/admin/products").RequireAuthorization(policy => policy.RequireRole("Admin", "CatalogManager"));
        catalogAdmin.MapPost("/", CreateProduct);
        catalogAdmin.MapPut("/{id:guid}", UpdateProduct);
        catalogAdmin.MapPost("/{id:guid}/publish", PublishProduct);
        catalogAdmin.MapPost("/{id:guid}/unpublish", UnpublishProduct);
        api.MapPost("/admin/variants/{id:guid}/stock-adjustments", AdjustStock)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "InventoryManager"));

        var privateApi = api.MapGroup("").RequireAuthorization();
        privateApi.MapPost("/carts", CreateCart);
        privateApi.MapGet("/carts/{id:guid}", GetCart);
        privateApi.MapPut("/carts/{id:guid}/items/{variantId:guid}", SetCartItem);
        privateApi.MapPost("/carts/{id:guid}/checkout", Checkout);
        privateApi.MapGet("/orders", ListOrders);
        privateApi.MapGet("/orders/{id:guid}", GetOrder);
        privateApi.MapPost("/orders/{id:guid}/cancel", CancelOrder);
    }

    private static async Task<IResult> GetProducts(string? q, int? page, int? pageSize, CommerceDbContext db, CancellationToken ct)
    {
        if (q?.Length > 100) return Error(400, "invalid_query", "Search text is too long.");
        if (page is < 1 or > 10000) return Error(400, "invalid_page", "Page must be between 1 and 10000.");
        var p = page ?? 1;
        var size = Math.Clamp(pageSize ?? 20, 1, 50);
        var query = db.Products.AsNoTracking().Where(x => x.IsPublished);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{term}%") ||
                EF.Functions.ILike(x.Description, $"%{term}%") ||
                x.Variants.Any(v => EF.Functions.ILike(v.Sku, $"%{term}%")));
        }
        var total = await query.CountAsync(ct);
        var products = await query.OrderBy(x => x.Name).ThenBy(x => x.Id)
            .Skip((p - 1) * size).Take(size).Include(x => x.Variants).ToListAsync(ct);
        return Results.Ok(new { items = products.Select(ToProductView), page = p, pageSize = size, total });
    }

    private static async Task<IResult> GetProduct(Guid id, CommerceDbContext db, CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking().Include(x => x.Variants)
            .SingleOrDefaultAsync(x => x.Id == id && x.IsPublished, ct);
        return product is null ? Results.NotFound() : Results.Ok(ToProductView(product));
    }

    private static object ToProductView(Product product) => new
    {
        product.Id, product.Name, product.Description, currency = "VND",
        variants = product.Variants.Where(v => v.IsActive).OrderBy(v => v.Sku)
            .Select(v => new { v.Id, v.Sku, v.Name, v.PriceVnd, v.Stock })
    };

    private static async Task<IResult> CreateProduct(CreateProductRequest request, CommerceDbContext db, CancellationToken ct)
    {
        if (!ValidProduct(request.Name, request.Description) || request.Variants is null || request.Variants.Count is < 1 or > 100 ||
            request.Variants.Any(v => string.IsNullOrWhiteSpace(v.Sku) || v.Sku.Length > 80 || string.IsNullOrWhiteSpace(v.Name) || v.Name.Length > 150 || v.PriceVnd is < 0 or > 1_000_000_000_000 || v.Stock < 0))
            return Error(400, "invalid_product", "Product or variant data is invalid.");
        var product = new Product { Name = request.Name.Trim(), Description = request.Description.Trim() };
        product.Variants = request.Variants.Select(v => new ProductVariant
        {
            Sku = v.Sku.Trim().ToUpperInvariant(), Name = v.Name.Trim(), PriceVnd = v.PriceVnd, Stock = v.Stock
        }).ToList();
        db.Products.Add(product);
        foreach (var variant in product.Variants.Where(x => x.Stock > 0))
            db.InventoryMovements.Add(new InventoryMovement { VariantId = variant.Id, Delta = variant.Stock, Reason = "initial_stock" });
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        { return Error(409, "duplicate_sku", "A SKU already exists."); }
        return Results.Created($"/api/v1/products/{product.Id}", new { product.Id, product.IsPublished });
    }

    private static async Task<IResult> UpdateProduct(Guid id, UpdateProductRequest request, CommerceDbContext db, CancellationToken ct)
    {
        if (!ValidProduct(request.Name, request.Description)) return Error(400, "invalid_product", "Product data is invalid.");
        var product = await db.Products.FindAsync([id], ct);
        if (product is null) return Results.NotFound();
        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> PublishProduct(Guid id, CommerceDbContext db, CancellationToken ct)
    {
        var product = await db.Products.Include(x => x.Variants).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return Results.NotFound();
        if (!product.Variants.Any(x => x.IsActive && x.PriceVnd > 0))
            return Error(409, "not_sellable", "A published product needs an active priced variant.");
        product.IsPublished = true;
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> UnpublishProduct(Guid id, CommerceDbContext db, CancellationToken ct)
    {
        var changed = await db.Products.Where(x => x.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsPublished, false), ct);
        return changed == 0 ? Results.NotFound() : Results.NoContent();
    }

    private static async Task<IResult> AdjustStock(Guid id, StockAdjustmentRequest request, ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        if (request.Delta is 0 or < -100000 or > 100000 || string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length > 200)
            return Error(400, "invalid_adjustment", "A nonzero delta and reason are required.");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var locked = await db.Variants.FromSqlInterpolated(
            $"SELECT * FROM commerce.\"ProductVariants\" WHERE \"Id\" = {id} FOR UPDATE").ToListAsync(ct);
        var variant = locked.SingleOrDefault();
        if (variant is null) return Results.NotFound();
        var next = (long)variant.Stock + request.Delta;
        if (next is < 0 or > int.MaxValue) return Error(409, "invalid_stock", "Adjustment would make stock invalid.");
        variant.Stock = (int)next;
        db.InventoryMovements.Add(new InventoryMovement { VariantId = id, Delta = request.Delta, Reason = request.Reason.Trim(), ActorUserId = UserId(user) });
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Results.Ok(new { variant.Id, variant.Stock });
    }

    private static bool ValidProduct(string? name, string? description) =>
        !string.IsNullOrWhiteSpace(name) && name.Length <= 200 &&
        !string.IsNullOrWhiteSpace(description) && description.Length <= 4000;

    private static async Task<IResult> CreateCart(ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        var cart = new Cart { UserId = userId };
        db.Carts.Add(cart);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/v1/carts/{cart.Id}", new { cart.Id });
    }

    private static async Task<IResult> GetCart(Guid id, ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        var cart = await db.Carts.AsNoTracking().Include(x => x.Items).ThenInclude(x => x.Variant).ThenInclude(x => x.Product)
            .SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        return cart is null ? Results.NotFound() : Results.Ok(ToCartView(cart));
    }

    private static object ToCartView(Cart cart) => new
    {
        cart.Id, currency = "VND", provisional = true,
        lines = cart.Items.OrderBy(x => x.Variant.Sku).Select(x => new
        {
            x.VariantId, x.Variant.Sku, productName = x.Variant.Product.Name,
            variantName = x.Variant.Name, x.Variant.PriceVnd, x.Quantity,
            available = x.Variant.IsActive && x.Variant.Product.IsPublished && x.Variant.Stock >= x.Quantity
        }),
        totalVnd = cart.Items.Sum(x => checked(x.Variant.PriceVnd * x.Quantity))
    };

    private static async Task<IResult> SetCartItem(Guid id, Guid variantId, SetCartItemRequest request,
        ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        if (request.Quantity is < 0 or > 99) return Error(400, "invalid_quantity", "Quantity must be between 0 and 99.");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var cart = await LockCart(db, id, ct);
        if (cart is null || cart.UserId != userId) return Results.NotFound();
        var item = await db.CartItems.SingleOrDefaultAsync(x => x.CartId == id && x.VariantId == variantId, ct);
        if (request.Quantity == 0)
        {
            if (item is not null) db.CartItems.Remove(item);
        }
        else
        {
            var variant = await db.Variants.AsNoTracking().Include(x => x.Product).SingleOrDefaultAsync(x => x.Id == variantId, ct);
            if (variant is null || !variant.IsActive || !variant.Product.IsPublished) return Results.NotFound();
            if (variant.Stock < request.Quantity) return Error(409, "insufficient_stock", "Insufficient stock.");
            if (item is null && await db.CartItems.CountAsync(x => x.CartId == id, ct) >= 100)
                return Error(409, "cart_full", "Cart cannot contain more than 100 variants.");
            if (item is null) db.CartItems.Add(new CartItem { CartId = id, VariantId = variantId, Quantity = request.Quantity });
            else item.Quantity = request.Quantity;
        }
        cart.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> Checkout(Guid id, HttpRequest http, ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        var key = http.Headers["Idempotency-Key"].ToString();
        if (string.IsNullOrWhiteSpace(key) || key.Length > 100)
            return Error(400, "invalid_idempotency_key", "Idempotency-Key is required (1-100 characters).");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var cart = await LockCart(db, id, ct);
        if (cart is null || cart.UserId != userId) return Results.NotFound();
        var prior = await db.Orders.AsNoTracking().SingleOrDefaultAsync(x => x.UserId == userId && x.IdempotencyKey == key, ct);
        if (prior is not null)
            return prior.CartId == id ? Results.Ok(new { prior.Id, prior.Status, prior.TotalVnd, prior.ExpiresAt, currency = "VND", replayed = true })
                : Error(409, "idempotency_conflict", "Idempotency-Key belongs to another cart.");
        var items = await db.CartItems.AsNoTracking().Where(x => x.CartId == id).OrderBy(x => x.VariantId).ToListAsync(ct);
        if (items.Count == 0) return Error(400, "empty_cart", "Cart is empty.");
        var order = new Order { UserId = userId, CartId = id, IdempotencyKey = key,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30) };
        foreach (var item in items)
        {
            var locked = await db.Variants.FromSqlInterpolated(
                $"SELECT * FROM commerce.\"ProductVariants\" WHERE \"Id\" = {item.VariantId} FOR UPDATE").ToListAsync(ct);
            var variant = locked.SingleOrDefault();
            if (variant is null || !variant.IsActive || variant.Stock < item.Quantity)
                return Error(409, "insufficient_stock", "A cart item is unavailable or lacks stock.");
            var product = await db.Products.AsNoTracking().SingleAsync(x => x.Id == variant.ProductId, ct);
            if (!product.IsPublished) return Error(409, "unavailable_product", "A cart product is unpublished.");
            variant.Stock -= item.Quantity;
            db.InventoryMovements.Add(new InventoryMovement { VariantId = variant.Id, Delta = -item.Quantity,
                Reason = "order_placed", OrderId = order.Id, ActorUserId = userId });
            order.Items.Add(new OrderItem { VariantId = variant.Id, Sku = variant.Sku,
                ProductName = product.Name, VariantName = variant.Name,
                UnitPriceVnd = variant.PriceVnd, Quantity = item.Quantity });
            order.TotalVnd = checked(order.TotalVnd + variant.PriceVnd * item.Quantity);
        }
        db.Orders.Add(order);
        db.CartItems.RemoveRange(await db.CartItems.Where(x => x.CartId == id).ToListAsync(ct));
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        { return Error(409, "checkout_conflict", "Checkout conflicted with another request. Retry with the same key."); }
        await tx.CommitAsync(ct);
        return Results.Created($"/api/v1/orders/{order.Id}", new { order.Id, order.Status,
            order.TotalVnd, order.ExpiresAt, currency = "VND", replayed = false });
    }

    private static async Task<IResult> ListOrders(ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        var orders = await db.Orders.AsNoTracking().Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt).Take(50)
            .Select(x => new { x.Id, x.Status, x.TotalVnd, x.CreatedAt, x.ExpiresAt }).ToListAsync(ct);
        return Results.Ok(new { items = orders, currency = "VND" });
    }

    private static async Task<IResult> GetOrder(Guid id, ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        var order = await db.Orders.AsNoTracking().Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        return order is null ? Results.NotFound() : Results.Ok(new
        {
            order.Id, order.Status, order.TotalVnd, order.CreatedAt, order.ExpiresAt, currency = "VND",
            lines = order.Items.Select(x => new { x.VariantId, x.Sku, x.ProductName, x.VariantName, x.UnitPriceVnd, x.Quantity })
        });
    }

    private static async Task<IResult> CancelOrder(Guid id, ClaimsPrincipal user, CommerceDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        if (userId is null) return Results.Unauthorized();
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var locked = await db.Orders.FromSqlInterpolated(
            $"SELECT * FROM commerce.\"Orders\" WHERE \"Id\" = {id} FOR UPDATE").ToListAsync(ct);
        var order = locked.SingleOrDefault();
        if (order is null || order.UserId != userId) return Results.NotFound();
        if (order.Status != OrderStatuses.PendingPayment)
            return Error(409, "invalid_order_state", "Only pending orders can be cancelled.");
        await RestoreStock(db, order, ct, userId);
        order.Status = OrderStatuses.Cancelled;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Results.NoContent();
    }

    internal static async Task RestoreStock(CommerceDbContext db, Order order, CancellationToken ct, string? actorUserId = null)
    {
        var lines = await db.OrderItems.Where(x => x.OrderId == order.Id).OrderBy(x => x.VariantId).ToListAsync(ct);
        foreach (var line in lines)
        {
            await db.Variants.Where(x => x.Id == line.VariantId)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Stock, x => x.Stock + line.Quantity), ct);
            db.InventoryMovements.Add(new InventoryMovement { VariantId = line.VariantId, Delta = line.Quantity,
                Reason = "order_released", OrderId = order.Id, ActorUserId = actorUserId });
        }
    }

    internal static async Task<Cart?> LockCart(CommerceDbContext db, Guid id, CancellationToken ct)
    {
        var rows = await db.Carts.FromSqlInterpolated(
            $"SELECT * FROM commerce.\"Carts\" WHERE \"Id\" = {id} FOR UPDATE").ToListAsync(ct);
        return rows.SingleOrDefault();
    }

    private static string? UserId(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier);
    private static IResult Error(int status, string code, string detail) =>
        Results.Problem(statusCode: status, title: code, detail: detail);
}

public sealed record CreateVariantRequest(string Sku, string Name, long PriceVnd, int Stock);
public sealed record CreateProductRequest(string Name, string Description, List<CreateVariantRequest> Variants);
public sealed record UpdateProductRequest(string Name, string Description);
public sealed record SetCartItemRequest(int Quantity);
public sealed record StockAdjustmentRequest(int Delta, string Reason);
