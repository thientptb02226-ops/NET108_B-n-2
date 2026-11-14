# Chạy bài thực hành Lab 4

Lab 4 là ứng dụng **ASP.NET Core MVC riêng** dùng CSDL SQL Server và DAL của Lab 3. Nó minh họa đăng nhập cookie, quyền `Employee`/`Manager` và quản lý danh mục; không thay frontend Commerce.

## Chuẩn bị CSDL

Chạy script và thiết lập `LAB3_SQL_CONNECTION` theo [hướng dẫn Lab 3](LAB3-RUN.md). Trên Windows có SQL Server LocalDB, mở PowerShell tại gốc repo:

```powershell
sqllocaldb start MSSQLLocalDB
sqllocaldb info MSSQLLocalDB
sqlcmd -S '<Instance pipe name>' -E -b -i 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 3/Database/01-create-and-seed.sql'
$env:LAB3_SQL_CONNECTION = 'Server=(localdb)\MSSQLLocalDB;Database=Net108KhaiLab3;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
```

Thay `<Instance pipe name>` bằng giá trị lệnh `sqllocaldb info` trả về. Nếu dùng SQL Server khác, đặt connection string tương ứng. Không lưu mật khẩu DB trong repo.

## Tạo tài khoản thử

Đặt hai email và hai mật khẩu riêng. Mật khẩu tối thiểu 12 ký tự, có chữ hoa, chữ thường và số. Lệnh seed băm mật khẩu trước khi lưu vào bảng `users` của Lab 3:

```powershell
$env:LAB4_MANAGER_EMAIL = 'manager-lab4@example.test'
$env:LAB4_MANAGER_PASSWORD = '<mat-khau-manh-cua-ban>'
$env:LAB4_EMPLOYEE_EMAIL = 'employee-lab4@example.test'
$env:LAB4_EMPLOYEE_PASSWORD = '<mat-khau-manh-khac>'
dotnet run --project 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 4/Source/Lab4.Web' -- --seed-users
```

Nếu email đã có, lệnh seed không ghi đè tài khoản hoặc mật khẩu. Hãy dùng email mới khi cần thử lại.

## Build, chạy web và kiểm thử

```powershell
dotnet build 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 4/Source/Lab4.Net108Khai.slnx'
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 4/Source/Lab4.Web' -- --urls http://localhost:5084
```

Mở `http://localhost:5084/Login/Login`. Manager được xem, thêm, sửa, xóa danh mục; Employee chỉ được xem danh sách và chi tiết. Đăng xuất bằng nút ở thanh điều hướng. Khi triển khai ngoài máy phát triển, cấu hình HTTPS/TLS vì cookie Production chỉ gửi qua HTTPS.

Lệnh kiểm tra FileUtil độc lập không cần CSDL:

```powershell
dotnet run --project 'File Lab và Dự Án cuối/Lab 1 - 8/Lab 4/Source/Lab4.Web' -- --verify-file-util
```

Script kiểm thử HTTP tự tạo tài khoản thử có email `example.invalid`, đăng nhập bằng form thật, kiểm quyền, tạo/sửa/xóa danh mục và kiểm logout:

```powershell
./scripts/lab4-smoke.ps1
```

Để lưu lại HTML thật của các màn hình trong lượt kiểm thử, dùng `./scripts/lab4-smoke.ps1 -EvidenceDirectory '.artifacts/lab4-evidence-html'`. Các ảnh chụp từ HTML này để đối chiếu báo cáo nằm trong `File Lab và Dự Án cuối/Lab 1 - 8/Lab 4/Evidence/`.

Script để lại hai tài khoản thử có mật khẩu hash trong LocalDB để có thể truy vết. Nó xóa danh mục thử. `FileUtil` được kiểm riêng và chưa nối với form danh mục vì bảng `categories` của đề không có cột ảnh.

## Phạm vi và kết quả đã kiểm

Ngày 14/11/2026: solution build 0 lỗi/0 cảnh báo; FileUtil lưu PNG hợp lệ và từ chối PNG giả; HTTP smoke qua cho đăng nhập, cookie, logout, chính sách quyền và CRUD. Môi trường kiểm là SQL Server LocalDB trên Windows, chưa phải Docker. Source Lab 4 tham chiếu source Lab 3; gói ZIP nộp bài kèm cả hai thư mục source để biên dịch.
