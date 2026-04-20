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

// Generar iconos placeholder SVG → PNG no requerido para load unpacked en dev
// En producción reemplazar con PNGs reales en icons/
for (const size of [16, 48, 128]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#6B21A8"/>
  <text x="50%" y="58%" font-family="sans-serif" font-size="${size * 0.5}" font-weight="bold"
        fill="white" text-anchor="middle" dominant-baseline="middle">D</text>
</svg>`;
    // Chrome no acepta SVG como icono; escribimos un PNG 1x1 de fallback para dev.
    // En producción: reemplazar icons/ con PNGs reales.
    const placeholder = `icons/icon${size}.png`;
    if (!fs.existsSync(path.join(ROOT, placeholder))) {
        // Copiar placeholder vacío (1x1 PNG) solo si no existe el real
        // Para producción: colocar PNGs correctos en apps/extension/icons/
        fs.writeFileSync(path.join(DIST, 'icons', `icon${size}.svg`), svg, 'utf8');
    } else {
        fs.copyFileSync(path.join(ROOT, placeholder), path.join(DIST, 'icons', `icon${size}.png`));
    }
}

// Actualizar manifest para usar SVG en dev si no hay PNG
const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
if (!fs.existsSync(path.join(ROOT, 'icons/icon16.png'))) {
    const iconDef = (s) => `icons/icon${s}.svg`;
    manifest.action.default_icon = { 16: iconDef(16), 48: iconDef(48), 128: iconDef(128) };
    manifest.icons               = { 16: iconDef(16), 48: iconDef(48), 128: iconDef(128) };
    fs.writeFileSync(path.join(DIST, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

console.log(`✓ Extension built → dist/  (API: ${API})`);
