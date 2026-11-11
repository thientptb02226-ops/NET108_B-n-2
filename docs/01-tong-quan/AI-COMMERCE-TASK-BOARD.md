# Bảng tick việc nhỏ — Net108Khai Commerce

Đây là **nơi duy nhất ghi trạng thái hoàn thành**. Mỗi dòng là một đầu ra có thể kiểm chứng. `☐` = chưa nghiệm thu; `☑` = đã nghiệm thu. Agent đổi ô tick, điền ngày `YYYY-MM-DD` theo giờ Việt Nam và dẫn bằng chứng (file, kết quả test hoặc commit) sau khi điều kiện ở dòng đó và [checklist cấp chức năng](AI-COMMERCE-EXECUTION-CHECKLIST.md) liên quan đã được đối chiếu. Có code hoặc tài liệu mà chưa chạy kiểm tra thì vẫn giữ `☐`.

Các mã `Cxx` là luồng backend Codex hỗ trợ và được phân cho 5 thành viên phụ trách theo [bảng phân công nhóm](AI-COMMERCE-PHAN-CONG-5-THANH-VIEN.md); `Fxx` thuộc Antigravity; `C01` do chủ dự án chốt, `C16`/`C18` nghiệm thu chung. Cột **Phụ trách** giữ tên agent/luồng thực thi, còn người chịu trách nhiệm rà và nghiệm thu từng `Cxx` xem bảng phân công nhóm. Mã cha hoàn thành khi **mọi mã con** của nó được tick và điều kiện cấp chức năng trong checklist đã đạt. Nếu một dòng vẫn mất hơn khoảng hai ngày hoặc cắt qua nhiều module, agent chia tiếp thành `.a`, `.b` trước khi code và thêm dòng vào bảng. Không tick mã cha thay cho mã con.

**Cổng Waterfall:** các dòng `W01–W06` dưới đây ghi quyết định chuyển giai đoạn theo [quy trình Waterfall](AI-COMMERCE-WATERFALL.md). Các dòng `0. Nền` đến `4. Phát hành` là nhóm chức năng; ô đã tick trước đây chỉ chứng minh đầu ra của dòng đó, không tự duyệt cổng. Các cổng hiện để `☐` cho đến khi có đủ bằng chứng và người phụ trách xác nhận.

| Giai đoạn | Mã | Phụ trách | Điều kiện tick | Cần trước | Tick | Ngày | Bằng chứng |
| --- | --- | --- | --- | --- | :---: | --- | --- |
| Yêu cầu | W01 | Chủ dự án | Chốt phạm vi release và toàn bộ quyết định C01 liên quan, tiêu chí chấp nhận | — | ☐ | — | — |
| Thiết kế | W02 | Codex + Antigravity + chủ dự án | Domain, schema, OpenAPI, UI, bảo mật, migration và test plan được duyệt | W01 | ☐ | — | — |
| Triển khai | W03 | Codex + Antigravity | Mọi task C/F thuộc phạm vi release có code/build/review và bằng chứng kỹ thuật | W02 | ☐ | — | — |
| Kiểm thử hệ thống | W04 | Codex + Antigravity | DB, contract, E2E, security, load, restore/rollback đạt tiêu chí release | W03 | ☐ | — | — |
| Nghiệm thu | W05 | Chủ dự án | Kịch bản UAT và giới hạn release được chấp nhận, C18 có bằng chứng | W04 | ☐ | — | — |
| Triển khai vận hành | W06 | Codex + người vận hành + Antigravity | Deploy, migration, health/smoke, quan sát và rollback trên môi trường đích | W05 | ☐ | — | — |

