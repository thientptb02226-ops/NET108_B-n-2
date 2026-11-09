# AGENTS.md - Quy Chuẩn & Hướng Dẫn Phát Triển Cho AI Agents (Net108Khai)

Chào mừng AI Agent (Claude Code, Codex, Antigravity, Gemini). Đây là tài liệu quy chuẩn tối cao định hình phương pháp làm việc, kiến trúc và chất lượng phần mềm trong dự án **Net108Khai (Trello Clone Ecosystem)**.

**Định tuyến phạm vi:** Khi làm việc về **AI native Commerce**, đọc và thực hiện [checklist Commerce](docs/AI-COMMERCE-EXECUTION-CHECKLIST.md) cùng [đặc tả Commerce](docs/AI-NATIVE-COMMERCE.md). Các mục Trello Clone bên dưới áp dụng cho yêu cầu Trello Clone; không coi chúng là bằng chứng về hệ thống Commerce đang chạy. Khi yêu cầu liên quan cả hai, ghi rõ phần nào thuộc từng phạm vi trước khi sửa.

**Agent mới nhận việc Commerce hoặc Lab 1:** Đọc [bản bàn giao cho Codex và Antigravity](docs/AI-COMMERCE-AGENT-HANDOFF.md) để tìm nguồn trạng thái, phần sở hữu và bước tiếp theo; kiểm tra lại bằng bảng tick và code hiện tại.

**Phân công Commerce:** Antigravity sở hữu frontend (`F01–F08`); Codex sở hữu backend, AI service và Docker (`C00`, `C02–C15`, `C17`). Quyết định nghiệp vụ `C01` thuộc người phụ trách dự án; tích hợp và nghiệm thu `C16`, `C18` là việc chung. Dùng hợp đồng API trong checklist để bàn giao, không tự sửa phần sở hữu của agent còn lại.

**Theo dõi tiến độ Commerce:** Cập nhật ô tick theo mã việc nhỏ (`Cxx.y`, `Fxx.y`) trong [bảng công việc AI](docs/AI-COMMERCE-TASK-BOARD.md) khi có bằng chứng nghiệm thu. Đây là nơi duy nhất ghi trạng thái hoàn thành; mã cha chỉ xong khi mọi mã con và điều kiện cấp chức năng đều đạt.

**Waterfall cho Commerce:** Trước khi nhận task Commerce mới hoặc chuyển sang tích hợp/kiểm thử/phát hành, đọc [cổng Waterfall](docs/AI-COMMERCE-WATERFALL.md). Đi theo `W01` yêu cầu → `W02` thiết kế → `W03` triển khai → `W04` kiểm thử hệ thống → `W05` nghiệm thu → `W06` triển khai vận hành. Công việc đã có là baseline cần đối chiếu, không tự coi là cổng đã được duyệt. Task nhỏ và review vẫn thực hiện bên trong giai đoạn phù hợp.

Mọi Agent hoạt động trong repository này **bắt buộc tuân thủ** các nguyên tắc dưới đây.

---

## 1. Triết Lý Cốt Lõi: Vibe Coding Chuẩn (Human Architect, AI Accelerator)

> **"Con người làm chủ kiến trúc, AI là máy gia tốc. Lực cản kỹ thuật được kiểm soát bằng Specification và Git."**

Tuyệt đối không áp dụng tư duy "one-prompt làm cả app". Mọi tính năng, sửa lỗi và nâng cấp phải trải qua **Quy trình 10 bước**:

```
[1. Scope & Requirement] ──► [2. System Design] ──► [3. Context & Specs] ──► [4. Atomic Tasks]
                                                                                     │
[8. Root-Cause Debug] ◄── [7. Atomic Step Code] ◄── [6. Approve Plan] ◄── [5. Read & Plan]
         │
         ▼
[9. Code Review & Sec] ──► [10. Scoped Refactor & Stable Git Commit]
```

1. **Hiểu rõ yêu cầu trước khi gõ phím**: Đọc kỹ spec, context tại `docs/` và codebase liên quan.
2. **Kế hoạch trước - Code sau**: Luôn đề xuất plan (file cần sửa, các bước thực hiện, impact analysis), đợi duyệt hoặc xác nhận trước khi sửa file lớn.
3. **Atomic Tasks & Atomic Commits**: Chia nhỏ bài toán thành các task độc lập. 1 task = 1 kết quả cụ thể, testable = 1 commit sạch.
4. **Không đoán mò**: Khi gặp lỗi, truy nguyên nhân gốc rễ (root-cause), yêu cầu log/stack trace, kiểm tra edge cases.
5. **Git Discipline**: Không xóa đè lịch sử, commit thường xuyên tại các điểm mốc ổn định để làm điểm tựa rollback.

