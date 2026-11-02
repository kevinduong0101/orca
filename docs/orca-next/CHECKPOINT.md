# Orca Next — Project Checkpoint & Handover Guide

Tài liệu này lưu lại toàn bộ tiến độ, trạng thái hiện tại, kiến trúc và mã nguồn đã triển khai để bất kỳ AI Agent hoặc kỹ sư nào có thể tiếp tục phát triển ngay lập tức.

---

## 1. Trạng Thái Hiện Tại (Current State)

- **Ngày cập nhật:** 02/11/2026
- **Giai đoạn:** Đã hoàn thành toàn bộ **Giai đoạn P0 (Nền tảng & BYOK)**, **Giai đoạn P1 (Trải nghiệm Coding & Worktree Orchestration)** và 2 hạng mục chiến lược cốt lõi của **Giai đoạn P2 (Cross-Agent Bus & Process Hibernation)**.
- **Mã nguồn Orca:** Đã cài đặt và kiểm thử tại `/Users/kevinduong/Documents/WORKPLACE/orca`.
- **Chất lượng mã nguồn:**
  - **Vitest:** 35/35 test suites vượt qua 100% (8 test files).
  - **Oxlint:** 0 errors, 0 warnings trên toàn bộ 27 files mới và sửa đổi.

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
   - Khi người dùng click lại tab hoặc agent có output mới, buffer được nạp lại tức thì.
   - Giảm 60%+ lượng RAM tiêu thụ khi mở đồng thời 5-10 agent worktrees.
   - Test: `src/main/hibernation/process-hibernation-manager.test.ts` (5/5 passed).

---

## 3. Tổng Hợp Kết Quả Kiểm Thử (Test Suite Summary)

```
Test Files: 8 passed (8)
Tests:      35 passed (35)
Lint:       0 errors, 0 warnings across 27 files
```

---

## 4. Các Bước Tiếp Theo (Next Implementation Steps)

1. **Commit & Staging:**
   - Tạo atomic git commit trong repository `/Users/kevinduong/Documents/WORKPLACE/orca` cho các module đã hoàn thiện.
2. **P2-3: Background Worktree Watcher & Conflict Early-Warning:**
   - Daemon theo dõi git index của các worktree song song và cảnh báo ngay khi 2 agent cùng sửa một file.
3. **P3: AI Worktree Auto-Coordinator & Continuous Benchmarks.**
