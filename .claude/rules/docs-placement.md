# Rules: Docs Placement — Mọi file .md phải nằm đúng chỗ trong docs/

> **Level: MANDATORY (Bắt buộc tuyệt đối)**  
> **Áp dụng cho:** Tất cả AI Agents (Claude Code, Codex, Antigravity, Gemini).

---

## 1. Nguyên Tắc Cốt Lõi
Khi AI tạo bất kỳ file `.md` nào cho dự án (report, plan, spec, guide, note, analysis, design doc...) ➔ **PHẢI** đặt trong thư mục `docs/` ở gốc dự án, vào đúng nhóm con tương ứng.

> [!CAUTION]
> **Cấm vứt file `.md` rải rác khắp nơi** (cạnh code, ở thư mục gốc, hoặc trong các thư mục ngẫu nhiên). Thư mục gốc chỉ chứa duy nhất 2 file hướng dẫn AI: `AGENTS.md` và `CLAUDE.md`.

---

## 2. Cấu Trúc Chuẩn Thư Mục `docs/` Ở Gốc Dự Án

```
docs/
├── README.md               # Index gốc: liệt kê mọi nhóm + mục lục tài liệu (luôn cập nhật)
├── 01-tong-quan/           # Overview: mục tiêu, phạm vi, roadmap, handoff, SOP
├── 02-ky-thuat/            # Technical: API spec, DB schema, kiến trúc, tích hợp, security
├── 03-san-pham/            # Product: PRD, đặc tả nghiệp vụ, use case, story
├── 04-van-hanh/            # Operations: deploy, runbook, incident, docker, monitoring
├── 05-mau/                 # Mẫu & Templates: checklist, form mẫu, rubric nghiệm thu
├── 06-design/              # Design: UI/UX, wireframe, design system, flow, sơ đồ UML
└── 99-ghi-chu/             # Notes: nháp, ghi chú nhanh, meeting, lặt vặt chưa phân loại
```

*Ghi chú:*
- Tiền tố số (`01-`, `02-`, ..., `99-`) giúp sắp xếp thư mục ổn định và trực quan trên mọi IDE/Explorer.
- `99-ghi-chu/` luôn đứng cuối cùng và dùng làm nơi lưu tạm trước khi tài liệu được tinh chỉnh sang nhóm chính thức.

---

## 3. Bảng Quyết Định Phân Loại Tài Liệu

| Nội dung file | Nhóm thư mục đích | Ví dụ |
|---|---|---|
| Bàn giao, định hướng, lộ trình, quy chuẩn Vibe Coding | `docs/01-tong-quan/` | `AI-COMMERCE-WATERFALL.md`, `VIBE_CODING_SOP.md` |
| OpenAPI, Auth, Cơ sở dữ liệu, Kiến trúc hệ thống | `docs/02-ky-thuat/` | `BACKEND-API-V1.md`, `SYSTEM_ARCHITECTURE.md` |
| Đặc tả sàn thương mại, kịch bản mua sắm, Use case | `docs/03-san-pham/` | `AI-NATIVE-COMMERCE.md`, `USE_CASES.md` |
| Hướng dẫn Docker, CI/CD, Backup, Disaster Recovery | `docs/04-van-hanh/` | `DOCKER_DEPLOYMENT.md`, `BACKUP_RUNBOOK.md` |
| Checklist kiểm thử, ma trận nghiệm thu, bảng công việc | `docs/05-mau/` | `AI-COMMERCE-TASK-BOARD.md`, `CHECKLIST.md` |
| Design Tokens, Apple Design, Wireframe, Sơ đồ UX | `docs/06-design/` | `FRONTEND_DESIGN_SYSTEM.md`, `APPLE_DESIGN.md` |
| Ghi chép cá nhân, biên bản họp, ý tưởng nháp | `docs/99-ghi-chu/` | `MEETING_NOTES.md`, `SCRATCH_IDEAS.md` |

---

## 4. Ngoại Lệ Duy Nhất (Không đưa vào `docs/`)
Chỉ có các file sau được phép nằm ở thư mục gốc:
- `AGENTS.md` (Quy chuẩn hệ thống cho toàn bộ AI Agents)
- `CLAUDE.md` (Quy chuẩn cho Claude Code)
- File cấu hình công cụ bắt buộc: `.gitignore`, `.dockerignore`, `.env.example`, `compose.yaml`, `Dockerfile`, file solution `.sln`/`.slnx`.

---

## 5. Quy Trình Khi AI Tạo File `.md` Mới
1. **Xác định nhóm**: Tra cứu bảng quyết định ở Mục 3 để chọn đúng nhóm con trong `docs/`.
2. **Đặt tên chuẩn**: Dùng chữ hoa gạch nối (hoặc kebab-case), rõ ràng, có ý nghĩa nghiệp vụ (ví dụ: `PAYMENT-GATEWAY-SPEC.md`).
3. **Cập nhật Index**: Mở `docs/README.md` và thêm một dòng mô tả ngắn về file vừa tạo.
