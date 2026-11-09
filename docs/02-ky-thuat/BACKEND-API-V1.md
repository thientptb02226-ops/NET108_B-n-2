# Hợp đồng backend v1 cho Antigravity

**Trạng thái:** các route dưới đây đã có code và build; chưa có kiểm thử tích hợp với PostgreSQL trên máy hiện tại vì Docker Engine không chạy. OpenAPI động ở `/openapi/v1.json` khi chạy Development. Base URL Compose: `http://localhost:8080`. Frontend chỉ xem API trả về là dữ liệu thật sau khi smoke test đi qua.

## Xác thực

`POST /api/v1/auth/register` nhận `{ "email": "...", "password": "..." }` và gửi mã xác thực email qua SMTP. `POST /api/v1/auth/confirm-email-code` nhận `{ "email": "...", "code": "..." }`. Cả Development và Production đều yêu cầu xác nhận email trước khi đăng nhập. `POST /api/v1/auth/login` nhận email/password, trả `accessToken`, `expiresIn`, `refreshToken`; `/refresh` gia hạn. Các route riêng nhận header `Authorization: Bearer <accessToken>`. Quên mật khẩu, Google/Facebook, role và các trạng thái lỗi được mô tả ở [hợp đồng xác thực](BACKEND-AUTH.md).

## Catalog

`GET /api/v1/products?q=&page=1&pageSize=20` trả:

```json
{
  "items": [{
    "id": "product-guid", "name": "Áo thun", "description": "...", "currency": "VND",
    "variants": [{ "id": "variant-guid", "sku": "SKU-001", "name": "Mặc định", "priceVnd": 199000, "stock": 20 }]
  }],
  "page": 1, "pageSize": 20, "total": 1
}
```

`GET /api/v1/products/{id}` trả một product cùng cấu trúc. Chỉ sản phẩm đã xuất bản và biến thể active xuất hiện. Giá/tồn có thể đổi giữa lúc xem và đặt hàng.

## Giỏ và đơn

Tất cả route sau yêu cầu bearer token. `POST /api/v1/carts` trả `{ "id": "cart-guid" }`. `PUT /api/v1/carts/{id}/items/{variantId}` nhận `{ "quantity": 1 }`; `0` xóa dòng, `1..99` cập nhật. `GET /api/v1/carts/{id}` trả `lines`, `currency`, `totalVnd` và `provisional: true`. Tổng giỏ chỉ là tạm tính.

`POST /api/v1/carts/{id}/checkout` yêu cầu `Idempotency-Key` dài 1–100 ký tự. Request không có body. Lần đầu trả `201` với `{ id, status: "pending_payment", totalVnd, expiresAt, currency: "VND", replayed: false }`; retry cùng key/cùng cart trả `200`, cùng order ID và `replayed: true`. Key đã dùng cho cart khác trả `409`. API tính lại giá và tồn trong transaction trước khi tạo đơn. Đơn chờ thanh toán hết hạn sau 30 phút và hoàn tồn; hiện chưa có API thanh toán nên đây **không** phải đơn đã trả tiền.

`GET /api/v1/orders` trả tối đa 50 đơn của người dùng. `GET /api/v1/orders/{id}` trả chi tiết và dòng hàng đã chốt giá. `POST /api/v1/orders/{id}/cancel` chỉ nhận đơn `pending_payment`, trả `204` và hoàn tồn. Cart/order của người khác trả `404` để không lộ sự tồn tại.

Frontend cần hiển thị rõ `pending_payment`, `cancelled`, `expired`. Chỉ báo đặt hàng thành công sau khi nhận order ID. Không hiển thị đã thanh toán vì backend chưa có thanh toán.

## Quản trị catalog

Route quản trị sản phẩm cần `Admin` hoặc `CatalogManager`; route điều chỉnh tồn kho cần `Admin` hoặc `InventoryManager`. Role được cấp bằng CLI riêng, không qua API đăng ký công khai:

| Route | Request | Kết quả |
| --- | --- | --- |
| `POST /api/v1/admin/products/` | `{ "name": "...", "description": "...", "variants": [{ "sku": "SKU-001", "name": "Mặc định", "priceVnd": 199000, "stock": 20 }] }` | `201`, sản phẩm ở trạng thái nháp |
| `PUT /api/v1/admin/products/{id}` | `{ "name": "...", "description": "..." }` | `204` |
| `POST /api/v1/admin/products/{id}/publish` | không body | `204`; cần biến thể active có giá dương |
| `POST /api/v1/admin/products/{id}/unpublish` | không body | `204` |
| `POST /api/v1/admin/variants/{id}/stock-adjustments` | `{ "delta": 5, "reason": "kiểm kho" }` | `200`, tồn mới; ghi lịch sử biến động |

Chưa có upload ảnh, sửa giá/biến thể, khuyến mại hoặc quản lý nhiều kho. UI quản trị đánh dấu phần chưa có API thay vì giả lập lưu thành công.

## AI đề xuất sản phẩm

`POST /api/v1/assistant/recommend` nhận `{ "message": "Tìm áo dưới 200 nghìn" }`, cần bearer token. Trả `{ answer, currency: "VND", products: [...], checkedAt }`. Model chỉ chọn SKU; server xác nhận SKU và lấy giá/tồn hiện hành từ DB. Nếu thiếu provider trả `503`; provider lỗi/JSON không hợp lệ trả `502`; catalog trên 200 biến thể trả `503`. Endpoint không đặt đơn, không trả lời chính sách và không dùng làm nguồn sự thật cho giá/tồn ngoài response đã kiểm tra.

## Quy ước lỗi và bàn giao

Lỗi nghiệp vụ dùng Problem Details với HTTP status và `title` là mã như `invalid_quantity`, `insufficient_stock`, `empty_cart`, `checkout_conflict`. `400` = input sai; `401` = chưa đăng nhập; `403` = thiếu role; `404` = không tồn tại hoặc không thuộc người dùng; `409` = trạng thái/tồn xung đột; `429` = rate limit; `502/503` = provider hoặc hệ thống chưa sẵn. Frontend xử lý theo status và mã, không dựa vào câu chữ `detail`.

Khi Antigravity cần trường/route mới: gửi màn hình, dữ liệu cần, trạng thái lỗi và ví dụ; Codex cập nhật endpoint và OpenAPI trước khi frontend tích hợp. Các hợp đồng về shipping, thuế và thanh toán sẽ bổ sung sau khi chủ dự án chốt.
