# Danh Mục Tài Liệu Dự Án (Documentation Index) — Net108Khai

> **Quy chuẩn lưu trữ:** Mọi tài liệu kỹ thuật, đặc tả, thiết kế và hướng dẫn của dự án đều được quản lý tập trung tại thư mục `docs/` theo đúng cấu trúc 8 nhóm chuẩn Vibe Coding. Thư mục gốc chỉ lưu trữ đúng 2 file cấu hình AI (`AGENTS.md` & `CLAUDE.md`).

---

## 1. Cấu Trúc Tổng Thể

```
docs/
├── README.md               # [Bạn đang ở đây] Mục lục điều hướng tài liệu toàn dự án
├── 01-tong-quan/           # Mục tiêu, lộ trình, quy chuẩn phát triển và bàn giao
├── 02-ky-thuat/            # Kiến trúc hệ thống, API contracts, DB schema, bảo mật
├── 03-san-pham/            # Đặc tả yêu cầu, PRD, use cases, tính năng nghiệp vụ
├── 04-van-hanh/            # Hướng dẫn deploy, Docker runbook, CI/CD, quan sát
├── 05-mau/                 # Biểu mẫu, checklist nghiệm thu, ma trận kiểm thử
├── 06-design/              # Design System, Apple Motion, Wireframe, sơ đồ StarUML
├── 99-ghi-chu/             # Ghi chú nhanh, meeting notes, ý tưởng chưa phân loại
└── labs/                   # Báo cáo thực hành môn học NET108 (Lab 1 - Lab 8)
```

---

## 2. Mục Lục Chi Tiết Theo Phân Nhóm

### 📁 `01-tong-quan/` — Tổng Quan & Định Hướng
- [AI-COMMERCE-WATERFALL.md](01-tong-quan/AI-COMMERCE-WATERFALL.md): Quy trình 6 cổng Waterfall (`W01`–`W06`) nghiệm thu hệ thống AI-Native Commerce.
- [AI-COMMERCE-TASK-BOARD.md](01-tong-quan/AI-COMMERCE-TASK-BOARD.md): Bảng tick việc nhỏ (Atomic Task Board) nguồn trạng thái duy nhất của dự án.
- [AI-COMMERCE-AGENT-HANDOFF.md](01-tong-quan/AI-COMMERCE-AGENT-HANDOFF.md): Bản phân chia trách nhiệm và bàn giao giữa AI Codex & Antigravity.
- [AI-COMMERCE-PHAN-CONG-5-THANH-VIEN.md](01-tong-quan/AI-COMMERCE-PHAN-CONG-5-THANH-VIEN.md): Phân công chức năng backend, AI và vận hành cho 5 thành viên, không gồm frontend.
- [TV3-HUONG-DAN-LAM-VIEC-VOI-AI-VA-GIT.md](01-tong-quan/TV3-HUONG-DAN-LAM-VIEC-VOI-AI-VA-GIT.md): Các bước W01–W04, prompt cho AI và kiểm soát commit/push riêng cho TV3.
- [SDLC-VS-ADLC.md](01-tong-quan/SDLC-VS-ADLC.md): So sánh vòng đời SDLC truyền thống và ADLC của AI Agent; mô hình phối hợp "Con người định hình, Agent thực thi".
- [VIBE_CODING_SOP.md](01-tong-quan/VIBE_CODING_SOP.md): Quy trình chuẩn 10 bước Vibe Coding (Human Architect, AI Accelerator).
- [GLOSSARY.md](01-tong-quan/GLOSSARY.md): Thuật ngữ chuẩn trong toàn bộ domain Commerce & Kanban.

### 📁 `02-ky-thuat/` — Kiến Trúc & Kỹ Thuật
- [SYSTEM_ARCHITECTURE.md](02-ky-thuat/SYSTEM_ARCHITECTURE.md): Kiến trúc tổng thể 7 lớp của hệ thống AI-Native Commerce.
- [BACKEND-API-V1.md](02-ky-thuat/BACKEND-API-V1.md): Đặc tả hợp đồng API v1 (OpenAPI) giữa Frontend và Backend.
- [BACKEND-AUTH.md](02-ky-thuat/BACKEND-AUTH.md): Kiến trúc xác thực JWT, RBAC, OAuth và Cookie an toàn.
- [mcp-reference-architecture.md](02-ky-thuat/mcp-reference-architecture.md): Kiến trúc Model Context Protocol (MCP) Server.

### 📁 `03-san-pham/` — Sản Phẩm & Nghiệp Vụ
- [AI-NATIVE-COMMERCE.md](03-san-pham/AI-NATIVE-COMMERCE.md): Đặc tả yêu cầu phần mềm (SRS) sàn thương mại điện tử AI-Native.

### 📁 `04-van-hanh/` — Vận Hành & Hạ Tầng
- *(Tài liệu Docker Compose, CI/CD pipeline, Runbook phục hồi thảm họa và giám sát hệ thống)*.

### 📁 `05-mau/` — Biểu Mẫu & Checklist Tái Sử Dụng
- [AI-COMMERCE-EXECUTION-CHECKLIST.md](05-mau/AI-COMMERCE-EXECUTION-CHECKLIST.md): Tiêu chí nghiệm thu cấp chức năng (`C00`–`C18`, `F01`–`F08`).

### 📁 `06-design/` — Thiết Kế UI/UX & Động Lực Học
- [sdlc-vs-adlc.html](06-design/sdlc-vs-adlc.html): Trang tương tác trực quan sơ đồ SDLC, ADLC và mô hình phối hợp Người - AI Agent.
- [FRONTEND_DESIGN_SYSTEM.md](06-design/FRONTEND_DESIGN_SYSTEM.md): Hệ thống Design Tokens, Atomic Components & Feedback States.
- [APPLE_DESIGN_SYSTEM.md](06-design/APPLE_DESIGN_SYSTEM.md): Tiêu chuẩn Apple Design, vật lý lò xo (spring physics) và tương tác trực tiếp 1:1.
- [VIETNAMESE_UX_GUIDELINES.md](06-design/VIETNAMESE_UX_GUIDELINES.md): Quy luật content tiếng Việt trong trải nghiệm mua sắm đàm thoại.
- [Lab1_NET108_UseCases_StarUML.mdj](06-design/Lab1_NET108_UseCases_StarUML.mdj): File sơ đồ Use Case StarUML của hệ thống.

### 📁 `labs/` — Học Tập & Đồ Án NET108
- [LAB-REPORT-STANDARD.md](labs/LAB-REPORT-STANDARD.md): Quy chuẩn trình bày báo cáo Lab 1 – Lab 8 theo mẫu FPT Polytechnic.

---

## 3. Quy Tắc Cập Nhật Tài Liệu
1. Khi thêm tài liệu `.md` mới, luôn phân loại vào đúng 1 trong các nhóm từ `01-` đến `06-` (hoặc `99-` nếu là nháp).
2. Sau khi tạo file mới, bắt buộc cập nhật liên kết và mô tả ngắn 1 dòng vào danh mục trên.
