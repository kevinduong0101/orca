# Orca Next — Competitive Analysis: Qoder vs. Orca

Tài liệu này phân tích chi tiết, khách quan giữa **Qoder** (chuẩn mực về trải nghiệm lập trình AI, quản lý tri thức và lập kế hoạch) và **Orca** (chuẩn mực về điều phối đa Agent trên các Git Worktree song song).

---

## 1. Tiêu Chí Phân Loại Tính Năng

Mỗi tính năng được xếp vào 1 trong 5 nhóm phân loại:

- 🟢 **[ĐÃ CÓ & TỐT]**: Đã hoạt động ổn định, không viết lại để tránh lãng phí.
- 🟡 **[CẦN CẢI TIẾN]**: Đã có nền tảng nhưng trải nghiệm còn thô, thiếu trực quan hoặc hiệu năng chưa tối ưu.
- 🔵 **[CHƯA CÓ - NÊN PHÁT TRIỂN]**: Tính năng cốt lõi tạo ra bước nhảy vọt về giá trị cho người dùng.
- 🟣 **[TÍCH HỢP QUA PLUGIN]**: Nên dùng MCP server hoặc Agent skill/plugin có sẵn thay vì nhồi vào core.
- ⚪ **[KHÔNG CẦN THIẾT]**: Tính năng thừa, rườm rà, gây over-engineering hoặc không phù hợp triết lý.

---

## 2. Bảng So Sánh Chi Tiết Theo 6 Lĩnh Vực

### A. AI Coding Experience (Trải Nghiệm Lập Trình AI)

| Tính năng                               | Qoder                                                                       | Orca Hiện tại                                                               | Đề xuất cho Orca Next                                                                                 | Phân loại                     |
| :-------------------------------------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------------------------- |
| **Code Editor**                         | Tích hợp sâu, Monaco-based, syntax highlight, mini-map mượt                 | Tích hợp Monaco Editor nhưng chủ yếu dùng để xem diff và file nhanh         | Cải tiến Monaco trong Orca thành editor đầy đủ với split editor, symbol navigation                    | 🟡 [CẦN CẢI TIẾN]             |
| **Code Completion (Inline Tab)**        | Tự động gợi ý thông minh dựa trên context file & project memory             | Chưa có native inline code completion (chủ yếu là Agent sinh cả block/file) | Tích hợp engine completion nhẹ (FIM model) chạy background qua worker                                 | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Multi-File Editing**                  | Rất mạnh: Đọc nhiều file, tạo diff có cấu trúc, preview trước khi apply     | Agent có thể sửa nhiều file qua tool call, hiển thị diff theo git change    | Tích hợp Unified Staging View: Cho phép duyệt/sửa diff từng file trước khi commit                     | 🟡 [CẦN CẢI TIẾN]             |
| **Codebase Understanding**              | Repo indexing, symbol graph, trích xuất quan hệ module                      | Dựa vào file tree, ripgrep và ast-grep                                      | Xây dựng Local Codebase Vector Index + AST Symbol Graph (nhẹ, lưu cache disk)                         | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Planning & Autonomous Coding**        | Tạo file `plans/<id>.md` chi tiết với các phase, checklist có thể tick chọn | Có chế độ prompt tuần tự, chưa có UI quản lý Plan tương tác                 | Thêm **Interactive Plan Board**: Render checklist markdown có trạng thái checkbox tương tác trực tiếp | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Browser Agent & Visual Verification** | Tích hợp browser connector chuyên dụng chụp màn hình và test UI             | Có `agent-browser` (Chromium headless + snapshot tree refs)                 | Giữ nguyên engine `agent-browser` của Orca vì rất mạnh, bổ sung UI preview tab trực quan              | 🟡 [CẦN CẢI TIẾN]             |

---

### B. Agent Management (Quản Lý & Điều Phối Agent)

