# ORCA 2.0 Task List & Progress Tracker

## Phase 1: Foundation — Marketing Navigation & Overview Dashboard

### Task 1: Marketing Workspace Navigation & View State Router

**Description:** Bổ sung mục điều hướng "Marketing OS" vào thanh Sidebar chính của Orca và tạo router chuyển đổi giữa các tab: Overview, Content Calendar, Content Studio, Approvals.
**Acceptance criteria:**

- [ ] Sidebar hiển thị mục `Marketing OS` với icon sang trọng, đồng bộ dark theme.
- [ ] Nhấp vào `Marketing OS` mở đúng layout làm việc chính mà không làm ảnh hưởng đến Native Chat hay Automations hiện tại.
- [ ] Có thanh sub-tabs linh hoạt: Overview, Calendar, Studio, Approvals.
      **Verification:**
- [ ] Build Orca UI thành công (`npm run build`).
- [ ] Kiểm tra chuyển đổi các tabs mượt mà, không giật lag.
      **Dependencies:** None
      **Files likely touched:**
- `src/renderer/src/components/sidebar/sidebar.tsx`
- `src/renderer/src/components/marketing/MarketingWorkspace.tsx`
- `src/renderer/src/components/marketing/marketing-tabs.ts`
  **Estimated scope:** M (3 files)

---

### Task 2: Marketing Overview Dashboard (KPIs, Channel Health, Recommendations)

**Description:** Xây dựng màn hình tổng quan (Overview) hiển thị sức khỏe đa kênh, số lượng bài viết đang chờ duyệt, lịch tuần tới và Orca Smart Recommendations widget.
**Acceptance criteria:**

- [ ] Thẻ 4 kênh chính (Instagram & Threads, Pinterest, LinkedIn, Website / Blog) với chỉ số hoạt động và trạng thái Agent (Active / Idle / Error).
- [ ] Widget "Orca AI Recommendations": Gợi ý thông minh (ví dụ: thiếu bài Pinterest tuần này, blog mới chưa share LinkedIn).
- [ ] Thanh tóm tắt nhanh: Total Posts This Week, Awaiting Approval, Scheduled, Active Automations.
      **Verification:**
- [ ] Render các chỉ số chuẩn xác với sample data chân thực của Kevin Duong Photography.
- [ ] Responsive grid đẹp mắt trên màn hình MacBook.
      **Dependencies:** Task 1
      **Files likely touched:**
- `src/renderer/src/components/marketing/MarketingOverview.tsx`
- `src/renderer/src/components/marketing/ChannelHealthCard.tsx`
- `src/renderer/src/components/marketing/OrcaRecommendationsWidget.tsx`
  **Estimated scope:** M (3 files)

---

## Checkpoint 1: Foundation & Overview Display

- [x] Navigation sidebar chuyển vào Marketing OS hoạt động mượt mà.
- [x] Màn hình Overview hiển thị đầy đủ thẻ 4 kênh và các chỉ số trực quan.
- [x] Ứng dụng build sạch, không lỗi TypeScript hay Tailwind.

---

## Phase 2: Content Calendar & Content Studio (Trọng tâm)

### Task 3: Unified Content Calendar (Month / Week / List view & Channel Filter)

**Description:** Xây dựng lịch nội dung tập trung cho phép xem toàn bộ kế hoạch bài đăng của tất cả các kênh theo chế độ Tháng, Tuần, và Danh sách, hỗ trợ lọc theo nền tảng.
**Acceptance criteria:**

- [ ] Switcher 3 chế độ xem: `Week View` (mặc định), `Month View`, và `List View`.
- [ ] Filter theo kênh: `All Channels`, `Instagram`, `Threads`, `Pinterest`, `LinkedIn`, `Website`.
- [ ] Màu sắc và badge nhận diện riêng cho từng nền tảng (Instagram: gradient tím hồng, Pinterest: đỏ, LinkedIn: xanh dương, Website: emerald).
- [ ] Click vào bài viết mở cửa sổ xem chi tiết và chỉnh sửa.
      **Verification:**
- [ ] Test chuyển đổi giữa tuần/tháng/danh sách với dữ liệu mẫu bài đăng.
- [ ] Filter hoạt động tức thì, ẩn hiện bài viết chính xác.
      **Dependencies:** Task 1
      **Files likely touched:**
