using Lab3.Data;
using Lab3.Entities;

var connection = Environment.GetEnvironmentVariable("LAB3_SQL_CONNECTION");
if (string.IsNullOrWhiteSpace(connection))
{
    Console.Error.WriteLine("Set LAB3_SQL_CONNECTION for the isolated Net108KhaiLab3 database.");
    return 2;
}

var db = new DBUtil(connection);
var categories = new CategoryDal(db);
var drinks = new DrinkDal(db);
var users = new UserDal(db);
var bills = new BillDal(db);
var details = new BillDetailDal(db);

if (args.Contains("--verify"))
{
    int categoryId = 0, drinkId = 0, userId = 0, billId = 0, detailId = 0;
    try
    {
        var tag = Guid.NewGuid().ToString("N")[..8];
        categoryId = categories.Insert(new Category(0, $"Kiểm thử {tag}", true));
        Check(categories.GetById(categoryId)?.Name == $"Kiểm thử {tag}", "Category GetById");
        Check(categories.Update(new Category(categoryId, $"Danh mục {tag}", true)), "Category Update");

        drinkId = drinks.Insert(new Drink(0, categoryId, $"Sản phẩm {tag}", 12000, null, "Tiếng Việt", true));
        Check(drinks.GetById(drinkId)?.Price == 12000, "Drink GetById");
        Check(drinks.Update(new Drink(drinkId, categoryId, $"Sản phẩm {tag}", 15000, null, "Tiếng Việt", true)), "Drink Update");

        userId = users.Insert(new User(0, $"lab3-{tag}@example.invalid", "NO_LOGIN_SAMPLE_RECORD", "Người thử", null, false, false));
        Check(users.GetById(userId)?.FullName == "Người thử", "User GetById");
        Check(users.Update(new User(userId, $"lab3-{tag}@example.invalid", "NO_LOGIN_SAMPLE_RECORD", "Người kiểm thử", null, false, false)), "User Update");

        billId = bills.Insert(new Bill(0, userId, $"T{tag}", DateOnly.FromDateTime(DateTime.Today), 15000, "sample"));
        Check(bills.GetById(billId)?.Total == 15000, "Bill GetById");
        Check(bills.Update(new Bill(billId, userId, $"T{tag}", DateOnly.FromDateTime(DateTime.Today), 30000, "sample")), "Bill Update");

        detailId = details.Insert(new BillDetail(0, billId, drinkId, 1, 15000));
        Check(details.GetById(detailId)?.Quantity == 1, "BillDetail GetById");
        Check(details.Update(new BillDetail(detailId, billId, drinkId, 2, 15000)), "BillDetail Update");

        Check(categories.GetAll().Any(x => x.Id == categoryId), "Category GetAll");
        Check(drinks.GetAll().Any(x => x.Id == drinkId), "Drink GetAll");
        Check(users.GetAll().Any(x => x.Id == userId), "User GetAll");
        Check(bills.GetAll().Any(x => x.Id == billId), "Bill GetAll");
        Check(details.GetAll().Any(x => x.Id == detailId), "BillDetail GetAll");
        Console.WriteLine("PASS: GetAll, GetById, Insert, Update for all five entities.");
    }
    finally
    {
        if (detailId != 0) Check(details.Delete(detailId), "BillDetail Delete");
        if (billId != 0) Check(bills.Delete(billId), "Bill Delete");
        if (drinkId != 0) Check(drinks.Delete(drinkId), "Drink Delete");
        if (userId != 0) Check(users.Delete(userId), "User Delete");
        if (categoryId != 0) Check(categories.Delete(categoryId), "Category Delete");
    }
    Console.WriteLine("PASS: Delete for all five entities; sample rows remain.");
}
else
{
    Console.WriteLine($"categories={categories.GetAll().Count}, drinks={drinks.GetAll().Count}, users={users.GetAll().Count}, bills={bills.GetAll().Count}, bill_details={details.GetAll().Count}");
}
return 0;

static void Check(bool condition, string step)
{
    if (!condition) throw new InvalidOperationException($"Lab 3 check failed: {step}");
}
