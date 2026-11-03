# Implementation Plan: Orca Native Browser Automation for Pinterest & LinkedIn Marketing

## Overview

Xây dựng và tích hợp hệ sinh thái tự động hóa đăng bài và tìm kiếm khách hàng tiềm năng cho Pinterest & LinkedIn chạy hoàn toàn bên trong trình duyệt nội bộ của Orca (Electron Webview với persistent profile `persist:orca-browser`). Điều này đảm bảo AI Agent có thể truy cập, tương tác, upload media và đăng bài mà không cần mở hoặc chiếm dụng trình duyệt ngoài (Chrome/Safari) của người dùng.

## Architecture Decisions

- **Trình duyệt nội bộ (Orca Browser Workspace):** Sử dụng trực tiếp `useAppStore.getState().createBrowserTab(worktreeId, url, { activate: true })` và `setActiveTabType("browser", worktreeId)`.
- **Lưu phiên đăng nhập bền vững (Persistent Session):** Webview của Orca được gắn partition `persist:orca-browser`, lưu trữ cookie, localStorage và token đăng nhập của Pinterest & LinkedIn an toàn, không bao giờ bị logout khi tắt app.
- **Tự động hóa Agent không can thiệp màn hình ngoài (Headless / Internal Automation):** Sử dụng bộ lệnh CLI `orca tab`, `orca snapshot`, `orca click`, `orca fill` để AI đọc accessibility tree và thao tác form trên tab nội bộ mà không di chuyển chuột máy tính của user.
- **Skill Transparency & Visibility:** Orca Native Chat tự động phân tích và gắn nhãn Huy hiệu hoạt động `⚡ Skill Active: [tên skill]` ngay trên tin nhắn khi người dùng gọi bất kỳ slash command hoặc chọn skill từ menu.

## Task List

### Phase 1: Skill Visibility & Native Chat Badge

- [x] Task 1: Thêm type definition `skills` và projection từ journal item vào `NativeChatMessage`.
- [x] Task 2: Cập nhật `NativeChatUserMessageRow.tsx` để tự động phát hiện slash commands / skills và render Huy hiệu `⚡ Skill Active: {name}`.
- [x] Task 3: Thêm vitest suite trong `NativeChatMessageRow.test.tsx` xác nhận hiển thị badge skill cho cả inline text và journal skills array.

### Checkpoint: Skill Visibility

- [x] Tất cả 21 bài test trong `NativeChatMessageRow.test.tsx` vượt qua 100%.
- [x] Oxlint 0 warnings, 0 errors, file < 400 dòng.

### Phase 2: Orca Internal Browser Session Profiles

- [x] Task 4: Chuyển đổi `handleOpenBrowserSession` trong `MarketingSettingsTab.tsx` từ `window.open` ngoại vi sang `createBrowserTab` nội bộ Orca.
- [x] Task 5: Tách `MarketingBackupSettingsCard.tsx` để đảm bảo `MarketingSettingsTab.tsx` tuân thủ nghiêm ngặt giới hạn $\le$ 400 dòng của Orca ESLint.

### Phase 3: Browser Automation Action Controller

- [x] Task 6: Bổ sung hành động "Publish via Orca Browser" trong Content Studio và Approvals Center cho kênh Pinterest & LinkedIn.
- [x] Task 7: Tạo kịch bản tự động hóa DOM bằng `orca snapshot` và form fill cho bài đăng Pinterest (Title, Board, 2:3 Pin, Link về kevinduong.com) và bài viết LinkedIn.

### Checkpoint: Complete

- [ ] End-to-end flow chạy trơn tru trong tab nội bộ Orca.
- [ ] Trình duyệt ngoài macOS không bị ảnh hưởng.
