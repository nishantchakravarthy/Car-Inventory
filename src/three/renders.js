// Studio "photography": one offscreen renderer produces a consistent 3/4 render
// of every car in the inventory, then frees its WebGL context.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { buildCar, disposeObject } from './carFactory.js';
import { createRenderer, createStudio, fitContact } from './studio.js';

const cache = new Map();

export async function renderInventory(cars, onEach, { width = 720, height = 450 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const renderer = createRenderer(canvas, { preserve: true, maxDpr: 1 });
  renderer.setSize(width, height, false);
  const { scene, contact } = createStudio(renderer);
  const camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 100);
  for (const car of cars) {
    const key = `${car.body}|${car.paint}|${car.darkRims ? 1 : 0}`;
    if (!cache.has(key)) {
      const mesh = buildCar(car.body, car.paint, { darkRims: car.darkRims });
      scene.add(mesh);
      fitContact(contact, mesh);
      const L = mesh.userData.spec.L;
      const d = L * 2.25, th = 0.82, ph = 0.13;
      camera.position.set(Math.sin(th) * d, Math.sin(ph) * d + 0.55, Math.cos(th) * d);
      camera.lookAt(0.15, 0.62, 0);
      renderer.render(scene, camera);
      cache.set(key, canvas.toDataURL('image/png'));
      scene.remove(mesh);
      disposeObject(mesh);
      await new Promise((r) => requestAnimationFrame(r));
    }
    onEach(car.id, cache.get(key));
  }
  renderer.dispose();
  renderer.forceContextLoss();
}

/** Interactive 360° viewer for the vehicle detail sheet. */
export class Viewer {
  constructor(canvas, car) {
    this.canvas = canvas;
    this.renderer = createRenderer(canvas);
    const studio = createStudio(this.renderer);
    this.scene = studio.scene;
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.car = buildCar(car.body, car.paint, { darkRims: car.darkRims });
    this.scene.add(this.car);
    fitContact(studio.contact, this.car);
    const L = this.car.userData.spec.L;
    this.camera.position.set(L * 2.0, 2.0, L * 1.85);
    this.controls = new OrbitControls(this.camera, canvas);
    Object.assign(this.controls, {
      enableDamping: true, dampingFactor: 0.08, enablePan: false, autoRotate: true, autoRotateSpeed: 0.9,
      minDistance: L * 1.15, maxDistance: L * 3.4, minPolarAngle: 0.5, maxPolarAngle: Math.PI / 2 - 0.04,
    });
    this.controls.target.set(0, 0.6, 0);
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; });
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.renderer.setAnimationLoop(() => { this.controls.update(); this.renderer.render(this.scene, this.camera); });
  }
  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Frame the whole car on narrow canvases (phones) until the user takes over.
    const L = this.car.userData.spec.L;
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.aspect);
    const fit = Math.max(L * 2.7, (L * 0.62) / Math.tan(hfov / 2));
    this.controls.maxDistance = Math.max(L * 3.4, fit * 1.2);
    if (this.controls.autoRotate) {
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.camera.position.copy(this.controls.target).addScaledVector(dir, fit);
    }
  }
  setPaint(hex) {
    const c = new THREE.Color(hex);
    gsap.to(this.car.userData.paint.color, { r: c.r, g: c.g, b: c.b, duration: 0.7, ease: 'power2.out' });
  }
  dispose() {
    this.renderer.setAnimationLoop(null);
    this.ro.disconnect();
    this.controls.dispose();
    disposeObject(this.car);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
