# CHECKPOINT & CONTEXT HANDOVER CHO CÁC AI AGENT KHÁC

> **Mục đích:** Tài liệu này đóng vai trò là **"Sổ tay bàn giao kiến trúc & Checkpoint"**. Bất kỳ AI nào (Claude, ChatGPT, Cursor, Gemini, Copilot...) hoặc lập trình viên mới khi tiếp quản dự án này **CHỈ CẦN ĐỌC FILE NÀY** là có thể nắm bắt 100% ngữ cảnh, vị trí file, quy tắc an toàn, và tiếp tục phát triển mà không phải quét (scan) lại toàn bộ hàng nghìn file mã nguồn!

---

## 📌 1. Thông tin chung về Repo & Nhánh Git

* **Repository:** `orca` (custom fork của Kevin Duong).
* **Nhánh làm việc chính:** `custom-main` (tracking `fork/custom-main`).
* **Quy chuẩn mã nguồn bắt buộc:**
  * Linter: `oxlint` (Phải đạt **0 warnings, 0 errors** trước khi commit).
  * Quy định số dòng: Mỗi file `.ts` tối đa **300 dòng**, file `.tsx` tối đa **400 dòng** (kiểm tra bằng `node config/scripts/check-max-lines-ratchet.mjs`). Tuyệt đối không thêm bypass trái phép.
  * Giữ nguyên bình luận và các logic hiện hữu của Orca upstream.

---

## 🏗️ 2. Bản đồ Kiến trúc tính năng Đa Tài Khoản & Auto-Failover

Hệ thống quản lý đa tài khoản & chống cạn Quota (429) được xây dựng theo mô hình 4 tầng tách biệt rõ ràng:

### 🔹 Tầng 1: Kiểu dữ liệu dùng chung (Shared Domain Types)
* [`src/shared/account-profile-types.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/shared/account-profile-types.ts)
  * `AccountProfile`: Cấu trúc tài khoản (id, name, email, provider, partitionId, authKind, quotaStatus, rateLimitCount, lastUsedAt).
  * `AccountFailoverConfig`: Cấu hình failover (enabled, strategy: 'round-robin', cooldownMinutes: 15, crossProviderFallback: true, safetyDelaySeconds: 3).
  * `AIProvider`: `'gemini' | 'chatgpt' | 'claude' | 'custom'`.

### 🔹 Tầng 2: State Management & Local Persistence (Renderer Store)
* [`src/renderer/src/store/slices/accounts/account-profiles-store.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/store/slices/accounts/account-profiles-store.ts)
  * Zustand Store quản lý danh sách `profiles`, tài khoản active theo từng hãng `activeAccountByProvider`, và cấu hình `failoverConfig`.
  * Hỗ trợ hàm `performAutoFailover(provider, currentAccountId)` tự động xoay vòng tài khoản khi gặp rate limit.
* [`src/renderer/src/store/slices/accounts/account-profiles-defaults.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/store/slices/accounts/account-profiles-defaults.ts)
  * Nơi tải và lưu LocalStorage (`STORAGE_KEY = 'kevin-studio:account-profiles'`).
  * **Lưu ý cốt lõi:** `DEFAULT_PROFILES = []`. Tuyệt đối không hardcode mock email hoặc dữ liệu giả lập ở đây! Bộ lọc tự động loại bỏ mọi profile rác khi khởi động.

### 🔹 Tầng 3: Đồng bộ với Hệ thống Thật (macOS Keychain & Native Services)
* [`src/renderer/src/components/native-chat/use-sync-native-accounts.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/native-chat/use-sync-native-accounts.ts)
  * **Tự động phát hiện tài khoản thật:** Gọi `callAntigravityAccounts('List')` lên tiến trình nền.
  * Đọc trực tiếp tài khoản Google đang đăng nhập trong macOS Keychain (`service: gemini, account: antigravity`), ví dụ `bykevinduong@gmail.com`.
  * Đồng bộ tự động cả tài khoản native của Codex và Claude từ `window.api`.

### 🔹 Tầng 4: Giao diện Người dùng (UI Components)
* [`src/renderer/src/components/native-chat/ChatAccountSwitcher.tsx`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/native-chat/ChatAccountSwitcher.tsx)
  * Nút chuyển tài khoản dạng Pill Glassmorphism ở góc dưới chân ô chat.
  * Hiệu ứng Aura thở (`animate-ping`) đổi màu: 🟢 Sẵn sàng / 🟡 Cooldown.
  * Icon theo hãng AI (✦ Gemini Sparkle, 🤖 ChatGPT Bot, 🗂️ Claude Layers).
  * Popover chia tab segmented control, hiển thị số tài khoản và cho phép chuyển đổi 1 chạm.
