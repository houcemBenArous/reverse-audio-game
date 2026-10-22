/**
 * Generates PWA PNG icons without any native dependencies.
 * Uses the @resvg/resvg-js package to rasterize the SVG icons.
 *
 * Run: node scripts/generate-icons.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

// Dynamic import so the script fails gracefully if the package isn't installed
let Resvg;
try {
  ({ Resvg } = await import('@resvg/resvg-js'));
} catch {
  console.error(
    '\n❌  @resvg/resvg-js is not installed.\n' +
    '   Run: npm install --save-dev @resvg/resvg-js\n' +
    '   Then re-run: node scripts/generate-icons.mjs\n'
  );
  process.exit(1);
}

mkdirSync(join(root, 'public', 'icons'), { recursive: true });

const svgIcon         = readFileSync(join(root, 'public', 'icons', 'icon.svg'));
const svgMaskable     = readFileSync(join(root, 'public', 'icons', 'icon-maskable.svg'));

const jobs = [
  { svg: svgIcon,     size: 192,  out: 'public/icons/icon-192.png' },
  { svg: svgIcon,     size: 512,  out: 'public/icons/icon-512.png' },
  { svg: svgMaskable, size: 512,  out: 'public/icons/icon-maskable-512.png' },
  { svg: svgIcon,     size: 180,  out: 'public/apple-touch-icon.png' },
];

for (const { svg, size, out } of jobs) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(root, out), png);
  console.log(`✓  ${out}`);
}

console.log('\nAll PWA icons generated.');
