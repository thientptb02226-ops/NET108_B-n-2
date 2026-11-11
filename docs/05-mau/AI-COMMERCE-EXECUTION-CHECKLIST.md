# Checklist thực thi AI native Commerce cho Net108Khai

Tài liệu này dành cho **AI phát triển dự án**. Mỗi ô chỉ được đánh dấu hoàn thành khi có bằng chứng kiểm tra; mô tả trong đặc tả không đồng nghĩa tính năng đã được triển khai. Trợ lý mua sắm chạy trong sản phẩm có các kiểm soát riêng ở mục **AI trong sản phẩm**.

Trạng thái của từng **mã việc nhỏ** (ví dụ `C08.1`, `F04.2`) được tick trong [bảng theo dõi chung](AI-COMMERCE-TASK-BOARD.md); các ô bên dưới là điều kiện nghiệm thu cấp chức năng. Một mục `Cxx`/`Fxx` chỉ hoàn thành khi mọi mã con của nó đã được nghiệm thu và các điều kiện bên dưới đều đạt.

**Thứ tự dự án:** áp dụng [cổng Waterfall `W01–W06`](AI-COMMERCE-WATERFALL.md). Các mã `Cxx`/`Fxx` bên dưới là đầu việc nằm trong giai đoạn phù hợp, không thay thế việc duyệt yêu cầu, thiết kế, kiểm thử hệ thống và phát hành.

## Phân công cố định

| Chủ sở hữu | Công việc | Ranh giới file |
| --- | --- | --- |
| **Codex — backend** | C00, C02–C15, C17; chủ trì hợp đồng API, .NET, SQL Server, AI/RAG/tool gateway, tích hợp, Docker và kiểm thử backend | `src/`, `compose.yaml`, `Dockerfile`, schema/migration, OpenAPI và tài liệu backend |
| **Antigravity — frontend** | F01–F08 và phần giao diện của C16; web, chat UI, admin UI, responsive/accessibility và kiểm thử frontend | Thư mục frontend Commerce được thống nhất khi F01 bắt đầu; `Chatbot-Frontend/` nếu dùng làm chat UI. Không sửa logic giao dịch trong `src/` |
| **Người phụ trách dự án** | C01: chốt quy tắc bán hàng, provider, chính sách và mục tiêu vận hành | Quyết định được ghi trong spec/ADR |
| **Codex + Antigravity** | C16 tích hợp API/UI và C18 nghiệm thu release | Mỗi bên kiểm phần mình và cùng chạy luồng xuyên hệ thống |

Hai agent có thể làm song song trong `W03` sau khi **`W02` đã chốt hợp đồng API và thiết kế UI**. Layout F01 đã dựng trước đó là baseline cần đối chiếu; dữ liệu giả phải được ghi rõ là fixture và không được trình bày như API đã chạy. Codex không tự sửa màn hình; Antigravity không tự đổi request/response backend. Khi cần đổi contract sau `W02`, ghi yêu cầu thay đổi, cập nhật thiết kế/OpenAPI và duyệt lại phần bị ảnh hưởng trước khi sửa client.

| Nhóm chức năng trong `W03` | Codex bàn giao | Antigravity bàn giao | Kiểm tra tại `W04` |
| --- | --- | --- | --- |
| 0. Nền | C00, C02: baseline và OpenAPI/ví dụ | F01–F02: khung và design system | Thống nhất route, auth flow và dữ liệu mỗi màn hình cần |
| 1. Mua hàng | C03–C08: catalog, giá, tồn, giỏ, quote, order | F03–F04: catalog, giỏ, checkout | C16: tìm → giỏ → xác nhận → order ID |
| 2. Sau bán | C09–C11: thanh toán, giao/hoàn, thông báo | F05: đơn và sau bán | C16: trạng thái và lỗi khớp API |
| 3. AI Commerce | C12–C15: knowledge, model, tool, hội thoại | F06–F07: chat, xác nhận, admin | C16: nguồn, quyền, preview và handoff |
| 4. Phát hành | C17: hạ tầng, quan sát, bảo mật | F08: chất lượng frontend | C18: E2E và release gate |

