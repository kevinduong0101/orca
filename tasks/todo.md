# Task List: Autonomous Continuous Learning Engine

- [x] **Task 1: Type Definitions for Learning Engine**
  - Mở rộng `marketing-types.ts` với `MarketInsight`, `AgentLearnedRule`, `PostPerformanceAudit`.
- [x] **Task 2: Agent Learning Engine Service**
  - Tạo `agent-learning-engine.ts` với bộ nhớ lưu trữ localStorage và thuật toán điều chỉnh điểm tin cậy.
- [x] **Task 3: Autonomous Market Intelligence Service**
  - Tạo `market-intelligence-service.ts` phục vụ quét và trích xuất mẫu bài top viral.
- [x] **Task 4: Post-Publish Audit & Reflection Engine**
  - Tạo `performance-reflection-engine.ts` tự động mổ xẻ nguyên nhân thành công/thất bại và đề xuất xoay trục.
- [x] **Task 5: Agent Brain UI Components**
  - Tạo `AgentBrainTab.tsx` và `AgentAuditLedgerCard.tsx` với đầy đủ thống kê và nút kích hoạt vòng lặp.
- [x] **Task 6: Workspace & Hook Integration**
  - Tích hợp vào `MarketingWorkspace.tsx` và `use-marketing-data.ts`.
- [x] **Task 7: Visual Feedback in Approvals & Calendar**
  - Thêm badge chiến lược trong `ApprovalsCenter.tsx` và nhãn kết quả tương tác trong `ContentCalendarCard.tsx`.
- [x] **Task 8: File Length & ESLint Gate**
  - Tách `ContentCalendarMonthView.tsx`, đảm bảo 100% files $\le$ 400 dòng và 0 lỗi oxlint.
- [ ] **Task 9: Build & Deployment**
  - Chạy `build:electron-vite`, đóng gói `app.asar` và cập nhật vào `/Applications/Orca.app`.
