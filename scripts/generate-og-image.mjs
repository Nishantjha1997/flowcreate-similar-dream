// Generates public/og-image.png (1200x630) — brand gradient + FlowCreate mark.
// Pure Node (zlib only), no dependencies. 4x supersampling for smooth edges.
// Re-run with: node scripts/generate-og-image.mjs
// (Replace with a designed card featuring the wordmark whenever ready — this
// exists so social shares are never imageless.)
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1200, H = 630, SS = 2; // supersample factor
const sw = W * SS, sh = H * SS;

// ── helpers ──────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// signed distance to a rounded rectangle centered at (cx,cy)
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}
function sdSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax, aby = by - ay;
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby), 0, 1);
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}
const mix = (base, top, a) => [
  Math.round(lerp(base[0], top[0], a)),
  Math.round(lerp(base[1], top[1], a)),
  Math.round(lerp(base[2], top[2], a)),
];
const aa = (d) => clamp(0.5 - d / (1.5 * SS), 0, 1); // distance → coverage

// ── scene ────────────────────────────────────────────────────────────────
// Brand: logo gradient #3FA1FF → #0057D9 on deep slate background.
const bgTop = [15, 23, 42];      // #0F172A
const bgBot = [2, 44, 102];      // deep blue
const blueA = [63, 161, 255];    // #3FA1FF
const blueB = [0, 87, 217];      // #0057D9
const white = [255, 255, 255];
const paleBlue = [191, 224, 255];// #BFE0FF
const check = [10, 102, 224];    // #0A66E0

const cx = sw / 2, cy = sh / 2;
const mark = 340 * SS / 2;       // half-size of the rounded-square mark
const markR = 88 * SS / 2;

const px = Buffer.alloc(sw * sh * 3);
for (let y = 0; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    // background: diagonal gradient + two soft glow circles
    const g = (x / sw + y / sh) / 2;
    let c = mix(bgTop, bgBot, g);
    const glow1 = clamp(1 - Math.hypot(x - sw * 0.85, y - sh * 0.15) / (sw * 0.5), 0, 1);
    const glow2 = clamp(1 - Math.hypot(x - sw * 0.1, y - sh * 0.95) / (sw * 0.45), 0, 1);
    c = mix(c, blueB, glow1 * glow1 * 0.35 + glow2 * glow2 * 0.25);

    // logo mark: rounded square with brand gradient
    const dSq = sdRoundRect(x, y, cx, cy, mark, mark, markR);
    if (dSq < 2 * SS) {
      const t = clamp(((x - (cx - mark)) + (y - (cy - mark))) / (4 * mark), 0, 1);
      c = mix(c, mix(blueA, blueB, t), aa(dSq));
    }
    // document sheet (white rounded rect inside the mark)
    const dDoc = sdRoundRect(x, y, cx, cy + 6 * SS, mark * 0.52, mark * 0.62, 10 * SS);
    if (dDoc < 2 * SS) c = mix(c, white, aa(dDoc));
    // folded corner (pale blue triangle approximated by a small rounded rect)
    const fc = sdRoundRect(x, y, cx + mark * 0.38, cy - mark * 0.42, mark * 0.16, mark * 0.16, 4 * SS);
    if (fc < 2 * SS && dDoc < 0) c = mix(c, paleBlue, aa(fc));
    // check stroke on the sheet
    const stroke = 13 * SS;
    const d1 = sdSegment(x, y, cx - mark * 0.28, cy + 8 * SS, cx - mark * 0.06, cy + mark * 0.3);
    const d2 = sdSegment(x, y, cx - mark * 0.06, cy + mark * 0.3, cx + mark * 0.34, cy - mark * 0.22);
    const dC = Math.min(d1, d2) - stroke;
    if (dC < 2 * SS) c = mix(c, check, aa(dC));

    const i = (y * sw + x) * 3;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
  }
}

// ── downsample to target size ────────────────────────────────────────────
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0;
    for (let dy = 0; dy < SS; dy++) for (let dx = 0; dx < SS; dx++) {
      const i = ((y * SS + dy) * sw + (x * SS + dx)) * 3;
      r += px[i]; g += px[i + 1]; b += px[i + 2];
    }
    const n = SS * SS, o = (y * W + x) * 3;
    out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
  }
}

// ── PNG encode ───────────────────────────────────────────────────────────
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter: none
  out.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'public'), { recursive: true });
writeFileSync(join(root, 'public', 'og-image.png'), png);
console.log(`og-image.png written (${(png.length / 1024).toFixed(0)} KB, ${W}x${H})`);
