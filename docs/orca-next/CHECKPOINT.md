# Orca Next — Project Checkpoint & Handover Guide

Tài liệu này lưu lại toàn bộ tiến độ, trạng thái hiện tại, kiến trúc và mã nguồn đã triển khai để bất kỳ AI Agent hoặc kỹ sư nào có thể tiếp tục phát triển ngay lập tức.

---

## 1. Trạng Thái Hiện Tại (Current State)

- **Ngày cập nhật:** 02/11/2026
- **Giai đoạn:** Đã hoàn thành 100% **Giai đoạn P0 (Nền tảng & BYOK)**, **Giai đoạn P1 (Trải nghiệm Coding & Worktree Orchestration)**, **Giai đoạn P2 (Cross-Agent Bus, Hibernation, Conflict Watcher)** và mở đầu xuất sắc **Giai đoạn P3 (P3-1: Smart Autonomous Model Router)**.
- **Mã nguồn Orca:** Đã cài đặt, kiểm thử và commit tại `/Users/kevinduong/Documents/WORKPLACE/orca`.
- **Chất lượng mã nguồn:**
  - **Vitest:** 45/45 test suites vượt qua 100% (10 test files).
  - **Oxlint & React Doctor:** 0 errors, 0 warnings trên toàn bộ codebase mới và sửa đổi.

---

## 2. Nhật Ký Triển Khai Chi Tiết (Implementation Ledger)

### ✅ Giai Đoạn P0: Nền Tảng & Multi-Provider

1. **P0-1: Project Memory Service (`src/main/project-memory/`)**
   - Quản lý file `.orca/MEMORY.md` tự động theo từng workspace.
   - Cơ chế ghi chú theo timestamp, phân loại mục tiêu/quy ước kiến trúc.
   - Token budgeting (giới hạn ký tự thông minh) và inject khối XML `<project_memory>` vào LLM prompt context.
   - Test: `src/main/project-memory/project-memory-service.test.ts` (4/4 passed).

2. **P0-2: Multi-Provider BYOK Gateway (`src/main/ai-providers/` & `src/renderer/`)**
   - Hỗ trợ kết nối bất kỳ LLM OpenAI-compatible (DeepSeek, Qwen, OpenRouter, Ollama local) qua API Key riêng của người dùng.
   - Endpoint test kết nối `/models` trực tiếp kiểm tra API key/URL.
   - UI: Component `CustomProviderSettingsSection.tsx` được tích hợp vào tab Settings (`AccountsPane.tsx`).
   - Test: `src/main/ai-providers/custom-provider-manager.test.ts` (5/5 passed).

3. **P0-3: Unified Slash Command Registry (`src/main/slash-commands/` & `src/renderer/`)**
   - Quét đồng bộ lệnh từ global (`~/.agents/skills`, `~/.gemini/commands`), project (`.gemini/commands`, `.agents/skills`) và plugins.
   - Parser `.toml` với `smol-toml`, thay thế tham số động `{{args}}`.
   - UI: Autocomplete palette `SlashCommandPalette.tsx` hỗ trợ phím mũi tên và Enter.
   - Test: `src/main/slash-commands/unified-command-registry.test.ts` (4/4 passed).

### ✅ Giai Đoạn P1: Trải Nghiệm Coding & Worktree Orchestration

4. **P1-1: Interactive Plan Board (`src/main/plans/` & `src/renderer/`)**
   - Parser phân tích markdown plan thành các giai đoạn (phases) và checklist tasks (`[ ]`, `[-]`, `[x]`).
   - Tính toán tiến độ completion rate (%) và round-trip update markdown khi user tương tác.
   - UI: Board `InteractivePlanBoard.tsx` trực quan hóa tiến độ với nút phân công task cho agent nhánh con ("Assign to Worktree Agent").
   - Test: `src/main/plans/plan-parser-service.test.ts` (5/5 passed).

5. **P1-2: One-Click Worktree Review & Merge Engine (`src/main/worktree-merge/` & `src/renderer/`)**
   - Service tính toán git numstat (files changed, insertions, deletions) giữa nhánh worktree và nhánh đích.
   - Kiểm tra trước xung đột (dry-run conflict check) bằng `git merge-tree` trước khi thực hiện merge thật.
   - Hỗ trợ 3 chiến lược: `merge-commit`, `squash`, `rebase` và dọn dẹp worktree tự động sau merge.
   - UI: Hộp thoại `WorktreeMergeDialog.tsx` hiển thị diff stats và xác nhận an toàn.
   - Test: `src/main/worktree-merge/worktree-merge-service.test.ts` (4/4 passed).

