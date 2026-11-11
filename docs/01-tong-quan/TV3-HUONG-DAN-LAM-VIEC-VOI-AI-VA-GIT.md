# Hướng dẫn TV3 làm việc với AI và Git

Áp dụng cho thành viên **TV3** của Net108Khai, phụ trách `C06` (giá/khuyến mại), `C07` (tồn kho/giữ hàng), `C08` (giỏ/quote/đơn). Đọc cùng [phân công 5 người](AI-COMMERCE-PHAN-CONG-5-THANH-VIEN.md), [Waterfall](AI-COMMERCE-WATERFALL.md), [bảng tick](AI-COMMERCE-TASK-BOARD.md) và [đặc tả Commerce](../03-san-pham/AI-NATIVE-COMMERCE.md). Frontend thuộc Antigravity; TV1 điều phối API, schema và migration chung.

**Trạng thái ngày 11/11/2026:** `W01`, `W02` và `C06–C08` còn mở trong bảng tick. Kiểm tra lại bảng tick và `git status` mỗi lần bắt đầu; branch TV3 có thể đã có commit mới.

## 0. TV3 giao việc cho AI bằng một câu

Mở AI trong thư mục repo của TV3 và gửi: **“Đọc toàn bộ `docs/01-tong-quan/TV3-HUONG-DAN-LAM-VIEC-VOI-AI-VA-GIT.md`, tự xác định bước hiện tại từ bảng tick và thực hiện phần việc được phép. Báo diff và kết quả kiểm tra, rồi dừng trước khi stage, commit, push, tạo PR hoặc tick.”**

AI phải tự làm theo thứ tự: kiểm branch/working tree ở mục 1 → đọc cổng `W01/W02` và phụ thuộc trong bảng tick → nếu `W01` còn mở, làm mục 2 → nếu `W01` đã duyệt nhưng `W02` còn mở, tổng hợp thiết kế C06–C08 cho TV1 và chờ hợp đồng chung → nếu `W02` đã duyệt, làm **một** mã việc đủ phụ thuộc theo mục 4. Nếu branch sai, có thay đổi lạ, thiếu quyết định hoặc contract, báo rõ để TV3 xử lý. AI chỉ tiếp tục phần khác khi TV3 giao lượt việc mới.

## 1. Mở đúng bản clone và branch

Trong File Explorer, mở thư mục repo đã clone; nhấn `Alt + D`, gõ `cmd`, nhấn Enter. Chạy từng lệnh:

```cmd
git status
git branch --show-current
```

Điều kiện tiếp tục: CMD đang ở thư mục repo, branch hiện `docs/tv3-W01-commerce-input`, và TV3 nhận diện được mọi file đang thay đổi. Nếu đang ở `main`, chạy `git switch docs/tv3-W01-commerce-input` **chỉ khi working tree sạch**. Mỗi thành viên làm trên bản clone riêng; không đổi branch trong thư mục làm việc của người khác.

Khi có tài liệu mới trên `main`, cập nhật branch của TV3 bằng:

```cmd
git fetch origin
git merge origin/main
```

Nếu Git báo xung đột, dừng và nhờ TV1 cùng xem từng file; không dùng force push, reset cứng hoặc xóa thay đổi để vượt lỗi.

## 2. Việc hiện tại: W01 — tổng hợp câu hỏi nghiệp vụ

Mở repo trong VS Code bằng `code .` (hoặc **File → Open Folder**). Nhờ AI đọc tài liệu và code liên quan, rồi tạo **một file duy nhất**: `docs/99-ghi-chu/TV3-W01-COMMERCE-INPUT.md`. File cần có bảng `Chủ đề | Điều đã biết và nguồn | Quyết định còn thiếu | Câu hỏi cho chủ dự án | Tác động C06/C07/C08` cho:

1. Giá VND, thuế, giá theo thời gian/kênh và khuyến mại.
2. Số kho, điều kiện bán hết hàng, thời điểm ghi giảm hoặc giữ tồn.
3. Thời hạn reservation, giải phóng tồn khi lỗi/hủy/hết hạn.
4. Giỏ của khách vãng lai và tài khoản, giới hạn số lượng.
5. Quote: giá/phí giao/tồn, thời hạn, thay đổi giá trước khi xác nhận.
6. Đặt đơn, thanh toán chờ xử lý, hủy đơn, retry và `Idempotency-Key`.

Ghi **“Chưa chốt”** khi tài liệu không có quyết định của chủ dự án. Phân biệt code đang chạy, đặc tả mục tiêu và đề xuất của AI. TV3 chuyển câu hỏi cho chủ dự án/TV1; AI không tự chọn chính sách giá, thuế, kho hoặc giao hàng. `C01` và `W01` chỉ được tick khi chủ dự án chốt đầy đủ theo cổng Waterfall.

Nếu file ghi chú đã tồn tại, AI đọc và chỉ bổ sung điều còn thiếu; khi câu hỏi đã đủ nhưng đang chờ chủ dự án trả lời, AI báo trạng thái chờ và dừng. AI làm mục này chỉ sửa file ghi chú nêu trên. Sau khi viết, AI chạy `git status --short`, kiểm nội dung và báo các câu hỏi ưu tiên cho chủ dự án. TV3 đọc bản nháp trước khi thực hiện mục 3. AI giữ nguyên backend, frontend và bảng tick ở giai đoạn này.

