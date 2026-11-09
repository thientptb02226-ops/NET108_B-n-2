# Thiết Kế Hệ Thống Giao Diện Frontend (Frontend Design System)

Tài liệu này là quy chuẩn thiết kế tối cao cho giao diện người dùng của **Net108Khai**, kết hợp 3 kỹ năng giao diện đỉnh cao:
1. **`impeccable`** (Paul Bakaus): Tiêu chuẩn tay nghề đẳng cấp (Out-of-distribution craft), playbooks và sàn chất lượng (craft floor).
2. **`taste-skill`** (Leonxlnx): Tiêu chuẩn chống giao diện rập khuôn (Anti-AI-slop), nhịp điệu màn hình (cadence) và micro-interactions tinh tế.
3. **`ui-ux-pro-max`** (NextLevelBuilder): Hệ thống design tokens, ma trận trạng thái thành phần (loading/empty/error/success) và khả năng tiếp cận (Accessibility WCAG AA).

---

## 1. Triết Lý & Quy Tắc Cốt Lõi (House Rules)

### A. Triệt Tiêu "AI Slop" (Taste-Skill Anti-Slop Discipline)
- **Tuyệt đối cấm màu tím / lavender gradient generic**: Tránh xa phong cách "AI chatbot" tím tím hồng hồng rẻ tiền. Sử dụng bảng màu thương mại tin cậy: Nền Slate/Zinc trung tính, nhấn Emerald (xanh ngọc lục bảo tượng trưng cho hoàn tất/thành công) hoặc Amber (ấm áp/thương mại).
- **Không dùng card mờ thiếu tương phản**: Mọi thẻ (Product Card, Cart Item, Modal) phải có đường viền sắc nét (`border border-zinc-200 dark:border-zinc-800`), độ đổ bóng phân tầng rõ rệt.
- **Dữ liệu thật, không bịa**: Dùng ảnh sản phẩm thực tế, tiền tệ VNĐ chuẩn (`199.000 ₫`), số lượng tồn kho thực. Nếu thiếu dữ liệu, hiển thị placeholder rõ ràng thay vì giả mạo thông tin.

### B. Tiêu Chuẩn Nghề Nghiệp (Impeccable Craft Floor)
- **Tập trung vào 2 chế độ hiển thị (Modes)**:
  - *Persuade & Experience* (Storefront / Hero): Táo bạo, ấn tượng, có cá tính mạnh mẽ, chuyển động mở màn (`data-enter`).
  - *Operate* (Giỏ hàng, Checkout, Đơn hàng, Admin): Trực diện, tối giản, rõ ràng, tối ưu cho thao tác nhanh và không gây nhầm lẫn về tiền bạc.
- **Bảo toàn hiển thị trên 5 mốc viewport**:
  1. `1440px` (Desktop): 1 section trọn vẹn màn hình đối với Landing/Hero. Cạnh lề trái và phải cân đối hoàn hảo.
  2. `1024px` (Tablet ngang): Lưới 3 cột mượt mà.
  3. `768px` (Tablet dọc): Lưới 2 cột, menu responsive.
  4. `390px` (Mobile chuẩn): 1 cột, các nút hành động chiếm trọn chiều ngang (`w-full`), vùng chạm tối thiểu `44px`.
  5. `320px` (Mobile nhỏ): Không tràn màn hình (`no horizontal overflow`), không chồng chéo nội dung.

### C. Ma Trận 4 Trạng Thái Thành Phần (UI-UX-Pro-Max State Machine)
Mọi view và component tương tác (Card, Button, Form, Modal) bắt buộc phải xử lý đủ 4 trạng thái:
1. **`Loading`**: Skeleton loading tinh tế có độ chuyển động shimmer nhẹ, giữ đúng chiều cao thực tế để chống giật trang (Zero Cumulative Layout Shift - CLS).
2. **`Empty`**: Thông điệp tiếng Việt cụ thể ("Giỏ hàng của bạn đang trống"), kèm theo 1 nút hành động duy nhất ("Khám phá sản phẩm ngay").
3. **`Error`**: Thông điệp tiếng Việt trực diện, giải thích rõ lý do và cung cấp nút thử lại ("Không thể tải danh sách sản phẩm. [Thử lại]").
4. **`Success`**: Hiển thị dữ liệu trọn vẹn, phản hồi tức thì.

