/**
 * 補裝 Rollup 對應 macOS 原生模組（修正 npm optional dependency 漏裝）。
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

if (process.platform !== 'darwin') {
  process.exit(0);
}

const rollupVersion = '4.61.1';
const arch = process.arch === 'x64' ? 'x64' : 'arm64';
const folder = `rollup-darwin-${arch}`;
const pkgDir = join(process.cwd(), 'node_modules', '@rollup', folder);

if (existsSync(pkgDir)) {
  process.exit(0);
}

const pkgName = `@rollup/${folder}`;
console.warn(`[postinstall] 補裝 ${pkgName}（Node ${process.arch}）…`);
execSync(
  `npm install ${pkgName}@${rollupVersion} --cpu=${arch} --os=darwin --no-save --force`,
  { stdio: 'inherit' }
);
