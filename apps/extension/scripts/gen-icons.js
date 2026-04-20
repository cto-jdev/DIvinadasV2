/**
 * Genera iconos PNG mínimos para DivinAds Extension.
 * Solo usa Node.js built-ins: sin canvas, sin sharp, sin dependencias.
 *
 * Diseño: fondo violeta (#6B21A8) con letra "D" blanca centrada.
 * El PNG es correcto (PNG spec compliant) usando chunks IHDR + IDAT + IEND.
 *
 * Uso:
 *   node scripts/gen-icons.js
 * Genera: icons/icon16.png, icon48.png, icon128.png
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, '..', 'icons');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── PNG helpers ─────────────────────────────────────────────────────────────

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (const b of buf) {
        crc ^= b;
        for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.allocUnsafe(4);
    len.writeUInt32BE(data.length, 0);
    const crcBuf = crc32(Buffer.concat([typeBytes, data]));
    const crcOut = Buffer.allocUnsafe(4);
    crcOut.writeUInt32BE(crcBuf, 0);
    return Buffer.concat([len, typeBytes, data, crcOut]);
}

function makePng(width, height, rgbaRows) {
    // rgbaRows: array of Uint8Array rows, each width*4 bytes (RGBA)
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    const ihdrData = Buffer.allocUnsafe(13);
    ihdrData.writeUInt32BE(width,  0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8]  = 8;   // bit depth
    ihdrData[9]  = 2;   // color type: RGB (no alpha for simplicity)
    ihdrData[10] = 0;   // compression
    ihdrData[11] = 0;   // filter
    ihdrData[12] = 0;   // interlace

    // Build raw scanlines (filter byte 0 = None + RGB data)
    const rawRows = [];
    for (const row of rgbaRows) {
        const scanline = Buffer.allocUnsafe(1 + width * 3);
        scanline[0] = 0; // filter None
        for (let x = 0; x < width; x++) {
            scanline[1 + x * 3]     = row[x * 4];     // R
            scanline[1 + x * 3 + 1] = row[x * 4 + 1]; // G
            scanline[1 + x * 3 + 2] = row[x * 4 + 2]; // B
        }
        rawRows.push(scanline);
    }
    const raw = Buffer.concat(rawRows);
    const compressed = zlib.deflateSync(raw, { level: 9 });

    return Buffer.concat([
        signature,
        chunk('IHDR', ihdrData),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ─── Icon renderer ───────────────────────────────────────────────────────────

// Tiny 5×7 bitmap font for "D" (column-major, MSB top)
// Each number = 8 pixels column (rows top→bottom), 5 columns
const LETTER_D = [
    [1,1,1,1,0],  // row 0 (top)
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],  // row 6 (bottom)
];

function renderIcon(size) {
    const BG  = [107, 33, 168]; // #6B21A8 violet
    const FG  = [255, 255, 255]; // white

    const rows = [];
    for (let y = 0; y < size; y++) {
        const row = new Uint8Array(size * 4);
        for (let x = 0; x < size; x++) {
            // Background
            row[x*4]   = BG[0]; row[x*4+1] = BG[1];
            row[x*4+2] = BG[2]; row[x*4+3] = 255;
        }
        rows.push(row);
    }

    // Draw "D" centered — scale glyph to ~60% of icon size
    const glyphH = LETTER_D.length;       // 7
    const glyphW = LETTER_D[0].length;    // 5
    const scale  = Math.max(1, Math.floor(size * 0.55 / glyphH));
    const totalH = glyphH * scale;
    const totalW = glyphW * scale;
    const offY   = Math.floor((size - totalH) / 2);
    const offX   = Math.floor((size - totalW) / 2);

    for (let gy = 0; gy < glyphH; gy++) {
        for (let gx = 0; gx < glyphW; gx++) {
            if (!LETTER_D[gy][gx]) continue;
            for (let sy = 0; sy < scale; sy++) {
                for (let sx = 0; sx < scale; sx++) {
                    const py = offY + gy * scale + sy;
                    const px = offX + gx * scale + sx;
                    if (py < 0 || py >= size || px < 0 || px >= size) continue;
                    rows[py][px*4]   = FG[0];
                    rows[py][px*4+1] = FG[1];
                    rows[py][px*4+2] = FG[2];
                }
            }
        }
    }

    return makePng(size, size, rows);
}

// ─── Generate ─────────────────────────────────────────────────────────────────

for (const size of [16, 48, 128]) {
    const buf  = renderIcon(size);
    const dest = path.join(OUT_DIR, `icon${size}.png`);
    fs.writeFileSync(dest, buf);
    console.log(`✓ ${dest}  (${buf.length} bytes)`);
}

console.log('Icons generated.');