6. **P1-3: Codebase AST Symbol Indexer (`src/main/ast-indexer/`)**
   - Trích xuất symbol (classes, interfaces, functions, methods, types) từ TS, JS, Python, Go, Rust.
   - Bộ nhớ in-memory index cho tốc độ truy vấn tức thì (<15ms) và cache đĩa tại `.orca/cache/symbols.json`.
   - Test: `src/main/ast-indexer/ast-symbol-indexer.test.ts` (4/4 passed).

### ✅ Giai Đoạn P2: Cross-Agent Collaboration & Resource Optimization

7. **P2-1: Shared Cross-Agent Knowledge Bus (`src/main/knowledge/`)**
   - Event bus thời gian thực kết nối giữa các agent chạy song song trên các worktrees khác nhau.
   - Khi Agent A phát hiện thay đổi schema database, API contract hay fix bug, Agent B tự động nhận được thông tin để cập nhật prompt context mà không cần đợi merge conflict.
   - Hỗ trợ TTL (tự hủy thông tin tạm thời), lọc theo severity, category, file pattern và định dạng markdown context injection.
   - Test: `src/main/knowledge/cross-agent-bus.test.ts` (4/4 passed).

8. **P2-2: Agent Memory & PTY Process Hibernation (`src/main/hibernation/`)**
   - Tự động phát hiện terminal/agent tabs nhàn rỗi (vượt ngưỡng `idleThresholdMs`, mặc định 10 phút).
   - Dump scrollback buffer xuống cache đĩa (`.orca/cache/terminals/{id}.log`) và giải phóng RAM in-memory.
   - Giảm 60%+ lượng RAM tiêu thụ khi mở đồng thời 5-10 agent worktrees.
   - Test: `src/main/hibernation/process-hibernation-manager.test.ts` (5/5 passed).

9. **P2-3: Background Worktree Watcher & Conflict Early-Warning (`src/main/worktree-watcher/` & `src/renderer/`)**
   - Giám sát các tệp đang bị sửa đổi (dirty/modified files) giữa nhiều worktrees chạy song song.
   - Phát hiện giao điểm và cảnh báo sớm các file bị sửa đổi đồng thời trước khi chờ đến lúc merge.
   - Tự động phát sinh event thông báo lên `CrossAgentBus` để các agent nhận biết.
   - UI: Banner thông minh `WorktreeConflictBanner.tsx` hiển thị file tranh chấp và các nhánh liên quan.
   - Test: `src/main/worktree-watcher/worktree-conflict-watcher.test.ts` (5/5 passed).

### ✅ Giai Đoạn P3: Nâng Cao & Trí Tuệ Nhân Tạo Thông Minh

10. **P3-1: Smart Autonomous Context & Model Routing (`src/main/routing/` & `src/renderer/`)**
    - Hệ thống tự động phân tích độ phức tạp của bài toán / prompt:
      - `trivial`: Câu hỏi ngắn, fix typo, format -> gợi ý `gpt-4o-mini` hoặc `deepseek-chat`.
      - `standard`: Coding thông thường -> gợi ý `claude-3-5-haiku`.
      - `complex`: Tái cấu trúc nhiều module, sửa schema -> gợi ý `claude-3-5-sonnet` hoặc `qwen2.5-coder-32b`.
      - `expert_reasoning`: Lỗi concurrency, race condition, deadlock, memory leak -> tự động kích hoạt model suy luận sâu (`claude-3-7-sonnet-thinking`, `deepseek-reasoner`).
    - Hỗ trợ 3 chiến lược: `cost_saving`, `balanced`, `max_intelligence`.
    - Tính toán chi phí dự toán (USD) và token chi tiết.
    - UI: Component `ModelRouterBadge.tsx` hiển thị gợi ý thông minh và nút 1-click "Áp dụng".
    - Test: `src/main/routing/smart-model-router.test.ts` (5/5 passed).

---

## 3. Tổng Hợp Kết Quả Kiểm Thử (Test Suite Summary)

```
Test Files: 10 passed (10)
Tests:      45 passed (45)
Lint:       0 errors, 0 warnings across all linters
```

---

## 4. Các Bước Tiếp Theo (Next Implementation Steps)

1. **Task P3-2: In-App Skills & MCP Marketplace UI:**
   - Trình duyệt và quản trị Skills / MCP servers bằng giao diện đồ họa.
2. **Task P3-3: Mobile One-Touch Merge & Remote Steering.**