Mỗi lần bàn giao cần có: tên endpoint và phiên bản, OpenAPI/ví dụ request-response, auth/quyền, lỗi dự kiến, trạng thái đã chạy hay chưa, lệnh kiểm tra và commit/file liên quan. Bên nhận phản hồi bằng danh sách trường thiếu hoặc kết quả tích hợp; không thay hợp đồng ngầm trong chat.

## 1. Định tuyến và nguồn sự thật

- [ ] Xác định yêu cầu hiện tại thuộc **Commerce**, **Trello Clone**, hay phần hạ tầng dùng chung. Ghi phạm vi bằng một câu trước khi sửa file.
- [ ] Với Commerce, đọc [đặc tả Commerce](AI-NATIVE-COMMERCE.md), [thuật ngữ](../GLOSSARY.md), [hướng dẫn chạy](../README.md), rồi đọc code liên quan trong `src/Net108Khai.Api/` và `compose.yaml`.
- [ ] Với Trello Clone, đọc `docs/SYSTEM_ARCHITECTURE.md` và module `Trello-Clone-*` tương ứng. Không suy ra yêu cầu Commerce từ tên thư mục Trello, hoặc suy ra Trello từ đặc tả Commerce.
- [ ] Xác minh trạng thái hiện tại bằng file/code/lệnh. Gắn nhãn từng phát biểu quan trọng: **Đã quan sát**, **Yêu cầu trong spec**, **Giả định**, **Chưa kiểm chứng**. Khi hai nguồn mâu thuẫn, ghi đúng chỗ mâu thuẫn và chọn phạm vi theo yêu cầu mới nhất của người dùng.

**Thứ tự bằng chứng cho việc đang chạy:** kết quả chạy/test và code hiện tại → cấu hình hiện tại → tài liệu triển khai hiện tại. **Thứ tự cho mục tiêu cần xây:** yêu cầu mới nhất của người dùng → đặc tả Commerce → quyết định đã chốt trong repo. Tài liệu cũ không chứng minh tính năng đã tồn tại.

## 2. Cách làm task nhỏ trong giai đoạn đã mở

Áp dụng cho từng mục `Cxx` hoặc `Fxx` khi cổng Waterfall cho phép; mỗi agent làm một mục hoặc một nhóm phụ thuộc chặt tại một thời điểm. Các bước build/unit check trong `W03` là phản hồi kỹ thuật, không thay thế nghiệm thu hệ thống `W04`.

- [ ] **Nhận việc:** ghi mã task, mục tiêu quan sát được, phạm vi file/module, phụ thuộc và phần nằm ngoài phạm vi. Xem `git status` để phân biệt thay đổi có sẵn với thay đổi của mình.
- [ ] **Kiểm chứng đầu vào:** đọc code và đặc tả trực tiếp; tìm endpoint/schema/test hiện có bằng `rg`. Ghi dữ kiện còn thiếu. Chỉ hỏi người dùng những quyết định nghiệp vụ mà repo không thể trả lời; tiếp tục phần độc lập trong lúc chờ.
- [ ] **Chia bước:** mỗi bước tạo một kết quả kiểm chứng được. Nếu một bước đồng thời thay đổi DB, API và AI, tách theo thứ tự migration → domain/API → AI/UI → kiểm thử tích hợp.
- [ ] **Thiết kế hợp đồng:** xác định input, output, lỗi, quyền, idempotency, trạng thái và dữ liệu nhạy cảm trước khi code. Đối chiếu bất biến tại mục 5 của đặc tả.
- [ ] **Thực thi:** sửa đúng các file liên quan; lưu dữ liệu giao dịch ở domain/database, không đặt quy tắc giá/tồn/quyền trong prompt. Không tự tạo chính sách bán hàng, giá thật, provider hoặc secret khi chưa có nguồn.
- [ ] **Kiểm tra:** chạy kiểm tra nhỏ nhất chứng minh kết quả (build, unit, integration, smoke, concurrency hoặc contract tùy rủi ro). Ghi lệnh, kết quả và môi trường. Nếu không chạy được, ghi **chưa kiểm chứng** và nguyên nhân cụ thể.
- [ ] **Đối chiếu:** rà acceptance criteria, quyền truy cập, trường hợp lỗi, cạnh tranh dữ liệu và tác động đến module khác. Cập nhật spec/README/OpenAPI nếu hành vi hoặc cách chạy đổi.
- [ ] **Báo cáo:** nêu file đã sửa, hành vi đã chứng minh, phần chưa kiểm chứng, rủi ro và task kế tiếp. Chỉ đánh dấu `Cxx` xong khi mọi tiêu chí nghiệm thu của nó đạt.