- `src/renderer/src/components/marketing/calendar/ContentCalendar.tsx`
- `src/renderer/src/components/marketing/calendar/CalendarWeekView.tsx`
- `src/renderer/src/components/marketing/calendar/CalendarMonthView.tsx`
- `src/renderer/src/components/marketing/calendar/CalendarFilterBar.tsx`
  **Estimated scope:** M (4 files)

---

### Task 4: Content Studio & Platform Post Preview (IG, Threads, Pinterest, LinkedIn)

**Description:** Xây dựng Content Studio cho phép soạn thảo hoặc chỉnh sửa bài viết do AI tạo ra, với live preview sát với giao diện thực tế của từng mạng xã hội.
**Acceptance criteria:**

- [ ] Trình xem trước chân thực (Live Preview Frame) cho:
  - Instagram Post / Carousel (khung ảnh vuông/dọc + caption + hashtags).
  - Threads Post (avatar, bubble chat, character counter).
  - Pinterest Pin (ảnh dọc 2:3, board selector, destination link).
  - LinkedIn Post (avatar chuyên nghiệp, formatting, "see more" preview).
- [ ] Trình soạn thảo cho phép tinh chỉnh nhanh caption, hashtag, và ảnh đính kèm.
      **Verification:**
- [ ] Preview hiển thị chuẩn xác tỉ lệ khung hình và font chữ tương ứng từng nền tảng.
- [ ] Sửa caption bên trái, live preview bên phải cập nhật theo thời gian thực.
      **Dependencies:** Task 3
      **Files likely touched:**
- `src/renderer/src/components/marketing/studio/ContentStudioModal.tsx`
- `src/renderer/src/components/marketing/studio/previews/InstagramPreview.tsx`
- `src/renderer/src/components/marketing/studio/previews/ThreadsPreview.tsx`
- `src/renderer/src/components/marketing/studio/previews/PinterestPreview.tsx`
- `src/renderer/src/components/marketing/studio/previews/LinkedInPreview.tsx`
  **Estimated scope:** L (5 files)

---

### Task 5: Human-in-the-loop Approvals & Publishing State Machine

**Description:** Xây dựng trung tâm duyệt bài (Approvals Center) để bạn kiểm soát và bấm duyệt trước khi đăng bài, với các nút thao tác `Approve`, `Request Re-write`, `Schedule`, `Reject`.
**Acceptance criteria:**

- [ ] Tab Approvals liệt kê các bài ở trạng thái `Needs Review` kèm lý do và kênh đăng.
- [ ] Thao tác 1-click Approve hoặc gửi lại yêu cầu chỉnh sửa cho Agent kèm chỉ dẫn ngắn.
- [ ] Bộ đếm số lượng bài chờ duyệt hiển thị ngay badge trên Sidebar / Tab header.
      **Verification:**
- [ ] Duyệt bài chuyển trạng thái từ `Needs Review` sang `Scheduled`.
- [ ] Badge số lượng bài chờ duyệt tự động giảm ngay lập tức.
      **Dependencies:** Task 4
      **Files likely touched:**
- `src/renderer/src/components/marketing/approvals/ApprovalsCenter.tsx`
- `src/renderer/src/components/marketing/approvals/ApprovalCard.tsx`
- `src/renderer/src/components/marketing/types/marketing-types.ts`
  **Estimated scope:** S (3 files)

---

## Checkpoint 2: Content Creation, Preview & Approval Flow

- [ ] Lịch bài đăng hiển thị mượt mà trên cả 3 view.
- [ ] Live preview các nền tảng (IG, Threads, Pinterest, LinkedIn) hiển thị chuẩn đẹp.
- [ ] Luồng duyệt bài (Approve / Reject / Schedule) hoạt động chính xác.

---

## Phase 3: Specialized Channel Agents & Repurposing Pipeline

### Task 6: 4 Channel Agent Personas & Prompts

**Description:** Định nghĩa cấu hình, brand voice, persona và system prompt cho 4 Agent chuyên trách trong Orca.
**Acceptance criteria:**

- [ ] Instagram & Threads Agent: Tone giọng hấp dẫn, chú trọng visual storytelling, hashtags phù hợp.
- [ ] Pinterest Agent: Chuyên gia Visual SEO, tối ưu keyword tìm kiếm, mô tả chuẩn evergreen, gắn link portfolio.
- [ ] LinkedIn Agent: Chuyên gia thương hiệu cá nhân, tone giọng chuyên nghiệp, insightful, bài học kinh doanh/nhiếp ảnh.
- [ ] Website Blog Agent: Chuyên gia Content & SEO, cấu trúc bài viết H1/H2/H3 rõ ràng cho Kevin Duong Photography.
      **Verification:**
