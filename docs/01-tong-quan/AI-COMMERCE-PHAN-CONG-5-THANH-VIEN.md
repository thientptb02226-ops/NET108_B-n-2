# Phân công 5 thành viên — Net108Khai AI native Commerce

Ngày lập: 11/11/2026. Tài liệu này chia **công việc ngoài frontend** cho 5 thành viên (`TV1`–`TV5`; thay bằng tên thật khi nhóm chốt). Antigravity sở hữu toàn bộ `F01–F08` trong `Chatbot-Frontend/`. Codex có thể hỗ trợ từng chủ việc backend, nhưng người được giao phải rà và nghiệm thu kết quả. [Bảng tick](AI-COMMERCE-TASK-BOARD.md) là nguồn duy nhất ghi trạng thái hoàn thành; tài liệu này chỉ ghi trách nhiệm.

## 1. Trách nhiệm và đầu ra

| Người | Mảng sở hữu | Mã việc chính | Đầu ra bàn giao |
| --- | --- | --- | --- |
| **TV1 — trưởng kỹ thuật/nền tảng** | Kiến trúc .NET, hợp đồng API, EF Core Code First, Docker, vận hành | `C00`, `C02`, `C03`, `C17` | OpenAPI, migration có version, Compose chạy được, runbook và bằng chứng build/restore |
| **TV2 — tài khoản và sách** | Đăng ký/đăng nhập, mã email, OAuth, role/quyền; catalog và đọc mẫu | `C04`, `C05` | API xác thực, ma trận quyền, sản phẩm/sách, API đọc mẫu chỉ cho nội dung đã duyệt |
| **TV3 — giao dịch Commerce** | Giá, khuyến mại, tồn kho, giỏ, quote và đặt đơn | `C06`, `C07`, `C08` | API giá/tồn/giỏ/đơn, bất biến tiền và tồn, test cạnh tranh và idempotency |
| **TV4 — sau đặt hàng** | Thanh toán làm cuối, giao/hoàn, outbox và thông báo | `C09`, `C10`, `C11` | Adapter/webhook, state giao/hoàn, consumer chống lặp, đối soát và test lỗi provider |
| **TV5 — AI Commerce** | Tri thức được duyệt, model gateway, tool gateway, hội thoại | `C12`, `C13`, `C14`, `C15` | RAG có ACL/nguồn, AI trả lời có căn cứ, tool có xác nhận/quyền/audit, bộ eval tiếng Việt |

**Chủ dự án** quyết định `C01.1–C01.3`, duyệt `W01`, `W02`, nghiệm thu `W05` và phạm vi phát hành. Cả 5 người tham gia `C16`, `C18`, `W04`; TV1 điều phối hợp đồng API và tích hợp, TV4 điều phối triển khai vận hành `W06`. Antigravity tham gia phần giao diện của các việc chung; không giao mã `Fxx` cho 5 người này.

## 2. Việc nhỏ theo từng người

### TV1 — nền tảng, thiết kế và vận hành

| Thứ tự | Mã | Kết quả cần bàn giao |
| --- | --- | --- |
| 1 | `C00.1–C00.3` | Kiểm lại build/Compose, chạy DB/API healthy, smoke đơn hàng và AI trên môi trường thật; `C00.1` đã có bằng chứng trong bảng tick, hai việc sau còn mở. |
| 2 | `C02.1` | Glossary và state machine Order/Payment/Reservation, nhánh hủy/lỗi/hết hạn. |
| 3 | `C02.2` | OpenAPI v1 có schema, role, lỗi, tiền VND, thời gian và idempotency. |
| 4 | `C02.3` | Ví dụ request/response, base URL và trạng thái endpoint để Antigravity đối chiếu. |
| 5 | `C03.1` | Chốt ranh giới module và quyền sở hữu bảng/domain; tách phần dùng chung đủ để các thành viên không sửa chồng. |
| 6 | `C03.2–C03.3` | Migration Code First có version; thử DB trống và bản sao DB demo, ghi forward/rollback. |
| 7 | `C17.1–C17.3` | Trace/metrics che dữ liệu riêng, TLS/secret/backup/restore, kiểm tải và bảo mật theo SLO đã chốt. |

### TV2 — danh tính, phân quyền và thư viện sách

| Thứ tự | Mã | Kết quả cần bàn giao |
| --- | --- | --- |
| 1 | `C04.1–C04.3` | Identity/session, gắn chủ giỏ/đơn, RBAC và test không đọc dữ liệu của người khác. |
| 2 | `C04.4–C04.5` | Đăng ký xác thực email bằng mã, gửi lại, quên mật khẩu bằng mã; test mã sai/hết hạn/dùng lại. |
| 3 | `C04.6–C04.8` | Google/Facebook OAuth, ma trận role, Data Protection, rate limit và test 401/403/restart. |
| 4 | `C05.1–C05.3` | Product/Variant/SKU Code First; API quản trị và API tìm/lọc/phân trang, chỉ hiện sản phẩm công khai. |
| 5 | `C05.4` | Schema sách giấy liên kết bản đọc mẫu/chương, nguồn, quyền công bố và trạng thái duyệt. |
| 6 | `C05.5–C05.6` | API thư viện/đọc mẫu và API duyệt/thu hồi; test bản nháp/thu hồi không lộ nội dung, thứ tự chương và quyền quản trị. |

