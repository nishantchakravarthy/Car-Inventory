// Procedural 3D cars — every vehicle in the showroom is generated from a side profile,
// extruded with a soft bevel, then dressed with glass, wheels, lights and trim.
// No external model files are needed, so the site loads fast and every car can be repainted live.
import * as THREE from 'three';

const BEVEL = 0.12;

// Side-profile parameters per body style (metres, front of the car points to +x).
export const BODY_STYLES = {
  coupe:    { L: 4.6,  W: 1.96, r: 0.37, wb: 2.7,  shift: 0.0,  c: 0.16, noseH: 0.44, hoodH: 0.68, beltH: 0.84, deckH: 0.9,  aBase: 0.82, aTop: -0.08, cTop: -1.0, cBase: -1.9,  roofH: 1.24 },
  sedan:    { L: 4.9,  W: 1.9,  r: 0.36, wb: 2.95, shift: 0.0,  c: 0.17, noseH: 0.5,  hoodH: 0.76, beltH: 0.92, deckH: 0.98, aBase: 0.92, aTop: 0.2,  cTop: -1.05, cBase: -1.75, roofH: 1.4 },
  suv:      { L: 4.8,  W: 1.98, r: 0.41, wb: 2.9,  shift: 0.0,  c: 0.27, noseH: 0.76, hoodH: 1.0,  beltH: 1.12, deckH: 1.18, aBase: 0.98, aTop: 0.38, cTop: -1.75, cBase: -2.08, roofH: 1.72 },
  roadster: { L: 4.3,  W: 1.92, r: 0.36, wb: 2.55, shift: 0.0,  c: 0.15, noseH: 0.42, hoodH: 0.64, beltH: 0.8,  deckH: 0.86, aBase: 0.45, aTop: -0.05, cTop: -0.45, cBase: -1.15, roofH: 1.1 },
  pickup:   { L: 5.3,  W: 2.0,  r: 0.42, wb: 3.2,  shift: 0.1,  c: 0.31, noseH: 0.95, hoodH: 1.18, beltH: 1.27, deckH: 1.27, aBase: 1.15, aTop: 0.62, cTop: -0.35, cBase: -0.48, roofH: 1.9, bed: true },
  hatch:    { L: 4.15, W: 1.82, r: 0.35, wb: 2.65, shift: 0.0,  c: 0.17, noseH: 0.56, hoodH: 0.8,  beltH: 0.94, deckH: 1.02, aBase: 0.88, aTop: 0.18, cTop: -1.5,  cBase: -1.82, roofH: 1.48 },
};

function bodyShape(p) {
  const { L, r, wb, shift, c, noseH, hoodH, beltH, deckH, aBase, cBase } = p;
  const f = L / 2, b = -L / 2;
  const archR = r + 0.07 + BEVEL;
  const xr = -wb / 2 + shift, xf = wb / 2 + shift;
  const s = new THREE.Shape();
  s.moveTo(f, c + 0.22);
  s.lineTo(f, noseH);
  s.quadraticCurveTo(f - 0.06, hoodH - 0.02, f - 0.55, hoodH);
  s.quadraticCurveTo(aBase + 0.4, beltH - 0.03, aBase, beltH);
  s.lineTo(cBase, beltH);
  s.quadraticCurveTo(b + 0.25, deckH, b + 0.06, deckH - 0.16);
  s.lineTo(b, c + 0.26);
  s.quadraticCurveTo(b, c, b + 0.26, c);
  s.lineTo(xr - archR, c);
  s.absarc(xr, r, archR, Math.PI, 0, true);
  s.lineTo(xr + archR, c);
  s.lineTo(xf - archR, c);
  s.absarc(xf, r, archR, Math.PI, 0, true);
  s.lineTo(xf + archR, c);
  s.lineTo(f - 0.26, c);
  s.quadraticCurveTo(f, c, f, c + 0.22);
  return s;
}

function cabinShape(p) {
  const { beltH, aBase, aTop, cTop, cBase, roofH } = p;
  const s = new THREE.Shape();
  s.moveTo(aBase + 0.02, beltH - 0.02);
  s.quadraticCurveTo(aBase - 0.12, beltH + (roofH - beltH) * 0.55, aTop, roofH);
  s.quadraticCurveTo((aTop + cTop) / 2, roofH + 0.05, cTop, roofH - 0.01);
  s.quadraticCurveTo(cBase + 0.1, roofH - 0.06, cBase - 0.02, beltH - 0.02);
  s.closePath();
  return s;
}