### Mẫu ghi việc ngắn

```text
Task: Cxx — ...
Chủ sở hữu: Codex / Antigravity / người phụ trách dự án / chung
Đầu vào đã kiểm chứng: file/đoạn code/lệnh ...
Quyết định còn thiếu: ... (hoặc không có)
Thay đổi: ...
Kiểm tra: lệnh ... → PASS/FAIL/CHƯA CHẠY (lý do)
Tiêu chí nghiệm thu: đạt/chưa đạt từng mục
Trạng thái: xong / đang làm / bị chặn bởi ...
```

## 3. Backlog có thứ tự và điều kiện hoàn thành

Trạng thái tại lúc lập checklist: bản demo có API .NET và Compose; `dotnet build`/`publish` và `docker compose config` đã qua ở lượt trước, **chưa xác nhận chạy container** vì Docker Engine không sẵn. Các ô dưới đây là cổng nghiệm thu của từng task, không tự động coi là đã xong chỉ vì có file.

### Nền tảng và quyết định

**C00 — Chạy lại baseline.** Phụ thuộc: không có.

- [ ] `dotnet build Net108Khai.slnx` thành công; ghi phiên bản SDK.
- [ ] `docker compose config --quiet` thành công và `docker compose up --build -d` đưa DB/API lên healthy hoặc ghi rõ lỗi môi trường.
- [ ] `./scripts/smoke.ps1` qua: tạo giỏ, đặt đơn và replay cùng `Idempotency-Key` trả cùng order ID. Kiểm tra AI endpoint theo hai trường hợp: chưa cấu hình → 503; có provider → trả lời từ catalog.
- [ ] Ghi kết quả thực tế vào ghi chú task; chưa đánh dấu xong nếu mới chỉ kiểm cú pháp/build.

**C01 — Chốt quy tắc kinh doanh. Chủ sở hữu: người phụ trách dự án; Codex tổng hợp, Antigravity góp câu hỏi UX.** Phụ thuộc: không có; hoàn thành trước thiết kế schema cuối.

- [ ] Có quyết định được người có thẩm quyền xác nhận cho loại hàng/biến thể, người bán, kho, thuế, khu vực giao, COD/thanh toán, hoàn đổi và retention hội thoại.
- [ ] Mỗi quyết định có nguồn và ngày; mục chưa chốt được ghi `TBD`, không điền bằng phỏng đoán. Cập nhật mục 13 đặc tả hoặc ADR nếu quyết định khó đảo ngược.

**C02 — Hợp đồng domain và API v1. Chủ sở hữu: Codex; Antigravity rà luồng UI.** Phụ thuộc: C01 cho các nhánh liên quan.

