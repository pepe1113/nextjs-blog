# Blog 留言／回應工具調查

調查日期：2026-08-07。以下只採用產品官方文件、官方原始碼與官方價格頁。

## 結論

如果要「公開留言串、訪客不用登入、只填名字或用匿名」，首選 **FastComments Flex**：訪客可只填名字，不需 email 或帳號；有代管、spam detection、預審與封鎖工具，最低 US$0.99/月。它沒有正式免費方案，但有 30 天試用。[匿名與管理功能](https://fastcomments.com/how-to-add-comments-to-a-website)｜[現行價格](https://cdn.fastcomments.com/traffic-pricing)

如果不需要把回應公開，而且正式站仍部署在 `siteUrl` 指向的 Netlify，最省事是 **Netlify Forms**：做一個名字選填、內容必填的文章回應表單，投稿只進 Netlify 後台／通知信；credit-based plans 的 form submissions 免費且不限量，內建 Akismet，還可加 honeypot。它不是留言串，不能讓讀者互相回覆。[Forms setup](https://docs.netlify.com/manage/forms/setup/)｜[Spam filters](https://docs.netlify.com/manage/forms/spam-filters/)｜[2026 pricing update](https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/)

如果要完全掌握資料與 UI，再做 **現有 Supabase + Next.js Route Handler** 的小型留言表；這個 repo 已有同樣的 server-side Supabase REST 路徑可沿用，但要自行負責審核、濫用防護、刪除與備份。Supabase Free 現為 500 MB database、2 個 active projects；Turnstile Free 提供不限 challenge，但 token 必須在伺服器端驗證。[Supabase pricing](https://supabase.com/pricing)｜[Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)｜[Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)｜[server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## 快速比較

價格是 2026-08-07 快照；自架工具的「免費」只代表軟體授權，不含主機、資料庫、寄信與維運時間。

| 工具 | 不登入／名字或匿名 | 代管與成本 | Moderation／spam | Next.js 導入 | 判斷 |
| --- | --- | --- | --- | --- | --- |
| **FastComments** | 符合；只填名字即可，不需 email／註冊，也支援 guest／anonymous | SaaS；30 天試用；Flex US$0.99/月起，無正式 free tier | 預審、keyword filter、spam detection、ban，可由 dashboard 或 email 管理 | 官方提供 VanillaJS snippet 與 React package；本案先用 script，無需新增 dependency | **最佳 managed 選擇**。[功能／安裝](https://fastcomments.com/how-to-add-comments-to-a-website)｜[價格／限制](https://cdn.fastcomments.com/traffic-pricing) |
| **Hyvor Talk** | Guest 預設開啟；名字必填、email 選填；可用「匿名」作顯示名 | SaaS；Personal 年繳為 EUR 5/月、2,500 credits/月；14 天試用 | 預審、rules、IP/user 管理；Akismet 或 FortGuard 另耗 spam-check credits | 官方 `@hyvor/hyvor-talk-react`，也可用 Web Component embed | 功能完整但比 FastComments 貴。[Guest](https://talk.hyvor.com/docs/commenting)｜[moderation](https://talk.hyvor.com/docs/moderation)｜[spam](https://talk.hyvor.com/docs/spam)｜[React](https://talk.hyvor.com/docs/install/react)｜[價格](https://talk.hyvor.com/pricing) |
| **Disqus Guest** | 免 Disqus 帳號，可真名、假名或匿名；但 **email 必填**、不驗證 | SaaS；Basic 免費但有廣告；Plus US$12/月起（100k monthly pageviews） | 所有 guest comments 一律 pending、需人工核准；有內建 spam filter 與管理工具 | 現有 `pliny/comments` 已支援，只要換 provider/config | 只在「一定要免費且可接受廣告、email、逐則審核」時考慮。[Guest](https://help.disqus.com/en/articles/1717211-guest-commenting)｜[email／審核](https://help.disqus.com/en/articles/4461282-moderation-settings)｜[價格](https://help.disqus.com/en/articles/1717110-comments-pricing-and-plans) |
| **Waline** | 符合；`requiredMeta` 預設為空，即匿名，亦可要求 nickname；可停用 login UI | 自架；可部署到 Vercel、Docker 等，需自備資料庫 | IP 頻率限制、重複內容防 flood、comment review；支援 Turnstile／reCAPTCHA | 官方 `@waline/client` 有 React wrapper 範例，需新增 client dependency 或自行載入 CDN | 自架選項中功能最齊，但元件與 server 都要維護。[欄位／登入](https://waline.js.org/en/reference/client/props.html)｜[安全／審核](https://waline.js.org/en/guide/features/safety.html)｜[部署](https://waline.js.org/en/guide/get-started/server.html)｜[React](https://waline.js.org/en/cookbook/import/project.html) |
| **Remark42** | 開 `AUTH_ANON=true` 後無需外部帳號，但會走 anonymous provider；名字至少 3 字元，僅能用字母、數字、底線、空白 | 自架、MIT；單一 binary／Docker，資料預設放單一 BoltDB file | 可刪留言、封鎖使用者；即時防機器人主要是 honeypot，較進階 spam cleanup 是事後批次 | 官方 embed／SPA API，包在 Client Component | 適合想要成熟自架討論功能者；防 spam 不如 managed SaaS。[匿名規則](https://remark42.com/docs/configuration/authorization/)｜[安裝](https://remark42.com/docs/getting-started/installation/)｜[管理](https://remark42.com/docs/manuals/admin-interface/)｜[spam](https://remark42.com/docs/manuals/spam/) |
| **Isso** | 最接近真正匿名；author、email 預設都非必填 | 自架、MIT；Python service + SQLite，費用是主機／維運 | 可開 moderation queue；內建 per-IP rate limit、author/email 規則；審核主要靠 log／SMTP signed URL | 載入官方 embed script；SPA 更新可呼叫 `Isso.fetchComments()`／`init()` | 自架中最輕，但後台與社群功能較樸素。[欄位／moderation／guard](https://isso-comments.de/docs/configuration/server/)｜[Quickstart](https://isso-comments.de/docs/guides/quickstart/)｜[SPA](https://isso-comments.de/docs/guides/advanced-integration/) |
| **Giscus** | **不符合**；留言者必須以 GitHub OAuth 授權，不能自行填名字／匿名 | 免費、無廣告；資料存在 GitHub Discussions，也可自架 widget | 用 GitHub 的編輯、刪除、鎖定、封鎖等工具管理 | 現有 `pliny/comments` 與 CSP 已直接支援 | 若未來願意接受 GitHub 登入，才是本 repo 改動最小的選擇。[登入／成本／儲存／整合](https://giscus.app/)｜[GitHub moderation](https://docs.github.com/en/discussions/managing-discussions-for-your-community/moderating-discussions) |
| **Utterances** | **不符合**；留言者必須 GitHub OAuth | 免費、無廣告；資料存在 GitHub Issues | 沿用 GitHub issue moderation，沒有獨立匿名／spam queue | 現有 `pliny/comments` 已支援 | 不選：不合免登入，且官方 repo 的最近 push 停在 2024-08，雖尚未 archived。[登入／成本／整合](https://utteranc.es/)｜[官方 repo metadata](https://api.github.com/repos/utterance/utterances) |
| **Cusdis** | 歷史功能符合免登入，但已不應新導入 | 官網舊價格頁仍在線，但已不能當作持續服務承諾 | 歷史設計是所有留言預設待審，且沒有 spam filter | 有 embed，但不值得投入整合 | **淘汰**：官方 README 明寫 deprecated，repo 已 archived；只適合既有使用者匯出資料。[deprecated README](https://github.com/djyde/cusdis)｜[repo metadata](https://api.github.com/repos/djyde/cusdis) |

## 自己做的三個範圍

### A. 文章底部私密回應表單（最小）

目前 `data/siteMetadata.js` 的 `siteUrl` 指向 Netlify；若那仍是正式部署，可加一個 `name`（選填）、`message`（必填）、`post_slug`（hidden）表單。空名字在 UI 顯示為「匿名」。Netlify 會把投稿留在 Forms UI，也能寄通知；Akismet 是預設 spam filter，honeypot 不需額外服務。[官方 setup](https://docs.netlify.com/manage/forms/setup/)｜[官方 spam filters](https://docs.netlify.com/manage/forms/spam-filters/)

這個方案沒有公開留言、reply、編輯或留言計數。若需求只是「讓讀者留下回應給作者」，到這裡就停。

### B. Supabase 公開留言 + 人工預審（推薦的自建 MVP）

沿用現有 `app/api/reactions/route.ts` 的 server-side REST 作法，不讓瀏覽器取得 service-role key。最小資料欄位為 `id, post_slug, name, content, status, created_at`；`name` 空白時存「匿名」，`status` 固定先寫 `pending`，公開 GET 只回 `approved`。Supabase 要同時設定 grants 與 RLS；官方文件明確說兩者是不同安全層，任何 exposed object 都要同時使用。[Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)

POST 邊界至少做：trim、名稱／內容長度限制、拒絕空內容、Turnstile token 的 server-side Siteverify。Cloudflare 明確要求伺服器驗證；token 五分鐘失效且只能用一次。[Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

先不做帳號、巢狀 reply、即時更新、按讚、Markdown、email 通知與 AI moderation；當真的出現回覆需求或審核量再加。這是目前最小且不會直接公開垃圾留言的自建版本。

### C. 完整自架引擎

需要公開 thread、reply、通知與管理介面，但不要 SaaS 時，選 **Waline** 或 **Remark42**；只要最簡單匿名留言與 SQLite，選 **Isso**。三者都比方案 B 多一個長期運行的 service，因此只有在「不接受第三方 SaaS，且願意維運」時才值得。

## 套到目前 repo 的實作影響

- [`components/Comments.tsx`](../components/Comments.tsx) 已透過 `pliny/comments` 統一載入留言；[`data/siteMetadata.js`](../data/siteMetadata.js) 目前設為 Giscus，而 starter 官方只內建 Giscus、Utterances、Disqus。[starter 官方說明](https://github.com/timlrx/tailwind-nextjs-starter-blog)
- FastComments／Hyvor／Waline／Remark42／Isso 都要把這個 component 換成各自 embed 的 Client Component；FastComments 可先用官方 async script，避免為單一 widget 新增 production dependency。[FastComments embed](https://fastcomments.com/how-to-add-comments-to-a-website)
- [`next.config.js`](../next.config.js) 的 CSP 現在只允許 `giscus.app` 的 script/frame。換任何第三方 embed 時都要只加入該供應商官方需要的網域；不要把 `script-src` 或 `frame-src` 放寬成 `*`。

## 建議決策

1. 要公開留言、最低維運：**FastComments Flex**。
2. 只要讀者把想法傳給作者：**Netlify Forms**，不需要留言系統。
3. 要完全自訂與自有資料：**Supabase MVP**，固定 `pending` + Turnstile。
4. 願意多付費換較完整社群功能：**Hyvor Talk**。
5. 堅持免費 managed：才考慮 **Disqus Guest**，接受廣告、email 必填與逐則人工核准。

Giscus、Utterances 因強制 GitHub 登入直接排除；Cusdis 因 deprecated／archived 排除。
