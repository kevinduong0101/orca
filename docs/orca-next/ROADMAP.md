# Orca Next — Implementation Roadmap & Execution Plan

Lộ trình triển khai được chia làm 4 giai đoạn ưu tiên từ **P0 (Nền tảng cốt lõi)** đến **P3 (Nâng cao & Hệ sinh thái)**.

---

## Giai Đoạn P0: Nền Tảng & Các Vấn Đề Quan Trọng (Foundation & Stability)

### Task P0-1: Thiết lập Hệ thống Trí nhớ Dự án (Living Project Memory Engine)

- **Mục tiêu**: Cho phép mọi Agent đọc và ghi nhớ các quy chuẩn, kiến trúc và quyết định kỹ thuật của dự án xuyên suốt các phiên làm việc.
- **Vấn đề cần giải quyết**: Mỗi lần mở session mới hoặc chuyển qua agent khác, agent lại quên ngữ cảnh, vi phạm lại các quy ước cũ hoặc hỏi lại các câu đã thống nhất.
- **Giải pháp**:
  - Tạo mô-đun `src/main/memory/project-memory-service.ts`.
  - Tự động phát hiện hoặc khởi tạo `.orca/MEMORY.md` khi mở project.
  - Hook vào `sessionStart` của mọi Agent để tự động inject tóm tắt từ `MEMORY.md`.
  - Cung cấp tool/command `/memory` để người dùng và agent có thể update memory bất kỳ lúc nào.
- **File / Module liên quan**:
  - `src/main/memory/project-memory-service.ts` (mới)
  - `src/main/agent-workspace-trust-spawn.ts`
  - `src/shared/agent-status-types.ts`
- **Mức độ ưu tiên**: `P0 (Khẩn cấp)`
- **Độ khó**: `Vừa phải (Medium)`
- **Điều kiện hoàn thành (DoD)**:
  1. Thư mục `.orca/MEMORY.md` tự động tạo khi mở workspace.
  2. Mọi agent spawn ra đều nhận được nội dung memory trong prompt ban đầu.
  3. Lệnh `/memory update <note>` cập nhật thành công nội dung vào file markdown.
- **Phương pháp kiểm thử**: Unit test với Vitest kiểm tra việc parse và inject file memory; E2E test spawn Claude/Codex kiểm tra xem agent có nhận biết được context trong memory không.

---

### Task P0-2: Unified Multi-Provider & BYOK Gateway UI

- **Mục tiêu**: Cho phép người dùng nhập API Key và Custom Endpoint tùy ý (OpenAI, Anthropic, Gemini, Qwen, DeepSeek, Ollama) trực tiếp trên UI Orca.
- **Vấn đề cần giải quyết**: Người dùng bị phụ thuộc vào CLI cài ngoài máy hoặc gặp khó khăn khi muốn đổi provider/model giá rẻ hoặc dùng local LLM.
- **Giải pháp**:
  - Xây dựng Provider Settings Tab trong `src/renderer/src/components/settings/`.
  - Lưu trữ API Key bảo mật trong Keychain/SecretStore (`src/main/secret-store.ts`).
  - Hỗ trợ endpoint chuẩn OpenAI-compatible (`/v1/chat/completions` và `/v1/models`).
- **File / Module liên quan**:
  - `src/renderer/src/components/settings/ProviderSettings.tsx` (mới)
  - `src/main/provider-gateway.ts` (mới)
  - `src/shared/agent-model-catalog.ts`
- **Mức độ ưu tiên**: `P0 (Khẩn cấp)`
- **Độ khó**: `Vừa phải (Medium)`
- **Điều kiện hoàn thành (DoD)**:
  1. UI hiển thị danh sách các provider: OpenAI, Anthropic, Google, DeepSeek, Custom.
  2. Test connection trả về mã `200 OK` và lấy được danh sách model khả dụng.
  3. Cho phép chọn model mặc định cho từng vai trò (Architect, Coder, Tester).
- **Phương pháp kiểm thử**: Mock API endpoints với Vitest, kiểm tra việc lưu/đọc token an toàn và gửi request thành công.

---

### Task P0-3: Unified Slash Command Registry & Autocomplete UI

- **Mục tiêu**: Hiển thị menu gợi ý lệnh gõ tắt mượt mà khi người dùng gõ `/` trong chat box.
- **Vấn đề cần giải quyết**: Các lệnh `.toml` bị phân tán hoặc không hiển thị trên giao diện chat khiến người dùng không biết có lệnh nào để dùng.
- **Giải pháp**:
  - Quét đồng thời 3 nguồn: Global commands (`~/.gemini/commands`), Project commands (`.orca/commands`) và Plugin commands.
  - Tích hợp autocomplete popup với phím mũi tên `Up/Down` và `Tab/Enter` trong rich text editor (`@tiptap` hoặc textarea).
