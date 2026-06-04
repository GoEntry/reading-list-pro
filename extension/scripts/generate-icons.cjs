const sharp = require('sharp');
const { mkdirSync } = require('fs');
const path = require('path');

// Bookmark icon on indigo-600 background — matches the login/popup header icon
function makeSvg(size) {
  const r = Math.round(size * 0.15); // border-radius
  const pad = Math.round(size * 0.18); // padding around bookmark
  const bw = size - pad * 2;
  const bh = size - pad * 2;

  // Bookmark path scaled into bw×bh, original viewBox 0 0 14 18
  // Original: M1 0 h12 a2 2 0 0 1 2 2 v16 l-7-3.5 L1 18 V2 a2 2 0 0 1 2-2
  // Simplified version matching the Heroicons "bookmark" solid
  const sx = bw / 14;
  const sy = bh / 18;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#4f46e5"/>
  <g transform="translate(${pad}, ${pad})">
    <path
      fill="white"
      transform="scale(${sx}, ${sy})"
      d="M1 0 C1 0 0 0 0 1 L0 18 L7 14.5 L14 18 L14 1 C14 0 13 0 13 0 Z"
    />
  </g>
</svg>`;
}

mkdirSync(path.join(__dirname, '../public/icons'), { recursive: true });

async function run() {
  for (const size of [16, 48, 128]) {
    const svg = Buffer.from(makeSvg(size));
    await sharp(svg)
      .png()
      .toFile(path.join(__dirname, `../public/icons/icon${size}.png`));
    console.log(`Created icon${size}.png`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
