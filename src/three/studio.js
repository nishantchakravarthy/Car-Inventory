// Shared studio setup: renderer, image-based lighting, key/rim lights and a soft floor.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { getShadowTexture } from './carFactory.js';

export function createRenderer(canvas, { alpha = true, preserve = false, maxDpr = 1.75 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, preserveDrawingBuffer: preserve, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

export function createStudio(renderer, { accent = 0xff5a1f, cool = 0x5fd4ff } = {}) {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3.5, 8, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const rimWarm = new THREE.DirectionalLight(accent, 2.2);
  rimWarm.position.set(-6, 2.2, -3.5);
  scene.add(rimWarm);
  const rimCool = new THREE.DirectionalLight(cool, 1.6);
  rimCool.position.set(6, 1.6, -5);
  scene.add(rimCool);
  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x0b0b0c, 0.35));

  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.42 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const contact = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: getShadowTexture(), transparent: true, depthWrite: false, opacity: 0.85 }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.004;
  scene.add(contact);

  return { scene, key, rimWarm, rimCool, floor, contact };
}

export function fitContact(contact, car) {
  const { L, W } = car.userData.spec;
  contact.scale.set(L * 1.25, W * 1.7, 1);
}
