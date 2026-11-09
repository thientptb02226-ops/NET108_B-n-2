# Quy Trình Chuẩn Vibe Coding (10 Bước Thực Thi)

Tài liệu này chuẩn hóa quy trình phát triển phần mềm kết hợp AI Agent tại **Net108Khai**, áp dụng triệt để nguyên lý: **"Con người làm chủ kiến trúc, AI là máy gia tốc; Specification & Git là hai lá chắn an toàn."**

---

## 4 Giai Đoạn & 10 Bước Thực Thi

| Giai Đoạn | Bước Cụ Thể | Trách Nhiệm Của Lập Trình Viên | Vai Trò Của AI Agent |
|---|---|---|---|
| **Giai đoạn 1: Chuẩn bị & Thiết kế** | **Bước 1**: Xác định bài toán & scope | Định hình người dùng, vấn đề cần giải quyết, chốt phạm vi tính năng (In-scope vs Out-of-scope) | Hỗ trợ phân tích use-case, đặt câu hỏi làm rõ (`/grill-me`) |
| | **Bước 2**: Phân tích & thiết kế hệ thống | Quyết định chia 3 tầng (Frontend, Backend, Database), luồng dữ liệu, auth & permissions | Đề xuất sơ đồ tuần tự, API contract |
| | **Bước 3**: Tạo tài liệu specs & context | Viết/Duyệt `docs/` (Architecture, Specs, Database Schema) | Tổng hợp và đối chiếu tính khả thi của spec |
| **Giai đoạn 2: Lập kế hoạch & Thực thi** | **Bước 4**: Phân rã thành Atomic Tasks | Xác định thứ tự ưu tiên và phụ thuộc giữa các task | Phân nhỏ task thành các đơn vị công việc độc lập (`/to-tickets`) |
| | **Bước 5**: Cho AI đọc codebase trước khi sửa | Chỉ định ngữ cảnh và các file cần tham khảo | Dùng tool đọc code, phân tích ảnh hưởng |
| | **Bước 6**: Lập & duyệt kế hoạch (Plan Review) | Phê duyệt kế hoạch triển khai của AI | Đưa ra bản kế hoạch từng bước cụ thể, KHÔNG sửa file vội vàng |
| **Giai đoạn 3: Kiểm thử & Chất lượng** | **Bước 7**: Triển khai từng bước (Atomic step) | Giám sát từng thay đổi nhỏ | Viết mã nguồn kèm unit test tương ứng (`/tdd`) |
| | **Bước 8**: Debug theo nguyên nhân gốc rễ | Cung cấp ngữ cảnh lỗi (log, error trace, hành vi thực tế vs kỳ vọng) | Tìm root-cause, giải thích nguyên nhân, vá triệt để thay vì hack tạm bợ (`/diagnosing-bugs`) |
| **Giai đoạn 4: Tổng hợp & Lặp lại** | **Bước 9**: Code review & kiểm tra an toàn | Đánh giá tổng thể mã nguồn | Rà soát lỗi bảo mật (OWASP, SQL injection, memory leak) (`/code-review`) |
| | **Bước 10**: Refactor có phạm vi & Git commit | Duyệt commit và tạo điểm mốc an toàn (checkpoint) | Dọn dẹp code thừa, giữ commit message chuẩn |

---

## Các Quy Tắc Vàng Khi Làm Việc Với AI

1. **Tuyệt đối không dùng One-Prompt cho tính năng lớn**:
   - Nếu một tính năng liên quan đến Database + API + UI + AI, phải tách thành tối thiểu 3-4 subtasks thực thi tuần tự.
2. **Kỷ luật Git (Git Discipline)**:
   - Trước khi bắt đầu một tính năng mới: `git status` phải sạch.
   - Sau khi hoàn thành một atomic task có kiểm thử thành công: Thực hiện `git commit`.
   - Khi AI đi chệch hướng hoặc sinh code lỗi dây chuyền: Thực hiện `git checkout` hoặc `git reset` quay về checkpoint gần nhất.
3. **Phỏng vấn làm rõ yêu cầu (`grill-me`)**:
   - Khi yêu cầu từ người dùng chưa rõ ràng, AI không được tự đoán mà phải chủ động hỏi các câu hỏi trọng tâm để chốt phương án thiết kế.
