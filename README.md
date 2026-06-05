# 清華小安（Vercel 線上版）

清華大學性騷擾防治助理 — 諮詢、通報協助、案例參考、場景示意圖。

**部署說明請看 [VERCEL.md](./VERCEL.md)**

## 本機執行

```bash
npm install
cp .env.example .env.local   # 填入 OPENAI_API_KEY
npm run dev
```

開啟 http://localhost:3000

## 技術

- React 19 + Vite 6 + TypeScript + Tailwind
- OpenAI GPT-4o（對話）、gpt-image-1（場景圖）
- Vercel Serverless：`/api/openai/*` 代理

## 與其他副本

| 資料夾 / 倉庫 | 用途 |
|---------------|------|
| 本倉庫 `ShiaoAn-vercel` | Vercel 正式站 |
| [ShiaoAn](https://github.com/WeiTe-Huang/ShiaoAn) | 原始 GitHub 倉庫 |