- [ ] Vẽ state machine Order/Payment/Reservation và bảng chuyển trạng thái hợp lệ, gồm hủy, hết hạn, giao một phần, hoàn một phần nếu áp dụng.
- [ ] Định nghĩa OpenAPI cho product, cart, quote, order, payment webhook, conversation và lỗi Problem Details; ghi rõ quyền, tiền, thời gian, phân trang, idempotency.
- [ ] Dùng ví dụ đầu vào/đầu ra cụ thể và kiểm tra không mâu thuẫn với glossary, state machine và đặc tả.
- [ ] Bàn giao cho Antigravity OpenAPI, base URL theo môi trường, auth/session flow, lỗi, ví dụ JSON và trạng thái endpoint **đã chạy / đang xây / chỉ có trong spec**. Antigravity xác nhận các màn hình có đủ dữ liệu hoặc ghi yêu cầu contract còn thiếu.

**C03 — Cấu trúc module và migration.** Phụ thuộc: C02.

- [ ] Tách ranh giới Catalog, Pricing, Inventory, Cart, Orders, Payments và Conversations trong .NET; dependency hướng vào domain, mỗi bảng có owner rõ.
- [ ] Thay schema tạo lúc startup bằng migration có version; nâng cấp từ database demo được kiểm tra trên bản sao dữ liệu.
- [ ] Có quy trình rollback/forward và integration test khởi tạo database trống lẫn database đã có dữ liệu.

### Commerce core

**C04 — Identity, session và quyền.** Phụ thuộc: C02–C03.

- [ ] Khách/nhân viên đăng nhập theo phương án đã chốt; giỏ và đơn được gắn chủ sở hữu hoặc session hợp lệ.
- [ ] Test truy cập giỏ/đơn của người khác bị từ chối; CS chỉ thấy dữ liệu được cấp quyền; API demo không còn mở công khai dữ liệu riêng.
- [ ] Đăng ký yêu cầu mã xác thực email, gửi lại mã, mã hết hạn/sai và quên mật khẩu bằng mã; test với SMTP thử nghiệm và SMTP production.
- [ ] Google/Facebook OAuth callback, xác thực email, mã trao đổi một lần, không tự liên kết tài khoản cùng email; test provider thật, replay và lỗi provider.
- [ ] Role Admin/CatalogManager/InventoryManager/SupportAgent có ma trận quyền; test 401/403, token hết hạn, khóa tài khoản, khóa Data Protection bền vững và mã hóa khi phát hành.

**C05 — Catalog và biến thể.** Phụ thuộc: C01–C03.

- [ ] CRUD quản trị, trạng thái xuất bản, SKU duy nhất và thuộc tính biến thể đúng quy tắc đã chốt.
- [ ] Search/filter trả sản phẩm đang bán; test sản phẩm ẩn/ngừng bán, SKU trùng và phân trang.
- [ ] Với sách giấy có đọc mẫu: schema Code First và API chỉ công bố chương/đoạn đã duyệt, có nguồn/quyền công bố, thứ tự chương và liên kết sản phẩm; bản nháp/thu hồi không lộ nội dung.

**C06 — Giá và khuyến mại.** Phụ thuộc: C01–C05.

- [ ] Giá có hiệu lực theo kênh/thời gian; quote tính trên server và trả breakdown, TTL, version.
- [ ] Test giá đổi trong lúc checkout, coupon hết hạn/không hợp lệ và làm tròn tiền VND; order line lưu giá chốt.

**C07 — Tồn và giữ hàng.** Phụ thuộc: C01–C05.

- [ ] Stock ledger và reservation có hạn; mọi thay đổi có nguyên nhân và không tạo tồn âm.
- [ ] Test nhiều checkout đồng thời trên cùng SKU, hết hạn giữ hàng, giải phóng sau thanh toán lỗi/hủy và đối soát tồn.

**C08 — Cart, quote và đặt đơn.** Phụ thuộc: C04, C06–C07.

- [ ] Cart kiểm chủ sở hữu, số lượng và trạng thái SKU; checkout tính lại quote trước khi khách xác nhận.
- [ ] `Idempotency-Key` cùng request trả cùng đơn, khác payload trả conflict; đơn và reservation nhất quán khi lỗi giữa chừng.
- [ ] Test giỏ rỗng, hàng bị ẩn, thiếu tồn, giá đổi, hai request đồng thời và lỗi database.