| Tính năng                                | Qoder                                      | Orca Hiện tại                                                                  | Đề xuất cho Orca Next                                                                | Phân loại                     |
| :--------------------------------------- | :----------------------------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :---------------------------- |
| **Quản lý nhiều Agent song song**        | Giới hạn trong 1 workspace / 1 luồng chính | **Rất mạnh**: Mỗi agent chạy trên 1 Git Worktree độc lập, không đụng chạm file | **Giữ nguyên làm lợi thế số 1**, tối ưu thêm giao diện hiển thị Fleet Overview       | 🟢 [ĐÃ CÓ & TỐT]              |
| **Agent Collaboration & Delegation**     | Chuyển giao ngữ cảnh qua session handoff   | Có cơ chế Coordinator / Subagent DAG trong `src/shared`                        | Hoàn thiện UI điều phối: Cho phép Lead Agent phân công task con cho các Worktree con | 🟡 [CẦN CẢI TIẾN]             |
| **Theo dõi trạng thái & Attention Ring** | Hiển thị trạng thái chat tuần tự           | Rất tốt: `AgentStateDot`, `AgentProgressRing`, theo dõi OSC terminal           | Giữ nguyên hệ thống Attention & Notification của Orca                                | 🟢 [ĐÃ CÓ & TỐT]              |
| **Review & Xác nhận kết quả**            | Review tuần tự trong chat                  | Diff viewer theo từng worktree, hỗ trợ compare với base branch                 | Bổ sung nút **"One-Click Merge & Squash"** từ worktree của Agent về main branch      | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Khả năng Resume task bị gián đoạn**    | Đọc checkpoint từ `plans/`                 | Tự động khôi phục PTY session qua terminal checkpoint cache                    | Chuẩn hóa định dạng checkpoint: Khôi phục cả trạng thái Plan + Terminal              | 🟡 [CẦN CẢI TIẾN]             |

---

### C. Knowledge & Memory (Tri Thức & Bộ Nhớ Dự Án)

| Tính năng                           | Qoder                                                          | Orca Hiện tại                                                          | Đề xuất cho Orca Next                                                                  | Phân loại                     |
| :---------------------------------- | :------------------------------------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :---------------------------- |
| **Project Memory (`MEMORY.md`)**    | Tự động cập nhật quy ước, sở thích người dùng, lỗi hay gặp     | Chưa có hệ thống trí nhớ dự án tự động (chủ yếu dựa vào system prompt) | Triển khai **Living Project Memory** chuẩn Markdown tại `.orca/MEMORY.md`              | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Repo Wiki & Architecture Docs**   | Tự động sinh wiki tổng quan kiến trúc và flow nghiệp vụ        | Dựa vào README.md hoặc tài liệu người dùng cấp sẵn                     | Thêm tính năng 1-click **"Generate Repo Architecture Wiki"** vào `.orca/wiki/`         | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Phase Gates & Design Freeze**     | Có file `feedback-phase-gates.md`, `feedback-design-freeze.md` | Chưa có cơ chế khóa thiết kế                                           | Tích hợp vào Plan Engine: Cảnh báo khi Agent định thay đổi API đã đóng băng            | 🟣 [TÍCH HỢP QUA PLUGIN]      |
| **Chia sẻ tri thức giữa các Agent** | Một agent duy nhất dùng chung memory                           | Mỗi worktree độc lập, chưa chia sẻ kiến thức học được                  | Xây dựng **Shared Knowledge Bus**: Khi Agent A tìm ra lỗi kiến trúc, Agent B tự update | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |

---

### D. Extensions & Integrations (Tiện Ích & Mở Rộng)

| Tính năng                        | Qoder                            | Orca Hiện tại                                            | Đề xuất cho Orca Next                                                              | Phân loại                     |
| :------------------------------- | :------------------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------- | :---------------------------- |
| **Model Context Protocol (MCP)** | Hỗ trợ MCP qua `mcp-router.json` | Có hỗ trợ `.mcp.json` và MCP tools trong backend         | Hoàn thiện UI quản lý MCP server (bật/tắt 1 click, test connection, xem tool logs) | 🟡 [CẦN CẢI TIẾN]             |
| **Quản lý Skills (`SKILL.md`)**  | Có marketplace riêng             | Tương thích chuẩn `.agents/skills`, hỗ trợ npx skills    | Bổ sung **In-app Skill Manager UI** (tìm kiếm, cài đặt, bật/tắt kỹ năng trực quan) | 🟡 [CẦN CẢI TIẾN]             |
| **Slash Commands (`.toml`)**     | Hệ thống lệnh phong phú          | Hỗ trợ `~/.gemini/commands/*.toml` nhưng thiếu UI config | Tích hợp Slash Command Palette hiển thị cả Project Commands và Global Commands     | 🟡 [CẦN CẢI TIẾN]             |
| **Custom Agents / Subagents**    | Cấu hình qua plugin              | Định nghĩa động qua `define_subagent` / `skills`         | Hỗ trợ lưu template Agent (Frontend Specialist, Bug Hunter, Security Auditor)      | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |

