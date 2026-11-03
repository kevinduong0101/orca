# Task List: Pinterest & LinkedIn Orca Browser Automation

## Phase 1: Skill Visibility & Native Chat Feedback

- [x] **Task 1: Model & Types Extension**
  - **Description:** Thêm `skills?: AgentJournalSkillRef[]` vào `NativeChatMessage` và ánh xạ trong `structured-agent-session-projection.ts`.
  - **Acceptance criteria:** `NativeChatMessage` lưu trữ đúng danh sách skills từ journal.
  - **Verification:** `npx oxlint` vượt qua với 0 lỗi.
- [x] **Task 2: Active Skill Badges in User Rows**
  - **Description:** Hiển thị huy hiệu `⚡ Skill Active: {name}` bên dưới bong bóng tin nhắn người dùng khi có slash command (ví dụ `/planning-and-task-breakdown`).
  - **Acceptance criteria:** Huy hiệu có icon `Sparkles`, pulse animation, token chuẩn Orca.
  - **Verification:** Test `NativeChatMessageRow.test.tsx` pass.
- [x] **Task 3: Unit Tests for Skill Badges**
  - **Description:** Viết test kiểm tra huy hiệu xuất hiện khi người dùng gõ slash command trong prompt hoặc khi gắn skills array.
  - **Acceptance criteria:** Test assertions pass cho text inline và mảng skills.
  - **Verification:** `npm test -- src/renderer/src/components/native-chat/NativeChatMessageRow.test.tsx` (21/21 passed).

## Checkpoint 1: Verified Green

- [x] Toàn bộ test của chat row vượt qua.

## Phase 2: Orca Internal Browser Integration for Marketing OS

- [x] **Task 4: Internal Tab Opening in MarketingSettingsTab**
  - **Description:** Thay thế `window.open(url, "_blank")` bằng `createBrowserTab(worktreeId, url, { activate: true })` và `setActiveTabType("browser", worktreeId)`.
  - **Acceptance criteria:** Bấm "Mở Trình Duyệt Đăng Nhập" mở tab webview nội bộ bên trong Orca, lưu profile riêng biệt.
  - **Verification:** Kiểm tra hành vi qua `useAppStore`.
- [x] **Task 5: Refactor MarketingSettingsTab & MarketingBackupSettingsCard**
  - **Description:** Tách `MarketingBackupSettingsCard.tsx` để giữ `MarketingSettingsTab.tsx` dưới 400 dòng.
  - **Acceptance criteria:** Cả 2 file < 400 dòng, 0 eslint/oxlint errors.
  - **Verification:** `npx oxlint` trả về 0 warnings 0 errors.

## Phase 3: Automated Publishing in Orca Browser Tab

- [ ] **Task 6: Publish via Orca Browser Action**
  - **Description:** Tích hợp nút kích hoạt AI đăng bài tự động trên tab Orca nội bộ trong Approvals Center và Content Studio.
  - **Acceptance criteria:** Trạng thái bài đăng chuyển sang `published` sau khi AI tương tác thành công với webview.
  - **Verification:** Kiểm tra luồng phê duyệt và ghi nhận lịch sử.
- [ ] **Task 7: DOM Action Script for Pinterest & LinkedIn**
  - **Description:** Định nghĩa cấu hình selector và fallback tự động cho Pinterest Pin Builder & LinkedIn Post Modal.
  - **Acceptance criteria:** Script điền đúng title, description, link và file đính kèm.
  - **Verification:** Chạy thử nghiệm tự động hóa với tab Pinterest test.
