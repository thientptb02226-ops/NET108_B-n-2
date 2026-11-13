using System.Data;
using Lab3.Entities;

namespace Lab3.Data;

public sealed class CategoryDal(DBUtil db)
{
    private const string Columns = "id, name, active";
    private static Category Map(DataRow row) => new(row.Field<int>("id"), row.Field<string>("name")!, row.Field<bool>("active"));
    public List<Category> GetAll() => db.QueryDataTable($"SELECT {Columns} FROM categories ORDER BY id", []).Rows.Cast<DataRow>().Select(Map).ToList();
    public Category? GetById(int id) => db.QueryDataTable($"SELECT {Columns} FROM categories WHERE id = @1", [id]).Rows.Cast<DataRow>().Select(Map).SingleOrDefault();
    public int Insert(Category item) => Convert.ToInt32(db.ExecuteScalar(
        "INSERT INTO categories(name, active) VALUES (@1, @2); SELECT CAST(SCOPE_IDENTITY() AS int)", [item.Name, item.Active]));
    public bool Update(Category item) => db.ExecuteNonQuery("UPDATE categories SET name = @1, active = @2 WHERE id = @3",
        [item.Name, item.Active, item.Id]) == 1;
    public bool Delete(int id) => db.ExecuteNonQuery("DELETE FROM categories WHERE id = @1", [id]) == 1;
}

public sealed class DrinkDal(DBUtil db)
{
    private const string Columns = "id, category_id, name, price, image, description, active";
    private static Drink Map(DataRow row) => new(row.Field<int>("id"), row.Field<int>("category_id"),
        row.Field<string>("name")!, row.Field<int>("price"), row.Field<string?>("image"),
        row.Field<string?>("description"), row.Field<bool>("active"));
    public List<Drink> GetAll() => db.QueryDataTable($"SELECT {Columns} FROM drinks ORDER BY id", []).Rows.Cast<DataRow>().Select(Map).ToList();
    public Drink? GetById(int id) => db.QueryDataTable($"SELECT {Columns} FROM drinks WHERE id = @1", [id]).Rows.Cast<DataRow>().Select(Map).SingleOrDefault();
    public int Insert(Drink item) => Convert.ToInt32(db.ExecuteScalar(
        "INSERT INTO drinks(category_id, name, price, image, description, active) VALUES (@1, @2, @3, @4, @5, @6); SELECT CAST(SCOPE_IDENTITY() AS int)",
        [item.CategoryId, item.Name, item.Price, item.Image, item.Description, item.Active]));
    public bool Update(Drink item) => db.ExecuteNonQuery(
        "UPDATE drinks SET category_id = @1, name = @2, price = @3, image = @4, description = @5, active = @6 WHERE id = @7",
        [item.CategoryId, item.Name, item.Price, item.Image, item.Description, item.Active, item.Id]) == 1;
    public bool Delete(int id) => db.ExecuteNonQuery("DELETE FROM drinks WHERE id = @1", [id]) == 1;
}

public sealed class UserDal(DBUtil db)
{
    private const string Columns = "id, email, password, full_name, phone, role, active";
    private static User Map(DataRow row) => new(row.Field<int>("id"), row.Field<string>("email")!,
        row.Field<string>("password")!, row.Field<string>("full_name")!, row.Field<string?>("phone"),
        row.Field<bool>("role"), row.Field<bool>("active"));
    public List<User> GetAll() => db.QueryDataTable($"SELECT {Columns} FROM users ORDER BY id", []).Rows.Cast<DataRow>().Select(Map).ToList();
    public User? GetById(int id) => db.QueryDataTable($"SELECT {Columns} FROM users WHERE id = @1", [id]).Rows.Cast<DataRow>().Select(Map).SingleOrDefault();
    public int Insert(User item) => Convert.ToInt32(db.ExecuteScalar(
        "INSERT INTO users(email, password, full_name, phone, role, active) VALUES (@1, @2, @3, @4, @5, @6); SELECT CAST(SCOPE_IDENTITY() AS int)",
        [item.Email, item.Password, item.FullName, item.Phone, item.Role, item.Active]));
    public bool Update(User item) => db.ExecuteNonQuery(
        "UPDATE users SET email = @1, password = @2, full_name = @3, phone = @4, role = @5, active = @6 WHERE id = @7",
        [item.Email, item.Password, item.FullName, item.Phone, item.Role, item.Active, item.Id]) == 1;
    public bool Delete(int id) => db.ExecuteNonQuery("DELETE FROM users WHERE id = @1", [id]) == 1;
}

