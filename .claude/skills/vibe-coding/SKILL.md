---
name: vibe-coding
description: Quy trình Vibe Coding chuẩn 10 bước cho phát triển phần mềm bằng AI Agent (Claude Code, Codex, Antigravity). Sử dụng khi lập kế hoạch, triển khai tính năng theo atomic tasks, quản lý context/spec và kiểm soát chất lượng bằng Git.
---

# Quy trÃ¬nh Vibe Coding chuáº©n (tÃ³m táº¯t video cho AI)

## 0. Metadata

| TrÆ°á»ng | GiÃ¡ trá»‹ |
|---|---|
| Nguá»“n | TikTok `@aidailyvietnam`, video ID `7674461635787967762` |
| Äá»‹nh dáº¡ng | Video dá»c 576x1024, dÃ i khoáº£ng 9 phÃºt 52 giÃ¢y |
| NgÃ´n ngá»¯ | Tiáº¿ng Viá»‡t (phá»¥ Ä‘á» lá»›n dÆ°á»›i mÃ n hÃ¬nh + slide minh hoáº¡) |
| Chá»§ Ä‘á» | CÃ¡ch dÃ¹ng AI Agent (Claude Code, Codex, Cursor) Ä‘á»ƒ xÃ¢y pháº§n má»m bÃ i báº£n, khÃ´ng chá»‰ "má»™t prompt lÃ  xong" |
| Cáº¥u trÃºc video | 3 pháº§n (Act): Ä‘á»‹nh nghÄ©a & hiá»ƒu láº§m, quy trÃ¬nh 10 bÆ°á»›c, báº£n cháº¥t & káº¿t luáº­n |

**LÆ°u Ã½ vá» Ä‘á»™ tin cáº­y:** Báº£n tÃ³m táº¯t nÃ y Ä‘Æ°á»£c dá»±ng tá»« cÃ¡c khung hÃ¬nh láº¥y máº«u má»—i 10 giÃ¢y (slide + phá»¥ Ä‘á»), **khÃ´ng cÃ³ báº£n chÃ©p lá»i Ã¢m thanh**. Pháº§n giá»ng nÃ³i cÃ³ thá»ƒ cÃ³ chi tiáº¿t khÃ´ng xuáº¥t hiá»‡n trÃªn slide. CÃ¡c con sá»‘ trong slide (99.8%, 10x, 5x, biá»ƒu Ä‘á»“ ná»£ ká»¹ thuáº­t) trÃ´ng nhÆ° hÃ¬nh minh hoáº¡, khÃ´ng pháº£i sá»‘ liá»‡u Ä‘o Ä‘áº¡c.

---

## 1. ThÃ´ng Ä‘iá»‡p cá»‘t lÃµi

> Vibe Coding hiá»‡u quáº£ khÃ´ng pháº£i lÃ  nÃ©m má»™t prompt lá»›n cho AI rá»“i chá». Con ngÆ°á»i lÃ m chá»§ kiáº¿n trÃºc, pháº¡m vi vÃ  kiá»ƒm soÃ¡t cháº¥t lÆ°á»£ng; AI lÃ  mÃ¡y gia tá»‘c.

Hai "lÃ¡ cháº¯n an toÃ n" video nháº¥n máº¡nh: **Specification (tÃ i liá»‡u context)** vÃ  **Git**.

---

## 2. Pháº§n 1: Vibe Coding lÃ  gÃ¬, vÃ  hiá»ƒu láº§m phá»• biáº¿n

- **Äá»‹nh nghÄ©a:** xÃ¢y pháº§n má»m báº±ng ngÃ´n ngá»¯ tá»± nhiÃªn. Con ngÆ°á»i nháº­p prompt, AI Agent (Claude Code, Codex, Cursor...) phÃ¢n tÃ­ch vÃ  thá»±c thi, káº¿t quáº£ lÃ  á»©ng dá»¥ng hoÃ n thiá»‡n.
- **Hiá»ƒu láº§m:** Vibe Coding *khÃ´ng pháº£i* lÃ  báº£o AI "lÃ m cáº£ dá»± Ã¡n cho tÃ´i chá»‰ vá»›i 1 cÃ¢u lá»‡nh". Giao toÃ n bá»™ trÃ¡ch nhiá»‡m cho AI lÃ  tá»± gÃ¢y tai háº¡i cho dá»± Ã¡n lá»›n.
- **Giá»›i háº¡n cá»§a "one-prompt":**
  - Dá»± Ã¡n nhá»/thá»­ nghiá»‡m (vÃ­ dá»¥ app To-Do list báº±ng HTML/CSS/JS, dÆ°á»›i khoáº£ng 100 dÃ²ng): hoáº¡t Ä‘á»™ng tá»‘t.
  - Dá»± Ã¡n thá»±c táº¿ (há»‡ thá»‘ng quáº£n lÃ½ cÃ´ng viá»‡c cÃ³ Auth, Database, API, UI): code nhanh máº¥t kiá»ƒm soÃ¡t, AI tá»± Ä‘oÃ¡n cáº¥u trÃºc, lá»—i dÃ¢y chuyá»n, khÃ³ báº£o trÃ¬.
  - Káº¿t luáº­n: one-prompt khÃ´ng Ã¡p dá»¥ng Ä‘Æ°á»£c cho app lá»›n.

