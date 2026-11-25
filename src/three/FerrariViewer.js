// Studio viewer for the Ferrari 458 Spider glTF model (model by vicent091036, via the three.js examples).
// The car drives in on rolling wheels, dips its nose as it brakes, follows the mouse a little,
// turns as the page scrolls, and can be dragged round and repainted.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

const BASE = import.meta.env?.BASE_URL ?? './';
const WHEEL_R = 0.33;

export class FerrariViewer {
  constructor(canvas, { paint = '#b5120f', onReady, onProgress, reduceMotion = false } = {}) {
    this.canvas = canvas;
    this.reduceMotion = reduceMotion;
    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;
    pmrem.dispose();
    // A warm key and cool rim give the paint some shape on the flat yellow block.
    const key = new THREE.DirectionalLight(0xfff1d6, 1.4);
    key.position.set(-3, 5, -2);
    const rim = new THREE.DirectionalLight(0xbfd8ff, 1.1);
    rim.position.set(4, 2.5, 4);
    this.scene.add(key, rim);

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.camera.position.set(-4.3, 1.25, -4.5);
    this.baseFov = 28;

    const controls = (this.controls = new OrbitControls(this.camera, canvas));
    Object.assign(controls, {
      enableDamping: true, dampingFactor: 0.07, enablePan: false, enableZoom: false,
      autoRotate: false, autoRotateSpeed: 0.6, minPolarAngle: 0.9, maxPolarAngle: Math.PI / 2 - 0.08,
    });
    controls.target.set(0, 0.5, 0);
    controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(this.resume); });
    controls.addEventListener('end', () => { if (!reduceMotion) this.resume = setTimeout(() => { controls.autoRotate = true; }, 3500); });

    this.body = new THREE.MeshPhysicalMaterial({ color: paint, metalness: 0.85, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.03 });
    this.details = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.3 });
    // Dark tinted glass: reads as a closed coupé roof instead of see-through.
    this.glass = new THREE.MeshPhysicalMaterial({ color: 0x0d141c, metalness: 0.5, roughness: 0.04, transmission: 0.2, transparent: true, opacity: 0.92, clearcoat: 1 });
    this.wheels = [];

    // pivot: scroll + mouse yaw; rig: drive-in travel and suspension pitch/bounce.
    this.pivot = new THREE.Group();
    this.rig = new THREE.Group();
    this.pivot.add(this.rig);
    this.scene.add(this.pivot);
    this.scroll = 0;
    this.mouse = { x: 0, y: 0 };
    this.lean = { x: 0, y: 0 };
    this.lastZ = 0;

    const draco = new DRACOLoader();
    draco.setDecoderPath(`${BASE}draco/`);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    const shadow = new THREE.TextureLoader().load(`${BASE}models/ferrari_ao.png`);
    loader.load(`${BASE}models/ferrari.glb`, (gltf) => {
      const car = gltf.scene.children[0];
      car.getObjectByName('body').material = this.body;
      ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim'].forEach((n) => { car.getObjectByName(n).material = this.details; });
      car.getObjectByName('glass').material = this.glass;
      ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].forEach((n) => this.wheels.push(car.getObjectByName(n)));
      const ao = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({ map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true }),
      );
      ao.rotation.x = -Math.PI / 2;
      ao.renderOrder = 2;
      car.add(ao);
      this.car = car;
      this.rig.add(car);
      draco.dispose();
      onReady?.();
      this.driveIn();
    }, (e) => { if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100)); });

    this.onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      this.mouse.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    };
    window.addEventListener('pointermove', this.onMove, { passive: true });

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.visible = true;
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; });
    this.io.observe(canvas);
    this.clock = new THREE.Clock();
    renderer.setAnimationLoop(() => this.frame());
  }

  // Rolls in from behind the frame, brakes with a little nose dive, then settles on the springs.
  driveIn() {
    if (this.reduceMotion) return;
    this.rig.position.z = 9;
    this.lastZ = 9;
    gsap.timeline({ onComplete: () => { this.controls.autoRotate = true; } })
      .to(this.rig.position, { z: 0, duration: 2.2, ease: 'expo.out' })
      .to(this.rig.rotation, { x: -0.025, duration: 0.35, ease: 'power2.out' }, 0.9)
      .to(this.rig.rotation, { x: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' }, 1.25);
  }

  // Little hop on the suspension when the paint changes.
  setPaint(hex) {
    const c = new THREE.Color(hex);
    gsap.to(this.body.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: 'power2.out' });
    if (!this.reduceMotion && this.car) {
      gsap.timeline()
        .to(this.rig.position, { y: 0.07, duration: 0.18, ease: 'power2.out' })
        .to(this.rig.position, { y: 0, duration: 0.7, ease: 'bounce.out' });
    }
  }

  // 0 at the top of the page, 1 once the hero has scrolled away.
  setScroll(p) { this.scroll = p; }

  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.visible) return;
    if (this.car) {
      const z = this.rig.position.z;
      const dz = z - this.lastZ;
      this.lastZ = z;
      if (dz) this.wheels.forEach((w) => { w.rotation.x += dz / WHEEL_R; });
    }
    const k = 1 - Math.pow(0.002, dt);
    this.lean.x += (this.mouse.x - this.lean.x) * k;
    this.lean.y += (this.mouse.y - this.lean.y) * k;
    this.pivot.rotation.y = this.scroll * 1.6 + this.lean.x * 0.12;
    this.pivot.position.y = -this.scroll * 0.25;
    this.camera.fov = this.baseFov + this.scroll * 4 - this.lean.y * 0.6;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.baseFov = w / h < 1.2 ? 40 : 28;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('pointermove', this.onMove);
    this.ro.disconnect();
    this.io.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
