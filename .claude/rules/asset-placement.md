# Rules: Asset Placement — File KHÔNG phải .md cũng phải nằm đúng chỗ, gốc dự án luôn sạch

> **Level: MANDATORY (Bắt buộc tuyệt đối)**  
> **Áp dụng cho:** Tất cả AI Agents (Claude Code, Codex, Antigravity, Gemini).

---

## 1. Nguyên Tắc 1 Câu
Mọi file mới sinh ra **không phải tài liệu `.md`** (như ảnh, script, fixture json, zip, file Word, Excel, sơ đồ vector...) **tuyệt đối không được thả bừa bãi ở thư mục gốc**, mà phải nằm trong đúng module sở hữu hoặc các thư mục tài nguyên chuyên biệt.

---

## 2. Cấu Trúc Đích Mặc Định

```
<gốc dự án>/
├── docs/                # Chỉ chứa tài liệu Markdown (.md) và sơ đồ đọc được của hệ thống
├── assets/              # Ảnh, media, icon dùng lâu dài trong dự án (.png, .svg, .webp, .mp4)
├── scripts/             # Script tiện ích, tooling hỗ trợ, migrate thủ công (.sh, .py, .ps1, .js)
├── certs/               # Chứng chỉ bảo mật nội bộ, mTLS, SSL key (luôn được .gitignore)
├── data/                # Dữ liệu mẫu lớn, fixture JSON/CSV không phải cấu hình hệ thống
└── File Lab và Dự Án/   # Tài liệu gốc, file đề lab, file Word/PDF nộp bài của sinh viên
```

---

## 3. Quyết Định Phân Loại File Không Phải `.md`

| Loại file | Thư mục đích |
|---|---|
| Ảnh minh họa giao diện, diagram export | `assets/images/` hoặc `docs/06-design/assets/` |
| File bài làm Word (.docx), PDF nộp bài | `File Lab và Dự Án cuối/Lab 1 - 8/` |
| Script PowerShell, Python tự động hóa | `scripts/` |
| Sơ đồ StarUML (.mdj) | `docs/06-design/` hoặc thư mục lab tương ứng |
| Chứng chỉ test, SSL (.crt, .key, .pfx) | `certs/` |

---

## 4. Checklist Trước Khi Ghi File
- [ ] File này có phải tài liệu `.md` không? Nếu có ➔ Chuyển qua luật `docs-placement.md`.
- [ ] File này có thuộc về module code cụ thể (`Chatbot-Frontend/`, `src/`) không? Nếu có ➔ Lưu trong thư mục của module đó.
- [ ] Nếu là asset dùng chung hoặc script tiện ích ➔ Đã đặt vào `assets/`, `scripts/` hay `data/` chưa?
- [ ] Tuyệt đối không sinh file tự do ở thư mục gốc!