---

## 3. Pháº§n 2: Quy trÃ¬nh 10 bÆ°á»›c

VÃ­ dá»¥ xuyÃªn suá»‘t: **á»©ng dá»¥ng quáº£n lÃ½ cÃ´ng viá»‡c cho sinh viÃªn** (Student Task App).

### BÆ°á»›c 1. XÃ¡c Ä‘á»‹nh bÃ i toÃ¡n & pháº¡m vi
- Tráº£ lá»i 3 cÃ¢u há»i trÆ°á»›c khi AI viáº¿t code: (1) NgÆ°á»i dÃ¹ng lÃ  ai? (2) á»¨ng dá»¥ng giáº£i quyáº¿t váº¥n Ä‘á» gÃ¬? (3) Chá»©c nÄƒng chÃ­nh lÃ  gÃ¬?
- VÃ­ dá»¥: sinh viÃªn CNTT, trá»… deadline / quÃªn lá»‹ch & quÃ¡ táº£i bÃ i táº­p, chá»©c nÄƒng gá»“m táº¡o task, Ä‘áº·t deadline, phÃ¢n loáº¡i, hoÃ n thÃ nh.
- Pháº¡m vi máº«u: phÃ¢n loáº¡i cÃ´ng viá»‡c, Ä‘Ã¡nh dáº¥u hoÃ n thÃ nh, nháº­n thÃ´ng bÃ¡o, quáº£n lÃ½ deadline.
- **TrÃ¡nh** prompt chung chung kiá»ƒu "HÃ£y táº¡o cho tÃ´i má»™t á»©ng dá»¥ng quáº£n lÃ½ cÃ´ng viá»‡c".

### BÆ°á»›c 2. PhÃ¢n tÃ­ch & thiáº¿t káº¿ há»‡ thá»‘ng
- Chia 3 táº§ng: Frontend (giao diá»‡n), Backend (nghiá»‡p vá»¥), Database (lÆ°u trá»¯).
- XÃ¡c Ä‘á»‹nh phÃ¢n quyá»n (vÃ­ dá»¥ Quáº£n trá»‹ viÃªn, Quáº£n lÃ½ nhÃ³m) vÃ  luá»“ng giao tiáº¿p giá»¯a cÃ¡c module.
- Chia module chá»©c nÄƒng: Authentication, User Management, Task Management...
- Chá»n tech stack trÆ°á»›c khi code. VÃ­ dá»¥ trong video: React (frontend), Node.js (backend), PostgreSQL (database).
- Má»¥c Ä‘Ã­ch: **AI khÃ´ng pháº£i tá»± Ä‘oÃ¡n mÃ²** vá» kiáº¿n trÃºc.

### BÆ°á»›c 3. Táº¡o tÃ i liá»‡u specs & context cho AI
- Viáº¿t cÃ¡c file nhÆ° `CONTEXT.md`, `PROJECT_RULES.md`, `SCHEMA...` gá»“m: tá»•ng quan dá»± Ã¡n, kiáº¿n trÃºc & cÃ´ng nghá»‡, quy Ä‘á»‹nh cho AI Agent (pháº¡m vi lÃ m gÃ¬, cáº¥m gÃ¬).
- Coding convention vÃ­ dá»¥: API theo RESTful + JSON response + HTTP status; TypeScript strict, camelCase, kiáº¿n trÃºc module/layer.
- Coi Ä‘Ã¢y lÃ  "bá»™ tÃ i liá»‡u onboarding" nhÆ° cho developer má»›i, nhÆ°ng dÃ nh cho AI.
- NguyÃªn táº¯c: **context cÃ ng chi tiáº¿t thÃ¬ AI sinh code cÃ ng Ä‘Ãºng.**