### TV3 — giá, tồn và đặt đơn

| Thứ tự | Mã | Kết quả cần bàn giao |
| --- | --- | --- |
| 1 | `C06.1–C06.3` | Offer theo kênh/thời gian, coupon, breakdown tiền VND và test ranh giới hiệu lực/làm tròn. |
| 2 | `C07.1–C07.3` | Stock ledger, reservation có TTL/consume/release/expire, test nhiều checkout cùng SKU và đối soát tồn. |
| 3 | `C08.1` | Cart API kiểm user/session, SKU hợp lệ và số lượng; test giỏ rỗng/hàng ẩn. |
| 4 | `C08.2` | Quote tính lại giá/phí/tồn trên server, có version/TTL và lỗi quote hết hạn. |
| 5 | `C08.3–C08.4` | Tạo đơn từ quote, snapshot giá, giữ tồn nhất quán và idempotency; test retry/double request/lỗi DB. |

### TV4 — thanh toán, giao hàng và tích hợp sự kiện

| Thứ tự | Mã | Kết quả cần bàn giao |
| --- | --- | --- |
| 1 | Thiết kế `C09–C11` trong `W02` | Chốt state payment/shipment/return, webhook, outbox và hợp đồng provider; chưa chọn provider thì ghi `TBD`. |
| 2 | `C09.1–C09.3` trong `W03`, **sau Commerce core** | Adapter thanh toán/COD theo quyết định, webhook xác minh và chống lặp, đối soát/capture/refund. Đây là phần tích hợp làm cuối theo yêu cầu dự án. |
| 3 | `C10.1–C10.4` | Shipment/tracking, hủy đơn, return/refund một phần; test không giao/hoàn vượt số lượng hoặc tiền đã thu. |
| 4 | `C11.1–C11.3` | Outbox cùng transaction, inbox/dedup/retry/dead-letter và adapter thông báo; test provider lỗi và replay. |

### TV5 — AI có căn cứ và kiểm soát hành động

| Thứ tự | Mã | Kết quả cần bàn giao |
| --- | --- | --- |
| 1 | `C12.1–C12.4` | Nguồn tri thức có version/ACL/duyệt; ingest/index/retrieval lọc quyền; test nguồn mâu thuẫn, hết hạn và injection. |
| 2 | `C13.1–C13.4` | Model gateway có timeout/budget/trace, prompt version, eval tiếng Việt và fallback khi provider lỗi. |
| 3 | `C14.1–C14.5` | Tool allowlist và policy gateway; preview, xác nhận, idempotency, audit; test mất quyền/replay/đổi payload. |
| 4 | `C15.1–C15.4` | Hội thoại, consent/retention, câu trả lời có nguồn và giá/tồn tươi, handoff cho CS; test quyền và không báo đặt đơn khi chưa có order ID. |

## 3. Thứ tự Waterfall và điểm bàn giao

1. **`W01` — yêu cầu:** chủ dự án chốt `C01`. Đã chọn đồ dùng học tập, sách giấy, đọc mẫu miễn phí và nhạc MP3 từ máy; còn cần chốt người bán/kho, quyền công bố từng đoạn sách, giá/thuế/giao/hoàn, provider AI, dữ liệu cá nhân và tải mục tiêu. Không tự tick `W01` khi còn thiếu.
2. **`W02` — thiết kế:** TV1 giữ bản hợp đồng API/schema chung. TV2–TV5 viết quy tắc và ví dụ cho module mình; Antigravity xác nhận dữ liệu UI cần. Chốt migration, quyền, lỗi và test matrix trước khi triển khai phần phụ thuộc.
3. **`W03` — triển khai:** TV1 làm nền/migration; TV2 làm identity/catalog/đọc mẫu; TV3 làm Commerce core; TV5 làm AI sau khi có nguồn và contract. TV4 thiết kế sớm, triển khai tích hợp thanh toán cuối. Mỗi người chỉ tick mã con có bằng chứng.
4. **`W04` — kiểm thử hệ thống:** TV1 kiểm DB/migration/restore; TV2 kiểm quyền và nội dung đọc mẫu; TV3 kiểm tiền/tồn/idempotency; TV4 kiểm webhook/hoàn/notification; TV5 kiểm AI/ACL/injection. Cùng Antigravity chạy `C16.1–C16.4`, đặc biệt cửa hàng → đọc mẫu → quay lại mua sách.
5. **`W05–W06` — nghiệm thu/phát hành:** chủ dự án nghiệm thu `C18`; TV1 và TV4 chuẩn bị deploy/rollback, các chủ module kiểm smoke trên môi trường đích.

