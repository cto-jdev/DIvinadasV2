/**
 * Empaqueta dist/ en divinads-extension-v{version}.zip
 * listo para subir a la Chrome Web Store.
 * Requiere 'archiver': npm i -D archiver
 */
'use strict';
const fs       = require('fs');
const path     = require('path');
const archiver = require('archiver');

const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../dist/manifest.json'), 'utf8'));
const version  = manifest.version;
const outFile  = path.resolve(__dirname, `../../divinads-extension-v${version}.zip`);

const output = fs.createWriteStream(outFile);
const archive = archiver('zip', { zlib: { level: 9 } });
archive.pipe(output);
archive.directory(path.join(__dirname, '../dist'), false);
archive.finalize();
output.on('close', () =>
    console.log(`✓ Zipped → ${outFile}  (${archive.pointer()} bytes)`));