public sealed class BillDal(DBUtil db)
{
    private const string Columns = "id, user_id, code, created_at, total, status";
    private static Bill Map(DataRow row) => new(row.Field<int>("id"), row.Field<int>("user_id"),
        row.Field<string>("code")!, DateOnly.FromDateTime(row.Field<DateTime>("created_at")),
        row.Field<int>("total"), row.Field<string>("status")!);
    public List<Bill> GetAll() => db.QueryDataTable($"SELECT {Columns} FROM bills ORDER BY id", []).Rows.Cast<DataRow>().Select(Map).ToList();
    public Bill? GetById(int id) => db.QueryDataTable($"SELECT {Columns} FROM bills WHERE id = @1", [id]).Rows.Cast<DataRow>().Select(Map).SingleOrDefault();
    public int Insert(Bill item) => Convert.ToInt32(db.ExecuteScalar(
        "INSERT INTO bills(user_id, code, created_at, total, status) VALUES (@1, @2, @3, @4, @5); SELECT CAST(SCOPE_IDENTITY() AS int)",
        [item.UserId, item.Code, item.CreatedAt.ToDateTime(TimeOnly.MinValue), item.Total, item.Status]));
    public bool Update(Bill item) => db.ExecuteNonQuery(
        "UPDATE bills SET user_id = @1, code = @2, created_at = @3, total = @4, status = @5 WHERE id = @6",
        [item.UserId, item.Code, item.CreatedAt.ToDateTime(TimeOnly.MinValue), item.Total, item.Status, item.Id]) == 1;
    public bool Delete(int id) => db.ExecuteNonQuery("DELETE FROM bills WHERE id = @1", [id]) == 1;
}

public sealed class BillDetailDal(DBUtil db)
{
    private const string Columns = "id, bill_id, drink_id, quantity, price";
    private static BillDetail Map(DataRow row) => new(row.Field<int>("id"), row.Field<int>("bill_id"),
        row.Field<int>("drink_id"), row.Field<int>("quantity"), row.Field<int>("price"));
    public List<BillDetail> GetAll() => db.QueryDataTable($"SELECT {Columns} FROM bill_details ORDER BY id", []).Rows.Cast<DataRow>().Select(Map).ToList();
    public BillDetail? GetById(int id) => db.QueryDataTable($"SELECT {Columns} FROM bill_details WHERE id = @1", [id]).Rows.Cast<DataRow>().Select(Map).SingleOrDefault();
    public int Insert(BillDetail item) => Convert.ToInt32(db.ExecuteScalar(
        "INSERT INTO bill_details(bill_id, drink_id, quantity, price) VALUES (@1, @2, @3, @4); SELECT CAST(SCOPE_IDENTITY() AS int)",
        [item.BillId, item.DrinkId, item.Quantity, item.Price]));
    public bool Update(BillDetail item) => db.ExecuteNonQuery(
        "UPDATE bill_details SET bill_id = @1, drink_id = @2, quantity = @3, price = @4 WHERE id = @5",
        [item.BillId, item.DrinkId, item.Quantity, item.Price, item.Id]) == 1;
    public bool Delete(int id) => db.ExecuteNonQuery("DELETE FROM bill_details WHERE id = @1", [id]) == 1;
}
