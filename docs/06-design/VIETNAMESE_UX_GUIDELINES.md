# Quy Chuẩn Nội Dung & Giao Tiếp Tiếng Việt (UX Writing & Chatbot)

Tài liệu này áp dụng kỹ năng **`quy-luat-content-viet`** vào toàn bộ giao diện, thông báo hệ thống và văn phong của trợ lý ảo trong **`Chatbot-Frontend`** và hệ thống **Net108Khai**.

---

## 1. Triết Lý Viết: "Nói Cho Một Người Nghe"

- **Xưng hô tự nhiên, nhất quán**:
  - Chatbot sử dụng đại từ thân thiện và chuyên nghiệp: `"mình - bạn"` hoặc `"tôi - bạn"`.
  - Tránh các đại từ hô hào tập thể như: *"Chào mọi người"*, *"Chào cả nhà"*, *"Xin chào các bạn ơi"*.
- **Loại bỏ câu rào đón vô nghĩa**:
  - Không bắt đầu câu trả lời bằng: *"Dạ vâng, tôi rất sẵn lòng giúp bạn việc này..."* hoặc *"Là một trợ lý AI, tôi xin phép được..."*.
  - Đi thẳng vào kết quả: *"Mình đã tạo xong 3 thẻ công việc cho Sprint 12 trên bảng Backend."*

---

## 2. Quy Tắc "3 Giây Đầu Là Lời Hứa"

- Người dùng lướt nhanh chỉ quan tâm: **"Có giải quyết được việc của tôi không và mất bao lâu?"**
- Cấu trúc thông điệp chuẩn:
  1. **Dòng 1**: Xác nhận ngay kết quả thực thi (hoặc câu trả lời trực tiếp).
  2. **Dòng 2 - 3**: Chi tiết bổ trợ cần thiết hoặc liên kết tới đối tượng cụ thể.
  3. **Cuối**: Gợi ý hành động tiếp theo (nếu có), không ép buộc.

---

## 3. Bản Địa Hóa Chuẩn Xác (Vietnamese Localization)

| Tránh Dùng (Văn dịch thô / Rườm rà) | Nên Dùng (Tiếng Việt tự nhiên & trực diện) |
|---|---|
| *"Đã xảy ra lỗi không xác định, vui lòng thử lại sau."* | *"Không thể kết nối đến máy chủ bảng công việc. Bạn hãy kiểm tra lại mạng hoặc thử lại sau 30 giây."* |
| *"Bạn có chắc chắn muốn xóa thẻ này không?"* | *"Xóa vĩnh viễn thẻ này cùng 4 bình luận? Thao tác này không thể hoàn tác."* |
| *"Thẻ đã được gán quyền sở hữu thành công."* | *"Đã gán thẻ cho Hoàng Minh."* |
| *"AI đang trong quá trình thực hiện tác vụ..."* | *"Đang tổng hợp 12 thẻ sprint..."* |

---

## 4. Gỡ Nghi Ngờ Đúng Lúc

Khi Agent hoặc Chatbot thực hiện các thao tác quan trọng (di chuyển hàng loạt thẻ, lưu trữ bảng, xóa dữ liệu):
- Cung cấp bản xem trước (Preview) ngắn gọn: *"Sẽ chuyển 5 thẻ đã hoàn thành sang cột Đã lưu trữ. Bạn có muốn tiếp tục?"*
- Cho phép hoàn tác (Undo) tức thì trong 5 giây thay vì bắt người dùng xác nhận qua nhiều bước phức tạp.
