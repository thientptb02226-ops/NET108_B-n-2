# Waterfall cho Net108Khai AI native Commerce

Tài liệu này quy định **thứ tự cổng giai đoạn**. [Đặc tả](AI-NATIVE-COMMERCE.md) chứa mục tiêu sản phẩm, [checklist](AI-COMMERCE-EXECUTION-CHECKLIST.md) chứa tiêu chí chức năng, và [bảng tick](AI-COMMERCE-TASK-BOARD.md) là nơi duy nhất ghi trạng thái hoàn thành. Các đợt `0–4` trong bảng tick là **nhóm chức năng**, không phải giai đoạn Waterfall.

## Quy tắc chuyển giai đoạn

Mỗi bản phát hành có phạm vi rõ ràng. Cổng `Wnn` đánh dấu **kết thúc** giai đoạn `Wnn`; chỉ bắt đầu giai đoạn kế tiếp sau khi cổng trước có bằng chứng và được tick trong bảng. Chủ dự án chốt yêu cầu và nghiệm thu; Codex chịu trách nhiệm backend, Antigravity chịu trách nhiệm frontend. Hai agent có thể làm song song **trong giai đoạn triển khai** sau khi thiết kế đã được chốt.

Code, giao diện và tài liệu đã tạo trước quy trình này là **baseline/prototype**. Kiểm kê và đối chiếu chúng với yêu cầu, thiết kế, test; không coi bản đã build hay ô task đã tick là sự phê duyệt ngược cho một cổng Waterfall. Tiếp tục sửa lỗi và kiểm chứng baseline trong phạm vi đã có; yêu cầu nghiệp vụ chưa chốt không được đoán để phát hành.

| Cổng | Giai đoạn | Đầu ra bắt buộc trước khi tick | Chủ trì |
| --- | --- | --- | --- |
| `W01` | Yêu cầu | Phạm vi release, loại hàng/biến thể, người bán/kho, giá/thuế, giao/hoàn, AI, bảo mật, tải/SLO và tiêu chí chấp nhận; quyết định `C01` được ghi ngày. Mục chưa quyết định có owner và được loại khỏi release hoặc giữ cổng mở. | Chủ dự án; Codex/Antigravity làm rõ |
| `W02` | Phân tích và thiết kế | Domain/state machine, schema Code First, sơ đồ luồng dữ liệu, OpenAPI, auth/role, lỗi, idempotency, thiết kế UI, kế hoạch migration/rollback và ma trận test được đối chiếu hai phía. Mọi endpoint trong phạm vi có contract ổn định. | Codex + Antigravity; chủ dự án duyệt quy tắc |
| `W03` | Triển khai | Các task backend/frontend thuộc phạm vi release được hoàn thành theo thiết kế đã chốt; build, unit/contract checks và review từng phần có bằng chứng. Backend và frontend chỉ làm song song trong ranh giới file đã phân công. | Codex + Antigravity |
| `W04` | Kiểm thử hệ thống | Migration trên DB sạch và bản sao dữ liệu, integration/contract/E2E, kiểm quyền, concurrency tồn/đơn, lỗi provider, bảo mật, tải và restore/rollback đều đạt tiêu chí release; lỗi nghiêm trọng đã xử lý. | Codex + Antigravity |
| `W05` | Nghiệm thu người dùng | Chủ dự án chạy hoặc xem bằng chứng các kịch bản mua hàng/AI, chấp nhận nội dung và chính sách, ký phạm vi release cùng danh sách giới hạn còn lại (`C18`). | Chủ dự án |
| `W06` | Triển khai và vận hành | Backup trước migration, deploy theo runbook, health/smoke trên môi trường đích, quan sát lỗi, rollback đã chuẩn bị; ghi phiên bản, thời gian và người chịu trách nhiệm vận hành. | Codex + người vận hành; Antigravity kiểm UI |

## Kiểm soát thay đổi

1. Mọi thay đổi sau `W01` ghi yêu cầu thay đổi: lý do, tác động đến API/schema/UI/test, release và người quyết định.
2. Nếu đổi nghiệp vụ, quay lại `W01`; nếu đổi contract hoặc kiến trúc, quay lại `W02`. Cập nhật tài liệu và kế hoạch trước khi triển khai tiếp phần bị ảnh hưởng. Việc sửa lỗi đúng với thiết kế đã duyệt có thể xử lý trong giai đoạn hiện tại, vẫn phải kiểm thử hồi quy.
3. Khi quay lại cổng trước, ghi lại phiên bản/phạm vi được duyệt. Các ô task đã nghiệm thu vẫn giữ bằng chứng lịch sử, nhưng phải kiểm tra lại phần bị ảnh hưởng; nếu không còn đạt, mở lại ô tick tương ứng.
4. Cổng chưa đạt thì ghi `☐` cùng nguyên nhân trong báo cáo; không dùng build thành công, fixture hoặc spec làm bằng chứng chạy thật.

## Thanh toán làm cuối

Theo quyết định hiện có, **tích hợp cổng thanh toán được làm cuối trong giai đoạn triển khai**, sau các phần commerce nền. Phạm vi, trạng thái đơn, bất biến tiền/tồn, webhook, bảo mật và tiêu chí test của thanh toán vẫn phải được chốt ở `W01–W02` trước khi triển khai phần phụ thuộc. Provider chưa chọn thì đánh dấu quyết định còn mở, giữ `C09` và cổng release bán hàng thật chưa đạt. Có thể nghiệm thu một bản nội bộ không thu tiền nếu chủ dự án ghi rõ phạm vi đó ở `W01`; không công bố bản này là web bán hàng thật.
