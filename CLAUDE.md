# CLAUDE.md - Hướng Dẫn Dành Riêng Cho Claude Code & Claude Agent

Tài liệu này cung cấp hướng dẫn vận hành, lệnh thực thi và quy ước phong cách mã nguồn cho Claude trong repository **Net108Khai**.

---

## 1. Vị Trí Kỹ Năng (Claude Skills)

Toàn bộ các kỹ năng mở rộng đã được cấu hình tại:
- `.claude/skills/` (và mirror tại `.agent/skills/`, `.codex/skills/`)

Các kỹ năng nòng cốt khi làm việc:
- `/vibe-coding`: Quy trình 10 bước chuẩn hóa quá trình phát triển.
- `/impeccable`: Đạo diễn thiết kế, craft floor, playbooks thẩm mỹ (`typeset`, `colorize`, `polish`, `harden`).
- `/taste-skill`: Tiêu chuẩn chống AI-slop, section cadence 1 màn hình, micro-animations, không màu tím generic.
- `/ui-ux-pro-max`: Hệ thống design tokens, 4 trạng thái UI (loading/empty/error/success), form UX chuẩn.
- `/apple-design`: Thiết kế giao diện phản hồi tức thì, chuyển động vật lý lò xo (spring physics) và tương tác kéo thả.
- `/astryx`: Hệ thống thiết kế chuẩn hóa của Meta dành cho AI Agents (`@astryxdesign/cli`), quy trình template-first và semantic tokens.
- `/animate-ui`: Thư viện chuyển động mượt mà cho React primitives và icons.
- `/quy-luat-content-viet`: Viết nội dung, chatbot prompts, UX copy và thông báo tiếng Việt tự nhiên, trực diện.
- `/codebase-design`: Thiết kế deep modules, giảm độ phức tạp interface, phân tách seam rõ ràng.
- `/domain-modeling`: Thiết kế các model Kanban (Board, List, Card, Member, Activity).
- `/tdd`: Viết test trước, kiểm thử hành vi tại interface.
- `/diagnosing-bugs`: Debug lỗi 4 pha dựa trên nguyên nhân gốc rễ.
- `/code-review`: Rà soát chất lượng code, bảo mật và hiệu năng.

---

## 2. Quy Ước Lệnh & Công Nghệ (Commands & Tooling)

Dự án là một monorepo gồm nhiều dịch vụ độc lập:

### Frontend (`Trello-Clone-Frontend` & `Chatbot-Frontend`)
```bash
# Cài đặt thư viện
npm install  # hoặc pnpm install

# Khởi chạy dev server
npm run dev

# Kiểm tra kiểu & linter
npm run type-check
npm run lint

# Chạy kiểm thử đơn vị
npm test
```

### Backend (`Trello-Clone-Backend`)
```bash
# Chạy migration database
npm run migration:run  # hoặc dotnet ef database update

# Khởi chạy backend API
npm run start:dev      # hoặc dotnet run

# Chạy test tích hợp và unit test
npm run test:e2e
```

### AI RAG Service (`Trello-Clone-AI-RAG`)
```bash
# Kích hoạt virtualenv & cài dependencies
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Chạy dev server
uvicorn app.main:app --reload --port 8000

# Chạy test
pytest
```

### MCP Server (`Trello-Clone-MCP`)
```bash
# Build & chạy MCP server
npm run build
npm start
```

### Hạ Tầng & Docker (`Trello-Clone-Infra`)
```bash
# Khởi động toàn bộ cụm dịch vụ (PostgreSQL, Redis, Qdrant/pgvector, Backend, Frontend)
docker compose -f docker-compose.yml up -d
```

---

## 3. Tiêu Chuẩn Phong Cách Mã Nguồn (Code Style Standards)

1. **Kiến Trúc Deep Module**:
   - Ưu tiên interface nhỏ gọn nhưng giải quyết logic hoàn chỉnh bên trong module.
   - Nhận dependencies từ bên ngoài (DI/IoC), không tự ý `new` service phụ thuộc để dễ dàng viết unit test.
   - Tránh side effect ngầm; trả về kết quả rõ ràng qua Value Objects hoặc Result Types.

2. **Giao Diện & Kéo Thả (Apple Motion Rules)**:
   - Thao tác kéo thả Kanban Card phải cập nhật vị trí 1:1 theo con trỏ ngay khi chạm (`pointerdown`).
   - Mọi hoạt ảnh mở thẻ, chuyển danh sách phải hỗ trợ interruptible (có thể bị chặn hoặc đảo chiều bất cứ lúc nào mà không bị giật lag).
   - Tham số lò xo mặc định cho UI: `damping: 1.0`, `response: 0.35s`.

3. **Ngôn Ngữ & Thông Điệp (Vietnamese UX Copy)**:
   - Viết ngắn gọn, trực diện, tôn trọng người dùng.
   - Không dùng văn phong máy móc, sáo rỗng.
   - Các thông báo lỗi phải chỉ rõ người dùng cần làm gì tiếp theo thay vì chỉ in mã lỗi thô.

---

## 4. Quy Trình Làm Việc An Toàn (Safety & Git Discipline)

- **Đọc trước khi sửa**: Luôn đọc file nguồn và các file liên quan trước khi áp dụng thay đổi.
- **Không tự ý cài packages lạ**: Khi cần bổ sung thư viện, giải thích lý do và xác nhận tính cần thiết.
- **Bảo mật tuyệt đối**: Không bao giờ commit file bí mật (`.env`, private keys trong `certs/`). Đã có cấu hình an toàn tại `.gitignore`.
- **Commit theo Atomic Task**: Mỗi khi hoàn thành một chức năng hoặc sửa một lỗi đã qua kiểm thử, commit với thông điệp rõ ràng theo chuẩn Conventional Commits (ví dụ: `feat(card): add drag-and-drop spring animation`).
- **Quy tắc Clean Workspace & Thư mục gốc**: 
  - Thư mục gốc chỉ chứa đúng 2 file hướng dẫn AI: `AGENTS.md` và `CLAUDE.md` (cùng các file config bắt buộc của công cụ).
  - Tuân thủ tuyệt đối 2 rules: `.claude/rules/docs-placement.md` (mọi file `.md` vào 8 nhóm chuẩn trong `docs/`) và `.claude/rules/asset-placement.md` (mọi file phi-markdown vào đúng thư mục tài nguyên, không thả rác ra root).
