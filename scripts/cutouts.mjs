// Build step: download each car photo from Wikimedia Commons, remove the background,
// and save a transparent WebP "sticker" to public/cutouts/. Writes src/data/cutouts.json
// listing the cars that succeeded; the site falls back to the original photo for the rest.
// Never fails the build: any error just means fewer cutouts.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'cutouts');
const manifestPath = path.join(root, 'src', 'data', 'cutouts.json');
const UA = 'HaldenMotorHouse-student-project/1.0 (https://github.com/nishantchakravarthy/car-inventory)';

const writeManifest = (m) => fs.writeFile(manifestPath, JSON.stringify(m, null, 2) + '\n');

// Keep the car: clear any separate piece of the mask smaller than a fifth of the biggest one
// (stray signs, stands or bits of background that are not attached to the car).
function keepCar(px, w, h) {
  const label = new Int32Array(w * h);
  const sizes = [0];
  const stack = [];
  for (let s = 0; s < w * h; s++) {
    if (label[s] || px[s * 4 + 3] === 0) continue;
    const id = sizes.length;
    let n = 0;
    label[s] = id; stack.push(s);
    while (stack.length) {
      const p = stack.pop(); n++;
      const x = p % w, y = (p - x) / w;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (q >= 0 && !label[q] && px[q * 4 + 3] !== 0) { label[q] = id; stack.push(q); }
      }
    }
    sizes.push(n);
  }
  const min = Math.max(...sizes) / 5;
  for (let p = 0; p < w * h; p++) if (label[p] && sizes[label[p]] < min) px[p * 4 + 3] = 0;
}

async function main() {
  if (process.env.SKIP_CUTOUTS) return console.log('[cutouts] skipped');
  let removeBackground, sharp;
  try {
    ({ removeBackground } = await import('@imgly/background-removal-node'));
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.warn('[cutouts] tools unavailable, using photos:', e.message);
    return;
  }
  const { INVENTORY } = await import('../src/data/inventory.js');
  await fs.mkdir(outDir, { recursive: true });
  const manifest = {};
  for (const car of INVENTORY) {
    const file = path.join(outDir, `${car.id}.webp`);
    try {
      const res = await fetch(car.imgLarge, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const png = await sharp(Buffer.from(await res.arrayBuffer())).rotate().resize({ width: 1280, withoutEnlargement: true }).png().toBuffer();
      const blob = await removeBackground(new Blob([png], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png' } });
      // Harden the mask: half-transparent pixels are ghosts (people, signs, reflections), so drop them.
      const { data: px, info } = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 3; i < px.length; i += 4) px[i] = px[i] < 150 ? 0 : Math.min(255, Math.round(((px[i] - 150) * 255) / 80));
      keepCar(px, info.width, info.height);
      const cut = await sharp(px, { raw: info }).png().toBuffer();
      const img = sharp(cut).trim({ threshold: 10 });
      const meta = await img.clone().toBuffer({ resolveWithObject: true });
      // Reject cutouts that kept almost nothing or almost everything.
      const stats = await sharp(cut).stats();
      const alphaMean = stats.channels[3]?.mean ?? 255;
      if (alphaMean < 25 || alphaMean > 235) throw new Error(`unusable mask (alpha mean ${alphaMean.toFixed(0)})`);
      await sharp(meta.data).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toFile(file);
      manifest[car.id] = `cutouts/${car.id}.webp`;
      console.log(`[cutouts] ${car.id} ok (alpha ${alphaMean.toFixed(0)})`);
    } catch (e) {
      console.warn(`[cutouts] ${car.id} failed: ${e.message}`);
    }
  }
  await writeManifest(manifest);
  console.log(`[cutouts] ${Object.keys(manifest).length}/${INVENTORY.length} done`);
}

main().catch((e) => console.warn('[cutouts] skipped:', e.message));
