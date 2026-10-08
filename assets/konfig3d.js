// 3D konfigurátor střechy a FVE (Three.js r170, lokálně v assets/vendor/three).
// Načítá se líně ze site.js, až je konfigurátor blízko výřezu. SVG ilustrace zůstává jako záloha.
import * as THREE from './vendor/three/three.module.min.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';

// Rozměry domu v metrech
const W = 12.4;          // délka (osa x)
const D = 8.4;           // hloubka (osa z), přední strana míří ke kameře (+z)
const H = 3.1;           // výška zdí
const PLINTH = 0.45;
const PITCH = THREE.MathUtils.degToRad(38);
const TAN = Math.tan(PITCH);
const O = 0.55;          // přesah u okapu
const OG = 0.45;         // přesah na štítu (sedlová)
const YE = H - O * TAN;  // výška okapu
const YR = H + (D / 2) * TAN; // výška hřebene
const HL = (W - D) / 2;  // polovina délky hřebene u valbové střechy

const PANEL = { w: 1.76, h: 1.13, gap: 0.03 }; // panel na šířku: 1,76 m podél okapu, 1,13 m po spádu

const ROOF_PROPS = {
  palena: { rough: 0.78, metal: 0, bump: 2.2, tile: [2.1, 2.38] },
  betonova: { rough: 0.86, metal: 0, bump: 1.8, tile: [2.31, 2.38] },
  plech: { rough: 0.42, metal: 0.55, bump: 0.9, tile: [2.2, 2.2] },
  hlinik: { rough: 0.4, metal: 0.6, bump: 1.1, tile: [2.1, 2.1] },
  sindel: { rough: 0.95, metal: 0, bump: 1.6, tile: [1.98, 1.68] },
};

/* ---------- Textury krytin (šedotónové, barva se násobí materiálem) ---------- */
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
function noise(ctx, n, amp) {
  const img = ctx.getImageData(0, 0, n, n);
  for (let i = 0; i < img.data.length; i += 4) {
    const d = (rnd() - 0.5) * amp;
    img.data[i] += d; img.data[i + 1] += d; img.data[i + 2] += d;
  }
  ctx.putImageData(img, 0, 0);
}
function canvasTex(draw, n = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d');
  draw(ctx, n);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function tileRows(ctx, n, cols, rows, stops, lip = 0.16) {
  const cw = n / cols, rh = n / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw, y = r * rh;
      const g = ctx.createLinearGradient(x, 0, x + cw, 0);
      stops.forEach(([o, v]) => g.addColorStop(o, `rgb(${v},${v},${v})`));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, cw + 1, rh + 1);
    }
    // stín pod přesahem tašky z řady nad ní
    const s = ctx.createLinearGradient(0, r * rh, 0, r * rh + rh * lip);
    s.addColorStop(0, 'rgba(0,0,0,.55)');
    s.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = s;
    ctx.fillRect(0, r * rh, n, rh * lip);
    // světlá hrana spodku tašky
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(0, (r + 1) * rh - 3, n, 2);
  }
}
const TEX = {
  palena: () => canvasTex((ctx, n) => {
    tileRows(ctx, n, 7, 7, [[0, 105], [0.22, 238], [0.45, 205], [0.7, 150], [0.88, 112], [1, 105]]);
    noise(ctx, n, 22);
  }),
  betonova: () => canvasTex((ctx, n) => {
    tileRows(ctx, n, 7, 7, [[0, 150], [0.25, 225], [0.5, 175], [0.75, 228], [1, 150]], 0.12);
    noise(ctx, n, 30);
  }),
  plech: () => canvasTex((ctx, n) => {
    ctx.fillStyle = 'rgb(210,210,210)';
    ctx.fillRect(0, 0, n, n);
    const seams = 4, sw = n / seams;
    for (let i = 0; i < seams; i++) {
      const x = i * sw;
      const g = ctx.createLinearGradient(x, 0, x + sw, 0);
      g.addColorStop(0, 'rgb(225,225,225)'); g.addColorStop(0.5, 'rgb(205,205,205)'); g.addColorStop(1, 'rgb(190,190,190)');
      ctx.fillStyle = g; ctx.fillRect(x, 0, sw, n);
      ctx.fillStyle = 'rgb(250,250,250)'; ctx.fillRect(x, 0, 5, n);
      ctx.fillStyle = 'rgb(95,95,95)'; ctx.fillRect(x + 5, 0, 5, n);
    }
    noise(ctx, n, 8);
  }),
  hlinik: () => canvasTex((ctx, n) => {
    ctx.fillStyle = 'rgb(205,205,205)';
    ctx.fillRect(0, 0, n, n);
    const s = n / 5;
    for (let r = -1; r <= 10; r++) {
      for (let c = -1; c <= 5; c++) {
        const cx = c * s + (r % 2 ? s / 2 : 0), cy = r * s / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s / 2); ctx.lineTo(cx + s / 2, cy); ctx.lineTo(cx, cy + s / 2); ctx.lineTo(cx - s / 2, cy); ctx.closePath();
        const g = ctx.createLinearGradient(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2);
        g.addColorStop(0, 'rgb(236,236,236)'); g.addColorStop(1, 'rgb(178,178,178)');
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - s / 2, cy); ctx.lineTo(cx, cy + s / 2); ctx.lineTo(cx + s / 2, cy); ctx.stroke();
      }
    }
    noise(ctx, n, 8);
  }),
  sindel: () => canvasTex((ctx, n) => {
    const rows = 12, cols = 6, rh = n / rows, cw = n / cols;
    for (let r = 0; r < rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const x = c * cw + (r % 2 ? cw / 2 : 0);
        const v = 150 + Math.floor(rnd() * 70);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x + 2, r * rh, cw - 4, rh);
      }
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(0, r * rh, n, 3);
    }
    noise(ctx, n, 60);
  }),
};

