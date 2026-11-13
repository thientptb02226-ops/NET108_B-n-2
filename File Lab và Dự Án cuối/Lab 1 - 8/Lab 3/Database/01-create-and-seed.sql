-- Lab 3 schema matches the five-table exercise. It is isolated from Commerce's EF database.
IF DB_ID(N'Net108KhaiLab3') IS NULL CREATE DATABASE Net108KhaiLab3;
GO
USE Net108KhaiLab3;
GO
IF OBJECT_ID(N'dbo.categories', N'U') IS NULL
CREATE TABLE dbo.categories (
    id int IDENTITY(1,1) PRIMARY KEY,
    name nvarchar(250) NOT NULL,
    active bit NOT NULL CONSTRAINT DF_categories_active DEFAULT 1
);
IF OBJECT_ID(N'dbo.drinks', N'U') IS NULL
CREATE TABLE dbo.drinks (
    id int IDENTITY(1,1) PRIMARY KEY,
    category_id int NOT NULL REFERENCES dbo.categories(id),
    name nvarchar(250) NOT NULL,
    price int NOT NULL CHECK (price >= 0),
    image nvarchar(250) NULL,
    description nvarchar(max) NULL,
    active bit NOT NULL CONSTRAINT DF_drinks_active DEFAULT 1
);
IF OBJECT_ID(N'dbo.users', N'U') IS NULL
CREATE TABLE dbo.users (
    id int IDENTITY(1,1) PRIMARY KEY,
    email varchar(100) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    full_name nvarchar(60) NOT NULL,
    phone varchar(10) NULL,
    role bit NOT NULL,
    active bit NOT NULL CONSTRAINT DF_users_active DEFAULT 1
);
IF OBJECT_ID(N'dbo.bills', N'U') IS NULL
CREATE TABLE dbo.bills (
    id int IDENTITY(1,1) PRIMARY KEY,
    user_id int NOT NULL REFERENCES dbo.users(id),
    code varchar(10) NOT NULL UNIQUE,
    created_at date NOT NULL,
    total int NOT NULL CHECK (total >= 0),
    status varchar(10) NOT NULL
);
IF OBJECT_ID(N'dbo.bill_details', N'U') IS NULL
CREATE TABLE dbo.bill_details (
    id int IDENTITY(1,1) PRIMARY KEY,
    bill_id int NOT NULL REFERENCES dbo.bills(id),
    drink_id int NOT NULL REFERENCES dbo.drinks(id),
    quantity int NOT NULL CHECK (quantity > 0),
    price int NOT NULL CHECK (price >= 0)
);
GO
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE name = N'Đồ dùng học tập')
    INSERT dbo.categories(name, active) VALUES (N'Đồ dùng học tập', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.drinks WHERE name = N'Sổ tay học tập')
    INSERT dbo.drinks(category_id, name, price, image, description, active)
    VALUES ((SELECT TOP 1 id FROM dbo.categories WHERE name = N'Đồ dùng học tập'),
            N'Sổ tay học tập', 35000, NULL, N'Dữ liệu mẫu Lab 3', 1);
-- This disabled account is sample data only; its password value is not an authentication credential.
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'lab3-demo@example.invalid')
    INSERT dbo.users(email, password, full_name, phone, role, active)
    VALUES ('lab3-demo@example.invalid', 'NO_LOGIN_SAMPLE_RECORD', N'Người dùng mẫu', NULL, 0, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.bills WHERE code = 'LAB30001')
    INSERT dbo.bills(user_id, code, created_at, total, status)
    VALUES ((SELECT id FROM dbo.users WHERE email = 'lab3-demo@example.invalid'),
            'LAB30001', CONVERT(date, GETDATE()), 35000, 'sample');
IF NOT EXISTS (SELECT 1 FROM dbo.bill_details
               WHERE bill_id = (SELECT id FROM dbo.bills WHERE code = 'LAB30001'))
    INSERT dbo.bill_details(bill_id, drink_id, quantity, price)
    VALUES ((SELECT id FROM dbo.bills WHERE code = 'LAB30001'),
            (SELECT TOP 1 id FROM dbo.drinks WHERE name = N'Sổ tay học tập'), 1, 35000);
GO