- **File / Module liên quan**:
  - `src/renderer/src/components/chat/SlashCommandPopup.tsx` (mới)
  - `src/main/command-registry.ts` (mới)
  - `src/shared/terminal-quick-command-types.ts`
- **Mức độ ưu tiên**: `P0 (Khẩn cấp)`
- **Độ khó**: `Thấp (Low)`
- **Điều kiện hoàn thành (DoD)**:
  1. Gõ `/` hiện ngay popup danh sách lệnh kèm mô tả trong <50ms.
  2. Bấm chọn hoặc gõ `/ponytail` chèn đúng prompt vào ô chat.
- **Phương pháp kiểm thử**: Component test bằng `@testing-library/react`.

---

## Giai Đoạn P1: Những Cải Tiến Có Giá Trị Cao (High-Value Features)

### Task P1-1: Interactive Plan Board (Bảng Kế Hoạch Đa Giai Đoạn)

- **Mục tiêu**: Trải nghiệm lập kế hoạch tương tác dạng checklist trực quan như Qoder.
- **Vấn đề cần giải quyết**: Kế hoạch sinh ra dạng markdown text trong luồng chat dài dễ bị trôi và không thể tương tác trực tiếp.
- **Giải pháp**:
  - Xây dựng component `PlanBoardView.tsx`: Parser đọc file markdown `plans/*.md` và render thành các Phase collapsible với checkbox task.
  - Khi agent thực thi xong 1 task, tự động đánh dấu tick xanh `[x]`.
  - Người dùng có thể click chuột để tick hoặc sửa nội dung task trên board.
- **File / Module liên quan**:
  - `src/renderer/src/components/plan/PlanBoardView.tsx` (mới)
  - `src/main/plan-service.ts` (mới)
- **Mức độ ưu tiên**: `P1 (Cao)`
- **Độ khó**: `Vừa phải (Medium)`
- **Điều kiện hoàn thành (DoD)**:
  1. Kế hoạch hiển thị ở panel giữa hoặc split view.
  2. Tự động sync 2 chiều giữa file `.md` và giao diện đồ họa.
- **Phương pháp kiểm thử**: Storybook fixture + Vitest kiểm tra logic parse/serialize markdown plan.

---

### Task P1-2: One-Click Worktree Review, Diff & Merge Engine

- **Mục tiêu**: Duyệt và gộp kết quả của Agent từ Worktree về nhánh chính dễ dàng trong 1 click.
- **Vấn đề cần giải quyết**: Người dùng phải gõ lệnh git thủ công hoặc tự cherry-pick khi agent hoàn thành việc ở worktree riêng.
- **Giải pháp**:
  - Tạo giao diện `WorktreeMergeDialog.tsx` hiển thị tổng kết diff (thay đổi file, số dòng +/-).
  - Tích hợp nút **"Merge to Main"** (hỗ trợ Squash Merge) và tự động dọn dẹp worktree sau khi merge.
  - Chạy linter / test tự động trước khi cho phép merge.
- **File / Module liên quan**:
  - `src/renderer/src/components/worktree/WorktreeMergeDialog.tsx` (mới)
  - `src/main/worktree-merge-service.ts` (mới)
  - `src/main/worktree-removal-safety.ts`
- **Mức độ ưu tiên**: `P1 (Cao)`
- **Độ khó**: `Phức tạp (High)`
- **Điều kiện hoàn thành (DoD)**:
  1. Nút "Review & Merge" xuất hiện nổi bật khi Agent đổi trạng thái sang `done`.
  2. Merge an toàn, xử lý conflict nếu nhánh chính có commit mới.
- **Phương pháp kiểm thử**: Integration test với git repo giả lập các tình huống clean merge và merge conflict.

---

### Task P1-3: Codebase AST & Lightweight Symbol Indexer

- **Mục tiêu**: Giúp Agent tra cứu vị trí định nghĩa hàm, class, interface trên toàn repo trong <50ms mà không tốn token đọc toàn bộ file.
- **Vấn đề cần giải quyết**: Agent thường xuyên phải dùng tool `view_file` hoặc `run_command` nhiều lần để tìm code, gây tốn token và chậm chạp.
- **Giải pháp**:
  - Tận dụng `ast-grep` (đã có sẵn trong package.json của Orca) chạy quét background khi mở repo.
  - Lưu cache symbol map vào `.orca/cache/symbols.json`.
  - Cung cấp tool tra cứu `lookup_symbol(name)` cho mọi Agent.
