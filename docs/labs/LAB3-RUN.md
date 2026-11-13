# Chạy bài thực hành Lab 3

Đây là bài ADO.NET **độc lập** theo đề `LAB 3.pdf`, không phải cơ sở dữ liệu giao dịch của backend Commerce. Bài dùng 5 bảng `categories`, `drinks`, `users`, `bills`, `bill_details` trong database `Net108KhaiLab3`. Trường `drinks` được dùng làm sản phẩm mẫu để liên hệ với đề tài đồ dùng học tập. Không nối bài mẫu này vào API Commerce.

## Cấu trúc

- `File Lab và Dự Án cuối/Lab 1 - 8/Lab 3/Database/01-create-and-seed.sql`: tạo database, khóa ngoại, ràng buộc và 1 bộ dữ liệu mẫu. Chạy lại không chèn trùng dữ liệu mẫu.
- `.../Source/Lab3.Entities`: 5 lớp thực thể có kiểu C# tương ứng.
- `.../Source/Lab3.Data`: `DBUtil` ADO.NET và 5 lớp DAL, mỗi lớp có `GetAll`, `GetById`, `Insert`, `Update`, `Delete`.
- `.../Source/Lab3.Console`: tầng trình bày, hiển thị số dòng và kịch bản kiểm thử CRUD.

## Cách chạy với SQL Server LocalDB trên Windows

Mở PowerShell tại thư mục gốc repo. Khởi động LocalDB bằng `sqllocaldb start MSSQLLocalDB`, rồi xem pipe bằng `sqllocaldb info MSSQLLocalDB`. Dùng giá trị **Instance pipe name** vừa trả về làm tham số `-S` cho `sqlcmd`:

```powershell
sqlcmd -S '<Instance pipe name>' -E -b -i 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 3/Database/01-create-and-seed.sql'
$env:LAB3_SQL_CONNECTION = 'Server=(localdb)\MSSQLLocalDB;Database=Net108KhaiLab3;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
dotnet build 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 3/Source/Lab3.Net108Khai.slnx'
dotnet run --project 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 3/Source/Lab3.Console' -- --verify
```

Với SQL Server khác, chạy script bằng SSMS hoặc `sqlcmd` trên server đó và đặt `LAB3_SQL_CONNECTION` tới `Net108KhaiLab3`. Không lưu mật khẩu trong repo. `--verify` chèn bản ghi thử riêng, đọc/sửa từng loại và xóa theo thứ tự khóa ngoại; 5 bản ghi mẫu vẫn giữ nguyên.

## Bằng chứng ngày 13/11/2026

Trên SQL Server LocalDB 17.0.4025.3, script chạy hai lần không lỗi và chỉ chèn dữ liệu mẫu ở lần đầu. `dotnet build` qua, bài kiểm thử trả:

```text
PASS: GetAll, GetById, Insert, Update for all five entities.
PASS: Delete for all five entities; sample rows remain.
```

Docker Engine không chạy trong lần kiểm này; bài Lab đã được kiểm bằng SQL Server LocalDB. Backend Commerce vẫn dùng EF Core Code First SQL Server trong `src/Net108Khai.Api` theo [quyết định chuyển provider](../02-ky-thuat/SQLSERVER-TRANSITION-LAB3.md).
