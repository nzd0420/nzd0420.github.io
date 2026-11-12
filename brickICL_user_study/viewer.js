// Linked 3D views of one question: the input, the reference answer and the candidates. Every view shows
// the same input parts; all but the first add their own parts on top, outlined.
// The LDraw handling follows nzd-supertry/viewer/index.html.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';

const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Fetch JSON, trying again when the connection drops; `absent` is what a file that does not exist (404) stands for.
export async function fetchJson(url, absent) {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
      if (r.status === 404 && absent !== undefined) return absent;
      throw Error(`${r.status} for ${url}`);
    } catch (err) {
      if (attempt >= 3) throw err;
      await new Promise(res => setTimeout(res, 400 * (attempt + 1)));
    }
  }
}

// One camera and one target for every view, so they turn together.
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
  // hosts: the .stage elements, one per view (data-tone="ref" outlines in the reference colour);
  // dataUrl: folder with colors.ldr and lib/
  constructor(hosts, dataUrl) {
    this.dataUrl = dataUrl;
    this.tones = hosts.map(h => (h.dataset.tone === 'ref' ? '--ref' : '--added'));
    this.hulls = {};
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

  // q: { context: [LDraw lines], views: [per view, the LDraw lines it adds, or null], parts: [part files],
  //      separate: true when the views are unrelated whole models rather than additions to one input }.
  // Resolves true once it is on screen.
  async show(q) {
    const ticket = ++this.ticket;
    this.current = null;
    panes.forEach(p => p.setRoot(null));
    invalidate();
    await this.ready;
    await Promise.all(q.parts.filter(p => !this.lib.has(p)).map(async p => {
      this.lib.set(p, await fetchJson(this.dataUrl + 'lib/' + p.replace(/[^\w.-]/g, '_') + '.json', {}));
    }));
    if (ticket !== this.ticket) return false;
    const lines = [...q.context], ranges = [];
    for (const added of q.views) { const a = lines.length; lines.push(...(added || [])); ranges.push([a, lines.length]); }
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
    // The camera frames the input and everything any view adds; "added parts" frames what the first view with parts adds.
    const n0 = q.context.length, box = new THREE.Box3(), boxAdded = new THREE.Box3();
    const [fa, fb] = ranges.find(([a, b]) => b > a) || [0, 0];
    parts.forEach((p, j) => { if (!p) return; box.expandByObject(p); if (j >= fa && j < fb) boxAdded.expandByObject(p); });
    const ground = b => { const c = b.getCenter(new THREE.Vector3()); return new THREE.Vector3(-c.x, -b.min.y, -c.z); };
    let offsets, scales = ranges.map(() => 1);
    if (q.separate) {
      // Every model stands on the ground at the centre of its own view, and is scaled to the size of the
      // largest one: the models are unrelated, so a small one should not look small next to a large one.
      const owns = ranges.map(([a, b]) => {
        const own = new THREE.Box3();
        for (let j = a; j < b; j++) if (parts[j]) own.expandByObject(parts[j]);
        return own;
      });
      offsets = owns.map(own => (own.isEmpty() ? new THREE.Vector3() : ground(own)));
      const radii = owns.map((own, i) => (own.isEmpty() ? 0 : own.translate(offsets[i]).getBoundingSphere(new THREE.Sphere()).radius));
      const largest = Math.max(...radii, 1);
      scales = radii.map(r => (r > 0 ? largest / r : 1));
      box.makeEmpty();
      owns.forEach((own, i) => { if (!own.isEmpty()) box.union(new THREE.Box3(own.min.clone().multiplyScalar(scales[i]), own.max.clone().multiplyScalar(scales[i]))); });
      boxAdded.copy(box);
    } else {
      const offset = ground(box);
      offsets = ranges.map(() => offset);
      box.translate(offset); boxAdded.translate(offset);
    }
    const size = box.getSize(new THREE.Vector3());
    this.current = { parts, n0, ranges, offsets, scales, separate: !!q.separate, box, boxAdded, radius: Math.max(size.x, size.y, size.z, 40) };
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
  outline(part, width, tone) {
    const inner = part.clone();
    inner.visible = true;
    inner.position.set(0, 0, 0); inner.quaternion.identity(); inner.scale.set(1, 1, 1);
    inner.traverse(c => {
      if (c.isMesh) { c.material = this.hulls[tone] ??= new THREE.MeshBasicMaterial({ side: THREE.BackSide }); c.castShadow = false; }
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

  add(root, part, mode, width, tone) {
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
    if (mode === 'added') root.add(this.outline(part, width, tone));
  }

  fill() {
    const T = this.current;
    if (!T) return;
    const width = Math.max(T.radius * 0.014, 0.8);
    panes.forEach((pane, i) => {
      const root = new THREE.Group();
      root.rotation.x = Math.PI;
      root.scale.setScalar(T.scales[i]);
      root.position.copy(T.offsets[i]).multiplyScalar(T.scales[i]);
      const [a, b] = T.ranges[i] || [0, 0];
      const hl = this.opt.highlight && i > 0 && !T.separate;   // the first view is the plain input; whole models are shown as they are
      for (let j = 0; j < T.n0; j++) this.add(root, T.parts[j], hl ? 'dim' : null);
      for (let j = a; j < b; j++) this.add(root, T.parts[j], hl ? 'added' : null, width, this.tones[i]);
      pane.setRoot(root);
      pane.light(T.radius);
    });
    for (const [tone, mat] of Object.entries(this.hulls)) mat.color.set(css(tone));
    invalidate();
  }

  setOption(name, value) { this.opt[name] = value; this.fill(); }

  fit(onAdded = false) {
    const T = this.current;
    if (!T) return;
    const sphere = (onAdded && !T.boxAdded.isEmpty() ? T.boxAdded : T.box).getBoundingSphere(new THREE.Sphere());
    if (onAdded) sphere.radius = Math.max(sphere.radius * 2.2, T.radius * 0.35);
    if (T.separate) sphere.radius *= 0.78;     // the union of differently shaped models overstates what each view needs
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