- **File / Module liên quan**:
  - `src/main/knowledge/ast-symbol-indexer.ts` (mới)
  - `src/main/knowledge/symbol-cache.ts` (mới)
- **Mức độ ưu tiên**: `P1 (Cao)`
- **Độ khó**: `Vừa phải (Medium)`
- **Điều kiện hoàn thành (DoD)**:
  1. Quét repo 10.000 file trong <3 giây.
  2. Agent tìm ra chính xác file và dòng chứa khai báo hàm.
- **Phương pháp kiểm thử**: Benchmark test đo tốc độ index và độ chính xác của symbol query.

---

## Giai Đoạn P2: Tính Năng Chiến Lược (Strategic Differentiation)

### Task P2-1: Shared Cross-Agent Knowledge Bus

- **Mục tiêu**: Khi một Agent học được điều mới (ví dụ: phát hiện lỗi type hoặc cách fix thư viện), toàn bộ các Agent khác trên các worktree khác lập tức được cập nhật.
- **Vấn đề cần giải quyết**: Hiện tại các worktree hoàn toàn cô lập, Agent B có thể vấp phải chính lỗi mà Agent A vừa tốn 10 phút để giải quyết.
- **Giải pháp**:
  - Triển khai Event Bus liên tiến trình trên SQLite / in-memory IPC trong `src/main/`.
  - Khi một agent ghi nhận bài học, nó phát sự kiện `KNOWLEDGE_DISCOVERED`.
  - Main process cập nhật vào Session Memory và broadcast cho các agent đang chạy.
- **File / Module liên quan**:
  - `src/main/knowledge/cross-agent-bus.ts` (mới)
  - `src/shared/agent-status-ipc-payload.ts`
- **Mức độ ưu tiên**: `P2 (Trung bình)`
- **Độ khó**: `Phức tạp (High)`
- **Điều kiện hoàn thành (DoD)**:
  1. Agent A thêm lưu ý vào memory -> Agent B nhận được lưu ý đó ngay trong câu hỏi tiếp theo.
- **Phương pháp kiểm thử**: Multi-agent integration test.

---

### Task P2-2: Agent Memory & PTY Hibernation (Tối ưu RAM)

- **Mục tiêu**: Giảm 60% mức tiêu thụ RAM khi mở từ 5 worktree trở lên.
- **Vấn đề cần giải quyết**: Mỗi tiến trình Node.js/PTY giữ nhiều buffer trong bộ nhớ, dễ gây giật lag trên máy có RAM 16GB.
- **Giải pháp**:
  - Giám sát trạng thái nhàn rỗi (idle). Sau 10 phút không có I/O, snapshot terminal scrollback ra file tạm trên disk.
  - Đóng tiến trình PTY nền; khi người dùng click lại vào tab, phục hồi PTY trong <200ms.
- **File / Module liên quan**:
  - `src/main/process-hibernation-manager.ts` (mới)
  - `src/main/agent-awake-service.ts`
- **Mức độ ưu tiên**: `P2 (Trung bình)`
- **Độ khó**: `Phức tạp (High)`
- **Điều kiện hoàn thành (DoD)**:
  1. Mở 8 worktrees cùng lúc tiêu thụ dưới 800MB RAM tổng thể.
  2. Không mất lịch sử dòng lệnh khi phục hồi tab.
- **Phương pháp kiểm thử**: Memory profiling với `process.memoryUsage()` và Vitest perf benchmarks.

---

## Giai Đoạn P3: Nâng Cao & Hệ Sinh Thái (Ecosystem & Intelligence)

### Task P3-1: Smart Autonomous Context & Model Routing

- **Mục tiêu**: Tự động chọn model tối ưu chi phí (nhỏ/nhanh) cho task đơn giản và model reasoning mạnh (Claude 3.7 Thinking / o3) cho task khó.
- **Độ khó**: `Rất cao (Very High)`

### Task P3-2: In-App Skills & MCP Marketplace UI

- **Mục tiêu**: Cửa hàng tiện ích đồ họa cho phép cài đặt Skills và MCP Servers chỉ với 1 click (kết nối trực tiếp với skills.sh và mcp.so).
- **Độ khó**: `Vừa phải (Medium)`

### Task P3-3: Mobile One-Touch Merge & Voice Steering

- **Mục tiêu**: Người dùng duyệt diff và bấm "Merge to Main" hoặc gửi lệnh bằng giọng nói ngay từ ứng dụng di động Orca Mobile.
- **Độ khó**: `Cao (High)`