function extrude(shape, width, bevelT, bevelS, segs = 8) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, width - bevelT * 2),
    bevelEnabled: true, bevelThickness: bevelT, bevelSize: bevelS, bevelSegments: segs, curveSegments: 28,
  });
  g.translate(0, 0, -(width - bevelT * 2) / 2);
  g.computeVertexNormals();
  return g;
}

// Shared, reusable materials (paint is per car so it can be recoloured).
const shared = {};
function mats() {
  if (shared.glass) return shared;
  shared.glass = new THREE.MeshPhysicalMaterial({ color: 0x07090c, metalness: 0.3, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 });
  shared.trim = new THREE.MeshStandardMaterial({ color: 0x0b0c0e, metalness: 0.2, roughness: 0.55 });
  shared.tire = new THREE.MeshStandardMaterial({ color: 0x111214, metalness: 0, roughness: 0.92 });
  shared.rim = new THREE.MeshStandardMaterial({ color: 0xb9bcc2, metalness: 1, roughness: 0.22 });
  shared.rimDark = new THREE.MeshStandardMaterial({ color: 0x2a2c31, metalness: 1, roughness: 0.3 });
  shared.head = new THREE.MeshBasicMaterial({ color: 0xf4f7ff });
  shared.tail = new THREE.MeshBasicMaterial({ color: 0xff2a1a });
  shared.caliper = new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.3, roughness: 0.4 });
  return shared;
}

function radialTexture(stops) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, c]) => grd.addColorStop(o, c));
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
let glowTex, shadowTex;
export const getGlowTexture = () => (glowTex ||= radialTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]));
export const getShadowTexture = () => (shadowTex ||= radialTexture([[0, 'rgba(0,0,0,.85)'], [0.55, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]));

function buildWheel(p, darkRims) {
  const m = mats();
  const { r } = p;
  const w = 0.3, rimR = r * 0.68;
  const pivot = new THREE.Group();
  const wheel = new THREE.Group();
  pivot.add(wheel);
  // Rounded tyre via lathe profile
  const pts = [];
  const k = 0.07;
  pts.push(new THREE.Vector2(rimR, -w / 2));
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(r - k + Math.cos(a) * k, -w / 2 + k + Math.sin(a) * k)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(r - k + Math.cos(a) * k, w / 2 - k + Math.sin(a) * k)); }
  pts.push(new THREE.Vector2(rimR, w / 2));
  const tire = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), m.tire);
  tire.rotation.x = Math.PI / 2;
  tire.castShadow = true;
  wheel.add(tire);
  const rimMat = darkRims ? m.rimDark : m.rim;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, w * 0.86, 40, 1, true), m.trim);
  barrel.rotation.x = Math.PI / 2;
  wheel.add(barrel);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.98, rimR * 0.98, 0.02, 40), m.trim);
  face.rotation.x = Math.PI / 2; face.position.z = w * 0.28;
  wheel.add(face);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(rimR * 0.98, 0.018, 8, 48), rimMat);
  lip.position.z = w * 0.42;
  wheel.add(lip);
  const spokeGeo = new THREE.BoxGeometry(rimR * 0.95, 0.055, 0.05);
  spokeGeo.translate(rimR * 0.47, 0, 0);
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(spokeGeo, rimMat);
    s.rotation.z = (i / 10) * Math.PI * 2 + (i % 2 ? 0.12 : 0);
    s.position.z = w * 0.38;
    wheel.add(s);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.2, rimR * 0.22, 0.08, 24), rimMat);
  hub.rotation.x = Math.PI / 2; hub.position.z = w * 0.4;
  wheel.add(hub);
  // Caliper stays put while the wheel spins
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.16, rimR * 0.62, 0.07), m.caliper);
  cal.position.set(rimR * 0.48, rimR * 0.28, w * 0.18);
  cal.rotation.z = -0.5;
  pivot.add(cal);
  return { pivot, wheel };
}

/**
 * Build a car. Returns a THREE.Group with userData { paint, wheels, spec } so callers
 * can recolour paint and roll the wheels.
 */