### Giao dịch và sau bán

**C09 — Thanh toán.** Phụ thuộc: C01, C08 và provider được chốt.

- [ ] Adapter tạo payment intent, xác minh chữ ký/timestamp webhook, xử lý lặp và sự kiện đến sai thứ tự.
- [ ] Đối soát provider ↔ order; test success/fail/timeout/retry/refund. Không lưu dữ liệu thẻ trong hệ thống.

**C10 — Giao hàng, hủy và hoàn trả.** Phụ thuộc: C01, C07–C09.

- [ ] Shipment/return có state và giới hạn số lượng; hủy/hoàn giải phóng hoặc hoàn nhập tồn đúng lúc.
- [ ] Test giao một phần, hoàn một phần, webhook vận chuyển lặp và hoàn tiền không vượt số đã thu.

**C11 — Outbox, thông báo và tích hợp.** Phụ thuộc: C08–C10.

- [ ] State và outbox ghi cùng transaction; consumer dedup theo event ID, retry và dead-letter có quan sát.
- [ ] Email/SMS/CRM/shipping chỉ nhận sự kiện hợp lệ; test sự kiện lặp, mất kết nối, replay và thứ tự.

### AI trong sản phẩm

**C12 — Knowledge có kiểm duyệt.** Phụ thuộc: C01, C04, C05.

- [ ] Nguồn chính sách/FAQ có chủ sở hữu, phiên bản, ngày hiệu lực, locale, tenant và ACL; chỉ bản đã duyệt được index.
- [ ] Truy xuất lọc quyền trước khi trả kết quả; sửa/xóa/thu hồi nguồn làm mất hiệu lực index và cache. Test nguồn mâu thuẫn, hết hạn, thiếu nguồn và prompt injection trong tài liệu.

**C13 — Model gateway và đánh giá.** Phụ thuộc: C12.

- [ ] Provider/model cấu hình riêng, timeout/budget/trace; fallback rõ khi provider lỗi. Prompt, model và bộ eval có version.
- [ ] Bộ eval tiếng Việt có câu hỏi giá/tồn thay đổi, so sánh, chính sách, thiếu bằng chứng, dữ liệu riêng và prompt injection; ghi kết quả trước/sau thay đổi.

**C14 — Tool gateway và xác nhận.** Phụ thuộc: C04, C08, C13.

- [ ] Tool allowlist có schema, quyền theo user/object, rate limit, audit và idempotency; model không có đường gọi SQL/HTTP tùy ý.
- [ ] Write tool có preview và confirmation token gắn payload/TTL; test token hết hạn, đổi payload, quyền bị thu hồi, replay và lời nhắc độc hại.

**C15 — Hội thoại và handoff.** Phụ thuộc: C12–C14.

- [ ] Câu trả lời về sản phẩm/chính sách gắn nguồn và dữ liệu tươi; khi thiếu bằng chứng, nêu giới hạn. Không báo đã đặt đơn nếu chưa có order ID từ API.
- [ ] Lưu consent, transcript tối thiểu, retention/xóa và handoff cho nhân viên; test truy cập hội thoại của người khác và lỗi model.

### Kênh, vận hành và phát hành

**C16 — Tích hợp frontend với backend. Chủ sở hữu chung: Codex + Antigravity.** Phụ thuộc: C02, các `Fxx` và endpoint `Cxx` tương ứng.

- [ ] Antigravity nối client với API đã được Codex xác nhận hoạt động; mọi fixture còn lại được ghi rõ và bị loại khỏi luồng release.
- [ ] Codex xác minh auth, CORS, error contract, tiền, thời gian và idempotency khớp request từ UI; Antigravity xác minh trạng thái loading/error/empty và xác nhận tổng tiền.
- [ ] Cùng chạy E2E từ tìm hàng → giỏ → quote/đặt đơn → xem đơn, và hội thoại → preview → xác nhận/handoff khi các API đó tồn tại. Ghi bằng chứng cho từng bước, không đánh dấu toàn bộ khi chỉ chạy phần demo.