function panelTex() {
  const c = document.createElement('canvas');
  c.width = 352; c.height = 226;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b1017';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#18222e';
  ctx.lineWidth = 2;
  for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo((i * c.width) / 12, 0); ctx.lineTo((i * c.width) / 12, c.height); ctx.stroke(); }
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, (i * c.height) / 6); ctx.lineTo(c.width, (i * c.height) / 6); ctx.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- Pomocné geometrie ---------- */
// Plocha z bodů (konvexní mnohoúhelník, proti směru hodinových ručiček zvenku); UV v metrech / velikost dlaždice textury
function face(points, tile) {
  const p = points.map((a) => new THREE.Vector3(...a));
  const u = p[1].clone().sub(p[0]).normalize();
  const n = p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0])).normalize();
  const v = n.clone().cross(u).normalize();
  const pos = [], uv = [];
  for (let i = 1; i < p.length - 1; i++) {
    for (const q of [p[0], p[i], p[i + 1]]) {
      pos.push(q.x, q.y, q.z);
      const d = q.clone().sub(p[0]);
      uv.push(d.dot(u) / tile[0], d.dot(v) / tile[1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
// Válec mezi dvěma body (hřebenáče, nároží, okapy)
function beam(a, b, r, mat, radial = 10) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, radial), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  m.castShadow = true;
  return m;
}
function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
// výška střechy v půdorysném bodě (x, z)
const roofY = (shape, x, z) => YR - TAN * (shape === 'valbova' ? Math.max(Math.abs(z), Math.abs(x) - HL) : Math.abs(z));

export function mount(root) {
  const stage = root.querySelector('.konf__stage');
  if (!stage) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return; // bez WebGL zůstane SVG ilustrace
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = 'konf__3d';
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf2e5cf, 38, 75);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1.5, 0.5, 200);
  camera.position.set(-17, 8.8, 21);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 3.4, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 17;
  controls.maxDistance = 38;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.42;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.55;
  controls.update();

  // Světla: zlatá hodina zleva zepředu
  scene.add(new THREE.HemisphereLight(0xd6e6f4, 0x8a7d5c, 0.75));
  const sun = new THREE.DirectionalLight(0xffdcae, 2.6);
  sun.position.set(-16, 14, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // Materiály
  const M = {
    wall: new THREE.MeshStandardMaterial({ color: 0xf1ebe1, roughness: 0.92 }),
    plinth: new THREE.MeshStandardMaterial({ color: 0x6d6862, roughness: 0.9 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x3b3a38, roughness: 0.6 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x1d2731, roughness: 0.08, metalness: 0.3, emissive: 0xffa95c, emissiveIntensity: 0.32 }),
    sill: new THREE.MeshStandardMaterial({ color: 0xd9d4cb, roughness: 0.7 }),
    door: new THREE.MeshStandardMaterial({ color: 0x7a5034, roughness: 0.65 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x8f4c39, roughness: 0.9 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.4, metalness: 0.7 }),
    fascia: new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 0.8 }),
    soffit: new THREE.MeshStandardMaterial({ color: 0x8a7462, roughness: 0.85, side: THREE.DoubleSide }),
    insul: new THREE.MeshStandardMaterial({ color: 0xf2b632, roughness: 0.9 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x3b3d40, roughness: 0.8, side: THREE.DoubleSide }),
    cap: new THREE.MeshStandardMaterial({ color: 0x3b3d40, roughness: 0.75 }),
    panel: new THREE.MeshStandardMaterial({ map: panelTex(), roughness: 0.16, metalness: 0.2, envMapIntensity: 1.4 }),
    panelFrame: new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.35, metalness: 0.6 }),
    battery: new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.35 }),
    led: new THREE.MeshStandardMaterial({ color: 0x1fa463, emissive: 0x1fa463, emissiveIntensity: 1.4 }),
    wallbox: new THREE.MeshStandardMaterial({ color: 0x20272d, roughness: 0.4, metalness: 0.3 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x7c9f58, roughness: 1 }),
    gravel: new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x5f8a45, roughness: 0.95 }),
    leaf2: new THREE.MeshStandardMaterial({ color: 0x6f9a4f, roughness: 0.95 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x6e4b33, roughness: 0.9 }),
  };
  const roofTex = {};

  // Terén a zahrada
  const grassTex = canvasTex((ctx, n) => { ctx.fillStyle = 'rgb(200,200,200)'; ctx.fillRect(0, 0, n, n); noise(ctx, n, 70); }, 256);
  grassTex.repeat.set(30, 30);
  M.grass.map = grassTex;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), M.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 14), M.gravel);
  drive.rotation.x = -Math.PI / 2;
  drive.position.set(1.4, 0.01, D / 2 + 7);
  drive.receiveShadow = true;
  scene.add(drive);

  const tree = (x, z, s) => {
    const g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.24 * s, 2.6 * s, 8), M.trunk);
    t.position.y = 1.3 * s; t.castShadow = true; g.add(t);
    [[0, 3.4, 0, 1.6], [-0.9, 2.8, 0.3, 1.1], [0.9, 2.9, -0.2, 1.15], [0.2, 4.3, 0.1, 1.05]].forEach(([dx, dy, dz, r], i) => {
      const geo = new THREE.IcosahedronGeometry(r * s, 2);
      const pos = geo.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        const f = 1 + (rnd() - 0.5) * 0.16;
        pos.setXYZ(k, pos.getX(k) * f, pos.getY(k) * f, pos.getZ(k) * f);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, i % 2 ? M.leaf2 : M.leaf);
      m.position.set(dx * s, dy * s, dz * s); m.castShadow = true; g.add(m);
    });
    g.position.set(x, 0, z);
    scene.add(g);
  };
  tree(-11.5, 3.5, 1.15);
  tree(10.8, -5.5, 1.3);
  tree(12.5, 6.5, 0.85);
  const shrub = (x, z, r) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), rnd() > 0.5 ? M.leaf : M.leaf2);
    m.position.set(x, r * 0.7, z); m.scale.y = 0.8; m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
  };
  [[-5.2, D / 2 + 0.8, 0.55], [-3.6, D / 2 + 0.75, 0.45], [4.4, D / 2 + 0.8, 0.5], [3.2, D / 2 + 0.75, 0.5], [W / 2 + 0.9, -2.5, 0.6]].forEach((a) => shrub(...a));

  // Dům (zdi, sokl, okna, dveře) – neměnné
  const house = new THREE.Group();
  house.add(box(W, H - PLINTH, D, M.wall, 0, PLINTH + (H - PLINTH) / 2, 0));
  house.add(box(W + 0.08, PLINTH, D + 0.08, M.plinth, 0, PLINTH / 2, 0));
  const win = (x, y, z, w, h, ry) => {
    const g = new THREE.Group();
    g.add(box(w + 0.18, h + 0.18, 0.1, M.frame, 0, 0, 0));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.glass); gl.position.z = 0.056; g.add(gl);
    g.add(box(0.06, h, 0.06, M.frame, 0, 0, 0.07));
    g.add(box(w, 0.06, 0.06, M.frame, 0, h * 0.12, 0.07));
    g.add(box(w + 0.34, 0.06, 0.24, M.sill, 0, -h / 2 - 0.12, 0.1));
    g.position.set(x, y, z); g.rotation.y = ry;
    house.add(g);
  };
  const zf = D / 2 + 0.02;
  win(-4.2, 1.85, zf, 1.3, 1.4, 0);
  win(-1.6, 1.85, zf, 1.3, 1.4, 0);
  win(4.4, 1.85, zf, 1.3, 1.4, 0);
  const door = new THREE.Group();
  door.add(box(1.25, 2.4, 0.1, M.frame, 0, 0, 0));
  door.add(box(1.05, 2.25, 0.08, M.door, 0, -0.04, 0.04));
  const dg = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.3), M.glass); dg.position.set(0.25, 0.2, 0.09); door.add(dg);
  door.position.set(1.4, PLINTH + 1.15, zf);
  house.add(door);
  house.add(box(2.2, 0.16, 1.2, M.sill, 1.4, 0.08, D / 2 + 0.6));
  win(W / 2 + 0.02, 1.85, 1.2, 1.2, 1.3, Math.PI / 2);
  win(W / 2 + 0.02, 1.85, -2.2, 1.2, 1.3, Math.PI / 2);
  win(-W / 2 - 0.02, 1.85, 0, 1.2, 1.3, -Math.PI / 2);
  win(-3, 1.85, -zf, 1.3, 1.4, Math.PI);
  win(3, 1.85, -zf, 1.3, 1.4, Math.PI);
  house.traverse((o) => { if (o.isMesh) { o.receiveShadow = true; } });
  scene.add(house);

  // Doplňky
  const battery = new THREE.Group();
  const bb = new THREE.Mesh(new RoundedBoxGeometry(0.64, 1.15, 0.24, 3, 0.05), M.battery);
  bb.castShadow = true; battery.add(bb);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.02), M.led); led.position.set(0, 0.4, 0.125); battery.add(led);
  battery.position.set(5.62, PLINTH + 0.75, D / 2 + 0.14);
  scene.add(battery);
  const wallbox = new THREE.Group();
  const wb = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.5, 0.16, 3, 0.05), M.wallbox);
  wb.castShadow = true; wallbox.add(wb);
  const wled = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.02), M.led); wled.position.set(0, 0.12, 0.085); wallbox.add(wled);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.25, 0.05), new THREE.Vector3(0.05, -0.8, 0.25), new THREE.Vector3(0.2, -1.2, 0.6), new THREE.Vector3(0.4, -1.32, 1.1)]), 24, 0.03, 6), M.wallbox);
  wallbox.add(cable);
  wallbox.position.set(0.3, PLINTH + 0.95, D / 2 + 0.1);
  scene.add(wallbox);

  // Střecha a panely – přestavují se při změně
  let roofG = null, panelsG = null, placed = -1;
  const disposeGroup = (g) => { if (!g) return; scene.remove(g); g.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); };

  function buildRoof(st) {
    disposeGroup(roofG);
    roofG = new THREE.Group();
    const p = ROOF_PROPS[st.mat];
    if (!roofTex[st.mat]) roofTex[st.mat] = TEX[st.mat]();
    M.roof.map = roofTex[st.mat];
    M.roof.bumpMap = roofTex[st.mat];
    M.roof.bumpScale = p.bump;
    M.roof.roughness = p.rough;
    M.roof.metalness = p.metal;
    M.roof.color.set(st.hex);
    M.roof.needsUpdate = true;
    M.cap.color.set(st.hex).multiplyScalar(0.82);
    M.cap.roughness = p.rough;
    M.cap.metalness = p.metal;
    const t = p.tile;
    const ze = D / 2 + O;
    const add = (pts, mat = M.roof) => { const m = new THREE.Mesh(face(pts, t), mat); m.castShadow = true; m.receiveShadow = true; roofG.add(m); };
    if (st.shape === 'valbova') {
      const xe = W / 2 + O;
      add([[-xe, YE, ze], [xe, YE, ze], [HL, YR, 0], [-HL, YR, 0]]);
      add([[xe, YE, -ze], [-xe, YE, -ze], [-HL, YR, 0], [HL, YR, 0]]);
      add([[-xe, YE, -ze], [-xe, YE, ze], [-HL, YR, 0]]);
      add([[xe, YE, ze], [xe, YE, -ze], [HL, YR, 0]]);
      roofG.add(beam([-HL, YR + 0.06, 0], [HL, YR + 0.06, 0], 0.13, M.cap, 12));
      [[-xe, ze, -HL], [xe, ze, HL], [-xe, -ze, -HL], [xe, -ze, HL]].forEach(([x, z, hx]) => roofG.add(beam([x, YE + 0.06, z], [hx, YR + 0.06, 0], 0.1, M.cap, 10)));
      [[-xe, ze, xe, ze], [-xe, -ze, xe, -ze], [-xe, -ze, -xe, ze], [xe, -ze, xe, ze]].forEach(([x1, z1, x2, z2]) => {
        roofG.add(beam([x1, YE - 0.14, z1 + Math.sign(z1) * 0.08], [x2, YE - 0.14, z2 + Math.sign(z2) * 0.08], 0.08, M.metal, 10));
      });
      // podbití
      const sf = new THREE.Mesh(new THREE.PlaneGeometry(W + 2 * O, D + 2 * O), M.soffit);
      sf.rotation.x = -Math.PI / 2; sf.position.y = YE - 0.02; roofG.add(sf);
    } else {
      const xe = W / 2 + OG;
      add([[-xe, YE, ze], [xe, YE, ze], [xe, YR, 0], [-xe, YR, 0]]);
      add([[xe, YE, -ze], [-xe, YE, -ze], [-xe, YR, 0], [xe, YR, 0]]);
      // štíty
      [-1, 1].forEach((s) => {
        const tri = face(s < 0
          ? [[s * W / 2, H, D / 2], [s * W / 2, H + (D / 2) * TAN, 0], [s * W / 2, H, -D / 2]]
          : [[s * W / 2, H, -D / 2], [s * W / 2, H + (D / 2) * TAN, 0], [s * W / 2, H, D / 2]], [1, 1]);
        const m = new THREE.Mesh(tri, M.wall); m.receiveShadow = true; m.castShadow = true; roofG.add(m);
        // štítová prkna
        roofG.add(beam([s * xe, YE - 0.05, ze], [s * xe, YR - 0.05, 0], 0.09, M.fascia, 8));
        roofG.add(beam([s * xe, YE - 0.05, -ze], [s * xe, YR - 0.05, 0], 0.09, M.fascia, 8));
      });
      roofG.add(beam([-xe, YR + 0.06, 0], [xe, YR + 0.06, 0], 0.13, M.cap, 12));
      [ze, -ze].forEach((z) => roofG.add(beam([-xe, YE - 0.14, z + Math.sign(z) * 0.08], [xe, YE - 0.14, z + Math.sign(z) * 0.08], 0.08, M.metal, 10)));
      [ze, -ze].forEach((z) => {
        const sf = new THREE.Mesh(new THREE.PlaneGeometry(W + 2 * OG, O), M.soffit);
        sf.rotation.x = -Math.PI / 2; sf.position.set(0, YE - 0.02, Math.sign(z) * (D / 2 + O / 2)); roofG.add(sf);
      });
    }
    // komín
    const cx = 2.9, cz = -1.3;
    const base = roofY(st.shape, cx, cz) - 0.4;
    const top = YR + 0.9;
    roofG.add(box(0.7, top - base, 0.7, M.brick, cx, (top + base) / 2, cz));
    roofG.add(box(0.86, 0.12, 0.86, M.plinth, cx, top + 0.06, cz));
    // zateplení: žlutá vrstva pod krytinou viditelná u okapu
    if (st.insul) {
      const xe = (st.shape === 'valbova' ? W / 2 + O : W / 2 + OG) - 0.05;
      [ze - 0.06, -(ze - 0.06)].forEach((z) => {
        const slab = box(2 * xe, 0.2, 0.5, M.insul, 0, YE - 0.04, z - Math.sign(z) * 0.2);
        slab.rotation.x = Math.sign(z) * PITCH;
        roofG.add(slab);
      });
    }
    scene.add(roofG);
  }

  function buildPanels(st) {
    disposeGroup(panelsG);
    panelsG = new THREE.Group();
    const cosP = Math.cos(PITCH);
    const rowPlan = (PANEL.h + PANEL.gap) * cosP;
    const z0 = D / 2 + O - 0.75 * cosP; // spodní hrana první řady (půdorys), okraj 0,75 m od okapu
    // kapacity řad zdola nahoru (valbová se ke hřebeni zužuje)
    const caps = [];
    for (let r = 0; ; r++) {
      const zTop = z0 - r * rowPlan - PANEL.h * cosP;
      if (zTop < 0.55 * cosP) break;
      const xmax = (st.shape === 'valbova' ? HL + zTop : W / 2 + OG) - 0.6;
      caps.push(Math.max(0, Math.floor((2 * xmax + PANEL.gap) / (PANEL.w + PANEL.gap))));
    }
    // úhledný blok: nejmenší počet řad se stejným počtem sloupců; jinak (valba) pyramida po řadách
    let rows = null;
    for (let r = 1; r <= caps.length && !rows; r++) {
      const cols = Math.ceil(st.panels / r);
      if (caps.slice(0, r).every((c) => c >= cols)) {
        rows = Array.from({ length: r }, (_, i) => Math.min(cols, st.panels - i * cols));
      }
    }
    if (!rows) {
      rows = [];
      let left = st.panels;
      for (const c of caps) { if (left <= 0) break; const k = Math.min(c, left); rows.push(k); left -= k; }
    }
    const nrm = new THREE.Vector3(0, Math.cos(PITCH), Math.sin(PITCH));
    const full = Math.max(...rows, 0);
    let placedN = 0;
    rows.forEach((c, r) => {
      const zBottom = z0 - r * rowPlan;
      const zc = zBottom - (PANEL.h * cosP) / 2;
      const yc = roofY('sedlova', 0, zc);
      // neúplná horní řada se zarovná zleva k bloku, ať blok drží tvar
      const blockW = full * (PANEL.w + PANEL.gap) - PANEL.gap;
      const rowW = c * (PANEL.w + PANEL.gap) - PANEL.gap;
      const x0 = rows.every((k, i) => i === rows.length - 1 || k === full) && c < full && st.shape !== 'valbova' ? -blockW / 2 : -rowW / 2;
      for (let i = 0; i < c; i++) {
        const xc = x0 + PANEL.w / 2 + i * (PANEL.w + PANEL.gap);
        const g = new THREE.Group();
        const fr = new THREE.Mesh(new THREE.BoxGeometry(PANEL.w, 0.04, PANEL.h), M.panelFrame);
        fr.castShadow = true; g.add(fr);
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(PANEL.w - 0.04, PANEL.h - 0.04), M.panel);
        gl.rotation.x = -Math.PI / 2; gl.position.y = 0.021; g.add(gl);
        g.rotation.x = PITCH;
        g.position.set(xc, yc, zc).addScaledVector(nrm, 0.09);
        panelsG.add(g);
        placedN++;
      }
    });
    scene.add(panelsG);
    return placedN;
  }

  let state = null;
  function apply(st) {
    state = st;
    buildRoof(st);
    const n = buildPanels(st);
    battery.visible = st.bat && n > 0;
    wallbox.visible = st.wallbox;
    if (n !== placed) {
      placed = n;
      root.dispatchEvent(new CustomEvent('konf:placed', { detail: n }));
    }
    kick();
  }

  // Velikost a vykreslování (jen když je konfigurátor vidět)
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    kick();
  };
  let visible = false, raf = 0, idleFrames = 0;
  const loop = () => {
    raf = 0;
    if (!visible) return;
    const moved = controls.update();
    renderer.render(scene, camera);
    idleFrames = moved || controls.autoRotate ? 0 : idleFrames + 1;
    if (idleFrames < 30) raf = requestAnimationFrame(loop);
  };
  function kick() { idleFrames = 0; if (!raf && visible) raf = requestAnimationFrame(loop); }
  controls.addEventListener('change', kick);
  controls.addEventListener('start', () => { controls.autoRotate = false; stage.classList.add('is-touched'); });
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0.05 }).observe(stage);

  root.addEventListener('konf:update', (e) => apply(e.detail));
  if (root.konfState) apply(root.konfState);
  resize();
  stage.classList.add('is-3d');
}
