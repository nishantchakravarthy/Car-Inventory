// Background-removed car "stickers" made at build time by scripts/cutouts.mjs.
import CUTOUTS from './cutouts.json';

const BASE = import.meta.env?.BASE_URL ?? './';
export const cutFor = (car) => (CUTOUTS[car.id] ? `${BASE}${CUTOUTS[car.id]}` : null);