### BÆ°á»›c 4. Triá»ƒn khai tuáº§n tá»±, tá»«ng task nhá»
- Chia pipeline task: ÄÄƒng kÃ½, rá»“i ÄÄƒng nháº­p, rá»“i Táº¡o cÃ´ng viá»‡c...
- Quy táº¯c vÃ ng: xong má»™t chá»©c nÄƒng vÃ  test OK thÃ¬ má»›i sang chá»©c nÄƒng káº¿.
- Lá»£i Ã­ch: dá»… khoanh vÃ¹ng lá»—i. Náº¿u one-prompt cho dá»± Ã¡n lá»›n, lá»—i ráº¥t khÃ³ truy ra nguyÃªn nhÃ¢n.

### BÆ°á»›c 5. Báº¯t buá»™c AI Ä‘á»c codebase trÆ°á»›c khi sá»­a
- KhÃ´ng ra lá»‡nh kiá»ƒu "HÃ£y thÃªm Notification vÃ o project ngay!".
- CÃ¡ch Ä‘Ãºng: (1) Ä‘á»c cáº¥u trÃºc project hiá»‡n táº¡i, (2) tÃ¬m module liÃªn quan (vÃ­ dá»¥ Notification), (3) phÃ¢n tÃ­ch luá»“ng Task vÃ  chá»‰ ra vá»‹ trÃ­ tÃ­ch há»£p phÃ¹ há»£p (vÃ­ dá»¥ qua event hook sau khi táº¡o task).

### BÆ°á»›c 6. Láº­p káº¿ hoáº¡ch trÆ°á»›c khi code (Plan first)
- YÃªu cáº§u AI Ä‘Æ°a ra káº¿ hoáº¡ch triá»ƒn khai, **chÆ°a Ä‘Æ°á»£c sá»­a file nÃ o**. VÃ­ dá»¥ káº¿ hoáº¡ch thÃªm RBAC: (1) báº£ng Roles/UserRoles trong DB, (2) middleware kiá»ƒm tra quyá»n, (3) API guard cho endpoint, (4) cáº­p nháº­t UI theo role.
- **Con ngÆ°á»i review káº¿ hoáº¡ch**; chá»‰ khi duyá»‡t má»›i cho AI triá»ƒn khai.
- Triá»ƒn khai theo tá»«ng bÆ°á»›c trong káº¿ hoáº¡ch. AI hoáº¡t Ä‘á»™ng nhÆ° co-pilot cÃ³ ká»· luáº­t, khÃ´ng pháº£i autocomplete.

### BÆ°á»›c 7. Kiá»ƒm tra & test ká»¹
- Cháº¡y test suite, kiá»ƒm tra cÃ¡c edge case (vÃ­ dá»¥: sai password tráº£ 401, thiáº¿u password tráº£ 400, truy cáº­p chÆ°a cáº¥p quyá»n tráº£ 403).
- AI táº¡o test case, nhÆ°ng **con ngÆ°á»i váº«n pháº£i hiá»ƒu káº¿t quáº£** vÃ  Ä‘Ã¡nh giÃ¡ cháº¥t lÆ°á»£ng.

### BÆ°á»›c 8. Debug cÃ³ thiáº¿t káº¿
- Khi bÃ¡o lá»—i, cung cáº¥p Ä‘á»§ context. Slide nÃªu "4 thÃ´ng tin debug chuáº©n"; cÃ¡c má»¥c tháº¥y rÃµ: káº¿t quáº£ mong muá»‘n, káº¿t quáº£ thá»±c táº¿, error message & stack trace.
- Há»i nguyÃªn nhÃ¢n gá»‘c: **nÃªn há»i** "Táº¡i sao lá»—i nÃ y láº¡i xáº£y ra?", **khÃ´ng nÃªn há»i** "Sá»­a lá»—i nhÆ° tháº¿ nÃ o?".
- **TrÃ¡nh copy-paste mÃ¹ quÃ¡ng** (vÃ²ng láº·p copy lá»—i, dÃ¡n cho AI, cháº¥p nháº­n code) vÃ¬ dá»… sinh code rÃ¡c, máº¥t kiá»ƒm soÃ¡t. Pháº£i hiá»ƒu nguyÃªn nhÃ¢n trÆ°á»›c khi cháº¥p nháº­n báº£n sá»­a.