* [`src/renderer/src/components/native-chat/use-chat-account-oauth.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/native-chat/use-chat-account-oauth.ts)
  * Hook xử lý kích hoạt đăng nhập OAuth an toàn.
* [`src/renderer/src/components/settings/MultiAccountSettingsManager.tsx`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/settings/MultiAccountSettingsManager.tsx)
  * Bảng điều khiển quản lý tập trung trong Settings: bật/tắt Auto-failover, chuyển chéo hãng AI, quản lý thẻ tài khoản.
* [`src/renderer/src/components/settings/AntigravityAccountsSection.tsx`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/settings/AntigravityAccountsSection.tsx) & [`AntigravityAddAccountDialog.tsx`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/settings/AntigravityAddAccountDialog.tsx)
  * Khu vực quản lý tài khoản Antigravity chính quy, nút "+ Add Account" và modal hướng dẫn đăng nhập browser/CLI.

---

## ⌨️ 3. Phím tắt Hệ thống (`Cmd + ,` mở Settings)

Được kích hoạt thông qua 3 file điều hướng:
1. [`src/shared/keybindings/definitions-core-1.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/shared/keybindings/definitions-core-1.ts): `app.settings` gán mặc định `platformBindings(['Mod+Comma'])`.
2. [`src/renderer/src/app-shell/app-command-handlers.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/app-shell/app-command-handlers.ts): Đăng ký command handler `['app.settings', () => claim('app.settings', () => useAppStore.getState().openSettingsPage())]`.
3. [`src/renderer/src/app-shell/use-global-keybindings.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/app-shell/use-global-keybindings.ts): Bắt phím toàn cục `(input.metaKey || input.ctrlKey) && input.key === ','` đảm bảo luôn mở Settings ở mọi nơi.

---

## 🛡️ 4. Quy tắc An toàn Tuyệt đối (Không được vi phạm)

1. **Không tạo dữ liệu giả (No Mock Data):**
   * Tuyệt đối không sinh email giả mạo (`test@gmail.com`, `kevin.gemini...`).
   * Nếu chưa có tài khoản, hiển thị màn hình Empty State và dẫn hướng người dùng đăng nhập.
2. **Bảo vệ Điều khoản Dịch vụ Google / OpenAI (ToS & Rate Limit Protection):**
   * Khi gặp HTTP 429 (Quota Limit), tài khoản đó **bắt buộc phải nghỉ (cooldown) tối thiểu 15 phút**.
   * Khi chuyển sang tài khoản khác hoặc hãng khác, **bắt buộc có độ trễ an toàn tối thiểu 3 giây** (`safetyDelaySeconds = 3`) để tránh bị WAF / Cloudflare gắn cờ bot spam.
3. **Bảo vệ Thông tin Nhạy cảm (No Credential Leak):**
   * Không lưu access token thô trong LocalStorage. Chỉ lưu metadata profile; token đăng nhập thật được quản lý riêng qua Vault mã hóa của Electron (`safeStorage`) và macOS Keychain.

---

## 📝 5. Nhật ký các Commit quan trọng (Changelog Checkpoint)

| Commit Hash | Tóm tắt thay đổi |
| :--- | :--- |
| `d970bed` | **Auto-detect Active Account:** Hook `useSyncNativeAccounts` đọc tài khoản thật (`bykevinduong@gmail.com`) từ macOS Keychain vào UI. |
| `5e9d1ce` | **Security Cleanup:** Xóa sổ 100% mock data, fake emails, đảm bảo dữ liệu minh bạch và an toàn. |
| `8ea2f6c` | **UI/UX Redesign & Shortcut:** Thiết kế Pill glassmorphism, đèn LED breathing, icon branded, và kích hoạt `Cmd + ,`. |
| `0c87131` | **Zero-Risk Failover:** Thêm cơ chế chuyển đổi chéo hãng AI khi dính 429 kèm 3s delay và 15m cooldown. |
| `3f56200` | **Add Account Button:** Thêm nút "+ Add Account" và Dialog thêm tài khoản cho Antigravity tương đương Codex/Claude. |
| `26383f6` | **Settings Integration:** Đưa bảng quản lý đa tài khoản vào giao diện Settings chung. |

---

## 🚀 6. Hướng dẫn cho AI tiếp theo phát triển tiếp

* Nếu cần mở rộng tính năng mới (ví dụ: bổ sung thêm provider DeepSeek, Grok, Qwen):
  1. Thêm định danh vào `AIProvider` trong [`src/shared/account-profile-types.ts`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/shared/account-profile-types.ts).
  2. Bổ sung icon và tab trong [`ChatAccountSwitcher.tsx`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/native-chat/ChatAccountSwitcher.tsx) & [`MultiAccountSettingsManager.tsx`](file:///Users/kevinduong/orca/workspaces/orca/cod/src/renderer/src/components/settings/MultiAccountSettingsManager.tsx).
  3. Sau khi chỉnh sửa, luôn chạy:
     ```bash
     /Users/kevinduong/Documents/WORKPLACE/orca/node_modules/.bin/oxlint <các file đã sửa>
     node config/scripts/check-max-lines-ratchet.mjs
     ```
  4. Đảm bảo 0 warnings, 0 errors và commit với thông điệp rõ ràng theo chuẩn Conventional Commits.
