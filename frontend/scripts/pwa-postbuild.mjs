// Post-processes the Expo web export (`dist/`) into an installable PWA.
// Metro web export gives no HTML template hook, so we copy static PWA assets
// into dist/ and inject the manifest link, apple meta tags and the (gated)
// service-worker registration into dist/index.html. Idempotent.
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'web-pwa');
const DIST = join(ROOT, 'dist');
const HTML = join(DIST, 'index.html');

if (!existsSync(HTML)) {
  console.error('pwa-postbuild: dist/index.html not found — run `expo export -p web` first.');
  process.exit(1);
}

// 1. Copy manifest, icons and service worker into the export root.
cpSync(join(SRC, 'manifest.webmanifest'), join(DIST, 'manifest.webmanifest'));
cpSync(join(SRC, 'service-worker.js'), join(DIST, 'service-worker.js'));
cpSync(join(SRC, 'pwa'), join(DIST, 'pwa'), { recursive: true });

// 2. Inject <head> tags + SW registration into index.html.
let html = readFileSync(HTML, 'utf8');

const HEAD_TAGS = `    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#1a2744" />
    <link rel="apple-touch-icon" href="/pwa/apple-touch-icon-180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Liaison" />`;

const SW_SNIPPET = `  <script>
    if ('serviceWorker' in navigator &&
        (location.protocol === 'https:' || location.hostname === 'localhost')) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js');
      });
    }
  </script>`;

// viewport-fit=cover → safe-area insets on notched iOS in standalone mode.
html = html.replace(
  /<meta name="viewport"[^>]*\/>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />'
);

if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `${HEAD_TAGS}\n  </head>`);
}
if (!html.includes("navigator.serviceWorker.register")) {
  html = html.replace('</body>', `${SW_SNIPPET}\n</body>`);
}

writeFileSync(HTML, html);
console.log('pwa-postbuild: injected manifest + apple meta + SW registration into dist/index.html');
