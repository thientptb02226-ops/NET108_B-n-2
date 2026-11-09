using Microsoft.EntityFrameworkCore;
using Net108Khai.Api.Domain;

namespace Net108Khai.Api.Data;

public static class DemoData
{
    public static async Task SeedAsync(CommerceDbContext db)
    {
        if (await db.Products.AnyAsync()) return;
        var products = new[]
        {
            new Product
            {
                Name = "Áo thun Net108Khai", Description = "Áo thun cotton màu đen, sản phẩm mẫu.", IsPublished = true,
                Variants = [new ProductVariant { Sku = "DEMO-001", Name = "Mặc định", PriceVnd = 199000, Stock = 20 }]
            },
            new Product
            {
                Name = "Bình nước Net108Khai", Description = "Bình nước 500 ml, sản phẩm mẫu.", IsPublished = true,
                Variants = [new ProductVariant { Sku = "DEMO-002", Name = "Mặc định", PriceVnd = 149000, Stock = 15 }]
            }
        };
        db.Products.AddRange(products);
        foreach (var variant in products.SelectMany(x => x.Variants))
            db.InventoryMovements.Add(new InventoryMovement { VariantId = variant.Id, Delta = variant.Stock, Reason = "demo_initial_stock" });
        await db.SaveChangesAsync();
    }
}
