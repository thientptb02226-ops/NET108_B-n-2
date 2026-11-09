# Net108Khai Frontend — AI Native Commerce Web Client

Ứng dụng web frontend của **Net108Khai**, kết hợp giao diện mua sắm và trợ lý AI thông minh, được xây dựng theo chuẩn thiết kế:
- **`impeccable`**: Chuẩn hoàn thiện cao cấp, visual hierarchy sắc nét, zero layout shift (CLS).
- **`taste-skill`**: Tiêu chuẩn chống AI-slop, section cadence 1 màn hình trên desktop, 2px hover lift, không dùng màu tím/lavender sáo rỗng.
- **`ui-ux-pro-max`**: Design tokens chuẩn, đủ 4 trạng thái UI (loading/empty/error/success), đáp ứng WCAG AA.
- **`apple-design` & `quy-luat-content-viet`**: Chuyển động vật lý lò xo mượt mà, văn phong tiếng Việt trực diện ("mình - bạn").

## Hướng Dẫn Chạy & Cấu Hình

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:3000`. Các yêu cầu tới `/api/*` sẽ tự động được proxy sang backend tại `http://localhost:8080`.

### 3. Kiểm tra kiểu & Linter
```bash
npm run type-check
```

### 4. Build sản phẩm (Production)
```bash
npm run build
```
Bản build tĩnh được xuất tại thư mục `dist/`.
