/**
 * Removes Google Analytics (gtag) from itch-build/index.html only.
 * Meta Pixel and the app bundle stay; production site (dist) keeps gtag.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = join(root, 'itch-build', 'index.html');
let html = readFileSync(htmlPath, 'utf8');
// Match async gtag loader + inline gtag config (Meta Pixel may follow before Vite’s module tag).
const stripped = html.replace(
  /\s*<!-- Google tag \(gtag\.js\) -->\s*<script async[^>]*>[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>\s*/,
  '\n    ',
);
if (stripped === html) {
  console.error('strip-itch-gtag: pattern not found in itch-build/index.html');
  process.exit(1);
}
writeFileSync(htmlPath, stripped);