## 4. Quy tắc phối hợp để không sửa chồng

- `Program.cs`, `CommerceDbContext.cs`, migration snapshot và hợp đồng OpenAPI là file chung: TV1 giữ quyền tích hợp cuối; người khác bàn giao thay đổi theo module, không tự tạo migration đồng thời trên cùng DbContext. Thứ tự migration: nền → identity/catalog/đọc mẫu → giá/tồn/đơn → sau bán → AI.
- Mỗi PR/task ghi mã `Cxx.y`, file đã sửa, ví dụ API, quyền, migration, lệnh và kết quả test. Người khác review ít nhất một lần trước khi tick.
- Không lấy fixture frontend làm bằng chứng API đã chạy. Không đưa truyện toàn văn/nhạc từ trang tham chiếu vào database. Sách đọc mẫu chỉ xuất bản sau khi chủ dự án cung cấp và xác nhận quyền công bố.
- Bảng tick hiện ghi `F03.5–F03.7` đã xong, nhưng `C05.5–C05.6` và `C16.4` còn mở; TV2 cùng Antigravity phải đối chiếu lại điều kiện “dùng API thật” và kiểm thử liên thông trước khi nghiệm thu phần đọc sách cho release.
- Khi hợp đồng API thay đổi, TV1 cập nhật OpenAPI và báo Antigravity; phần bị ảnh hưởng quay lại `W02` theo [Waterfall](AI-COMMERCE-WATERFALL.md).

## 5. Cách dùng Git branch cho từng người

**Mỗi người dùng một clone riêng** của repository, không cùng đổi branch trong `C:\Net108Khai`. Trước khi đổi branch, kiểm `git status` và xử lý thay đổi của chính mình; không `git switch`, `reset`, `clean` hoặc stash thay người khác trong thư mục dùng chung. `main` chỉ nhận code qua pull request (PR) đã review; mỗi **mã việc nhỏ** có một branch ngắn hạn. Tên branch: `feat/tvN-Cxx-y-ten-ngan` hoặc `docs/tvN-Cxx-y-ten-ngan`; không giữ một branch lớn cho cả người suốt dự án. TV3 xem [hướng dẫn riêng](TV3-HUONG-DAN-LAM-VIEC-VOI-AI-VA-GIT.md) trước khi giao task cho AI.

| Người | Branch ví dụ ở giai đoạn thiết kế/triển khai | Review chính |
| --- | --- | --- |
| TV1 | `docs/tv1-C02-2-api-contract`, sau đó `feat/tv1-C03-2-migrations` | TV2 hoặc TV3 |
| TV2 | `docs/tv2-C04-auth-rules`, sau đó `feat/tv2-C04-4-email-codes` | TV1 |
| TV3 | `docs/tv3-C08-order-states`, sau đó `feat/tv3-C07-1-stock-ledger` | TV1 hoặc TV4 |
| TV4 | `docs/tv4-C09-payment-contract`, sau đó `feat/tv4-C10-1-shipment` | TV1 hoặc TV3 |
| TV5 | `docs/tv5-C12-knowledge-policy`, sau đó `feat/tv5-C12-1-sources` | TV1 hoặc TV2 |

Ví dụ thao tác trên **clone sạch của từng người** (thay tên branch và mã việc của mình):

```powershell
git status --short
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feat/tv2-C04-4-email-codes
# Sửa đúng phạm vi task, chạy build/test liên quan.
git add <duong-dan-file-cua-task>
git commit -m "C04.4: xac thuc email bang ma"
git push -u origin feat/tv2-C04-4-email-codes
```

Sau đó tạo PR **từ branch task vào `main`**, ghi mã việc, thay đổi, migration/API contract, lệnh và kết quả test. Người review kiểm code và điều kiện nghiệm thu; chỉ merge sau khi CI/build và review đạt. Nếu `main` thay đổi trước lúc merge, cập nhật branch bằng `git fetch origin` rồi `git merge origin/main`, giải quyết xung đột trong clone của mình và chạy lại test. Khi PR đã merge, tạo branch mới từ `main` mới nhất cho mã tiếp theo.

**File chung và migration:** TV1 điều phối lượt sửa `Program.cs`, `CommerceDbContext.cs`, snapshot migration và OpenAPI. TV2–TV5 báo trước nếu task cần các file đó; không cùng tạo migration trên hai branch từ một schema cũ. Tích hợp theo thứ tự phụ thuộc trong mục 3, tránh merge code phụ thuộc vào API/schema chưa có. Antigravity dùng branch riêng cho `Fxx`; PR frontend được review với hợp đồng API do TV1 bàn giao.
