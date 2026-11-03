# Kế Hoạch Triển Khai: Điều Khiển Trình Duyệt Nội Bộ Orca Cho Pinterest & LinkedIn

## 1. Mục Tiêu & Bản Chất Nhu Cầu

- **Vấn đề của User:** Tránh việc AI hay script mở trình duyệt bên ngoài hệ điều hành (Chrome/Safari) làm gián đoạn công việc cá nhân.
- **Giải pháp:** Sử dụng toàn bộ hệ thống **Embedded Browser (Electron Webview)** và cơ chế tự động hóa **Orca Browser Engine (orca tab

Usage: orca tab <command> [options]

Commands:
list List open browser tabs
show Show one browser tab by page id
current Show the current browser tab
switch Switch the active browser tab
create Create a new browser tab in the current worktree
profile list List browser session profiles available to browser tabs
profile create Create a browser session profile for browser tabs
profile delete Delete a browser session profile used by browser tabs
profile set Switch a browser tab to a different browser profile
profile show Show the browser profile bound to a tab
profile use-default Switch a browser tab back to the default browser profile
profile clone Clone a browser tab into a different browser profile
close Close a browser tab

Run `orca tab <command> --help` for command-specific usage., page: 34ca44eb-54f8-4245-abed-bf4d052f5b5a
Google — https://www.google.com/

- generic
  - generic
    - navigation
      - generic
        - link "Gmail " [ref=e12]
          - StaticText "Gmail"
        - link "Tìm kiếm hình ảnh " [ref=e13]
          - StaticText "Hình ảnh"
      - button "Các ứng dụng của Google" [expanded=false, ref=e14]
      - link "Đăng nhập" [ref=e8]
        - StaticText "Đăng nhập"
    - image "Google"
    - search
      - generic
        - generic
          - combobox "Tìm kiếm" [expanded=false, ref=e15]
          - button "Công cụ nhập" [ref=e16]
          - button "Tìm kiếm bằng giọng nói" [ref=e17]
          - button "Tìm kiếm bằng hình ảnh" [ref=e18]
          - link "Chế độ AI" [ref=e19]
            - generic
            - generic
              - StaticText "Chế độ AI"
        - generic
          - button "Tìm trên Google" [ref=e20]
          - button "Xem trang đầu tiên tìm được" [ref=e21]
    - generic
      - StaticText "Google hỗ trợ các ngôn ngữ: "
      - link "English" [ref=e9]
      - link "Français" [ref=e10]
      - link "繁體中文" [ref=e11]
    - contentinfo
      - StaticText "Việt Nam"
      - link "Giới thiệu" [ref=e1]
      - link "Quảng cáo" [ref=e2]
      - link "Doanh nghiệp" [ref=e3]
      - link "Cách hoạt động của Tìm kiếm" [ref=e4]
      - link "Quyền riêng tư" [ref=e5]
      - link "Điều khoản" [ref=e6]
      - button "Cài đặt" [expanded=false, ref=e7]
        - StaticText "Cài đặt", , , )** tích hợp sẵn ngay bên trong Orca.
- **Lợi ích:**
  1. Profile/Cookies được lưu bền vững trong partition nội bộ của Orca ().
  2. Bạn đăng nhập Pinterest & LinkedIn trực tiếp trong 1 tab của Orca, hoàn toàn độc lập với Chrome/Safari ngoài máy.
  3. AI Agent có thể truy cập accessibility tree, đọc DOM, upload ảnh 2:3, đăng bài tự động mà bạn không bị nhảy cửa sổ ra ngoài màn hình.

---

## 2. Kiến Trúc & Luồng Thực Thi (Workflow)

---

## 3. Các Bước Triển Khai Cụ Thể (Phased Breakdown)

### Phase 1: Nâng cấp Settings Tab để mở tab Browser nội bộ Orca