**C17 — Quan sát, bảo mật và vận hành.** Phụ thuộc: C03–C16.

- [ ] Trace từ request qua tool/provider/DB, metrics checkout, tồn, webhook, AI cost và grounded answers; log che PII.
- [ ] Secret ngoài repo, TLS, backup và restore drill, rate limit, kiểm quyền, quét dependency; có runbook sự cố và rollback.
- [ ] Đo tải thực tế, chốt SLO/RPO/RTO với chủ dự án, kiểm chứng trước phát hành.

**C18 — Release gate.** Phụ thuộc: toàn bộ task nằm trong phạm vi release.

- [ ] OpenAPI, migration, test và runbook khớp với build phát hành; `docker compose` dev và môi trường đích đều được kiểm tra.
- [ ] Báo cáo rõ tính năng nào **đã chạy**, **chỉ có trong spec**, **chưa kiểm chứng**. Các lỗi bảo mật, lệch tiền/tồn, tool trái quyền và thiếu audit được xử lý trước khi đưa vào giao dịch thật.
- [ ] Codex ký phần backend/API/infra; Antigravity ký phần UI/accessibility/E2E; người phụ trách dự án chốt quy tắc nghiệp vụ và phạm vi release.

### Frontend — Antigravity

Các task `Fxx` thuộc Antigravity. Framework và vị trí frontend Commerce được chọn sau khi kiểm tra repo; không mặc định dùng thư mục `Trello-Clone-Frontend` cho Commerce. Codex cung cấp contract, không cung cấp dữ liệu giả dưới tên dữ liệu thật.

**F01 — Khung frontend Commerce.** Phụ thuộc: `W02` cho bản triển khai theo Waterfall. Khung đã dựng trước đó là baseline cần đối chiếu với thiết kế được duyệt.

- [ ] Chọn và ghi framework, thư mục, lệnh chạy/build, cách cấu hình API base URL; không gắn secret vào bundle client.
- [ ] Thiết kế route và layout cho catalog, chi tiết sản phẩm, giỏ, checkout, đơn hàng, chat và admin theo phạm vi đã chốt. Đánh dấu route chưa có API.
- [ ] Build frontend thành công; README nêu cách chạy riêng và cùng Compose.

**F02 — Design system và trạng thái UI.** Phụ thuộc: F01.

- [ ] Có token màu, chữ, spacing, component form/button/card/dialog; hiển thị tốt trên mobile/desktop và điều hướng bàn phím.
- [ ] Mỗi màn hình có trạng thái loading, empty, error, success; thông báo tiếng Việt rõ tác động và cách xử lý.

**F03 — Catalog và khám phá.** Phụ thuộc: F01–F02, C02, C05 cho tích hợp thật.

- [ ] Danh sách/tìm kiếm/lọc và chi tiết sản phẩm dùng trường từ contract; ảnh/giá/tồn thiếu thì hiển thị trạng thái thiếu dữ liệu, không bịa.
- [ ] Test filter, phân trang, sản phẩm ẩn/hết hàng, lỗi mạng và responsive.
- [ ] Từ cửa hàng vào `/read` hoặc từ sách giấy vào `/read/{slug}`; trang đọc theo mẫu KhoaVerse có thư viện, tìm kiếm, mục lục, chuyển chương/trang, chỉnh giao diện, quay lại cửa hàng và link mua sách giấy.
- [ ] Nhạc nền dùng MP3 chọn từ thiết bị, chỉ phát trong trình duyệt; test tệp lỗi, điều khiển bàn phím, mobile và các trạng thái không có nội dung đọc mẫu.

**F04 — Giỏ và checkout.** Phụ thuộc: F03, C04, C06–C08 cho tích hợp thật.

