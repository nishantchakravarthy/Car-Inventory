// The showroom stage: a turntable car under studio light, orbiting light ribbons,
// drifting dust and a glowing turntable ring. Camera + framing are driven by a plain
// `state` object so GSAP ScrollTrigger can scrub it.
import * as THREE from 'three';
import gsap from 'gsap';
import { buildCar, rollWheels, disposeObject, getGlowTexture } from './carFactory.js';
import { createRenderer, createStudio, fitContact } from './studio.js';

const ribbonVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const ribbonFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime; uniform float uOffset; uniform vec3 uColor; uniform float uIntensity;
  void main(){
    float x = fract(vUv.x * 2.0 - uTime + uOffset);
    float head = smoothstep(1.0, 0.975, x);
    float a = pow(x, 4.0) * head;
    gl_FragColor = vec4(uColor * a * 2.2 * uIntensity, a * uIntensity);
  }
`;
const dustVert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime; uniform float uDpr;
  varying float vA;
  void main(){
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.08 + aSeed * 0.12), 4.5);
    p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aSeed * 3.0) * uDpr * (6.0 / -mv.z);
    vA = smoothstep(0.0, 0.6, p.y) * smoothstep(4.5, 3.2, p.y) * (0.35 + aSeed * 0.65);
  }
`;
const dustFrag = /* glsl */ `
  varying float vA; uniform vec3 uColor;
  void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA; gl_FragColor = vec4(uColor * a, a); }
`;

export class Stage {
  constructor(canvas, { reduceMotion = false } = {}) {
    this.canvas = canvas;
    this.reduceMotion = reduceMotion;
    this.renderer = createRenderer(canvas);
    const studio = createStudio(this.renderer);
    Object.assign(this, studio);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.rig = new THREE.Group();
    this.scene.add(this.rig);
    this.auto = 0;
    this.hold = 1;
    this.carX = 0;
    this.running = true;
    this.state = { theta: 0.95, phi: 0.16, dist: 10.5, lookY: 0.62, shiftX: 0.2, shiftY: 0, spin: 1, ribbon: 1, ribbonSpeed: 1, intro: 0 };
    this.clock = new THREE.Clock();
    this.time = 0;
    this.ribbonTime = 0;
    this.buildRing();
    this.buildRibbons();
    this.buildDust();
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    this.renderer.setAnimationLoop(this.tick);
  }

