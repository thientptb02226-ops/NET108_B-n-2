namespace Lab3.Entities;

public sealed record Category(int Id, string Name, bool Active);
public sealed record Drink(int Id, int CategoryId, string Name, int Price, string? Image, string? Description, bool Active);
public sealed record User(int Id, string Email, string Password, string FullName, string? Phone, bool Role, bool Active);
public sealed record Bill(int Id, int UserId, string Code, DateOnly CreatedAt, int Total, string Status);
public sealed record BillDetail(int Id, int BillId, int DrinkId, int Quantity, int Price);