---

## 2. Bản Đồ Hệ Thống Net108Khai (Monorepo Ecosystem)

| Module | Vai Trò & Trách Nhiệm | Tech Stack Mục Tiêu |
|---|---|---|
| **`src/`** | Core API Commerce, Product Catalog, Carts, Orders, Auth, AI Provider | C# / .NET 10 / PostgreSQL |
| **`Chatbot-Frontend/`** | Web app chính Commerce & Trợ lý mua sắm AI (React, Tailwind, Motion) | React 19 / TypeScript / Vite / TailwindCSS |
| **`trello-clone/Backend`** | (Dự phòng) Core API Kanban, Boards/Lists/Cards, Realtime WebSockets | Node.js / NestJS / ASP.NET Core / PostgreSQL |
| **`trello-clone/Frontend`** | (Dự phòng) Web app Kanban, trải nghiệm kéo thả trực quan | React / Next.js / TailwindCSS / Motion |
| **`trello-clone/AI-RAG`** | Dịch vụ AI & RAG: Vector search, embedding, tóm tắt thẻ, hỏi đáp dự án | Python (FastAPI, LangChain/LlamaIndex, Qdrant) |
| **`trello-clone/MCP`** | Model Context Protocol Server cung cấp Tools, Resources, Prompts | TypeScript / Python MCP SDK |
| **`trello-clone/Desktop`** | Ứng dụng Desktop đa nền tảng | Electron / Tauri / .NET MAUI |
| **`trello-clone/Mobile`** | Ứng dụng di động iOS/Android | Flutter / React Native |
| **`trello-clone/Infra`** | Hạ tầng mở rộng, Docker Compose, CI/CD, Nginx reverse proxy | Docker, K8s, Terraform, GitHub Actions |
| **`certs/`** | Chứng chỉ bảo mật nội bộ và mTLS (được mã hóa/ignore bởi git) | OpenSSL, Let's Encrypt |
| **`docs/`** | Toàn bộ tài liệu đặc tả kiến trúc, spec, checklist và bài tập lab (`docs/labs`) | Markdown / Office Docs |

---

## 3. Bộ Kỹ Năng Agent Tích Hợp (Installed Skills Matrix)

Các kỹ năng đã được tích hợp sẵn tại `.agent/skills/`, `.claude/skills/` và `.codex/skills/`:

### A. Kỹ Thuật Lập Trình (Engineering Skills)
- **`codebase-design`**: Thiết kế **Deep Modules** (Interface nhỏ gọn, Implementation sâu, che giấu độ phức tạp cao, tối đa leverage cho caller).
- **`domain-modeling`**: Thiết kế thực thể nghiệp vụ (Board, List, Card, Member, Activity) chuẩn xác, tránh data mutation bừa bãi.
- **`implement-spec` & `to-spec`**: Chuyển đổi requirements thành spec chi tiết và task graph có thứ tự thực thi rõ ràng.
- **`tdd` (Test-Driven Development)**: Viết test cho interface trước khi triển khai, kiểm thử biên (edge cases).
- **`diagnosing-bugs`**: Phân tích lỗi 4 pha (Tái hiện -> Cô lập -> Xác định nguyên nhân gốc -> Vá & hồi quy).
- **`code-review`**: Rà soát bảo mật (OWASP), hiệu năng, SQL injection, memory leak trước khi hoàn thành task.

### B. Thiết Kế Giao Diện, Động Lực Học & Thẩm Mỹ (Frontend Design Trinity & Apple Foundation)
Áp dụng cho toàn bộ phần Frontend (`Chatbot-Frontend`, `Trello-Clone-Frontend`, `Desktop`, `Mobile`):

1. **`impeccable` (Craft Floor & Out-of-Distribution Quality)**:
   - Thẩm mỹ đạt chuẩn đạo diễn thiết kế (Design Director). Tuyệt đối không dùng template generic hay layout cẩu thả.
   - Tuân thủ playbooks: `typeset` (optical sizing, spacing), `colorize` (bảng màu hài hòa, có ý đồ), `polish` (căn chỉnh thẳng hàng, nhịp điệu thị giác), `harden` (bền bỉ trước dữ liệu thực tế, viewport hẹp, phím điều hướng).
   - Kiểm tra hiển thị tại 5 mốc viewport: 1440px (Desktop), 1024px (Tablet ngang), 768px (Tablet dọc), 390px (Mobile chuẩn), 320px (Mobile nhỏ).

