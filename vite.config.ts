import path from 'path';
import type { ProxyOptions } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// PWA 暫緩：恢復時啟用 vite-plugin-pwa 與 index.tsx 的 registerSW（見 DEPLOY.md）

function openaiProxy(apiKey: string): ProxyOptions {
  return {
    target: 'https://api.openai.com',
    changeOrigin: true,
    secure: true,
    rewrite: (requestPath) => requestPath.replace(/^\/api\/openai/, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        if (apiKey) {
          proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const openaiKey = (env.OPENAI_API_KEY ?? env.VITE_OPENAI_API_KEY ?? '').trim();
  const proxyConfig = openaiKey ? { '/api/openai': openaiProxy(openaiKey) } : undefined;

  // GitHub Pages 專案站：https://<user>.github.io/<repo>/
  const ghRepo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base =
    process.env.GITHUB_ACTIONS === 'true' && ghRepo ? `/${ghRepo}/` : '/';

  // Vercel / Netlify 等平台：建置時啟用 /api/openai 代理（金鑰在平台環境變數，不必進 bundle）
  const serverHasApiProxy =
    Boolean(openaiKey) ||
    process.env.VERCEL === '1' ||
    process.env.NETLIFY === 'true' ||
    process.env.CF_PAGES === '1';

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: proxyConfig,
    },
    preview: {
      port: 3000,
      proxy: proxyConfig,
    },
    plugins: [react()],
    define: {
      // 金鑰只留在 Vite 伺服器端（proxy），不注入前端 bundle
      'import.meta.env.VITE_OPENAI_PROXY': JSON.stringify(serverHasApiProxy ? '1' : '0'),
      'import.meta.env.VITE_BASE_PATH': JSON.stringify(base),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            openai: ['openai'],
            icons: ['lucide-react'],
            markdown: ['react-markdown', 'remark-gfm', 'remark-parse', 'remark-rehype'],
          },
        },
      },
    },
  };
});