---

## 2. Hệ Thống Token Thiết Kế (Design Tokens)

### 2.1. Màu Sắc (Color Palette)
```css
:root {
  /* Nền và Bề mặt */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc; /* zinc-50 */
  --bg-tertiary: #f1f5f9;  /* zinc-100 */
  
  /* Văn bản */
  --text-primary: #0f172a;   /* zinc-900 */
  --text-secondary: #475569; /* zinc-600 */
  --text-muted: #94a3b8;     /* zinc-400 */
  
  /* Điểm nhấn thương hiệu (Commerce Emerald) */
  --brand-primary: #059669;       /* emerald-600 */
  --brand-primary-hover: #047857; /* emerald-700 */
  --brand-primary-light: #ecfdf5; /* emerald-50 */
  
  /* Ngữ nghĩa (Semantics) */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #0284c7;

  /* Đường viền & Đổ bóng */
  --border-subtle: #e2e8f0; /* zinc-200 */
  --border-strong: #cbd5e1; /* zinc-300 */
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
}
```

### 2.2. Kiểu Chữ (Typography Scale)
- **Phông chữ chủ đạo**: `Plus Jakarta Sans`, `Inter`, hoặc system sans-serif hiện đại.
- **Tỷ lệ (Modular Scale)**:
  - Hero Heading: `clamp(2rem, 5vw, 3.5rem)` (`tracking-tight font-extrabold`)
  - Section Title: `1.75rem (28px)` (`tracking-tight font-bold`)
  - Card Title / Subheading: `1.125rem (18px)` (`font-semibold`)
  - Body Text: `1rem (16px)` (`leading-relaxed font-normal`)
  - Microcopy / Metadata: `0.875rem (14px)` (`text-muted`)

---

## 3. Động Lực Học & Micro-Interactions (Motion & Feedback)

Áp dụng quy tắc vàng từ `taste-skill` và `apple-design`:
- **Card Hover**: Khi chuột rê vào thẻ sản phẩm, thẻ nâng nhẹ `translateY(-2px)` và bóng đổ tăng nhẹ trong 150ms (`transition: transform 150ms ease-out, box-shadow 150ms ease-out`).
- **Button Press**: Khi người dùng nhấn nút (`active`), co nhẹ `scale(0.98)` phản hồi tức thì ngay tại `pointerdown`.
- **Keyboard Focus Ring**: Viền focus rõ nét, chuẩn WCAG AA: `outline-none ring-2 ring-emerald-600 ring-offset-2`.
- **Spring Transitions**: Đối với các chuyển động mở Drawer giỏ hàng hoặc Modal chi tiết sản phẩm:
  - `damping: 1.0` (Critically Damped - không rung lắc), `duration: 0.35s`.
  - Hỗ trợ ngắt quãng (Interruptible) - người dùng có thể bấm đóng hoặc kéo trả lại bất kỳ lúc nào.

---

## 4. Ngôn Ngữ & UX Microcopy Tiếng Việt (`quy-luat-content-viet`)

- **Xưng hô**: Trợ lý AI xưng `"mình - bạn"` hoặc trả lời trung tính, trực diện.
- **Tiêu chuẩn giá**: Luôn dùng định dạng VNĐ có dấu chấm phân cách hàng nghìn (`199.000 ₫` hoặc `199.000 VNĐ`).
- **Nút hành động (Buttons)**: Gồm **Động từ + Danh từ cụ thể**:
  - Tốt: `"Thêm vào giỏ hàng"`, `"Đặt hàng ngay"`, `"Xác nhận hủy đơn"`.
  - Tránh: `"Gửi"`, `"OK"`, `"Tiếp tục"` (mơ hồ).
- **Xác nhận tác động mạnh**:
  - Không xóa/hủy đột ngột: Cung cấp dialog xác nhận rõ ràng: *"Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"*
  - Hỗ trợ hoàn tác (Undo) hoặc thông báo thành công trong 3 giây.
