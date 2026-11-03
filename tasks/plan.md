# Implementation Plan: Orca Autonomous Continuous Self-Learning & Feedback Engine

## Overview

Xây dựng và tích hợp hệ sinh thái AI Tự Học Hỏi & Vòng Lặp Phản Tư Thích Ứng Mỗi Ngày (Continuous Autonomous Self-Learning & Feedback Loop) vào Orca Marketing OS:

1. **Tự động khảo sát & học hỏi bài viral (Inbound Intelligence):** Quét các mẫu bài top-performing trên Pinterest & LinkedIn, trích xuất công thức (Visual Ratio 2:3, Emotional Hook, Pricing Transparency, Soft CTA).
2. **Sáng tạo bài theo Giả thuyết (Hypothesis-Driven):** Gắn thẻ giả thuyết học hỏi vào từng bài đăng trong pipeline.
3. **Vòng lặp kiểm tra 24h-48h & Tự phản tư (Post-Publish Audit & Reflection):** Đọc tương tác thực tế:
   - Bài tương tác tốt (High performing): Tăng điểm tin cậy (+8%), lưu vào _Validated Playbook_.
   - Bài kém tương tác (Low engagement): Kích hoạt _AI Reflection_, tự mổ xẻ nguyên nhân và xoay trục (_Actionable Pivot_) cho bài tiếp theo.
4. **Trung tâm Điều Khiển Bộ Não AI (Agent Brain Tab):** Dashboard hiển thị Playbook quy tắc, kho tri thức bài viral, và sổ cái tự phản tư 48h.

## Task List

### Phase 1: Mở rộng Data Models & Memory Store

- [x] Task 1: Mở rộng `marketing-types.ts` (Thêm tab `brain`, `MarketInsight`, `AgentLearnedRule`, `PostPerformanceAudit`, `hypothesis`).
- [x] Task 2: Xây dựng `agent-learning-engine.ts` quản lý bộ nhớ kinh nghiệm và điều chỉnh trọng số điểm tin cậy.

### Phase 2: Logic Tự Động Khảo Sát & Phản Tư

- [x] Task 3: Xây dựng `market-intelligence-service.ts` quét và hấp thu các mẫu bài viral mới nhất.
- [x] Task 4: Xây dựng `performance-reflection-engine.ts` tự động chấm điểm, tạo reflection và actionable pivot sau 48h.

### Phase 3: Giao Diện "Agent Brain" & Tích Hợp Hệ Thống

- [x] Task 5: Tạo giao diện `AgentBrainTab.tsx` & `AgentAuditLedgerCard.tsx`.
- [x] Task 6: Tích hợp tab `🧠 Agent Brain` vào `MarketingWorkspace.tsx` và kết nối `useMarketingData`.
- [x] Task 7: Hiển thị badge Giả thuyết học hỏi trong `ApprovalsCenter.tsx` và huy hiệu Audit tương tác trong `ContentCalendarCard.tsx`.
- [x] Task 8: Tách `ContentCalendarMonthView.tsx` để giữ toàn bộ các file $\le$ 400 dòng chuẩn ESLint.

### Phase 4: Kiểm Thử, Build & Triển Khai

- [x] Toàn bộ 29 files trong Marketing OS đạt 0 warnings, 0 errors trên `oxlint`.
- [ ] Build `build:electron-vite` và cập nhật vào `/Applications/Orca.app`.
- [ ] Git commit lên nhánh `main`.
