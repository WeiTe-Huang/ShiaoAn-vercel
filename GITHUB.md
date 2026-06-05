# GitHub 上線與常見 Error 排除

倉庫：https://github.com/WeiTe-Huang/ShiaoAn

## 先確認你是哪一種「Error」

| 現象 | 常見原因 | 處理方式 |
|------|----------|----------|
| 網頁全白 / 主控台 `Failed to load module` | GitHub Pages 路徑錯誤 | 使用下方 **GitHub Actions** 部署（已設 `base: /ShiaoAn/`） |
| 黃色提示「請設定 OPENAI_API_KEY」 | 純靜態託管、建置時未啟用 API | 改部署 **Vercel** 或 **Netlify**，並設定環境變數 |
| 對話回「無法連線」/ 500 | 平台未設 `OPENAI_API_KEY` | 在 Vercel/Netlify → Environment Variables 加入金鑰後 **Redeploy** |
| `git push` 被拒絕 | 誤把金鑰 commit 進去 | 刪除金鑰、rotate 新金鑰，勿提交 `.env.local` |

## GitHub Pages（僅前端，對話需另接後端）

1. 倉庫 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**
2. 推送 `main` 後，**Actions** 分頁應出現綠色 ✓
3. 網址：`https://wei-te-huang.github.io/ShiaoAn/`（使用者名稱請依你的帳號調整）

> GitHub Pages **無法**執行 `api/openai` 代理，上架後案例/通報可用，**諮詢與生圖需用 Vercel**。

## Vercel（推薦，含 OpenAI 代理）

1. https://vercel.com 匯入 `WeiTe-Huang/ShiaoAn`
2. **Environment Variables** 新增 `OPENAI_API_KEY`（Production）
3. Deploy → 使用 `vercel.json` 與 `api/openai/[...path].ts`

## 本機 clone 後無法執行

```bash
git clone https://github.com/WeiTe-Huang/ShiaoAn.git
cd ShiaoAn
cp .env.example .env.local   # 填入金鑰（此檔不會上傳 GitHub）
npm install
npm run dev
```

## 仍無法解決

請提供：**錯誤截圖**、是 **GitHub Pages / Vercel / 本機** 哪一種、瀏覽器 **Console** 第一行紅字訊息。
