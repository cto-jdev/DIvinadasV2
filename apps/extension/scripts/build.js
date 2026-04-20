/**
 * Build script de la extensión V2.
 * Lee DIVINADS_API_BASE del entorno y lo inyecta en background.js.
 * Salida: dist/ listo para cargar en Chrome o subir a Web Store.
 *
 * Uso:
 *   DIVINADS_API_BASE=https://app.divinads.com node scripts/build.js
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const API  = process.env.DIVINADS_API_BASE ?? 'https://app.divinads.com';
const PANEL = process.env.DIVINADS_PANEL_URL ?? 'https://app.divinads.com';

// Limpiar y crear dist/
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'icons'), { recursive: true });

// Archivos que se copian sin transformación
const COPY = ['popup.html', 'popup.js', 'options.html', 'options.js', 'manifest.json'];
for (const f of COPY) {
    fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
}

// background.js: reemplazar la URL base
let bg = fs.readFileSync(path.join(ROOT, 'background.js'), 'utf8');
bg = bg.replace(
    /const DIVINADS_API_BASE\s*=\s*['"][^'"]+['"]/,
    `const DIVINADS_API_BASE = '${API}'`,
);

// popup.js + options.js: reemplazar URL panel
for (const f of ['popup.js', 'options.js']) {
    let src = fs.readFileSync(path.join(DIST, f), 'utf8');
    src = src.replace(
        /const PANEL_URL\s*=\s*['"][^'"]+['"]/g,
        `const PANEL_URL = '${PANEL}/panel'`,
    );
    fs.writeFileSync(path.join(DIST, f), src, 'utf8');
}

fs.writeFileSync(path.join(DIST, 'background.js'), bg, 'utf8');

// Copiar iconos PNG reales
for (const size of [16, 48, 128]) {
    const src = path.join(ROOT, 'icons', `icon${size}.png`);
    if (!fs.existsSync(src)) {
        console.error(`ERROR: icons/icon${size}.png not found. Run: node scripts/gen-icons.js`);
        process.exit(1);
    }
    fs.copyFileSync(src, path.join(DIST, 'icons', `icon${size}.png`));
}

console.log(`✓ Extension built → dist/  (API: ${API})`);