2. **`taste-skill` (Anti-Slop Standard & Bố Cục Chuyên Nghiệp)**:
   - Triệt tiêu hoàn toàn "AI slop": Cấm dùng gradient tím/lavender sáo rỗng thường thấy ở AI; cấm thẻ mờ mịt thiếu tương phản; cấm text mờ nhạt khó đọc.
   - Section Cadence: 1 section / 1 màn hình ở 1440x900 trên landing page; hero entrance duy nhất (`data-enter`), lề trái phải bằng nhau (equal edges).
   - Micro-animations có kiểm soát: Card hover nhấc nhẹ 2px (`translateY(-2px)`), button step hover và press scale (`scale(0.98)`).
   - Tôn trọng dữ liệu thực tế: Dùng ảnh sản phẩm thực tế, tiền tệ định dạng VNĐ (199.000 ₫), tồn kho thực, cấm bịa đặt thông tin.
   - Tiêu chuẩn thao tác ngón tay: Nút bấm và vùng chạm trên mobile tối thiểu 44px (`min-h-[44px] min-w-[44px]`).

3. **`ui-ux-pro-max` (Design Tokens & State Machine)**:
   - Hệ thống token chuẩn xác (màu Slate/Zinc nền nã + Emerald/Amber tin cậy cho thương mại điện tử).
   - Bắt buộc xử lý trọn vẹn 4 trạng thái cho mọi component: `loading` (skeleton/spinner tinh tế), `empty` (hướng dẫn cụ thể), `error` (thông điệp tiếng Việt có cách giải quyết), `success` (dữ liệu hiển thị rõ ràng).
   - Form UX: Inline validation, error summary, nhãn rõ ràng (không thay label bằng placeholder), quản lý focus bàn phím trực quan (`ring-2 ring-primary ring-offset-2`).

4. **`apple-design`**:
   - Thao tác trực tiếp 1:1, bám con trỏ (`grabOffset`), phản hồi ngay tại `pointerdown`.
   - Chuyển động lò xo vật lý (`damping: 1.0`, `response: 0.35s`), hỗ trợ ngắt quãng và đổi hướng (interruptible).

### C. Ngôn Ngữ & Trải Nghiệm Tiếng Việt (Quy Luật Content Việt)
- Áp dụng kỹ năng **`quy-luat-content-viet`** cho `Chatbot-Frontend`, UI Microcopy, Error Messages & Notifications:
  - **Nói chuyện với 1 người**: Dùng từ ngữ tự nhiên, gần gũi ("bạn - mình" hoặc danh xưng ngữ cảnh), tuyệt đối không mở đầu sáo rỗng ("Xin chào tất cả các bạn", "Cả nhà ơi").
  - **3 giây đầu là lời hứa**: Tin nhắn chatbot và thông báo phải nêu ngay giá trị cốt lõi, trả lời thẳng trọng tâm câu hỏi.
  - **Cắt bỏ rườm rà**: Giữ thuật ngữ kỹ thuật cần thiết, diễn đạt sáng rõ, sử dụng ví dụ gần gũi với người dùng Việt Nam (Zalo, MoMo, giờ VN, tiền VNĐ).

---

## 4. Quy Chuẩn Làm Việc Khi Nhận Yêu Cầu

1. **Khảo sát**: Dùng lệnh đọc file (`read_file`, `grep`) khảo sát thư mục liên quan trước khi sửa bất kỳ code nào.
2. **Đề xuất**: Tóm tắt ngắn gọn những gì sẽ làm. Nếu có nhiều giải pháp, nêu ưu/nhược điểm (theo nguyên tắc `codebase-design`).
3. **Thực thi an toàn**:
   - Tuân thủ clean code, type safety (TypeScript strict mode, C# nullable enable, Python type hints).
   - Bảo toàn comment hiện có không liên quan.
   - Luôn kiểm tra build/test sau khi sửa code.
4. **Báo cáo**: Nêu rõ file đã thay đổi, kết quả kiểm thử, và hướng dẫn bước tiếp theo cho lập trình viên.

---

## 5. Quy Chuẩn Tổ Chức File Mới (Clean Workspace Policy)

> **"Nguyên tắc giữ sạch thư mục gốc (Root Hygiene): Không để file phát sinh tự do ngoài root."**

- **Quy tắc**: Khi xuất hiện hoặc tạo bất kỳ file mới nào (tài liệu nháp, file dữ liệu, script phụ trợ, báo cáo, ghi chú...) mà **không thuộc về bất kỳ cây thư mục module có sẵn nào**, **bắt buộc tạo một thư mục riêng (ví dụ: `misc/` hoặc `others/`)** và đưa các file đó vào bên trong.
- **Mục đích**: Bảo toàn cây thư mục gốc luôn gọn gàng, có trật tự, chỉ chứa các thư mục module cốt lõi và các file cấu hình hệ thống chuẩn (`.gitignore`, `README.md`, `AGENTS.md`, `CLAUDE.md`...).
