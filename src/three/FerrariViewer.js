// Studio viewer for the Ferrari 458 Italia glTF model (model by vicent091036, via the three.js examples).
// Light, neutral studio so it sits naturally on a white page, with drag-to-rotate and live repainting.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

const BASE = import.meta.env?.BASE_URL ?? './';

export class FerrariViewer {
  constructor(canvas, { paint = '#b5120f', onReady, reduceMotion = false } = {}) {
    this.canvas = canvas;
    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(-4.3, 1.25, -4.5);

    const controls = (this.controls = new OrbitControls(this.camera, canvas));
    Object.assign(controls, {
      enableDamping: true, dampingFactor: 0.07, enablePan: false, enableZoom: false,
      autoRotate: !reduceMotion, autoRotateSpeed: 0.55, minPolarAngle: 0.9, maxPolarAngle: Math.PI / 2 - 0.08,
    });
    controls.target.set(0, 0.5, 0);
    controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(this.resume); });
    controls.addEventListener('end', () => { if (!reduceMotion) this.resume = setTimeout(() => { controls.autoRotate = true; }, 4000); });

    this.body = new THREE.MeshPhysicalMaterial({ color: paint, metalness: 0.9, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.03 });
    this.details = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.35 });
    this.glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1 });
    this.wheels = [];

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
      this.scene.add(car);
      draco.dispose();
      if (!reduceMotion) gsap.from(car.position, { z: 7, duration: 2, ease: 'expo.out' });
      onReady?.();
    });

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.visible = true;
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; });
    this.io.observe(canvas);
    renderer.setAnimationLoop(() => {
      if (!this.visible) return;
      this.controls.update();
      renderer.render(this.scene, this.camera);
    });
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Keep the whole car in frame on narrow screens.
    this.camera.fov = w / h < 1.2 ? 40 : 28;
    this.camera.updateProjectionMatrix();
  }

  setPaint(hex) {
    const c = new THREE.Color(hex);
    gsap.to(this.body.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: 'power2.out' });
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.ro.disconnect();
    this.io.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