  buildRing() {
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff7a3d, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(3.25, 3.29, 160), ringMat);
    this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.006;
    this.scene.add(this.ring);
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(3.6, 3.61, 160), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.006;
    this.scene.add(ring2);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: getGlowTexture(), color: 0x9fb4d6, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = 0.002;
    this.scene.add(pool);
  }

  buildRibbons() {
    this.ribbons = new THREE.Group();
    const defs = [
      { R: 3.7, h: 0.35, amp: 0.22, ph: 0.0, color: 0xff6a2b, off: 0.0 },
      { R: 4.1, h: 1.05, amp: 0.35, ph: 1.7, color: 0x6fd8ff, off: 0.33 },
      { R: 3.4, h: 1.6, amp: 0.25, ph: 3.1, color: 0xffd2a8, off: 0.66 },
      { R: 4.6, h: 0.75, amp: 0.4, ph: 4.4, color: 0xff6a2b, off: 0.15 },
    ];
    this.ribbonMats = defs.map((d) => {
      const pts = [];
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const r = d.R + Math.sin(a * 2 + d.ph) * 0.35;
        pts.push(new THREE.Vector3(Math.cos(a) * r, d.h + Math.sin(a * 3 + d.ph) * d.amp, Math.sin(a) * r * 0.8));
      }
      const curve = new THREE.CatmullRomCurve3(pts, true);
      const mat = new THREE.ShaderMaterial({
        vertexShader: ribbonVert, fragmentShader: ribbonFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uOffset: { value: d.off }, uColor: { value: new THREE.Color(d.color) }, uIntensity: { value: 1 } },
      });
      this.ribbons.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.012, 6, true), mat));
      return mat;
    });
    this.scene.add(this.ribbons);
  }

  buildDust() {
    const n = 520;
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 6;
      pos.set([Math.cos(a) * r, Math.random() * 4.5, Math.sin(a) * r], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uDpr: { value: this.renderer.getPixelRatio() }, uColor: { value: new THREE.Color(0xffe6cf) } },
    });
    this.scene.add(new THREE.Points(g, this.dustMat));
  }

  setCar(car) {
    if (this.car) { this.car.remove(this.contact); this.rig.remove(this.car); disposeObject(this.car); }
    this.car = buildCar(car.body, car.paint, { darkRims: car.darkRims });
    this.car.add(this.contact);
    this.rig.add(this.car);
    this.lastX = undefined;
    fitContact(this.contact, this.car);
    this.current = car;
  }

  setPaint(hex) {
    if (!this.car) return;
    const c = new THREE.Color(hex);
    gsap.to(this.car.userData.paint.color, { r: c.r, g: c.g, b: c.b, duration: 0.8, ease: 'power2.out' });
  }

  /** Cinematic swap: current car drives off frame, the next one rolls in and brakes. */
  driveTo(car) {
    if (!this.car || this.reduceMotion) { this.setCar(car); return Promise.resolve(); }
    if (this.driving) { this.driving.kill(); this.hold = 1; }
    const full = Math.PI * 2;
    return new Promise((resolve) => {
      this.driving = gsap.timeline({ onComplete: () => { this.hold = 1; resolve(); } })
        .set(this, { hold: 0 })
        .to(this, { auto: Math.ceil(this.auto / full) * full, duration: 0.55, ease: 'power2.inOut' })
        .to(this.state, { ribbonSpeed: 5, duration: 0.6, ease: 'power2.in' }, '<0.2')
        .to(this, { carX: 14, duration: 0.85, ease: 'power3.in' }, '<')
        .add(() => { this.setCar(car); this.carX = -14; this.lastX = -14; })
        .to(this, { carX: 0, duration: 1.4, ease: 'expo.out' })
        .to(this.state, { ribbonSpeed: 1, duration: 1.2, ease: 'power2.out' }, '<');
    });
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.running) return;
    const s = this.state;
    this.time += dt;
    this.ribbonTime += dt * 0.11 * s.ribbonSpeed * (this.reduceMotion ? 0.2 : 1);
    if (!this.reduceMotion) this.auto += dt * 0.28 * s.spin * this.hold;
    this.rig.rotation.y = this.auto;
    if (this.car) {
      const x = this.carX;
      this.car.position.x = x;
      if (this.lastX !== undefined) rollWheels(this.car, x - this.lastX);
      this.lastX = x;
    }
    this.ribbons.rotation.y = this.time * 0.05;
    this.ribbonMats.forEach((m) => { m.uniforms.uTime.value = this.ribbonTime; m.uniforms.uIntensity.value = s.ribbon; });
    this.dustMat.uniforms.uTime.value = this.time;
    this.ring.material.opacity = 0.55 + Math.sin(this.time * 1.6) * 0.2;

    // Keep the car inside the frame on narrow screens.
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const dist = Math.max(s.dist, 3.4 / Math.tan(hfov / 2)) + s.intro * 7;
    const phi = s.phi + s.intro * 0.25, th = s.theta - s.intro * 0.6;
    const cp = Math.cos(phi);
    this.camera.position.set(Math.sin(th) * cp * dist, Math.sin(phi) * dist + s.lookY, Math.cos(th) * cp * dist);
    this.camera.lookAt(0, s.lookY, 0);
    this.camera.setViewOffset(this.w, this.h, -s.shiftX * this.w, -s.shiftY * this.h, this.w, this.h);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.resize);
    this.renderer.dispose();
  }
}
