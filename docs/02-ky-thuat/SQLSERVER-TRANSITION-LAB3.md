# Quyết định chuyển Commerce sang SQL Server từ Lab 3

**Ngày quyết định:** 11/11/2026. **Người quyết định:** chủ dự án. **Phạm vi:** backend Commerce `.NET 10` trong `src/Net108Khai.Api`, EF Core Code First, Docker Compose và tài liệu từ Lab 3 trở đi. Các Lab 1–2 và lịch sử Git có thể mô tả PostgreSQL tại thời điểm chúng được làm; không viết lại lịch sử như thể SQL Server đã chạy từ đầu.

## Lý do và ranh giới

Đề `File Lab và Dự Án cuối/File đề lab và mẫu báo cáo và slide bài giảng/Bài lab/LAB 3.pdf` yêu cầu cú pháp SQL Server (`CREATE DATABASE`, `identity`, `nvarchar`) và `SqlConnection`/`SqlCommand` trong phần ADO.NET. Vì vậy backend Commerce chuyển từ `Npgsql`/PostgreSQL sang `Microsoft.EntityFrameworkCore.SqlServer`/SQL Server. **Việc đổi provider không tự hoàn thành Lab 3:** bài Lab còn yêu cầu mô hình 3 lớp, `DBUtil`, entity và DAL có `GetAll`, `GetById`, `Insert`, `Delete`, `Update`. Báo cáo/bài nộp Lab 3 phải đối chiếu riêng từng tiêu chí đó với code thực tế; không gọi EF Core là ADO.NET `DBUtil`.

## Thay đổi kỹ thuật

| Thành phần | Trước | Từ Lab 3 |
| --- | --- | --- |
| EF provider | `Npgsql.EntityFrameworkCore.PostgreSQL`, `UseNpgsql` | `Microsoft.EntityFrameworkCore.SqlServer` 10.0.14, `UseSqlServer` |
| Docker DB | `postgres:17-alpine`, `postgres_data`, 5432 | SQL Server 2022 Developer, `sqlserver_data`, 1433 |
| `Guid` | `uuid` | `uniqueidentifier` |
| `DateTimeOffset` | PostgreSQL timestamp mapping | `datetimeoffset` |
| Chuỗi | PostgreSQL text/varchar | SQL Server `nvarchar` theo cấu hình EF |
| Khóa bản ghi | `FOR UPDATE`, `SKIP LOCKED` | `UPDLOCK`/`HOLDLOCK`; worker chờ bản ghi đang khóa |
| Tìm kiếm | `ILike` | `Like`; mức khớp hoa/thường và dấu phụ thuộc collation SQL Server, cần kiểm thử với tiếng Việt |
| Mã lỗi unique | PostgreSQL `23505` | SQL Server `2601`/`2627` |

Identity user/role ID và khóa ghép login/token giới hạn 128 ký tự trong EF model để các primary key/index không vượt giới hạn khóa của SQL Server; ID hiện tại do Identity tạo dưới dạng chuỗi GUID ngắn hơn giới hạn này.

EF migration PostgreSQL cũ bị thay khỏi assembly hiện tại; Git history vẫn giữ mã nguồn cũ. Migration `SqlServerInitial` mới tạo schema `commerce` và bảng trên **SQL Server trống**. EF migrator chạy riêng bằng `--migrate` trước API. Script T-SQL idempotent tạo bằng `dotnet ef migrations script --idempotent --project src/Net108Khai.Api --startup-project src/Net108Khai.Api`; kiểm nội dung trước khi áp dụng ngoài Development.

**Dữ liệu cũ:** chuyển provider không chuyển dữ liệu. Volume PostgreSQL cũ không bị xóa bởi Compose mới; không dùng `docker compose down -v` để dọn môi trường khi chưa sao lưu. Nếu đã có đơn/tài khoản thật trên PostgreSQL, TV1 phải lập kế hoạch export → ánh xạ kiểu/trường → nhập SQL Server → đối soát số dòng/tổng tiền/quyền → rollback, rồi kiểm thử trên bản sao. Chưa có bằng chứng chạy kế hoạch này; không đổi connection string của hệ thống đang giữ dữ liệu thật trước khi hoàn tất.

## Cấu hình và kiểm chứng

`.env.example` chỉ có mật khẩu **mẫu phát triển**; `.env` được ignore. Compose dùng `MSSQL_SA_PASSWORD` và `ACCEPT_EULA=Y` cho image Developer. Connection string Development bật `Encrypt=True;TrustServerCertificate=True` vì chứng chỉ container tự ký. Môi trường thật cần tài khoản quyền tối thiểu, chứng chỉ TLS được tin cậy và secret ngoài repo; không dùng cấu hình Development để phát hành.

Trên máy có Docker Engine, TV1 chạy:

```powershell
Copy-Item .env.example .env
docker compose config --quiet
docker compose up --build -d
Invoke-RestMethod http://localhost:8080/health/ready
./scripts/smoke.ps1
```

Sau đó kiểm migration trong SQL Server, kiểm tìm kiếm tiếng Việt, khóa tồn/đơn đồng thời, mã email và worker hết hạn. Chỉ tick `C00.2–C00.3`, `C03.2–C03.3` và cổng `W04` khi có kết quả thật. Nếu Docker Engine không chạy, ghi **chưa kiểm chứng** dù `dotnet build`, Compose config và T-SQL script sinh thành công.

**Kết quả kiểm chứng 11/11/2026 trên môi trường Development:** `dotnet build Net108Khai.slnx --no-restore` qua với 0 cảnh báo/lỗi; `docker compose up --build -d` khởi động SQL Server healthy, migrator áp dụng `20261111100131_SqlServerInitial`, API trả `/health/ready = ready`; query SQL Server xác nhận 2 sản phẩm mẫu. `./scripts/smoke.ps1` qua đăng ký/xác thực email, đặt lại mật khẩu, chặn đọc giỏ khác chủ, checkout idempotent, hủy đơn và thu hồi refresh token. Bài smoke chờ hết cửa sổ rate limit trước hai yêu cầu auth cuối. Chưa kiểm trên bản sao PostgreSQL có dữ liệu thật, tải đồng thời, collation tiếng Việt, SMTP/OAuth/AI provider thật hoặc backup/restore; các ô tương ứng vẫn để mở.

## Tác động Waterfall và phân công

Đây là thay đổi thiết kế database do chủ dự án yêu cầu tại `W01`; TV1 cập nhật `W02` (schema, migration, OpenAPI và rollback). TV2 rà Identity/catalog/đọc mẫu; TV3 rà giá, tồn, giỏ, quote, đơn và tính đồng thời; TV4 rà payment/outbox; TV5 rà các truy vấn tri thức. Antigravity chỉ cần kiểm hợp đồng API nếu payload hoặc lỗi thay đổi. Bảng tick là nơi duy nhất ghi hoàn thành; quyết định này không tự tick `W01/W02`.

Nguồn kỹ thuật: [EF Core SQL Server provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/), [SQL Server container](https://learn.microsoft.com/en-us/sql/linux/install-upgrade/quickstart-install-docker?view=sql-server-linux-ver16), [gói EF Core SqlServer 10.0.14](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.SqlServer/10.0.14).