export function buildCar(type = 'coupe', color = '#c9372c', opts = {}) {
  const p = BODY_STYLES[type] || BODY_STYLES.coupe;
  const m = mats();
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05,
  });

  const body = new THREE.Mesh(extrude(bodyShape(p), p.W, 0.15, BEVEL, 10), paint);
  body.castShadow = true; body.receiveShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(extrude(cabinShape(p), p.W * 0.76, 0.12, 0.05, 6), m.glass);
  cabin.castShadow = true;
  car.add(cabin);

  const f = p.L / 2 + BEVEL, b = -p.L / 2 - BEVEL;
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat);
    o.position.set(x, y, z); o.rotation.set(rx, ry, rz);
    car.add(o);
    return o;
  };

  // Side skirts + lower front intake + rear diffuser
  const archR = p.r + 0.07 + BEVEL;
  const skirtLen = p.wb - archR * 2 - 0.06;
  [-1, 1].forEach((sd) => add(new THREE.BoxGeometry(skirtLen, 0.09, 0.05), m.trim, p.shift, p.c - BEVEL + 0.05, sd * (p.W / 2 - 0.02)));
  add(new THREE.BoxGeometry(0.06, 0.16, p.W - 0.7), m.trim, f - 0.035, p.c + 0.18, 0);
  add(new THREE.BoxGeometry(0.06, 0.12, p.W - 0.6), m.trim, b + 0.04, p.c + 0.12, 0);

  // Light signatures: thin LED blades with glow sprites
  const glowMat = (c) => new THREE.SpriteMaterial({ map: getGlowTexture(), color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 });
  const headY = p.noseH - 0.04;
  [-1, 1].forEach((sd) => {
    add(new THREE.BoxGeometry(0.05, 0.045, 0.46), m.head, f - 0.03, headY, sd * (p.W / 2 - 0.42), 0, sd * 0.25, 0);
    const g = new THREE.Sprite(glowMat(0xdfe8ff)); g.scale.set(0.9, 0.35, 1); g.position.set(f + 0.02, headY, sd * (p.W / 2 - 0.42)); car.add(g);
  });
  add(new THREE.BoxGeometry(0.04, 0.02, p.W - 1.1), m.head, f - 0.02, headY + 0.005, 0);
  const tailY = p.deckH - 0.12;
  add(new THREE.BoxGeometry(0.05, 0.05, p.W - 0.35), m.tail, b + 0.06, tailY, 0);
  [-1, 1].forEach((sd) => {
    const g = new THREE.Sprite(glowMat(0xff3a22)); g.scale.set(0.8, 0.3, 1); g.position.set(b - 0.02, tailY, sd * (p.W / 2 - 0.3)); car.add(g);
  });

  // Mirrors
  [-1, 1].forEach((sd) => {
    add(new THREE.BoxGeometry(0.16, 0.08, 0.16), paint, p.aBase - 0.14, p.beltH + 0.13, sd * (p.W * 0.38 + 0.12), 0, sd * 0.2, -0.1);
    add(new THREE.BoxGeometry(0.05, 0.04, 0.1), m.trim, p.aBase - 0.1, p.beltH + 0.09, sd * (p.W * 0.38 + 0.03));
  });

  if (p.bed) {
    const bedLen = p.cBase - 0.12 - (-p.L / 2 + 0.14);
    add(new THREE.BoxGeometry(bedLen, 0.03, p.W - 0.42), m.trim, (p.cBase - 0.12 + (-p.L / 2 + 0.14)) / 2, p.beltH + BEVEL - 0.004, 0);
  }

  // Wheels
  const wheels = [];
  const xs = [p.wb / 2 + p.shift, -p.wb / 2 + p.shift];
  xs.forEach((x) => [-1, 1].forEach((sd) => {
    const { pivot, wheel } = buildWheel(p, opts.darkRims);
    pivot.position.set(x, p.r, sd * (p.W / 2 - 0.13));
    if (sd < 0) pivot.children.forEach((ch) => { ch.rotation.y += Math.PI; ch.position.z *= -1; });
    car.add(pivot);
    wheels.push({ pivot, wheel, flip: sd < 0 ? -1 : 1 });
  }));

  car.userData = { paint, wheels, spec: p, type };
  return car;
}

/** Roll the wheels by a travelled distance (metres along +x). */
export function rollWheels(car, dx) {
  const { wheels, spec } = car.userData;
  const a = dx / spec.r;
  wheels.forEach(({ wheel, flip }) => { wheel.rotation.z -= a * flip; });
}

export function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && o.material === obj.userData?.paint) o.material.dispose();
  });
}
