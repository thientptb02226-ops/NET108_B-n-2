# Apple Design System & Fluid Motion (Ứng Dụng Trong Net108Khai)

Tài liệu này áp dụng triết lý thiết kế và động lực học chất lỏng (Fluid, Physical Motion) từ Apple (WWDC) vào các ứng dụng giao diện của **Net108Khai** (`Trello-Clone-Frontend`, `Chatbot-Frontend`, `Desktop`, `Mobile`).

---

## 1. Bốn Nguyên Tắc Cốt Lõi

### 1. Phản Hồi Tức Thì (Kill Latency)
- **Bắt sự kiện ngay tại `pointerdown`**: Khi người dùng nhấn chuột hoặc chạm vào thẻ Kanban, phản hồi thị giác (độ nảy, nâng nhẹ thẻ, hiệu ứng đổ bóng) phải xuất hiện ngay trong 0ms. Không chờ sự kiện `click` hay `pointerup`.
- **Cập nhật 1:1 liên tục**: Trong quá trình kéo thẻ, vị trí thẻ phải bám sát con trỏ trong từng frame (`requestAnimationFrame`).

### 2. Thao Tác Trực Tiếp (Direct Manipulation)
- **Tôn trọng điểm nắm bắt (`grabOffset`)**: Khi người dùng nhấn vào góc trên của thẻ và kéo, con trỏ phải giữ nguyên khoảng cách tương đối tới góc thẻ đó. Tuyệt đối không để thẻ nhảy tâm vào giữa con trỏ.
- Sử dụng `setPointerCapture` để đảm bảo chuyển động không bị đứt đoạn ngay cả khi con trỏ di chuyển ra ngoài phạm vi phần tử.

### 3. Khả Năng Gián Đoạn & Đảo Chiều (Interruptibility)
- Bất kỳ hoạt ảnh nào (mở modal thẻ, đóng danh sách, chuyển cột) đều phải có khả năng bị người dùng "tóm lấy" và đảo chiều ngay lập tức.
- Luôn lấy giá trị hiển thị thực tế trên màn hình (`presentation value`) làm điểm khởi đầu cho chuyển động tiếp theo, không bắt đầu từ giá trị đích (`target value`) để tránh hiện tượng giật cục.

### 4. Động Lực Học Lò Xo (Physical Spring Motion)

| Trường Hợp Tương Tác | Damping (Hệ số cản) | Response (Thời gian phản hồi) | Hành Vi Vật Lý |
|---|---|---|---|
| **Kéo thả thẻ thông thường** | `1.0` (Critically Damped) | `0.3s - 0.4s` | Di chuyển mượt mà, không bị rung lắc hay bắn quá đà |
| **Búng thẻ / Thả tay có quán tính (Flick)** | `~0.8` (Under-damped) | `0.3s - 0.35s` | Có quán tính nhẹ, nảy nhẹ tự nhiên khi tiếp đất vào danh sách đích |
| **Chạm biên danh sách (Boundaries)** | Cản lực tăng dần (`Rubber-band`) | - | Tạo cảm giác có lực đàn hồi kéo lại, không khựng cứng đơ |

---

## 2. Thẩm Mỹ & Độ Sâu (Depth & Translucency)

- **Vật liệu bán trong suốt (Materials & Blur)**:
  - Header bảng điều khiển và Chatbot popup sử dụng `backdrop-filter: blur(20px)` kèm màu nền có độ trong suốt (`rgba(255, 255, 255, 0.8)` hoặc `rgba(30, 30, 30, 0.8)`).
- **Hệ thống phân cấp độ sâu**:
  - Nền bảng: Phẳng, tông màu dịu.
  - Cột (List): Nổi nhẹ trên nền bảng (`box-shadow` mềm).
  - Thẻ tĩnh (Card): Nằm phẳng trên cột.
  - Thẻ đang được kéo (Dragging Card): Nâng lên cao với độ bóng lớn (`box-shadow: 0 20px 30px rgba(0,0,0,0.15)`), xoay nhẹ từ 2° đến 4° theo hướng kéo để tạo cảm giác tự nhiên như cầm một tấm thẻ thật ngoài đời.