- [ ] Kiểm tra output sinh nội dung của từng agent thể hiện rõ phong cách riêng biệt, không bị trùng lặp văn phong.
      **Dependencies:** Task 5
      **Files likely touched:**
- `src/main/marketing-agents/channel-agent-registry.ts`
- `src/main/marketing-agents/prompts/instagram-threads-agent.ts`
- `src/main/marketing-agents/prompts/pinterest-agent.ts`
- `src/main/marketing-agents/prompts/linkedin-agent.ts`
- `src/main/marketing-agents/prompts/website-blog-agent.ts`
  **Estimated scope:** M (5 files)

---

### Task 7: Blog-to-Social Multi-Channel Repurposing Generator

**Description:** Tạo pipeline biến 1 bài viết blog hoặc 1 concept dự án ảnh thành toàn bộ gói truyền thông đa kênh cùng một lúc.
**Acceptance criteria:**

- [ ] Input: URL bài viết hoặc đoạn văn bản tóm tắt nội dung blog / bộ ảnh.
- [ ] Output: Tự động phân chia 1 Instagram Carousel + 2 Threads posts + 3 Pinterest Pins + 1 LinkedIn Post vào Lịch ở trạng thái `Draft / Needs Review`.
      **Verification:**
- [ ] Chạy thử nghiệm với 1 bài blog mẫu, kiểm tra 4 kênh đều nhận được bài nháp tương ứng trên Lịch.
      **Dependencies:** Task 6
      **Files likely touched:**
- `src/renderer/src/components/marketing/repurposing/RepurposingWizard.tsx`
- `src/renderer/src/components/marketing/repurposing/use-repurposing-pipeline.ts`
  **Estimated scope:** S (2 files)

---

## Phase 4: Smart Marketing Automations & Task Checkpoint

### Task 8: 5 Marketing Automation Templates in Orca Automations

**Description:** Tích hợp 5 starter templates chuyên dụng cho marketing vào tab Templates của Orca Automations Center.
**Acceptance criteria:**

- [ ] Template 1: Weekly Content Planner (Thứ Hai 08:00 - Lên kế hoạch 7 ngày).
- [ ] Template 2: Pinterest Evergreen Publisher (Hàng ngày 11:30 - Tự tạo 2-3 Pin từ thư viện).
- [ ] Template 3: LinkedIn Weekly Thought Leadership (Thứ Năm 09:00 - Bài học nghề nghiệp & case study).
- [ ] Template 4: Blog-to-Social Multi-Channel Sync (Kích hoạt khi có bài viết mới).
- [ ] Template 5: Sunday Content Performance Review (Chủ nhật 18:00 - Tổng kết số liệu và đề xuất).
      **Verification:**
- [ ] Mở tab Templates trong Automations thấy 5 template mới, bấm "Use Template" tự điền sẵn form chuẩn xác.
      **Dependencies:** Task 6
      **Files likely touched:**
- `src/renderer/src/components/automations/automation-templates.ts`
  **Estimated scope:** S (1 file)

---

### Task 9: Checkpointed Steer & Context Persistence in Native Chat

**Description:** Nâng cấp cơ chế `Steer`: Khi người dùng bấm `Cmd + Enter` để bẻ lái, Orca lưu lại bản ghi nhớ (checkpoint) về những gì đã làm được và các quyết định vừa đưa ra vào task context, giúp Agent không bị mất sạch trí nhớ ngắn hạn.
**Acceptance criteria:**

- [ ] Khi ngắt lệnh bằng Steer, session journal ghi nhận checkpoint trạng thái gần nhất.
- [ ] Turn mới được cấp thêm tóm tắt checkpoint ngắn gọn để tiếp tục liền mạch với yêu cầu mới.
      **Verification:**
- [ ] Thử nghiệm Steer trong lúc Agent đang chạy, kiểm tra turn tiếp theo nhận thức được các file đã sửa trước đó.
      **Dependencies:** Task 1
      **Files likely touched:**
- `src/main/acp/acp-structured-turns.ts`
- `src/main/native-chat/agent-session-journal/journal-dispatch-reducer.ts`
  **Estimated scope:** S (2 files)

---

## Checkpoint 4: Complete System Verification

- [ ] Toàn bộ luồng từ Automation → Agent sinh bài → Lịch biên tập → Live Preview → Duyệt bài hoạt động mượt mà.
- [ ] Đóng gói và cập nhật bản build hoàn chỉnh vào `/Applications/Orca.app`.
