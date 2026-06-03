const { PNG } = require('pngjs');
const { writeFileSync, mkdirSync } = require('fs');

// Indigo-600: #4f46e5 = rgb(79, 70, 229)
function solidPng(size, r, g, b) {
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255;
  }
  return PNG.sync.write(png);
}

mkdirSync('public/icons', { recursive: true });
for (const size of [16, 48, 128]) {
  writeFileSync(`public/icons/icon${size}.png`, solidPng(size, 79, 70, 229));
  console.log(`Created public/icons/icon${size}.png`);
}
