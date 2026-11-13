using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Net108Khai.Api.Domain;

namespace Net108Khai.Api.Data;

public sealed class CommerceDbContext(DbContextOptions<CommerceDbContext> options) : IdentityDbContext<CommerceUser>(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ExternalLoginTicket> ExternalLoginTickets => Set<ExternalLoginTicket>();
    public DbSet<ProductVariant> Variants => Set<ProductVariant>();
    public DbSet<InventoryMovement> InventoryMovements => Set<InventoryMovement>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        model.HasDefaultSchema("commerce");
        model.Entity<CommerceUser>().Property(x => x.Id).HasMaxLength(128);
        model.Entity<IdentityRole>().Property(x => x.Id).HasMaxLength(128);
        model.Entity<IdentityUserLogin<string>>().Property(x => x.LoginProvider).HasMaxLength(128);
        model.Entity<IdentityUserLogin<string>>().Property(x => x.ProviderKey).HasMaxLength(128);
        model.Entity<IdentityUserToken<string>>().Property(x => x.LoginProvider).HasMaxLength(128);
        model.Entity<IdentityUserToken<string>>().Property(x => x.Name).HasMaxLength(128);
        model.Entity<CommerceUser>().HasIndex(x => x.NormalizedEmail).IsUnique().HasDatabaseName("EmailIndex");

        model.Entity<ExternalLoginTicket>(b =>
        {
            b.ToTable("ExternalLoginTickets");
            b.HasKey(x => x.Id);
            b.Property(x => x.CodeHash).HasMaxLength(64).IsRequired();
            b.Property(x => x.UserId).IsRequired();
            b.HasOne<CommerceUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(x => x.CodeHash).IsUnique();
            b.HasIndex(x => x.ExpiresAt);
        });

        model.Entity<Product>(b =>
        {
            b.ToTable("Products");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            b.HasMany(x => x.Variants).WithOne(x => x.Product).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(x => x.IsPublished);
        });
        model.Entity<ProductVariant>(b =>
        {
            b.ToTable("ProductVariants", t =>
            {
                t.HasCheckConstraint("CK_ProductVariants_Price", "[PriceVnd] BETWEEN 0 AND 1000000000000");
                t.HasCheckConstraint("CK_ProductVariants_Stock", "[Stock] >= 0");
            });
            b.HasKey(x => x.Id);
            b.Property(x => x.Sku).HasMaxLength(80).IsRequired();
            b.Property(x => x.Name).HasMaxLength(150).IsRequired();
            b.HasIndex(x => x.Sku).IsUnique();
            b.HasIndex(x => new { x.ProductId, x.IsActive });
        });
        model.Entity<Cart>(b =>
        {
            b.ToTable("Carts");
            b.HasKey(x => x.Id);
            b.Property(x => x.UserId).IsRequired();
            b.HasOne<CommerceUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(x => x.UserId);
            b.HasMany(x => x.Items).WithOne(x => x.Cart).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<InventoryMovement>(b =>
        {
            b.ToTable("InventoryMovements", t => t.HasCheckConstraint("CK_InventoryMovements_Delta", "[Delta] <> 0"));
            b.HasKey(x => x.Id);
            b.Property(x => x.Reason).HasMaxLength(200).IsRequired();
            b.Property(x => x.ActorUserId).HasMaxLength(450);
            b.HasOne<ProductVariant>().WithMany().HasForeignKey(x => x.VariantId).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(x => new { x.VariantId, x.CreatedAt });
        });
        model.Entity<CartItem>(b =>
        {
            b.ToTable("CartItems", t => t.HasCheckConstraint("CK_CartItems_Quantity", "[Quantity] BETWEEN 1 AND 99"));
            b.HasKey(x => new { x.CartId, x.VariantId });
            b.HasOne(x => x.Variant).WithMany().HasForeignKey(x => x.VariantId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<Order>(b =>
        {
            b.ToTable("Orders", t => t.HasCheckConstraint("CK_Orders_Total", "[TotalVnd] >= 0"));
            b.HasKey(x => x.Id);
            b.Property(x => x.UserId).IsRequired();
            b.HasOne<CommerceUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            b.Property(x => x.IdempotencyKey).HasMaxLength(100).IsRequired();
            b.Property(x => x.Status).HasMaxLength(32).IsRequired();
            b.HasIndex(x => new { x.UserId, x.IdempotencyKey }).IsUnique();
            b.HasIndex(x => new { x.UserId, x.CreatedAt });
            b.HasIndex(x => new { x.Status, x.ExpiresAt });
            b.HasMany(x => x.Items).WithOne(x => x.Order).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<OrderItem>(b =>
        {
            b.ToTable("OrderItems", t =>
            {
                t.HasCheckConstraint("CK_OrderItems_Quantity", "[Quantity] > 0");
                t.HasCheckConstraint("CK_OrderItems_Price", "[UnitPriceVnd] >= 0");
            });
            b.HasKey(x => new { x.OrderId, x.VariantId });
            b.Property(x => x.Sku).HasMaxLength(80).IsRequired();
            b.Property(x => x.ProductName).HasMaxLength(200).IsRequired();
            b.Property(x => x.VariantName).HasMaxLength(150).IsRequired();
            b.HasOne<ProductVariant>().WithMany().HasForeignKey(x => x.VariantId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
