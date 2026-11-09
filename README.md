# Net108Khai AI native Commerce

[Đặc tả hệ thống](docs/AI-NATIVE-COMMERCE.md) mô tả kiến trúc mục tiêu. [Checklist AI](docs/AI-COMMERCE-EXECUTION-CHECKLIST.md) và [bảng tick](docs/AI-COMMERCE-TASK-BOARD.md) ghi phần đã nghiệm thu. Antigravity sở hữu frontend; Codex sở hữu backend .NET.

[Hợp đồng API v1 cho Antigravity](docs/BACKEND-API-V1.md) ghi route, payload, quyền và trạng thái triển khai.
[Hợp đồng xác thực và phân quyền](docs/BACKEND-AUTH.md) ghi luồng mã email, quên mật khẩu, Google/Facebook và ma trận role.
[Quy trình Waterfall Commerce](docs/AI-COMMERCE-WATERFALL.md) quy định cổng yêu cầu → thiết kế → triển khai → kiểm thử → nghiệm thu → vận hành; trạng thái cổng nằm trong bảng tick.

## Backend hiện có

ASP.NET Core 10, EF Core code first và PostgreSQL. CSDL giao dịch nằm trong schema `commerce`; migration ở `src/Net108Khai.Api/Data/Migrations`. API v1 có tài khoản Identity bearer, catalog và biến thể, quản trị catalog/điều chỉnh tồn, giỏ theo người dùng, đặt đơn idempotent, hủy đơn chờ thanh toán và tự hết hạn sau 30 phút. Trợ lý chỉ chọn SKU; server lấy giá/tồn từ CSDL và tạo câu trả lời có kiểm soát.

**Chưa có cổng thanh toán:** đơn ở `pending_payment`, không thể chuyển sang `paid` bằng API hiện tại. Theo yêu cầu của dự án, payment là phần tích hợp cuối. Không dùng bản này để thu tiền hoặc công bố là đã hoàn thiện toàn bộ quy trình thương mại.

## Chạy phát triển bằng Docker

```powershell
Copy-Item .env.example .env
docker compose up --build -d
Invoke-RestMethod http://localhost:8080/health/ready
./scripts/smoke.ps1
```

Compose khởi động PostgreSQL và Mailpit, chạy **migrator một lần**, rồi khởi động API. Migrator chỉ thêm sản phẩm mẫu khi ở `Development`. Dữ liệu lưu trong volume `postgres_data`; khóa xác thực lưu ở `protection_keys`. `docker compose down` không xóa các volume. Email thử xem tại `http://localhost:8025`. Trang OpenAPI phát triển: `http://localhost:8080/openapi/v1.json`. Docker Engine phải chạy trước khi dùng Compose.

## Chạy .NET trực tiếp

```powershell
docker compose up -d db
docker compose up -d mailpit
$env:ConnectionStrings__Commerce='Host=localhost;Port=5432;Database=net108khai;Username=net108khai;Password=local-dev-only'
dotnet run --project src/Net108Khai.Api -- --migrate
dotnet run --project src/Net108Khai.Api --urls http://localhost:8080
```

Database `net108khai` được PostgreSQL trong Compose tạo. EF migration tạo schema `commerce` và bảng; ứng dụng API không tự thay schema lúc khởi động. Các bảng demo cũ trong schema `public` (nếu có) được giữ nguyên, **không tự nhập** vào schema mới.

## Xác thực và API

`POST /api/v1/auth/register` với `email`, `password` (tối thiểu 12 ký tự, chữ hoa/thường, số và ký tự đặc biệt) gửi mã qua email. `POST /api/v1/auth/confirm-email-code` xác nhận email; sau đó `/login` trả bearer token và `/refresh` gia hạn. `/forgotPassword` và `/resetPassword` dùng mã email để đặt lại mật khẩu. Google/Facebook dùng `/external/{provider}/start` và mã trao đổi một lần. Frontend gửi `Authorization: Bearer <accessToken>`. Sản phẩm công khai tại `GET /api/v1/products`; giỏ và đơn yêu cầu đăng nhập. Chi tiết ở [hợp đồng xác thực](docs/BACKEND-AUTH.md).

```text
GET  /api/v1/products
GET  /api/v1/products/{id}
POST /api/v1/carts
GET  /api/v1/carts/{id}
PUT  /api/v1/carts/{id}/items/{variantId}
POST /api/v1/carts/{id}/checkout    Idempotency-Key: <unique key>
GET  /api/v1/orders
GET  /api/v1/orders/{id}
POST /api/v1/orders/{id}/cancel
POST /api/v1/assistant/recommend
```

Route quản trị sản phẩm yêu cầu `Admin` hoặc `CatalogManager`; điều chỉnh tồn kho yêu cầu `Admin` hoặc `InventoryManager`. Tạo admin đầu tiên bằng tác vụ CLI riêng; **không** có endpoint công khai cấp role:

```powershell
$env:Bootstrap__AdminEmail='admin@example.com'
$env:Bootstrap__AdminPassword='<mật-khẩu-mạnh-riêng>'
docker compose run --rm -e Bootstrap__AdminEmail -e Bootstrap__AdminPassword api --bootstrap-admin
Remove-Item Env:Bootstrap__AdminPassword
```

Cấp role nhân viên cho tài khoản đã xác nhận email: đặt `Bootstrap__GrantEmail`, `Bootstrap__GrantRole` (`CatalogManager`, `InventoryManager` hoặc `SupportAgent`), rồi chạy `docker compose run --rm -e Bootstrap__GrantEmail -e Bootstrap__GrantRole api --grant-role`. Cấp role có hiệu lực sau khi người dùng đăng nhập lại.

Mật khẩu trên là chỗ điền, không phải mật khẩu mặc định. Không commit `.env` hoặc secret.

## AI provider

Điền `AI_ENDPOINT`, `AI_MODEL`, `AI_API_KEY` trong `.env`; endpoint phải hỗ trợ `POST /v1/chat/completions`. Ngoài Development, endpoint phải dùng HTTPS. Endpoint `recommend` yêu cầu đăng nhập và giới hạn tần suất; model chỉ chọn tối đa 5 SKU, còn giá/tồn do server đọc từ DB. Nếu chưa cấu hình provider trả 503; catalog trên 200 biến thể trả 503 cho đến khi có search/retrieval phù hợp.

## Phát hành thật

- Cấu hình SMTP (`Smtp__Host`, `Smtp__Port`, `Smtp__From`, `Smtp__User`, `Smtp__Password`) trước khi chạy Production. Development dùng Mailpit và vẫn yêu cầu xác nhận email. Cấu hình chứng chỉ mã hóa khóa Data Protection và OAuth callback HTTPS theo [hợp đồng xác thực](docs/BACKEND-AUTH.md).
- Tạo và **duyệt** SQL migration trước khi áp dụng trên database thật: `dotnet ef migrations script --idempotent --project src/Net108Khai.Api --startup-project src/Net108Khai.Api -o migrate.sql`. [Hướng dẫn EF Core](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying) khuyến nghị kiểm tra migration và dùng script/bundle trong triển khai production.
- Dùng reverse proxy HTTPS, secret manager, backup và kiểm thử restore. Đổi `POSTGRES_PASSWORD`; không đưa Compose Development nguyên trạng lên Internet.
- Thanh toán, giao hàng, thuế/phí, chính sách hoàn trả và nội dung thật vẫn cần được chốt và tích hợp. Chỉ đánh dấu các ô trong bảng tick khi đã có bằng chứng test tương ứng.
