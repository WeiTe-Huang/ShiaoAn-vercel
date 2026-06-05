# PWA 部署指南

專案已設定 **PWA**（可「加入主畫面」、離線快取靜態資源）與 **OpenAI 伺服器代理**（金鑰不進前端）。

## 一、本機建置

```bash
cd "/Users/weitehuang/Downloads/清華小安"
npm install
cp .env.example .env.local   # 若尚未設定
npm run build
```

產出在 **`dist/`**，內含 `manifest.webmanifest`、`sw.js` 等 PWA 檔案。

## 二、立刻上線（推薦）

### A. Vercel（自訂網域最簡單）

1. 安裝 CLI：`npm i -g vercel`
2. 在專案目錄：`vercel login` → `vercel`
3. 於 [Vercel 專案設定](https://vercel.com) → **Environment Variables** 新增：
   - `OPENAI_API_KEY` = 你的金鑰
4. 再執行：`npm run deploy:vercel` 或 `vercel --prod`
5. **Settings → Domains** 綁定你的網域（依畫面設定 DNS CNAME）

已包含 `api/openai/[...path].ts`，正式環境會代轉 OpenAI。

### B. Netlify

1. `npm i -g netlify-cli` → `netlify login`
2. `netlify init` 或連結 Git 倉庫
3. 後台 **Site settings → Environment variables** 設定 `OPENAI_API_KEY`
4. `npm run build` → `npm run deploy:netlify`

### C. 自有主機 / cPanel（只上傳靜態檔）

1. 將 **`dist/` 內所有檔案** 上傳到網域根目錄（或子目錄）
2. **必須 HTTPS**（PWA 與 Service Worker 要求）
3. 設定 **SPA 路由**：所有非檔案路徑回傳 `index.html`

**Nginx 範例**（並代理 OpenAI，金鑰放伺服器環境變數）：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.edu.tw;
    root /var/www/xiaoan/dist;
    index index.html;

    location /api/openai/ {
        proxy_pass https://api.openai.com/;
        proxy_set_header Authorization "Bearer $openai_api_key";
        proxy_ssl_server_name on;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> 若只上傳 `dist/`、**沒有**後端代理，對話與生圖 API 在正式站會失敗；請用 A/B 或加上方 Nginx。

### D. Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- 環境變數：`OPENAI_API_KEY`
- 需另加 Workers 轉發 `/api/openai/*`（或改用 Vercel/Netlify）

## 三、安裝成 PWA

1. 用手機 **Chrome / Safari** 開啟你的 **HTTPS** 網址
2. **Safari**：分享 →「加入主畫面」
3. **Chrome**：選單 →「安裝應用程式」或「加入主畫面」

## 四、檢查清單

- [ ] 網站為 **HTTPS**
- [ ] 伺服器已設定 `OPENAI_API_KEY`（或 Nginx 代理）
- [ ] 開啟 `/manifest.webmanifest` 可看到「清華小安」
- [ ] DevTools → Application → Service workers 為 activated
- [ ] 對話可正常回覆（非「系統忙碌」）

## 五、子路徑部署

若網址為 `https://example.edu.tw/xiaoan/`，需在 `vite.config.ts` 設定 `base: '/xiaoan/'` 後重新 `npm run build`。
