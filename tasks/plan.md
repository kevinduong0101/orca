# Implementation Plan: ORCA 2.0 — Personal Marketing & Content Operating System

## Overview

Dựa trên báo cáo nghiên cứu kiến trúc chuyên sâu (`ChatGPT_Nghiên-cứu-kiến-trúc-Orca_20261103-1248.md`) và yêu cầu cụ thể của Kevin Duong, Orca được nâng cấp từ một Local Agent Chat & Automation thành **ORCA 2.0 — Personal Marketing & Content Operating System**.
Hệ thống này đóng vai trò như một **Marketing Director & Autonomous Content Hub**, cho phép điều hành đa kênh (Instagram & Threads, Pinterest, LinkedIn, Website / Blog Photography) trên một giao diện trung tâm duy nhất, có lịch biên tập trực quan, luồng duyệt nội dung (Human-in-the-loop), và các automation thông minh.

---

## Architecture Decisions

1. **Orca Control Center (Giao diện trung tâm):**
   - Tích hợp thêm section điều hành chuyên biệt vào Orca Sidebar (`Marketing / Content OS`).
   - Cung cấp 5 phân hệ cốt lõi: **Overview Dashboard**, **Content Calendar**, **Content Studio**, **Approvals**, và **Automations**.

2. **Channel Agent Architecture (4 Agent chuyên trách):**
   - **Social Agent (Instagram & Threads):** Lập kế hoạch tuần, viết caption, visual storytelling, reels/carousel/stories prompts.
   - **Pinterest Growth Agent:** Visual SEO, tạo Pin variants từ kho ảnh & bài blog, quản lý Boards, gắn backlink về website.
   - **LinkedIn Professional Agent:** Bài viết chuyên sâu, chia sẻ kiến thức, bài học thực tế, xây dựng personal brand uy tín.
   - **Website & Blog Agent:** Nghiên cứu từ khoá, viết bài blog chuẩn SEO cho Kevin Duong Photography / linear thinking, internal linking, tối ưu hình ảnh.

3. **Multi-Channel Repurposing Engine (1 Ý tưởng → Đa kênh):**
   - 1 bài viết blog hoặc 1 concept ảnh có thể tự động phái sinh ra: 1 Instagram Carousel + 2 Threads Posts + 3 Pinterest Pins + 1 LinkedIn Post.
   - Mỗi kênh có phiên bản ngôn ngữ và định dạng riêng biệt, không copy nguyên văn.

4. **Human-in-the-loop Approval & Publishing Bridge:**
   - Trạng thái rõ ràng: `Draft` → `Needs Review` → `Approved / Scheduled` → `Published`.
   - Adapter kiến trúc mở: Tương thích với Metricool API / headless social posting hoặc Webhook/Local scheduler.

5. **Task Orchestration & Memory Enhancement:**
   - Nâng cấp cơ chế `Steer`: Tự động lưu checkpoint ngữ cảnh trước khi bẻ lái thay vì làm mất toàn bộ tiến trình.
   - Cơ chế `Queue`: Tự động kết nối chuỗi bài viết trong hàng đợi.

---

## Task List

### Phase 1: Foundation — Marketing Navigation & Overview Dashboard

- [ ] **Task 1: Marketing Workspace Navigation & View State Router**
- [ ] **Task 2: Marketing Overview Dashboard (KPIs, Channel Health, Recommendations)**
- [ ] **Checkpoint 1: Foundation & Overview Display Verified**

### Phase 2: Content Calendar & Content Studio (Trọng tâm)

- [ ] **Task 3: Unified Content Calendar (Month / Week / List view & Channel Filter)**
- [ ] **Task 4: Content Studio & Platform Post Preview (IG, Threads, Pinterest, LinkedIn)**
- [ ] **Task 5: Human-in-the-loop Approvals & Publishing State Machine**
- [ ] **Checkpoint 2: Content Creation, Preview & Approval Flow Verified**

### Phase 3: Specialized Channel Agents & Repurposing Pipeline

- [ ] **Task 6: 4 Channel Agent Personas & Prompt Generators**
- [ ] **Task 7: Blog-to-Social Multi-Channel Repurposing Generator**
- [ ] **Checkpoint 3: Agent Output & Multi-Channel Generation Verified**

### Phase 4: Smart Marketing Automations & Task Checkpoint

- [ ] **Task 8: 5 Marketing Automation Templates in Orca Automations**
- [ ] **Task 9: Checkpointed Steer & Context Persistence in Native Chat**
- [ ] **Checkpoint 4: End-to-end Marketing & Automation Loop Verified**

---

## Risks and Mitigations

| Risk                                                                                                            | Impact | Mitigation                                                                                                                                                                                |
| :-------------------------------------------------------------------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Limit & Social Token Expiry:** Các mạng xã hội (Meta, Pinterest) có token hạn ngắn và kiểm duyệt khắt khe | High   | Thiết kế kiến trúc Approval & Adapter: Orca chuẩn bị sẵn nội dung + preview hoàn hảo, hỗ trợ xuất sang Metricool hoặc Webhook, không phụ thuộc vào việc login account trực tiếp trong app |
| **Quá tải giao diện (UI Clutter):** Quá nhiều kênh và bảng biểu làm app bị rối                                  | Medium | Áp dụng thiết kế Minimalist Dark/Light Marketing Workspace: Thẻ kênh gọn gàng, thanh lọc linh hoạt, chỉ hiện thông tin quan trọng nhất                                                    |
| **Chi phí Token khi chạy đa kênh:** Agent phân tích đồng thời nhiều kênh tiêu tốn token                         | Medium | Deterministic Pre-filtering: Sử dụng quy tắc deterministic và rule-based template trước, chỉ gọi model Antigravity cho khâu sáng tạo nội dung                                             |

---

## Open Questions

1. Bạn muốn ưu tiên triển khai ngay giao diện **Content Calendar & Overview Dashboard** trực tiếp trong Orca trước, hay tạo các **Template Automation** chuyên trách từng kênh vào Automations Center trước?
2. Trong 4 kênh (Instagram/Threads, Pinterest, LinkedIn, Website Blog), kênh nào bạn cần tạo nội dung và lên lịch thường xuyên nhất mỗi ngày?
