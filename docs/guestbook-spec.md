# 獨立留言板 Spec

## 目標

新增公開的 `/guestbook` 頁面，讓訪客不登入即可留下名字與留言，並能選填 Email、回覆既有留言。文章頁維持原本 Giscus，不共用留言板資料。

## 使用者流程

1. 訪客從導覽列進入 `Guestbook`。
2. 頁面顯示公開留言串；只公開名字、內容與時間。
3. 訪客填寫名字與留言、選填 Email 後送出，不需登入。
4. 訪客可點任一留言的「回覆」，回覆會顯示在該留言下方。
5. 每一則新留言或回覆都寄信通知 `notify@peiwang.dev`。
6. 若是回覆且被回覆者有留下 Email，另外寄信通知對方。

## 頁面與元件

- 新增頁面：`/guestbook`
- 導覽列新增：`Guestbook`
- 新增留言板元件，負責載入、送出、回覆與狀態提示。
- `components/Comments.tsx` 恢復使用 `pliny/comments` 的 Giscus 實作。
- `data/siteMetadata.js` 恢復原本 Giscus provider 與設定。

## API

### `GET /api/guestbook/`

- 回傳最多 200 則留言，依建立時間由舊到新。
- 公開欄位只有：`id`、`parent_id`、`author_name`、`content`、`created_at`。
- 不回傳 Email 或 IP 雜湊。

### `POST /api/guestbook/`

- 輸入：`parentId | null`、`name`、選填的 `email`、`content`、honeypot 欄位。
- 限制：名字 1–80 字、Email 有填時需符合格式且最多 254 字、內容 1–2000 字。
- 同一 IP 雜湊 10 分鐘最多 5 則。
- 寫入成功後透過 Resend HTTP API 寄信；不新增 production dependency。
- 寄信失敗不回滾已寫入留言，回傳 `notificationSent: false`，避免重送造成重複留言。

## Supabase

- 資料表：`public.guestbook_entries`
- 欄位：`id`、`parent_id`、`author_name`、可為 `NULL` 的 `author_email`、`content`、`ip_hash`、`created_at`。
- 啟用 RLS；`anon`、`authenticated` 不可直接讀寫資料表或執行寫入 RPC。
- Vercel server route 使用既有 `SUPABASE_SERVICE_ROLE_KEY` 存取。
- RPC：`public.create_guestbook_entry(...)`，負責輸入檢查、父留言查找與原子化限流。
- 目前錯建的 `post_comments` 無正式資料；確認為空後移除其 table／function，改用 guestbook 命名。

## Vercel 與寄信設定

在 Vercel Project → Settings → Environment Variables 設定 Production、Preview：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GUESTBOOK_HASH_SALT`：獨立隨機字串
- `RESEND_API_KEY`：Resend API key
- `GUESTBOOK_FROM_EMAIL`：`Pei.Blog <comments@peiwang.dev>`

Resend 需先驗證 `peiwang.dev` 的 SPF／DKIM。寄件地址不必建立實體信箱；收件信箱 `notify@peiwang.dev` 則必須已能正常收信。環境變數變更後需重新部署才會套用。

## 不做

- 登入、管理後台、編輯／刪除 UI
- 即時更新、Markdown、按讚
- 自動審核或人工審核流程
- 超過 200 則留言的分頁；實際超過時再加

## 驗收條件

- `/guestbook` 可顯示、送出並回覆留言。
- 文章頁仍載入 Giscus，不呼叫 guestbook API。
- 公開 API 回應不含 Email／IP 雜湊。
- Supabase 的 `anon`、`authenticated` 無直接資料權限。
- 每則留言通知 `notify@peiwang.dev`；父留言有 Email 時，回覆才另行通知。
- 缺少 Resend 設定或寄信失敗時，留言仍只建立一次並顯示通知失敗。
- TypeScript、ESLint、`git diff --check` 與本機瀏覽器驗證通過；依專案規範不跑 test script。
