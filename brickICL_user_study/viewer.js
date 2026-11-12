// Two linked 3D views of one question: the input (left) and the input plus the added parts (right).
// The LDraw handling follows nzd-supertry/viewer/index.html.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';

const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// One camera and one target for both views, so they turn together.
const camera = new THREE.PerspectiveCamera(32, 1, 1, 1e5);
const target = new THREE.Vector3();
const panes = [];
let dirty = false;
function invalidate() {
  if (dirty) return;
  dirty = true;
  requestAnimationFrame(() => { dirty = false; panes.forEach(p => p.render()); });
}

class Pane {
  constructor(host) {
    this.canvas = document.createElement('canvas');
    host.append(this.canvas);
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.toneMapping = THREE.NeutralToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    const s = this.scene = new THREE.Scene();
    s.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    s.environmentIntensity = 0.55;
    s.add(new THREE.HemisphereLight(0xffffff, 0x8d939a, 1.1));
    this.sun = new THREE.DirectionalLight(0xffffff, 1.7);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.radius = 4;
    s.add(this.sun, this.sun.target);
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.16 }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    s.add(this.ground);
    this.controls = new OrbitControls(camera, this.canvas);
    this.controls.target = target;
    this.controls.addEventListener('change', invalidate);
    this.root = null;
    new ResizeObserver(() => { this.resize(); invalidate(); }).observe(this.canvas);
  }
  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    if (camera.aspect !== w / h) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  }
  setRoot(group) {
    if (this.root) this.scene.remove(this.root);
    this.root = group;
    if (group) this.scene.add(group);
  }
  light(r) {
    this.ground.scale.set(r * 10, r * 10, 1);
    this.sun.position.set(r * 0.9, r * 2.2, r * 1.3);
    Object.assign(this.sun.shadow.camera, { left: -r * 1.6, right: r * 1.6, top: r * 1.6, bottom: -r * 1.6, near: r * 0.2, far: r * 6 });
    this.sun.shadow.camera.updateProjectionMatrix();
  }
  render() { if (this.canvas.isConnected && this.root) this.renderer.render(this.scene, camera); }
}

