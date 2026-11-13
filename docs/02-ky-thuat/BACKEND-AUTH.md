# Hợp đồng xác thực Commerce v1

Backend dùng ASP.NET Core Identity, SQL Server schema `commerce`, bearer token. Frontend do Antigravity thực hiện; tài liệu này là hợp đồng tích hợp. Các endpoint đã có code và build, nhưng chưa được kiểm thử end to end với SQL Server, SMTP và OAuth provider vì Docker Engine trên máy hiện chưa chạy.

## Vai trò và quyền

| Vai trò | Quyền hiện có | Cách cấp |
| --- | --- | --- |
| Khách chưa đăng nhập | Xem catalog đã xuất bản | Không cần tài khoản |
| Người mua (đã đăng nhập) | Giỏ, đơn của chính mình, trợ lý đề xuất | Đăng ký hoặc OAuth; không có role nâng quyền |
| `CatalogManager` | Tạo/sửa/xuất bản/ẩn sản phẩm | CLI `--grant-role` |
| `InventoryManager` | Điều chỉnh tồn kho có ghi lịch sử | CLI `--grant-role` |
| `SupportAgent` | Dự phòng cho chức năng hỗ trợ khách hàng; hiện chưa có API đặc quyền | CLI `--grant-role` |
| `Admin` | Quyền catalog và tồn kho hiện có | CLI `--bootstrap-admin` |

API công khai không có thao tác tự cấp role. `GET /api/v1/auth/me` trả `{ id, email, emailConfirmed, roles }`. Route quản trị trả `403` nếu token hợp lệ nhưng thiếu role. Giỏ và đơn kiểm tra `UserId` trong CSDL; tài nguyên của người khác trả `404`.

## Đăng ký, mã email và quên mật khẩu

1. `POST /api/v1/auth/register` với `{ "email": "user@example.com", "password": "Strong!Password123" }`. Mật khẩu tối thiểu 12 ký tự, chữ hoa/thường, số, ký tự đặc biệt. Backend gửi email có mã xác nhận. SMTP là bắt buộc cả khi phát triển; Compose dùng Mailpit tại `http://localhost:8025` để kiểm tra email, không gửi ra Internet.
2. `POST /api/v1/auth/confirm-email-code` với `{ "email": "user@example.com", "code": "mã trong email" }`. Mã là chuỗi bảo mật dài, có hiệu lực 15 phút. `POST /api/v1/auth/resendConfirmationEmail` với `{ "email": "..." }` gửi lại mã. Chưa xác nhận email thì không đăng nhập được.
3. `POST /api/v1/auth/login` với email và password trả `{ accessToken, expiresIn, refreshToken }`. Access token hết hạn sau 15 phút; refresh token sau 7 ngày. `POST /api/v1/auth/refresh` nhận `{ "refreshToken": "..." }`. `POST /api/v1/auth/logout` cần bearer token, đổi security stamp để vô hiệu hóa refresh token cũ; access token đã phát vẫn có hiệu lực tối đa tới khi hết hạn. Frontend xóa cả hai token khỏi phiên khi logout, không ghi URL/log.
4. `POST /api/v1/auth/forgotPassword` với `{ "email": "..." }` gửi mã đặt lại. `POST /api/v1/auth/resetPassword` với `{ "email": "...", "resetCode": "mã trong email", "newPassword": "New!Password123" }`. Mã có hiệu lực 15 phút. Phản hồi quên mật khẩu không nên tiết lộ email có tài khoản hay không. Identity còn có `GET /confirmEmail` từ framework nhưng UI dùng luồng nhập mã ở trên.

## Đăng nhập Google/Facebook

Chỉ bật provider khi đã cấu hình cả client ID và secret. Frontend mở trình duyệt tới `GET /api/v1/auth/external/google/start` hoặc `/facebook/start`. Backend chuyển tới provider; callback phía backend là `/signin-google` hoặc `/signin-facebook`. Cần khai báo chính xác URI công khai này trong Google Console và Facebook Developers. [Hướng dẫn OAuth của Microsoft](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/?view=aspnetcore-10.0) mô tả cấu hình provider.

Backend chuyển về `Frontend:AuthCallbackUrl` cố định:

- `?status=verify_email`: tài khoản OAuth mới, cần nhập mã xác nhận gửi qua email, sau đó khởi động đăng nhập OAuth lại.
- `?code=...`: mã trao đổi một lần, hết hạn sau 2 phút. Frontend gửi `POST /api/v1/auth/external/exchange` với `{ "code": "..." }` để nhận token JSON. Mã được lưu dạng SHA-256 trong CSDL, khóa hàng khi đổi và đánh dấu đã dùng. Không đưa access token hay refresh token vào URL.
- `?error=account_exists_use_password`: email đã có tài khoản nhưng chưa liên kết provider. Người dùng đăng nhập bằng mật khẩu; backend không tự ghép theo email để tránh chiếm tài khoản. Tính năng liên kết tài khoản có xác nhận sẽ được thiết kế riêng.

Facebook có thể không cung cấp email; backend trả `provider_email_required`, người dùng dùng phương thức khác hoặc cấp quyền email. Lỗi cấu hình trả `provider_not_configured`. Frontend hiển thị lỗi, không coi OAuth thành công khi chưa đổi được token. Callback Production và ứng dụng phải dùng HTTPS.

## Cấu hình và bảo mật vận hành

Compose Development: SQL Server, Mailpit SMTP `mailpit:1025`, API. `.env` có `MSSQL_SA_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `AUTH_CALLBACK_URL`; secret không commit. Google/Facebook thực tế chỉ kiểm được sau khi chủ dự án tạo ứng dụng, cấp credential và đăng ký URI callback.

Production yêu cầu SMTP Host/Port/From/User/Password, `Smtp__EnableSsl=true`, HTTPS, `Frontend__AuthCallbackUrl` HTTPS, đường dẫn khóa Data Protection bền vững (`DataProtection__KeyPath`) và chứng chỉ PKCS#12 (`DataProtection__CertificatePath`, `DataProtection__CertificatePassword`) để mã hóa khóa khi lưu. Cần mount key volume riêng, giới hạn quyền file, quản lý chứng chỉ và backup. Không dùng Mailpit hay cấu hình Development khi triển khai công khai.

Nếu API nằm sau reverse proxy, đặt `ReverseProxy__KnownProxies__0` bằng IP proxy tin cậy để xử lý `X-Forwarded-Proto`/`X-Forwarded-For`; proxy cần chuyển tiếp Host công khai. Không tin forwarded headers từ mọi IP. Khi dùng Compose cục bộ, SMTP ở `localhost:1025` cho .NET chạy trực tiếp và `mailpit:1025` cho API container.

Đường xác thực bị giới hạn 10 request/phút/IP; Identity khóa tài khoản 15 phút sau 5 lần đăng nhập sai. Refresh token và email token phụ thuộc khóa Data Protection, nên phải giữ khóa qua các lần deploy. Chưa có tích hợp OAuth provider chạy thật, kiểm thử SMTP production, thu hồi access token tức thì hay bắt buộc MFA cho nhân viên; đây là điều kiện cần làm trước khi công bố mức bảo mật production hoàn chỉnh.