### BÆ°á»›c 9. Review & refactor cÃ³ pháº¡m vi
- Sau khi cháº¡y Ä‘Æ°á»£c: kiá»ƒm tra phÃ¢n layer, an ninh (báº£o máº­t), code trÃ¹ng láº·p, logic Ä‘áº·t sai layer.
- Refactor cÃ³ giá»›i háº¡n rÃµ (vÃ­ dá»¥ chá»‰ module Auth vÃ  tÃ¡ch helper), **khÃ´ng** ra lá»‡nh "refactor toÃ n bá»™ project cho tá»‘t hÆ¡n".

### BÆ°á»›c 10. Ká»· luáº­t Git
- Commit ngay sau má»—i tÃ­nh nÄƒng hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh (vÃ­ dá»¥ hoÃ n thÃ nh Authentication thÃ¬ commit).
- Má»—i commit lÃ  Ä‘iá»ƒm tá»±a an toÃ n Ä‘á»ƒ quay láº¡i (vÃ­ dá»¥ `git reset --hard HEAD~1` khi AI lÃ m há»ng).
- DÃ¹ng Git Ä‘á»ƒ kiá»ƒm soÃ¡t tá»‘c Ä‘á»™ thay Ä‘á»•i do AI sinh ra.

### VÃ²ng láº·p phÃ¡t triá»ƒn
Sau má»—i vÃ²ng: chá»n task tiáº¿p theo, náº¡p context cho AI, láº­p káº¿ hoáº¡ch triá»ƒn khai, yÃªu cáº§u phÃ¢n tÃ­ch, rá»“i láº·p láº¡i.

---

## 4. TÃ³m táº¯t 4 giai Ä‘oáº¡n (slide tá»•ng káº¿t)

| Giai Ä‘oáº¡n | Ná»™i dung |
|---|---|
| 1. Chuáº©n bá»‹ & Thiáº¿t káº¿ | Hiá»ƒu bÃ i toÃ¡n, phÃ¢n tÃ­ch requirement, xÃ¡c Ä‘á»‹nh scope, thiáº¿t káº¿ kiáº¿n trÃºc, táº¡o tÃ i liá»‡u context |
| 2. Láº­p káº¿ hoáº¡ch & Thá»±c thi | Chia project thÃ nh task nhá» (atomic), cho AI Ä‘á»c code trÆ°á»›c khi thay Ä‘á»•i, láº­p & duyá»‡t káº¿ hoáº¡ch |
| 3. Kiá»ƒm thá»­ & Cháº¥t lÆ°á»£ng | Triá»ƒn khai tá»«ng bÆ°á»›c, cháº¡y & test, test edge case, debug theo nguyÃªn nhÃ¢n gá»‘c, review code & báº£o máº­t, refactor cÃ³ pháº¡m vi |
| 4. Tá»•ng há»£p & Láº·p láº¡i | Refactor cÃ³ pháº¡m vi, commit báº£n á»•n Ä‘á»‹nh, láº·p vÃ²ng phÃ¡t triá»ƒn má»›i |

---

## 5. Pháº§n 3: Báº£n cháº¥t cá»§a Vibe Coding

