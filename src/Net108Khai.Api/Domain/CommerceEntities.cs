using Microsoft.AspNetCore.Identity;

namespace Net108Khai.Api.Domain;

public sealed class CommerceUser : IdentityUser;

public sealed class ExternalLoginTicket
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string CodeHash { get; set; }
    public required string UserId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RedeemedAt { get; set; }
}

public sealed class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Description { get; set; }
    public bool IsPublished { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<ProductVariant> Variants { get; set; } = [];
}

public sealed class ProductVariant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public required string Sku { get; set; }
    public required string Name { get; set; }
    public long PriceVnd { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class InventoryMovement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VariantId { get; set; }
    public int Delta { get; set; }
    public required string Reason { get; set; }
    public string? ActorUserId { get; set; }
    public Guid? OrderId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Cart
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string UserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<CartItem> Items { get; set; } = [];
}

public sealed class CartItem
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public Guid VariantId { get; set; }
    public ProductVariant Variant { get; set; } = null!;
    public int Quantity { get; set; }
}

public static class OrderStatuses
{
    public const string PendingPayment = "pending_payment";
    public const string Cancelled = "cancelled";
    public const string Expired = "expired";
}

public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string UserId { get; set; }
    public Guid CartId { get; set; }
    public required string IdempotencyKey { get; set; }
    public long TotalVnd { get; set; }
    public string Status { get; set; } = OrderStatuses.PendingPayment;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}

public sealed class OrderItem
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid VariantId { get; set; }
    public required string Sku { get; set; }
    public required string ProductName { get; set; }
    public required string VariantName { get; set; }
    public long UnitPriceVnd { get; set; }
    public int Quantity { get; set; }
}