- [ ] Sửa số lượng, xóa dòng, hiển thị breakdown quote và thời hạn; cập nhật khi giá/tồn đổi.
- [ ] Trước đặt hàng, khách xem tổng tiền và xác nhận. UI gửi idempotency key ổn định khi retry cùng yêu cầu; chỉ báo thành công khi API trả order ID.
- [ ] Test double-click, mất mạng rồi retry, giỏ rỗng, hết hàng, quote hết hạn và lỗi validation.

**F05 — Tài khoản, đơn và sau bán.** Phụ thuộc: F01–F02, C04, C09–C10 cho tích hợp thật.

- [ ] Login/session theo contract; trang đơn chỉ hiển thị dữ liệu chủ sở hữu, trạng thái và timeline thật.
- [ ] UI đăng ký, nhập/gửi lại mã email, quên/đặt lại mật khẩu bằng mã, nút Google/Facebook và callback đổi mã; không đưa token vào URL/log.
- [ ] Hủy/hoàn chỉ xuất hiện khi API cho phép; giao diện phân biệt yêu cầu đã gửi với yêu cầu đã được chấp thuận.

**F06 — Chat mua sắm và xác nhận hành động AI.** Phụ thuộc: F02, C12–C15 cho tích hợp thật.

- [ ] Tin nhắn hiển thị nguồn, trạng thái đang trả lời, thiếu bằng chứng, lỗi provider và handoff; không tự hiển thị giá/tồn từ văn bản mẫu như dữ liệu hiện hành.
- [ ] Hành động ghi có preview, tác động và nút xác nhận rõ; UI chỉ hiển thị kết quả sau response của tool/API. Test từ chối, token hết hạn và retry.

**F07 — Giao diện quản trị.** Phụ thuộc: F02, C04–C05, C12, C15 theo màn hình.

- [ ] Nhân viên có màn hình catalog, nguồn tri thức cần duyệt và hội thoại bàn giao đúng role; trạng thái nháp/đã duyệt rõ ràng.
- [ ] Test quyền bị từ chối, dữ liệu nhạy cảm và thao tác duyệt/xuất bản cần xác nhận.

**F08 — Kiểm thử và bàn giao frontend.** Phụ thuộc: các `Fxx` nằm trong phạm vi release.

- [ ] Build, lint và test UI qua; kiểm tra keyboard, screen reader cơ bản và kích thước mobile/desktop mục tiêu.
- [ ] Danh sách route và API đang dùng khớp OpenAPI; test E2E cùng Codex theo C16. Ghi rõ fixture, API chưa có và phần chưa thể kiểm thử.

## 4. Quy tắc chống bịa cho câu trả lời và báo cáo của AI

- **Giá/tồn/đơn:** lấy từ API nghiệp vụ tại thời điểm trả lời; ghi thời điểm nếu dữ liệu có thể đổi. Không lấy số này từ RAG, prompt mẫu hoặc trí nhớ hội thoại.
- **Chính sách:** dùng tài liệu đã duyệt, đúng phiên bản/hiệu lực. Nếu không có nguồn, nói chưa có căn cứ và chuyển người phụ trách.
- **Trạng thái triển khai:** xem code và kết quả chạy. Một đoạn trong spec chỉ là mục tiêu; một file tồn tại chỉ chứng minh file tồn tại.
- **Kiểm thử:** chỉ nói `PASS` nếu đã chạy và thấy kết quả. Khi Docker/provider không sẵn, ghi `CHƯA CHẠY`, lý do và lệnh cần chạy lại.
- **Quyết định nghiệp vụ:** ghi `TBD` và các lựa chọn ảnh hưởng; không tự đặt quy tắc thuế, hoàn tiền, giao hàng hoặc provider.
- **Hành động có tác động:** hiển thị preview, kiểm quyền và điều kiện xác nhận trước khi gọi API ghi; báo thành công theo ID/response thật.

Checklist này là chỉ mục thực thi. Điều kiện nghiệp vụ chi tiết nằm trong [đặc tả Commerce](AI-NATIVE-COMMERCE.md); cách chạy bản demo nằm trong [README](../README.md).
