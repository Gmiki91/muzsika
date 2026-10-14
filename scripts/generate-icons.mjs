// Draws the app icons (public/icons/icon-192.png and icon-512.png) without any dependencies.
// Runs after `npm install`; use `npm run icons` to redraw them.
import { deflateSync } from 'node:zlib';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
const force = process.argv.includes('--force');

const BACKGROUND = [0x2a, 0x3f, 0x9e];
const NOTE = [0xff, 0xff, 0xff];

// An eighth note on a 100 x 100 grid. It stays inside the central safe zone,
// so the same files also work as maskable icons.
const HEAD = { cx: 41, cy: 67, rx: 13, ry: 9.5, angle: (-24 * Math.PI) / 180 };
const STEM = { x1: 51.5, x2: 55.5, y1: 24, y2: 67 };
const FLAG = [
  [55.5, 24], [63, 27], [69, 33], [72, 41], [70, 50], [65, 57],
  [62, 56], [65.5, 49], [66, 42], [62, 36], [55.5, 33],
];

function inHead(x, y) {
  const dx = x - HEAD.cx;
  const dy = y - HEAD.cy;
  const cos = Math.cos(HEAD.angle);
  const sin = Math.sin(HEAD.angle);
  const u = dx * cos + dy * sin;
  const v = -dx * sin + dy * cos;
  return (u * u) / (HEAD.rx * HEAD.rx) + (v * v) / (HEAD.ry * HEAD.ry) <= 1;
}

function inStem(x, y) {
  return x >= STEM.x1 && x <= STEM.x2 && y >= STEM.y1 && y <= STEM.y2;
}

function inFlag(x, y) {
  let inside = false;
  for (let i = 0, j = FLAG.length - 1; i < FLAG.length; j = i++) {
    const [xi, yi] = FLAG[i];
    const [xj, yj] = FLAG[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function render(size) {
  const samples = 3;
  const rgb = Buffer.alloc(size * size * 3);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let covered = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const x = ((px + (sx + 0.5) / samples) / size) * 100;
          const y = ((py + (sy + 0.5) / samples) / size) * 100;
          if (inHead(x, y) || inStem(x, y) || inFlag(x, y)) covered++;
        }
      }
      const t = covered / (samples * samples);
      const offset = (py * size + px) * 3;
      for (let c = 0; c < 3; c++) {
        rgb[offset + c] = Math.round(BACKGROUND[c] * (1 - t) + NOTE[c] * t);
      }
    }
  }
  return rgb;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgb) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: RGB

  const stride = size * 3;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

try {
  mkdirSync(outDir, { recursive: true });
  for (const size of [192, 512]) {
    const file = join(outDir, `icon-${size}.png`);
    if (existsSync(file) && !force) continue;
    writeFileSync(file, encodePng(size, render(size)));
    console.log(`Wrote ${file}`);
  }
} catch (error) {
  // Never block `npm install` because of an icon.
  console.warn('Could not generate the app icons:', error);
}
