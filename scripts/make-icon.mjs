#!/usr/bin/env node
/**
 * Generate icon.svg + icon.png for the Capability Demo plugin.
 *
 * Produces a 512x512 rounded-square purple icon with a graduation cap
 * emoji. PNG conversion uses macOS `sips` (which on macOS 13+ supports
 * SVG input). Falls back to leaving only icon.svg if sips fails.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const svgPath = join(root, 'icon.svg');
const pngPath = join(root, 'icon.png');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" ry="96" fill="url(#bg)"/>
  <rect x="8" y="8" width="496" height="496" rx="92" ry="92" fill="none" stroke="#a855f7" stroke-width="4" stroke-opacity="0.4"/>
  <text x="256" y="340" text-anchor="middle"
        font-size="280"
        font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui">🎓</text>
</svg>`;

writeFileSync(svgPath, svg);
console.log(`Wrote ${svgPath}`);

// Try sips first (macOS). If that fails, try rsvg-convert / inkscape.
const tryCmd = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  return r.status === 0;
};

let ok = false;
if (process.platform === 'darwin') {
  ok = tryCmd('sips', ['-s', 'format', 'png', svgPath, '--out', pngPath, '-z', '512', '512']);
}
if (!ok) {
  ok = tryCmd('rsvg-convert', ['-w', '512', '-h', '512', svgPath, '-o', pngPath]);
}
if (!ok) {
  ok = tryCmd('inkscape', [svgPath, '--export-type=png', `--export-filename=${pngPath}`, '-w', '512', '-h', '512']);
}

if (ok && existsSync(pngPath)) {
  console.log(`Wrote ${pngPath}`);
} else {
  console.warn('Could not convert SVG to PNG (no sips/rsvg-convert/inkscape). Leaving icon.svg only.');
  process.exitCode = 1;
}