| Nhóm chức năng | Mã | Phụ trách | Việc nhỏ và điều kiện tick | Cần trước | Tick | Ngày | Bằng chứng |
| --- | --- | --- | --- | --- | :---: | --- | --- |
| 0. Nền | C00.1 | Codex | Build .NET và kiểm cú pháp Compose; ghi phiên bản/lệnh/kết quả | — | ☑ | 2026-11-09 | `dotnet build Net108Khai.slnx --no-restore`: 0 lỗi; `docker compose config --quiet`: qua; .NET SDK 10.0.402 |
| 0. Nền | C00.2 | Codex | Khởi động DB/API bằng Docker; health `ready` trả thành công | C00.1 | ☐ | — | — |
| 0. Nền | C00.3 | Codex | Smoke đặt đơn/replay và kiểm AI có/không provider; lưu kết quả thật | C00.2 | ☐ | — | — |
| 0. Nền | C01.1 | Chủ dự án | Chốt loại hàng, biến thể, người bán, kho và kênh ưu tiên bằng quyết định ghi ngày | — | ☐ | — | — |
| 0. Nền | C01.2 | Chủ dự án | Chốt giá/thuế, thanh toán/COD, giao hàng và hoàn đổi bằng quyết định ghi ngày | — | ☐ | — | — |
| 0. Nền | C01.3 | Chủ dự án | Chốt provider AI, dữ liệu cá nhân/retention và mục tiêu tải/SLO | — | ☐ | — | — |
| 0. Nền | C02.1 | Codex | Chốt glossary và state machine Order/Payment/Reservation với nhánh lỗi | C01 liên quan | ☐ | — | — |
| 0. Nền | C02.2 | Codex | Viết OpenAPI v1: schema, quyền, lỗi, tiền, thời gian, idempotency | C02.1 | ☐ | — | — |
| 0. Nền | C02.3 | Codex + Antigravity | Bàn giao ví dụ API/base URL/auth và rà đủ dữ liệu cho từng màn hình | C02.2 | ☐ | — | — |
| 0. Nền | F01.1 | Antigravity | Chọn framework/thư mục frontend Commerce; ghi quyết định và cách cấu hình API URL | C01.1 | ☑ | 2026-11-09 | `Chatbot-Frontend/`, React 19 + Vite + Tailwind, proxy `/api` trong `vite.config.ts` |
| 0. Nền | F01.2 | Antigravity | Tạo route/layout cho các màn hình trong phạm vi; đánh dấu route chưa có API | F01.1 | ☑ | 2026-11-09 | Layout `App.tsx` (Catalog, Assistant, Orders, Cart, Checkout); fallback fixture trong `api.ts` |
| 0. Nền | F01.3 | Antigravity | Build frontend qua; README có lệnh chạy riêng và cùng backend | F01.2 | ☑ | 2026-11-09 | `npm run build` thành công xuất `dist/`, tài liệu tại `Chatbot-Frontend/README.md` |
| 0. Nền | F02.1 | Antigravity | Token màu/chữ/spacing và component form/button/card/dialog dùng lại được | F01.1 | ☑ | 2026-11-09 | `tailwind.config.js`, `FRONTEND_DESIGN_SYSTEM.md`, `Button.tsx`, `Modal.tsx`, `Badge.tsx` |
| 0. Nền | F02.2 | Antigravity | Component loading/empty/error/success có thông điệp tiếng Việt | F02.1 | ☑ | 2026-11-09 | `FeedbackStates.tsx` (Skeleton shimmer, EmptyState, ErrorState song hành tiếng Việt) |
| 0. Nền | F02.3 | Antigravity | Kiểm keyboard, focus, nhãn form và layout mobile/desktop cho component nền | F02.1–F02.2 | ☑ | 2026-11-09 | Skip-link `index.html`, ESC đóng modal, focus ring `ring-2 ring-emerald-600`, 44px tap targets |
| 1. Mua hàng | C03.1 | Codex | Tách ranh giới module .NET và owner dữ liệu; build vẫn qua | C02.1 | ☐ | — | — |
| 1. Mua hàng | C03.2 | Codex | Chuyển schema startup sang migration có version | C03.1 | ☐ | — | — |
| 1. Mua hàng | C03.3 | Codex | Test migration trên DB trống và bản sao DB demo; ghi cách forward/rollback | C03.2 | ☐ | — | — |
| 1. Mua hàng | C04.1 | Codex | Schema identity và login/logout/session theo phương án chốt; test flow | C01.1, C03 | ☐ | — | — |
| 1. Mua hàng | C04.2 | Codex | Gắn chủ sở hữu giỏ/đơn, chặn đọc/sửa object của người khác | C04.1 | ☐ | — | — |
| 1. Mua hàng | C04.3 | Codex | RBAC nhân viên/admin và test quyền từ chối, session hết hạn | C04.2 | ☐ | — | — |
| 1. Mua hàng | C04.4 | Codex | Email xác thực bằng mã: đăng ký, gửi lại, mã hết hạn/sai; smoke với Mailpit và SMTP thật | C04.1 | ☐ | — | — |
| 1. Mua hàng | C04.5 | Codex | Quên mật khẩu: gửi mã, đổi mật khẩu, thử mã sai/hết hạn/replay và khóa đăng nhập | C04.4 | ☐ | — | — |
| 1. Mua hàng | C04.6 | Codex | Google/Facebook OAuth: callback, mã đổi token một lần, email trùng và thử provider thật | C04.4 | ☐ | — | — |
| 1. Mua hàng | C04.7 | Codex | Ma trận role Admin/CatalogManager/InventoryManager/SupportAgent, cấp role bằng CLI, test 401/403 | C04.3 | ☐ | — | — |
| 1. Mua hàng | C04.8 | Codex | Lưu/mã hóa khóa Data Protection, thời hạn token, thử restart, rate limit và rà bảo mật auth | C04.4–C04.7 | ☐ | — | — |
| 1. Mua hàng | C05.1 | Codex | Schema Product/Variant/SKU/thuộc tính và ràng buộc duy nhất | C01.1, C03 | ☐ | — | — |
| 1. Mua hàng | C05.2 | Codex | API quản trị tạo/sửa/xuất bản/ẩn sản phẩm với quyền phù hợp | C04.3, C05.1 | ☐ | — | — |
| 1. Mua hàng | C05.3 | Codex | API tìm kiếm/lọc/phân trang; test SKU trùng, ẩn và hết hàng | C05.1–C05.2 | ☐ | — | — |
| 1. Mua hàng | C05.4 | Codex | Chốt schema Code First sách giấy ↔ bản đọc mẫu, chương, nguồn/quyền công bố và trạng thái duyệt | C01.1, C03, C05.1 | ☐ | — | — |
| 1. Mua hàng | C05.5 | Codex | API quản trị duyệt/thu hồi đọc mẫu và API công khai thư viện/chi tiết/chương; ẩn bản nháp | C04.3, C05.4 | ☐ | — | — |
| 1. Mua hàng | C05.6 | Codex | Test phân trang/tìm sách, thứ tự chương, bản nháp/thu hồi, nội dung thiếu và quyền quản trị | C05.5 | ☐ | — | — |
| 1. Mua hàng | C06.1 | Codex | Offer theo kênh/thời gian và cách chọn giá hiệu lực; test ranh giới thời gian | C01.2, C05 | ☐ | — | — |
| 1. Mua hàng | C06.2 | Codex | Coupon/promotion theo quy tắc chốt, có lỗi hợp lệ và hết hạn | C06.1 | ☐ | — | — |
| 1. Mua hàng | C06.3 | Codex | Dịch vụ tính breakdown tiền VND và test làm tròn/giá đổi | C06.1–C06.2 | ☐ | — | — |
| 1. Mua hàng | C07.1 | Codex | Stock ledger ghi mọi thay đổi với nguyên nhân và ngăn tồn âm | C01.1, C05 | ☐ | — | — |
| 1. Mua hàng | C07.2 | Codex | Reservation có TTL, consume/release/expire rõ trạng thái | C07.1 | ☐ | — | — |
| 1. Mua hàng | C07.3 | Codex | Test checkout đồng thời, hết hạn và đối soát tồn | C07.2 | ☐ | — | — |
| 1. Mua hàng | C08.1 | Codex | Cart API kiểm owner, SKU và số lượng; test giỏ rỗng/hàng ẩn | C04.2, C05.3 | ☐ | — | — |
| 1. Mua hàng | C08.2 | Codex | Quote API tính giá/phí/tồn mới, có version/TTL và lỗi hết hạn | C06.3, C07.2, C08.1 | ☐ | — | — |
| 1. Mua hàng | C08.3 | Codex | Đặt đơn từ quote, snapshot giá và giữ hàng nhất quán trong transaction | C08.2 | ☐ | — | — |
| 1. Mua hàng | C08.4 | Codex | Idempotency cùng payload và conflict khác payload; test retry, lỗi DB, cạnh tranh | C08.3 | ☐ | — | — |
| 1. Mua hàng | F03.1 | Antigravity | Trang catalog dùng API list/search/filter/phân trang, không dùng dữ liệu giả khi tích hợp | C02.3, C05.3, F02 | ☐ | — | — |
| 1. Mua hàng | F03.2 | Antigravity | Trang chi tiết hiển thị biến thể, giá/tồn và trạng thái thiếu dữ liệu | F03.1, C06.1 | ☐ | — | — |
| 1. Mua hàng | F03.3 | Antigravity | Test responsive, sản phẩm ẩn/hết hàng, lỗi mạng và filter | F03.1–F03.2 | ☐ | — | — |
| 1. Mua hàng | F03.4 | Antigravity | Tạo điều hướng Commerce → `/read` và nút Xem sách → `/read/{slug}`, có đường quay về cửa hàng | W02, F01–F02 | ☑ | 2026-11-10 | Điều hướng Commerce ↔ `/read`, nút Xem sách trên card sách và modal chi tiết, nút quay về cửa hàng và mua sách giấy |
| 1. Mua hàng | F03.5 | Antigravity | Dựng thư viện và trang đọc theo mẫu KhoaVerse: tìm sách, bìa, mục lục, đọc chương, trước/sau, giao diện đọc; dùng API thật | C05.5, F03.4 | ☑ | 2026-11-10 | Kệ sách 3D, tìm kiếm, modal chi tiết và reader 2 trang desktop/1 trang mobile chuẩn KhoaVerse; hợp đồng API và fixture mẫu rõ ràng |
| 1. Mua hàng | F03.6 | Antigravity | Phát/tạm dừng/chuyển MP3 người dùng chọn từ máy, không tải lên server; xử lý tệp lỗi và quyền trình duyệt | F03.5 | ☑ | 2026-11-10 | Trình phát MP3 offline với Web Audio ambient piano + file picker đọc tệp từ máy không upload server, xử lý lỗi format |
| 1. Mua hàng | F03.7 | Antigravity | So sánh giao diện đọc với mẫu trên desktop/mobile; test keyboard, loading/empty/error, link mua sách và rời/quay lại trang đọc | F03.5–F03.6 | ☑ | 2026-11-10 | Chụp ảnh đối chiếu 1440x900 & 390x844; test keyboard ← → Esc, bookmark ruy băng đỏ, theme tối/sáng, mobile >=44px |
| 1. Mua hàng | F04.1 | Antigravity | Giỏ thêm/sửa/xóa dòng qua API, hiển thị tổng tạm tính và lỗi tồn | C08.1, F03 | ☐ | — | — |
| 1. Mua hàng | F04.2 | Antigravity | Màn quote hiển thị breakdown, thời hạn và thay đổi giá/tồn | C08.2, F04.1 | ☐ | — | — |
| 1. Mua hàng | F04.3 | Antigravity | Xác nhận tổng tiền và đặt đơn; retry giữ idempotency key, chỉ thành công khi có order ID | C08.4, F04.2 | ☐ | — | — |
| 1. Mua hàng | F04.4 | Antigravity | Test double-click, mất mạng, giỏ rỗng, quote hết hạn và validation | F04.3 | ☐ | — | — |
| 2. Sau bán | C09.1 | Codex | Adapter tạo payment intent/redirect hoặc COD theo quyết định chốt | C01.2, C08 | ☐ | — | — |
| 2. Sau bán | C09.2 | Codex | Webhook xác minh chữ ký/timestamp và xử lý lặp/sai thứ tự | C09.1 | ☐ | — | — |
| 2. Sau bán | C09.3 | Codex | Đối soát, capture/refund theo provider; test fail/timeout/retry | C09.2 | ☐ | — | — |
| 2. Sau bán | C10.1 | Codex | Shipment state/API, giới hạn số lượng giao và cập nhật tracking | C09, C07 | ☐ | — | — |
| 2. Sau bán | C10.2 | Codex | Hủy đơn theo state, giải phóng reservation hoặc hoàn tiền đúng nhánh | C10.1 | ☐ | — | — |
| 2. Sau bán | C10.3 | Codex | Return case và refund một phần; chặn hoàn vượt số đã thu | C10.2 | ☐ | — | — |
| 2. Sau bán | C10.4 | Codex | Test giao/hoàn một phần, webhook lặp và đối soát sau bán | C10.1–C10.3 | ☐ | — | — |
| 2. Sau bán | C11.1 | Codex | Ghi outbox cùng transaction với order/payment/return | C08–C10 | ☐ | — | — |
| 2. Sau bán | C11.2 | Codex | Consumer inbox/dedup, retry, dead-letter và test replay | C11.1 | ☐ | — | — |
| 2. Sau bán | C11.3 | Codex | Adapter thông báo/tích hợp theo event; test lỗi provider và không gửi trùng | C11.2 | ☐ | — | — |
| 2. Sau bán | F05.1 | Antigravity | Login/session UI theo contract và xử lý hết phiên | C04, F02 | ☐ | — | — |
| 2. Sau bán | F05.4 | Antigravity | UI đăng ký/mã email, quên mật khẩu bằng mã, Google/Facebook callback và đổi mã lấy token | C04.4–C04.6, F05.1 | ☐ | — | — |
| 2. Sau bán | F05.2 | Antigravity | Danh sách/chi tiết đơn chỉ của chủ sở hữu, timeline từ API | C09, F05.1 | ☐ | — | — |
| 2. Sau bán | F05.3 | Antigravity | UI hủy/hoàn theo quyền và state; phân biệt đã yêu cầu/đã chấp thuận | C10, F05.2 | ☐ | — | — |
| 3. AI Commerce | C12.1 | Codex | Schema nguồn tri thức, version, ACL, ngày hiệu lực và duyệt | C01.3, C04 | ☐ | — | — |
| 3. AI Commerce | C12.2 | Codex | Pipeline ingest/chia đoạn/embedding/index chỉ cho bản đã duyệt | C12.1 | ☐ | — | — |
| 3. AI Commerce | C12.3 | Codex | Retrieval lọc quyền, locale, hiệu lực; thu hồi nguồn xóa index/cache | C12.2 | ☐ | — | — |
| 3. AI Commerce | C12.4 | Codex | Test tài liệu mâu thuẫn, hết hạn, thiếu nguồn và prompt injection | C12.3 | ☐ | — | — |
| 3. AI Commerce | C13.1 | Codex | Model gateway cấu hình provider, timeout, retry/budget và lỗi rõ | C12.3 | ☐ | — | — |
| 3. AI Commerce | C13.2 | Codex | Version prompt/model, trace và chi phí token theo request | C13.1 | ☐ | — | — |
| 3. AI Commerce | C13.3 | Codex | Bộ eval tiếng Việt về giá/tồn/chính sách/quyền/injection có baseline | C13.2 | ☐ | — | — |
| 3. AI Commerce | C13.4 | Codex | Test fallback khi provider lỗi/chậm và giới hạn chi phí | C13.1–C13.3 | ☐ | — | — |
| 3. AI Commerce | C14.1 | Codex | Tool schema/allowlist cho tìm sản phẩm, offer và trạng thái đơn | C04, C13 | ☐ | — | — |
| 3. AI Commerce | C14.2 | Codex | Policy gateway kiểm user, object, tenant và rate limit trước tool | C14.1 | ☐ | — | — |
| 3. AI Commerce | C14.3 | Codex | Preview và confirmation token gắn payload/TTL cho write tool | C14.2, C08 | ☐ | — | — |
| 3. AI Commerce | C14.4 | Codex | Audit/idempotency mọi write tool; không cho model gọi SQL/HTTP tùy ý | C14.3 | ☐ | — | — |
| 3. AI Commerce | C14.5 | Codex | Test token hết hạn, đổi payload, replay, mất quyền và prompt độc hại | C14.4 | ☐ | — | — |
| 3. AI Commerce | C15.1 | Codex | Conversation/turn schema, consent và retention/xóa transcript | C04, C13 | ☐ | — | — |
| 3. AI Commerce | C15.2 | Codex | Trả lời có nguồn, giá/tồn tươi, nói rõ khi thiếu bằng chứng | C12, C14, C15.1 | ☐ | — | — |
| 3. AI Commerce | C15.3 | Codex | Luồng đề xuất → xác nhận → tool result và handoff cho CS | C14.5, C15.2 | ☐ | — | — |
| 3. AI Commerce | C15.4 | Codex | Test quyền hội thoại, lỗi model và không báo đặt đơn khi thiếu order ID | C15.3 | ☐ | — | — |
| 3. AI Commerce | F06.1 | Antigravity | Chat UI nhập/gửi/hiển thị hội thoại và trạng thái đang trả lời | C15.1, F02 | ☐ | — | — |
| 3. AI Commerce | F06.2 | Antigravity | Hiển thị nguồn, thiếu chứng cứ, lỗi provider và dữ liệu tươi | C15.2, F06.1 | ☐ | — | — |
| 3. AI Commerce | F06.3 | Antigravity | Preview tác động, xác nhận/từ chối và chỉ hiện kết quả sau tool response | C14.3, F06.2 | ☐ | — | — |
| 3. AI Commerce | F06.4 | Antigravity | UI handoff và test token hết hạn, retry, lỗi, quyền bị từ chối | C15.3, F06.3 | ☐ | — | — |
| 3. AI Commerce | F07.1 | Antigravity | Admin catalog với quyền và trạng thái nháp/xuất bản | C05.2, F02 | ☐ | — | — |
| 3. AI Commerce | F07.2 | Antigravity | Admin duyệt/thu hồi nguồn tri thức, có xác nhận thao tác | C12.3, F07.1 | ☐ | — | — |
| 3. AI Commerce | F07.3 | Antigravity | Hàng đợi handoff cho CS; test RBAC và che PII | C15.3, F07.2 | ☐ | — | — |
| 4. Phát hành | C16.1 | Codex + Antigravity | E2E catalog → giỏ → quote → order ID trên API/UI thật | C08, F04 | ☐ | — | — |
| 4. Phát hành | C16.2 | Codex + Antigravity | E2E thanh toán/giao/hoàn và trạng thái UI khớp API | C10, F05 | ☐ | — | — |
| 4. Phát hành | C16.3 | Codex + Antigravity | E2E hỏi → nguồn → preview/xác nhận → handoff, kiểm quyền | C15, F06–F07 | ☐ | — | — |
| 4. Phát hành | C16.4 | Codex + Antigravity | E2E cửa hàng → Xem sách → đọc mẫu/chuyển chương → quay lại mua sách; kiểm bản nháp/thu hồi không lộ nội dung | C05.6, F03.7 | ☐ | — | — |
| 4. Phát hành | C17.1 | Codex | Trace/metrics/log có che PII cho API, DB, tool và provider | C03, C15 | ☐ | — | — |
| 4. Phát hành | C17.2 | Codex | Secret/TLS/backup/runbook, thử restore và rollback | C03, C11 | ☐ | — | — |
| 4. Phát hành | C17.3 | Codex | Load/security/dependency tests; ghi SLO/RPO/RTO đã chốt | C17.1–C17.2 | ☐ | — | — |
| 4. Phát hành | F08.1 | Antigravity | Build, lint và test frontend qua | F03–F07 | ☐ | — | — |
| 4. Phát hành | F08.2 | Antigravity | Accessibility, keyboard và responsive trên thiết bị mục tiêu | F08.1 | ☐ | — | — |
| 4. Phát hành | F08.3 | Antigravity | Rà route/API theo OpenAPI, bỏ fixture release và bàn giao E2E | F08.2, C16 | ☐ | — | — |
| 4. Phát hành | C18.1 | Codex + Antigravity | Build phát hành khớp OpenAPI, migration, test và runbook | C16–C17, F08 | ☐ | — | — |
| 4. Phát hành | C18.2 | Codex + Antigravity + chủ dự án | Ký nghiệm thu backend, UI, quy tắc nghiệp vụ và phạm vi release | C18.1 | ☐ | — | — |

**Cách cập nhật:** tìm đúng mã, đổi `☐` → `☑`, điền ngày và bằng chứng. Nếu test fail, provider/Docker chưa sẵn hoặc quyết định nghiệp vụ còn `TBD`, ghi tiến độ riêng và giữ `☐`. Các mã cha trong [checklist cấp chức năng](AI-COMMERCE-EXECUTION-CHECKLIST.md) là tiêu chí tổng hợp, không có ô trạng thái thứ hai.