**Hoàn thành bước W01 của TV3** khi file nêu đủ câu hỏi, có nguồn cho điều đã biết và chủ dự án đã trả lời các quyết định liên quan; TV1 đưa quyết định được chốt vào đặc tả chung. File ghi chú **không tự chứng minh** cổng `W01` đã được duyệt.

## 3. TV3 kiểm bản nháp trước khi đưa lên GitHub

Trong CMD, chạy:

```cmd
git branch --show-current
git status --short
type docs\99-ghi-chu\TV3-W01-COMMERCE-INPUT.md
```

TV3 đọc toàn bộ file trong VS Code hoặc từ lệnh `type` (file mới chưa được Git theo dõi nên `git diff` có thể chưa hiển thị nội dung). Kiểm tra câu hỏi dễ trả lời, không có giá/thuế/phí/chính sách tự bịa, không có secret hoặc dữ liệu khách hàng, không có file ngoài phạm vi. Nếu thấy file lạ, dừng để xác định chủ sở hữu; không đưa nó vào commit của TV3.

**Chỉ sau khi TV3 duyệt đúng file**, yêu cầu AI thực hiện hoặc tự chạy:

```cmd
git add docs/99-ghi-chu/TV3-W01-COMMERCE-INPUT.md
git diff --cached --name-only
git diff --cached --check
```

Điều kiện commit: `git diff --cached --name-only` **chỉ hiện đúng file trên**, kiểm tra whitespace không báo lỗi, và TV3 đã xem nội dung. Nếu có file khác đã stage, dừng và nhờ người phụ trách kiểm tra; không commit toàn bộ index.

```cmd
git commit -m "W01: tong hop quy tac gia ton va don hang"
git push -u origin docs/tv3-W01-commerce-input
```

Trên GitHub, tạo PR **từ `docs/tv3-W01-commerce-input` vào `main`**, mời TV1 review; mô tả câu hỏi, nguồn và quyết định còn mở. Merge sau khi TV1 và chủ dự án rà nội dung. Branch có mặt trên GitHub không có nghĩa đã có code hoặc đã hoàn thành W01.

## 4. Sau khi W01 và W02 được duyệt

TV1 xác nhận bản đặc tả, OpenAPI, schema và test plan đã chốt. TV3 lấy `main` mới nhất rồi tạo **branch mới cho từng mã nhỏ**; ví dụ `feat/tv3-C06-1-offer`, sau đó `feat/tv3-C06-2-coupon`. Không dùng branch ghi chú W01 để viết toàn bộ Commerce core.

Thứ tự task: `C06.1` → `C06.2` → `C06.3`; `C07.1` → `C07.2` → `C07.3`; `C08.1` → `C08.2` → `C08.3` → `C08.4`. Đọc cột **Cần trước** trong bảng tick cho từng việc: một số nhánh có thể chạy song song sau khi phụ thuộc đã đạt. Mỗi task có đầu ra code, test biên và PR riêng. TV1 nhận mọi thay đổi cần `Program.cs`, `CommerceDbContext.cs`, migration snapshot hoặc OpenAPI để tránh merge chồng; TV3 không tự tạo migration đồng thời với người khác.

Prompt ngắn cho AI khi triển khai một task:

```text
Tôi là TV3. Chỉ làm mã Cxx.y trên branch feat/tv3-Cxx-y-... . Đọc AGENTS.md, đặc tả, hợp đồng API, bảng tick, code và test liên quan. Kiểm tra W01/W02 và các mã phụ thuộc đã được duyệt. Nêu file sẽ sửa và tác động tới TV1/TV2/TV4/Antigravity, rồi triển khai đúng một mã việc; thêm test có ý nghĩa cho quy tắc tiền, tồn, quyền hoặc idempotency. Chạy build/test liên quan, báo lệnh và kết quả thật. Để tôi review diff trước khi stage, commit, push hoặc tick bảng. Nếu thiếu quyết định/contract, ghi rõ và dừng phần phụ thuộc.
```

## 5. Quy tắc Git bắt buộc cho TV3 và AI

- Trước khi sửa: `git branch --show-current` và `git status --short`; làm đúng branch task của TV3, nhận diện thay đổi có sẵn.
- Trước khi commit: xem `git diff`, stage **đúng đường dẫn của task**, xem `git diff --cached --name-only` và `git diff --cached --check`; TV3 duyệt danh sách file và nội dung.
- AI **dừng sau khi báo kết quả**. AI chỉ commit/push/tick khi TV3 yêu cầu rõ hành động cụ thể **sau khi xem diff**. Không dùng `git add .`, `git commit -am`, `git push --force`, `git reset --hard`, `git clean` hoặc thao tác trên `main` để gom việc cho nhanh.
- PR chỉ chứa một task hoặc nhóm phụ thuộc chặt. Mời ít nhất TV1 hoặc người review được phân công; chỉ cập nhật ô tick `Cxx.y` khi tiêu chí, test và bằng chứng trong [bảng tick](AI-COMMERCE-TASK-BOARD.md) đều đạt.
- Nếu `git push` bị từ chối vì branch từ xa thay đổi, `git fetch origin`, xem khác biệt và hỏi người đang làm cùng branch; không force push. Nếu build/test không chạy được, báo **chưa kiểm chứng** kèm lý do.
