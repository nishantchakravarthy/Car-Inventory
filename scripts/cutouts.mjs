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
      const cut = Buffer.from(await blob.arrayBuffer());
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