export class Viewer {
  // hosts: the two .stage elements; dataUrl: folder with colors.ldr and lib/
  constructor(hosts, dataUrl) {
    this.dataUrl = dataUrl;
    hosts.forEach(h => panes.push(new Pane(h)));
    this.loader = new LDrawLoader();
    this.loader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
    this.ready = this.loader.preloadMaterials(dataUrl + 'colors.ldr');
    this.lib = new Map();          // part file -> { loader key: LDraw text } for the part and its sub-files
    this.dimCache = new Map();
    this.opt = { highlight: true, edges: true };
    this.current = null;
    this.ticket = 0;
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { this.dimCache.clear(); this.fill(); });
  }

  // q: { context: [LDraw lines], added: [LDraw lines], parts: [part files] }. Resolves true once it is on screen.
  async show(q) {
    const ticket = ++this.ticket;
    this.current = null;
    panes.forEach(p => p.setRoot(null));
    invalidate();
    await this.ready;
    await Promise.all(q.parts.filter(p => !this.lib.has(p)).map(async p => {
      const r = await fetch(this.dataUrl + 'lib/' + p.replace(/[^\w.-]/g, '_') + '.json');
      this.lib.set(p, r.ok ? await r.json() : {});
    }));
    if (ticket !== this.ticket) return false;
    const lines = [...q.context, ...q.added];
    const sections = new Map();
    for (const p of q.parts) for (const [key, text] of Object.entries(this.lib.get(p))) if (text) sections.set(key, text);
    let text = '0 FILE main.ldr\n0 Name: main.ldr\n' + lines.join('\n0 STEP\n') + '\n';
    for (const [key, t] of sections) text += `0 FILE ${key}\n${t}\n`;
    const model = await new Promise((res, rej) => this.loader.parse(text, res, rej));
    if (ticket !== this.ticket) return false;
    const parts = [];
    model.children.forEach(o => { if (o.isGroup) parts[o.userData.buildingStep] = o; });
    model.rotation.x = Math.PI;                // LDraw is -Y up
    model.updateMatrixWorld(true);
    const n0 = q.context.length, box = new THREE.Box3(), boxAdded = new THREE.Box3();
    parts.forEach((p, j) => { if (!p) return; box.expandByObject(p); if (j >= n0) boxAdded.expandByObject(p); });
    const c = box.getCenter(new THREE.Vector3()), offset = new THREE.Vector3(-c.x, -box.min.y, -c.z);
    const size = box.getSize(new THREE.Vector3());
    this.current = { parts, n0, offset, box: box.translate(offset), boxAdded: boxAdded.translate(offset),
      radius: Math.max(size.x, size.y, size.z, 40) };
    panes.forEach(p => p.resize());
    this.fill();
    this.fit();
    return true;
  }

  dim(mat) {
    if (Array.isArray(mat)) return mat.map(m => this.dim(m));
    let v = this.dimCache.get(mat.uuid);
    if (!v) {
      v = mat.clone();
      v.color.lerp(new THREE.Color(css('--dim')), 0.8);
      if (v.transparent) v.opacity = Math.min(v.opacity, 0.4);
      this.dimCache.set(mat.uuid, v);
    }
    return v;
  }

  // An orange silhouette around an added part: the part drawn again, back faces only, stretched about the
  // centre of its bounding box (in the part's own frame) so that every side sticks out by `width`.
  outline(part, width) {
    const inner = part.clone();
    inner.visible = true;
    inner.position.set(0, 0, 0); inner.quaternion.identity(); inner.scale.set(1, 1, 1);
    inner.traverse(c => {
      if (c.isMesh) { c.material = this.hull ??= new THREE.MeshBasicMaterial({ side: THREE.BackSide }); c.castShadow = false; }
      else if (c.isLineSegments) c.visible = false;
    });
    inner.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(inner);
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const s = new THREE.Vector3(1 + 2 * width / Math.max(size.x, 1), 1 + 2 * width / Math.max(size.y, 1), 1 + 2 * width / Math.max(size.z, 1));
    inner.scale.copy(s);
    inner.position.set(c.x * (1 - s.x), c.y * (1 - s.y), c.z * (1 - s.z));
    const wrap = new THREE.Group();
    wrap.position.copy(part.position); wrap.quaternion.copy(part.quaternion); wrap.scale.copy(part.scale);
    wrap.add(inner);
    return wrap;
  }

  add(root, part, mode, width) {
    if (!part) return;
    const o = part.clone();
    o.visible = true;
    o.traverse(c => {
      if (c.isMesh) {
        if (mode === 'dim') c.material = this.dim(c.material);
        c.castShadow = true; c.receiveShadow = true;
      } else if (c.isLineSegments) c.visible = this.opt.edges;
    });
    root.add(o);
    if (mode === 'added') root.add(this.outline(part, width));
  }

  fill() {
    const T = this.current;
    if (!T) return;
    this.hull?.color.set(css('--added'));
    const width = Math.max(T.radius * 0.014, 0.8);
    panes.forEach((pane, i) => {
      const root = new THREE.Group();
      root.rotation.x = Math.PI;
      root.position.copy(T.offset);
      const hl = i === 1 && this.opt.highlight;
      T.parts.forEach((p, j) => {
        if (j < T.n0) this.add(root, p, hl ? 'dim' : null);
        else if (i === 1) this.add(root, p, hl ? 'added' : null, width);
      });
      this.hull?.color.set(css('--added'));
      pane.setRoot(root);
      pane.light(T.radius);
    });
    invalidate();
  }

  setOption(name, value) { this.opt[name] = value; this.fill(); }

  fit(onAdded = false) {
    const T = this.current;
    if (!T) return;
    const sphere = (onAdded && !T.boxAdded.isEmpty() ? T.boxAdded : T.box).getBoundingSphere(new THREE.Sphere());
    if (onAdded) sphere.radius = Math.max(sphere.radius * 2.2, T.radius * 0.35);
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const half = Math.min(vHalf, Math.atan(Math.tan(vHalf) * camera.aspect));
    const dist = sphere.radius / Math.sin(half) * 1.08;
    const dir = onAdded ? camera.position.clone().sub(target).normalize() : new THREE.Vector3(0.75, 0.55, 1).normalize();
    target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(dir, dist);
    camera.near = dist / 100; camera.far = dist * 100;
    camera.updateProjectionMatrix();
    panes.forEach(p => p.controls.update());
    invalidate();
  }
}
