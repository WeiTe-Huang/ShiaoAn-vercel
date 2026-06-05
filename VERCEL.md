# Vercel 部署（清華小安）

此倉庫為 **Vercel 線上版**，與本機開發用的 `清華小安` 資料夾分開維護。

## 一、連結 Vercel

1. 開啟 https://vercel.com → **Add New → Project**
2. 匯入 GitHub 倉庫 **`WeiTe-Huang/ShiaoAn-vercel`**（或你建立的名稱）
3. Framework 應自動辨識為 **Vite**（`vercel.json` 已設定）

## 二、環境變數（必設，否則對話無法使用）

在 Vercel 專案 → **Settings → Environment Variables**：

| 名稱 | 值 | 環境 |
|------|-----|------|
| `OPENAI_API_KEY` | 你的 `sk-...` | Production、Preview、Development |

儲存後到 **Deployments → 最新一筆 → Redeploy**。

## 三、運作說明

- 前端：`dist/`（`npm run build`）
- API：`api/openai/[...path].ts` 轉發至 OpenAI（金鑰只在伺服器）
- 勿把 `.env.local` 提交到 GitHub

## 四、自訂網域

Vercel → **Settings → Domains** 綁定你的網域即可。

## 五、本機開發

```bash
cp .env.example .env.local   # 填入 OPENAI_API_KEY
npm install
npm run dev
```