- **AI code ráº¥t nhanh nhÆ°ng cáº§n kiá»ƒm soÃ¡t cháº·t.** AI cÃ³ thá»ƒ viáº¿t code nhanh hÆ¡n con ngÆ°á»i ráº¥t nhiá»u, nhÆ°ng con ngÆ°á»i pháº£i giá»¯ quyá»n Ä‘á»‹nh hÆ°á»›ng vÃ  quyáº¿t Ä‘á»‹nh thay Ä‘á»•i.
- **Thiáº¿u ná»n táº£ng ban Ä‘áº§u thÃ¬ háº­u quáº£ lá»›n:** khÃ´ng cÃ³ requirement rÃµ rÃ ng, AI tá»± Ä‘Æ°a ra quyáº¿t Ä‘á»‹nh thay vÃ¬ lÃ m theo chá»‰ dáº«n.
- **Ná»£ ká»¹ thuáº­t tÄƒng vá»t** khi thiáº¿u specification vÃ  bá» qua review code (slide minh hoáº¡ báº±ng biá»ƒu Ä‘á»“ cá»™t tÄƒng dáº§n, mang tÃ­nh minh hoáº¡).
- **LÃ¡ cháº¯n an toÃ n: Spec & Git.** Specification Ä‘á»‹nh hÃ¬nh pháº¡m vi Ä‘á»ƒ AI hiá»ƒu vÃ  khÃ´ng lÃ m sai; Git cho phÃ©p khÃ´i phá»¥c an toÃ n, kiá»ƒm soÃ¡t tá»‘c Ä‘á»™ thay Ä‘á»•i, tiáº¿t kiá»‡m thá»i gian debug.
- **Báº£n cháº¥t quy trÃ¬nh tá»‘t:** *khÃ´ng pháº£i* chá»‰ Ä‘Æ°a prompt vÃ  nháº­n code mÃ¹ quÃ¡ng, Ä‘á»ƒ AI tá»± Ä‘oÃ¡n kiáº¿n trÃºc, máº¥t kiá»ƒm soÃ¡t khi sá»­a. *MÃ  lÃ * hiá»ƒu rÃµ bÃ i toÃ¡n & thiáº¿t káº¿ giáº£i phÃ¡p, chia nhá» cÃ´ng viá»‡c thÃ nh atomic tasks, kiá»ƒm soÃ¡t cháº¥t lÆ°á»£ng & quáº£n lÃ½ lá»‹ch sá»­ code.
- **AI lÃ  Ä‘á»“ng Ä‘á»™i tÄƒng tá»‘c, developer giá»¯ vai trÃ² kiá»ƒm soÃ¡t:** AI há»— trá»£ phÃ¢n tÃ­ch (Ä‘á»c codebase), triá»ƒn khai (sinh code theo káº¿ hoáº¡ch), kiá»ƒm thá»­ (cháº¡y test, soÃ¡t edge case), tÄƒng tá»‘c (rÃºt ngáº¯n thá»i gian phÃ¡t triá»ƒn). Developer lÃ  "thuyá»n trÆ°á»Ÿng": Ä‘á»‹nh hÆ°á»›ng chiáº¿n lÆ°á»£c, kiá»ƒm soÃ¡t cháº¥t lÆ°á»£ng, giá»¯ cho toÃ n bá»™ dá»± Ã¡n Ä‘i Ä‘Ãºng hÆ°á»›ng.

---

## 6. Káº¿t luáº­n cá»§a video

Bá»‘n ká»¹ nÄƒng cá»‘t lÃµi Ä‘á»ƒ tá»• chá»©c quy trÃ¬nh phÃ¡t triá»ƒn pháº§n má»m vá»›i AI:

1. **Thiáº¿t káº¿ há»‡ thá»‘ng:** xÃ¡c Ä‘á»‹nh scope & kiáº¿n trÃºc.
2. **Atomic tasks:** chia nhá» task vÃ  táº¡o context.
3. **Test & review code:** kiá»ƒm tra ká»¹ vÃ  xá»­ lÃ½ edge case.
4. **Ká»· luáº­t Git:** commit vÃ  Ä‘iá»ƒm tá»±a rollback.

> **Con ngÆ°á»i lÃ m chá»§ kiáº¿n trÃºc, AI lÃ  mÃ¡y gia tá»‘c.** Quy trÃ¬nh chuáº©n lÃ  ká»¹ nÄƒng sá»‘ 1 cá»§a ká»· nguyÃªn AI.

---

## 7. Gá»£i Ã½ cho AI khi dÃ¹ng ná»™i dung nÃ y

- Náº¿u ngÆ°á»i dÃ¹ng muá»‘n "lÃ m cáº£ app báº±ng má»™t prompt", hÃ£y giáº£i thÃ­ch giá»›i háº¡n (má»¥c 2) vÃ  Ä‘á» xuáº¥t báº¯t Ä‘áº§u tá»« BÆ°á»›c 1-3.
- Khi há»— trá»£ code cho dá»± Ã¡n cÃ³ sáºµn: Ä‘á»c codebase vÃ  Ä‘á» xuáº¥t káº¿ hoáº¡ch trÆ°á»›c, **chÆ°a sá»­a file** cho Ä‘áº¿n khi ngÆ°á»i dÃ¹ng duyá»‡t (BÆ°á»›c 5-6).
- Khi gáº·p lá»—i: yÃªu cáº§u Ä‘á»§ context (káº¿t quáº£ mong muá»‘n, káº¿t quáº£ thá»±c táº¿, error + stack trace) vÃ  giáº£i thÃ­ch nguyÃªn nhÃ¢n gá»‘c trÆ°á»›c khi sá»­a (BÆ°á»›c 8).
- Khuyáº¿n khÃ­ch commit sau má»—i tÃ­nh nÄƒng á»•n Ä‘á»‹nh vÃ  refactor theo pháº¡m vi nhá» (BÆ°á»›c 9-10).

