import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const publicDir = join(process.cwd(), 'public');
const required = ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon-180x180.png'];

if (required.every((name) => existsSync(join(publicDir, name)))) {
  process.exit(0);
}

const iconSvg = join(publicDir, 'icon.svg');
if (!existsSync(iconSvg)) {
  console.warn('[pwa] public/icon.svg missing, skip icon generation');
  process.exit(0);
}

console.log('[pwa] Generating PNG icons from public/icon.svg …');
try {
  execSync(
    'npx --yes @vite-pwa/assets-generator --preset minimal-2023 public/icon.svg',
    { stdio: 'inherit', cwd: process.cwd() }
  );
} catch (e) {
  console.warn('[pwa] Icon generation failed; PWA may still work with SVG favicon only.');
  process.exit(0);
}
