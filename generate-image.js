import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const WIDTH = 1200;
const HEIGHT = 628;
const BG = '#080b12';
const ORANGE = '#FF6B00';

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateImage({ hookLine, brand = 'AutoFlow', outputPath }) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Dot grid pattern
  ctx.fillStyle = 'rgba(255, 107, 0, 0.05)';
  for (let x = 24; x < WIDTH; x += 28) {
    for (let y = 24; y < HEIGHT; y += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Radial glow behind text area
  const glow = ctx.createRadialGradient(350, HEIGHT / 2, 0, 350, HEIGHT / 2, 500);
  glow.addColorStop(0, 'rgba(255, 107, 0, 0.07)');
  glow.addColorStop(1, 'rgba(255, 107, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Left accent bar
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, 5, HEIGHT);

  // Small top-left decorative line
  ctx.fillStyle = ORANGE;
  ctx.fillRect(40, 40, 60, 3);

  // Hook line — bold white text
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 50px "Segoe UI", Arial, sans-serif';
  const lines = wrapText(ctx, hookLine, WIDTH - 180);
  const lineHeight = 66;
  const totalH = lines.length * lineHeight;
  let y = (HEIGHT - totalH) / 2 + 10;

  for (const line of lines) {
    ctx.fillText(line, 70, y);
    y += lineHeight;
  }

  // Bottom-right: brand name
  ctx.fillStyle = ORANGE;
  ctx.font = '700 22px "Segoe UI", Arial, sans-serif';
  const bw = ctx.measureText(brand).width;
  const bx = WIDTH - bw - 50;
  const by = HEIGHT - 45;
  ctx.fillText(brand, bx, by);

  // Underline accent under brand
  ctx.fillStyle = ORANGE;
  ctx.fillRect(bx, by + 6, bw, 2.5);

  // Bottom-left: subtle tagline
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.font = '400 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText(brand === 'CyberShield' ? 'cybrshieldtech.com' : 'autoflow.agency', 70, HEIGHT - 45);

  // Output
  const buffer = canvas.toBuffer('image/png');
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }
  return buffer;
}

// CLI: node generate-image.js "Your hook line" BrandName output.png
if (process.argv[1]?.endsWith('generate-image.js') && process.argv[2]) {
  const hook = process.argv[2];
  const brand = process.argv[3] || 'AutoFlow';
  const out = process.argv[4] || 'post-image.png';
  generateImage({ hookLine: hook, brand, outputPath: out })
    .then(p => console.log(`Image saved: ${p}`))
    .catch(e => { console.error(e); process.exit(1); });
}