---

### E. Developer Experience (Trải Nghiệm Nhà Phát Triển)

| Tính năng                        | Qoder                              | Orca Hiện tại                                                     | Đề xuất cho Orca Next                                                    | Phân loại        |
| :------------------------------- | :--------------------------------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------- | :--------------- |
| **Quản lý Workspace & Worktree** | 1 project folder tại một thời điểm | **Tốt nhất hiện nay**: Worktree pool, prefetch base, safe removal | Giữ nguyên core engine, cải tiến đồ họa Worktree Tree trên sidebar       | 🟢 [ĐÃ CÓ & TỐT] |
| **Terminal Multiplexing**        | Terminal nhúng cơ bản              | **Rất mạnh**: xterm headless, split panes, OSC protocol, SSH2     | Giữ nguyên xterm/PTY core, thêm quick-action buttons cho output terminal | 🟢 [ĐÃ CÓ & TỐT] |
| **Mobile Companion**             | Không có                           | **Đã có sẵn**: iOS & Android app điều khiển agent từ xa           | Nâng cấp app mobile để duyệt và merge diff trực tiếp trên điện thoại     | 🟢 [ĐÃ CÓ & TỐT] |
| **Tích hợp Issue Trackers**      | Cần plugin                         | Tích hợp sẵn Linear SDK, Jira Issue, GitLab MR, GitHub PR         | Giữ nguyên, mở rộng thêm webhook để trigger Agent tự fix issue           | 🟢 [ĐÃ CÓ & TỐT] |

---

### F. Performance, Reliability & Security

| Tính năng                           | Qoder                                                       | Orca Hiện tại                                                     | Đề xuất cho Orca Next                                                                     | Phân loại                     |
| :---------------------------------- | :---------------------------------------------------------- | :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :---------------------------- |
| **Tối ưu RAM khi chạy nhiều Agent** | Ăn ít RAM hơn vì chỉ chạy 1 luồng                           | Có thể tốn RAM nếu mỗi Agent chạy 1 Electron webview              | Chia sẻ process host giữa các worktree; hibernate PTY của agent không active              | 🟡 [CẦN CẢI TIẾN]             |
| **Khởi động & Render**              | Khởi động nhanh                                             | Dùng Electron + Oxlint + Vite, tối ưu tốt                         | Thêm Virtualized Tab Bar cho Worktrees để giảm DOM nodes                                  | 🟡 [CẦN CẢI TIẾN]             |
| **Multi-Provider BYOK**             | Cấu hình linh hoạt (OpenAI-compatible, custom API endpoint) | Hỗ trợ qua các launcher CLI bên ngoài                             | Bổ sung **Unified Provider Settings UI** hỗ trợ cả Custom Base URL, API Key, Token Window | 🔵 [CHƯA CÓ - NÊN PHÁT TRIỂN] |
| **Security & Sandbox Isolation**    | Sandbox process chuẩn                                       | Rất mạnh: `agent-workspace-trust`, `nonWorkspaceFileAccessPolicy` | Giữ nguyên mô hình bảo mật cấp enterprise của Orca                                        | 🟢 [ĐÃ CÓ & TỐT]              |

---

## 3. Tổng Hợp Tỷ Lệ Đánh Giá

- 🟢 **Giữ nguyên & Phát huy (Đã có & tốt):** ~30% (Git Worktree engine, Terminal PTY multiplexing, Mobile Companion, Issue Trackers, Security Guard).
- 🟡 **Cải tiến & Nâng cấp (Đã có nhưng cần tối ưu):** ~35% (Monaco Editor, UI Slash Commands, Quản lý MCP/Skills, Tối ưu RAM khi chạy 5+ agents).
- 🔵 **Phát triển mới (Chưa có - Cốt lõi của Orca Next):** ~25% (Living Project Memory, Repo Knowledge Graph, Interactive Plan Board, One-Click Worktree Merge, Unified BYOK Provider Settings).
- 🟣 **Dùng Plugin/Skill có sẵn:** ~10% (Phase-gates, Design freeze, Ponytail rules, TDD workflows).