- **File:**
- **Thay đổi:**
  - Thay vì gọi (mở trình duyệt mặc định bên ngoài máy macOS), chuyển sang dùng và .
  - Tạo tab browser nội bộ có nhãn rõ ràng: và .
  - Hiển thị hướng dẫn trực quan: _"Đăng nhập tài khoản ngay trong tab này. Orca lưu session riêng biệt và AI sẽ điều khiển tab này trong ứng dụng."_

### Phase 2: Tích hợp Trình Điều Khiển Tự Động Hóa Nội Bộ (Internal Browser Automation Controller)

- **File:** hoặc tương đương trong renderer/main.
- **Cơ chế:**
  - Hỗ trợ gọi các lệnh tự động hóa nội bộ của Orca (orca tab

Usage: orca tab <command> [options]

Commands:
list List open browser tabs
show Show one browser tab by page id
current Show the current browser tab
switch Switch the active browser tab
create Create a new browser tab in the current worktree
profile list List browser session profiles available to browser tabs
profile create Create a browser session profile for browser tabs
profile delete Delete a browser session profile used by browser tabs
profile set Switch a browser tab to a different browser profile
profile show Show the browser profile bound to a tab
profile use-default Switch a browser tab back to the default browser profile
profile clone Clone a browser tab into a different browser profile
close Close a browser tab

Run `orca tab <command> --help` for command-specific usage., , page: 34ca44eb-54f8-4245-abed-bf4d052f5b5a
Google — https://www.google.com/

- generic
  - generic
    - navigation
      - generic
        - link "Gmail " [ref=e12]
          - StaticText "Gmail"
        - link "Tìm kiếm hình ảnh " [ref=e13]
          - StaticText "Hình ảnh"
      - button "Các ứng dụng của Google" [expanded=false, ref=e14]
      - link "Đăng nhập" [ref=e8]
        - StaticText "Đăng nhập"
    - image "Google"
    - search
      - generic
        - generic
          - combobox "Tìm kiếm" [expanded=false, ref=e15]
          - button "Công cụ nhập" [ref=e16]
          - button "Tìm kiếm bằng giọng nói" [ref=e17]
          - button "Tìm kiếm bằng hình ảnh" [ref=e18]
          - link "Chế độ AI" [ref=e19]
            - generic
            - generic
              - StaticText "Chế độ AI"
        - generic
          - button "Tìm trên Google" [ref=e20]
          - button "Xem trang đầu tiên tìm được" [ref=e21]
    - generic
      - StaticText "Google hỗ trợ các ngôn ngữ: "
      - link "English" [ref=e9]
      - link "Français" [ref=e10]
      - link "繁體中文" [ref=e11]
    - contentinfo
      - StaticText "Việt Nam"
      - link "Giới thiệu" [ref=e1]
      - link "Quảng cáo" [ref=e2]
      - link "Doanh nghiệp" [ref=e3]
      - link "Cách hoạt động của Tìm kiếm" [ref=e4]
      - link "Quyền riêng tư" [ref=e5]
      - link "Điều khoản" [ref=e6]
      - button "Cài đặt" [expanded=false, ref=e7]
        - StaticText "Cài đặt", , , ).
  - Lập trình kịch bản đăng bài tự động:
    - **Pinterest:** Điều hướng đến , điền Title, Description, Link về , chọn Board, bấm Publish.
    - **LinkedIn:** Điều hướng đến , mở modal soạn thảo bài viết, dán nội dung narrative theo 4 trụ cột, bấm Post.

### Phase 3: Thêm Nút "Run AI Automation in Orca Browser" Trong Studio & Approvals

- Trong **ContentStudioModal** và **ApprovalsCenter**:
  - Khi duyệt bài cho Pinterest hoặc LinkedIn, có nút hành động: **"Publish via Orca Browser"**.
  - AI kích hoạt tab nội bộ và thực hiện đăng bài tự động trong nền mà không hề chiếm quyền điều khiển chuột hay trình duyệt ngoài của bạn.

### Phase 4: Kiểm Thử & Triển Khai

- Chạy toàn diện (đảm bảo 0 warnings, 0 errors, file $\le$ 400 dòng).
- Build , pack và copy vào .
