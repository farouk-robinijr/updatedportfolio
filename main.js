import * as THREE from "./three.module.js";

const sections = [
  {
    id: "home",
    label: "Home",
    rocketName: "Home Rocket",
    position: new THREE.Vector3(-8.2, 0, 6.9),
    cameraOffset: new THREE.Vector3(4.1, 4.8, 6.0),
    paragraphs: [
      "Welcome to my portfolio. I am a computer science student passionate about Python, SQL, databases, and building creative technology projects. This portfolio is inspired by my dream of building a rocket from scratch.",
    ],
  },
  {
    id: "about",
    label: "About Me",
    rocketName: "About Me Rocket",
    position: new THREE.Vector3(6.8, 0, 6.2),
    cameraOffset: new THREE.Vector3(-4.0, 5.0, 6.4),
    paragraphs: [
      "My name is Farouk El Hammoumi. I am 21 years old, originally from Morocco, and currently studying Computer Science at Valencia College.",
      "My main skills are Python and SQL. I enjoy building projects that combine programming and databases, such as my casino project that uses Python and SQL to manage player and game data.",
      "I am always looking to improve my skills through real-world experience and new challenges. My goal is to grow as a developer and work on meaningful projects. One of my biggest dreams is to build a rocket from scratch, which inspired the futuristic rocket launch theme of my portfolio.",
    ],
  },
  {
    id: "projects",
    label: "Projects",
    rocketName: "Projects Rocket",
    position: new THREE.Vector3(-1.8, 0, 0.4),
    cameraOffset: new THREE.Vector3(4.6, 5.2, 6.1),
    intro: "Projects:",
    list: [
      "Casino project created with Python.",
      "SQL database developed for the casino project to store player data and everything related to the casino system.",
      "Gestion du stockage app for inventory and merchandise management.",
    ],
  },
  {
    id: "skills",
    label: "Skills",
    rocketName: "Skills Rocket",
    position: new THREE.Vector3(9.0, 0, -2.9),
    cameraOffset: new THREE.Vector3(-4.7, 5.2, 5.8),
    intro: "Skills:",
    list: ["Python", "SQL", "JavaScript", "HTML", "CSS", "Prompting", "AI tools", "Automations"],
  },
  {
    id: "experience",
    label: "Experience",
    rocketName: "Experience Rocket",
    position: new THREE.Vector3(-8.8, 0, -4.5),
    cameraOffset: new THREE.Vector3(4.4, 5.4, 6.2),
    paragraphs: [
      "Experience:",
      "Built practical database and inventory-management projects, including an app for gestion du stockage to organize products, stock levels, and related data in a cleaner way.",
    ],
  },
  {
    id: "contact",
    label: "Contact",
    rocketName: "Contact Rocket",
    position: new THREE.Vector3(2.4, 0, -8.1),
    cameraOffset: new THREE.Vector3(4.3, 5.5, 5.9),
    contact: [
      { label: "Email", value: "farouklheh@gmail.com", href: "mailto:farouklheh@gmail.com" },
      { label: "LinkedIn", value: "Farouk EL Hammoumi" },
      { label: "Phone", value: "321-424-0354", href: "tel:3214240354" },
    ],
  },
];

const byId = new Map(sections.map((section) => [section.id, section]));
const refs = new Map();
const hitTargets = [];
const vehicles = [];
const astronauts = [];
const beacons = [];
const galaxyLayers = [];
const trafficBarriers = [];
const buildingSpecs = [
  { type: "command", x: -11.4, y: 0.04, z: 1.9, scale: 0.82, rotationY: Math.PI * 0.48, barrier: "circle", radius: 2.08, slowRadius: 2.86 },
  { type: "hangar", x: 4.4, y: 0.04, z: -10.2, scale: 0.86, rotationY: 0.04, barrier: "box", halfX: 2.42, halfZ: 1.52 },
  { type: "lab", x: 10.1, y: 0.04, z: 1.1, scale: 0.76, rotationY: -Math.PI * 0.12, barrier: "circle", radius: 1.95, slowRadius: 2.62 },
];
const heroTowerSpec = {
  x: 12.8,
  z: -11.8,
  y: 0.05,
  scale: 0.98,
  rotationY: -0.55,
  halfX: 1.78,
  halfZ: 1.28,
};
const perf = {
  pixelRatio: Math.min(window.devicePixelRatio || 1, window.innerWidth <= 760 ? 1 : 1.18),
  animationScale: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.45 : 1,
  lowPower: window.innerWidth <= 760 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4),
};

const canvas = document.querySelector("#scene-canvas");
const panel = document.querySelector("#section-panel");
const panelKicker = document.querySelector("#panel-kicker");
const panelTitle = document.querySelector("#panel-title");
const panelContent = document.querySelector("#panel-content");
const closeButton = document.querySelector("#close-panel");
const loading = document.querySelector("#loading");
const topHud = document.querySelector(".top-hud");
const sectionDock = document.querySelector(".section-dock");
const launchIntro = document.querySelector("#launch-intro");
const launchButton = document.querySelector("#launch-button");
const launchStatus = document.querySelector("#launch-status");
const warpOverlay = document.querySelector("#warp-overlay");
const warpStatus = document.querySelector("#warp-status");
const dockButtons = Array.from(document.querySelectorAll(".dock-button"));
const ROOM_ORIGIN = new THREE.Vector3(0, 24, 56);
const ROOM_TARGET = ROOM_ORIGIN.clone().add(new THREE.Vector3(0, 1.55, -0.6));
const CONTROL_MONITOR_ASSET_BASE = "./src/assets/control-room-monitor/";
const SPACE_ASSET_URL = "./src/assets/need_some_space.glb";
const controlRoom = {
  group: null,
  monitors: [],
  centerScreen: null,
  centerTexture: null,
  spaceDisplay: null,
  enterButton: null,
  overviewButton: null,
  selectedId: "home",
  previewActive: false,
  leaving: false,
  monitorRedrawAt: 0,
};
let controlRoomMonitorAssetPromise = null;
let spaceAssetPromise = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01030a);
scene.fog = new THREE.FogExp2(0x03060d, 0.011);

const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 220);
const cameraViews = {
  desktop: {
    fov: 44,
    basePosition: new THREE.Vector3(0, 11.2, 22.4),
    baseLookAt: new THREE.Vector3(-0.4, 1.1, -1.6),
  },
  mobile: {
    fov: 54,
    basePosition: new THREE.Vector3(0, 18.2, 37.5),
    baseLookAt: new THREE.Vector3(-0.2, 0.95, -1.8),
  },
};
let responsiveMode = getResponsiveMode();
let targetFov = cameraViews[responsiveMode].fov;
const currentLookAt = cameraViews[responsiveMode].baseLookAt.clone();
const flight = {
  active: false,
  startPosition: new THREE.Vector3(),
  startLookAt: new THREE.Vector3(),
  endPosition: cameraViews[responsiveMode].basePosition.clone(),
  endLookAt: cameraViews[responsiveMode].baseLookAt.clone(),
  startedAt: 0,
  duration: 1,
  arc: 0,
};
const orbit = {
  target: cameraViews[responsiveMode].baseLookAt.clone(),
  desiredTarget: cameraViews[responsiveMode].baseLookAt.clone(),
  yaw: 0,
  desiredYaw: 0,
  pitch: 0,
  desiredPitch: 0,
  distance: 1,
  desiredDistance: 1,
  isDragging: false,
  pointerId: null,
  lastX: 0,
  lastY: 0,
  dragTotal: 0,
  clickCandidateId: null,
  pinchDistance: 0,
};
camera.fov = targetFov;
camera.position.copy(cameraViews[responsiveMode].basePosition);
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(perf.pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.36;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = true;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const scratch = new THREE.Vector3();
const lookScratch = new THREE.Vector3();
const sideScratch = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const lookObject = new THREE.Object3D();
const leanEuler = new THREE.Euler();
const leanQuat = new THREE.Quaternion();
const trafficResolution = { blocked: false, speedScale: 1 };
const trafficSample = new THREE.Vector3();
const trafficPrevious = new THREE.Vector3();
const scaleScratch = new THREE.Vector3();
const orbitPositionScratch = new THREE.Vector3();
const gltfBox = new THREE.Box3();
const gltfCenter = new THREE.Vector3();
const gltfSize = new THREE.Vector3();
let shadowFramesRemaining = 4;
let warpTimers = [];

const softShadowTexture = createSoftDiscTexture();
const exhaustTexture = createExhaustTexture();
const steamTexture = createSteamTexture();

const materials = {
  base: standard(0x101116, 0.22, 0.78),
  deckPanel: standard(0x16171d, 0.28, 0.68),
  deckInset: standard(0x090a0d, 0.18, 0.86),
  road: standard(0x1a1b20, 0.18, 0.72),
  roadEdge: standard(0x2a2b30, 0.28, 0.55),
  bevel: standard(0x2b2c31, 0.32, 0.54),
  black: standard(0x0b0c10, 0.28, 0.7),
  tower: standard(0x111217, 0.42, 0.62),
  white: standard(0xfffdf4, 0.03, 0.22),
  glass: new THREE.MeshStandardMaterial({
    color: 0x080d12,
    emissive: 0x102238,
    emissiveIntensity: 0.36,
    metalness: 0.08,
    roughness: 0.12,
    transparent: true,
    opacity: 0.78,
  }),
  towerGlass: new THREE.MeshStandardMaterial({
    color: 0x13080a,
    emissive: 0xff1f24,
    emissiveIntensity: 0.82,
    metalness: 0.14,
    roughness: 0.18,
    transparent: true,
    opacity: 0.66,
  }),
  rocketBlack: standard(0x050506, 0.18, 0.46),
  red: new THREE.MeshStandardMaterial({
    color: 0xf0252d,
    emissive: 0xff1822,
    emissiveIntensity: 1.45,
    metalness: 0.24,
    roughness: 0.42,
  }),
  redLight: new THREE.MeshBasicMaterial({ color: 0xff3434 }),
  redDim: new THREE.MeshBasicMaterial({
    color: 0xff2c2c,
    transparent: true,
    opacity: 0.58,
  }),
  redGlow: new THREE.MeshBasicMaterial({
    color: 0xff3030,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
  whiteLight: new THREE.MeshBasicMaterial({
    color: 0xf4f0df,
    transparent: true,
    opacity: 0.34,
  }),
  blueGlow: new THREE.MeshBasicMaterial({
    color: 0x61a8ff,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
  hitbox: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, depthWrite: false }),
};

let hoveredId = null;
let selectedId = null;
let panelTimer = null;
let introActive = true;
let roomMode = true;
let hoveredRoomTarget = null;
const activePointers = new Map();

document.body.classList.add("intro-active");
setCameraToView(introCameraView(), true);
window.startPortfolioLaunch = () => enterControlRoomSelection();

init();
window.__portfolioBooted = true;
document.body.classList.add("portfolio-ready");
animate();

function standard(color, metalness, roughness) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function fakeLight(intensity = 0) {
  const light = new THREE.Object3D();
  light.intensity = intensity;
  return light;
}

function getResponsiveMode() {
  return window.innerWidth <= 760 ? "mobile" : "desktop";
}

function baseCameraView() {
  const view = cameraViews[getResponsiveMode()];
  return {
    fov: view.fov,
    position: view.basePosition.clone(),
    lookAt: view.baseLookAt.clone(),
  };
}

function introCameraView() {
  const mode = getResponsiveMode();
  return {
    fov: mode === "mobile" ? 64 : 60,
    position: ROOM_ORIGIN.clone().add(mode === "mobile" ? new THREE.Vector3(0, 1.62, 5.9) : new THREE.Vector3(0, 1.42, 5.35)),
    lookAt: ROOM_TARGET.clone(),
  };
}

function setCameraToView(view, syncOrbit = false) {
  targetFov = view.fov;
  camera.fov = view.fov;
  camera.position.copy(view.position);
  currentLookAt.copy(view.lookAt);
  camera.updateProjectionMatrix();
  if (syncOrbit) setOrbitFromView(view, true);
}

function setOrbitFromView(view, immediate = false) {
  const offset = view.position.clone().sub(view.lookAt);
  const distance = Math.max(offset.length(), 0.01);
  const yaw = Math.atan2(offset.x, offset.z);
  const pitch = Math.asin(THREE.MathUtils.clamp(offset.y / distance, -0.98, 0.98));
  orbit.desiredTarget.copy(view.lookAt);
  orbit.desiredYaw = yaw;
  orbit.desiredPitch = clampOrbitPitch(pitch);
  orbit.desiredDistance = clampOrbitDistance(distance);
  if (immediate) {
    orbit.target.copy(orbit.desiredTarget);
    orbit.yaw = orbit.desiredYaw;
    orbit.pitch = orbit.desiredPitch;
    orbit.distance = orbit.desiredDistance;
    currentLookAt.copy(orbit.target);
    camera.position.copy(orbitPositionFromState(orbit.target, orbit.yaw, orbit.pitch, orbit.distance));
  }
}

function syncOrbitToCurrent() {
  const view = {
    fov: camera.fov,
    position: camera.position.clone(),
    lookAt: currentLookAt.clone(),
  };
  setOrbitFromView(view, true);
}

function clampOrbitPitch(value) {
  if (roomMode) return THREE.MathUtils.clamp(value, -0.1, 0.44);
  return THREE.MathUtils.clamp(value, 0.08, 1.2);
}

function clampOrbitDistance(value) {
  const mode = getResponsiveMode();
  if (roomMode) return THREE.MathUtils.clamp(value, mode === "mobile" ? 4.1 : 3.45, mode === "mobile" ? 6.35 : 5.75);
  const min = selectedId ? (mode === "mobile" ? 8.2 : 5.2) : mode === "mobile" ? 18 : 10;
  const max = selectedId ? (mode === "mobile" ? 24 : 18) : mode === "mobile" ? 44 : 32;
  return THREE.MathUtils.clamp(value, min, max);
}

function orbitPositionFromState(target, yaw, pitch, distance, result = new THREE.Vector3()) {
  const horizontal = Math.cos(pitch) * distance;
  return result.set(
    target.x + Math.sin(yaw) * horizontal,
    target.y + Math.sin(pitch) * distance,
    target.z + Math.cos(yaw) * horizontal,
  );
}

function sectionCameraView(section) {
  const mode = getResponsiveMode();
  const lookAt = section.position.clone().add(new THREE.Vector3(0, mode === "mobile" ? 2.75 : 2.25, 0));

  if (mode === "mobile") {
    const horizontal = section.cameraOffset.clone();
    horizontal.y = 0;
    horizontal.normalize();
    return {
      fov: 55,
      position: section.position.clone().add(new THREE.Vector3(horizontal.x * 9.2, 8.4, horizontal.z * 12.2)),
      lookAt,
    };
  }

  const offset = section.cameraOffset.clone();
  return {
    fov: 44,
    position: section.position.clone().add(new THREE.Vector3(offset.x * 1.22, offset.y + 0.75, offset.z * 1.32)),
    lookAt,
  };
}

function startCameraFlight(view, preferredDuration) {
  const distance = camera.position.distanceTo(view.position);
  const duration = preferredDuration ?? THREE.MathUtils.clamp(0.86 + distance * 0.055, 1.05, 2.25);
  setOrbitFromView(view, false);
  flight.active = true;
  flight.startPosition.copy(camera.position);
  flight.startLookAt.copy(currentLookAt);
  flight.endPosition.copy(view.position);
  flight.endLookAt.copy(view.lookAt);
  flight.startedAt = clock.elapsedTime;
  flight.duration = duration;
  flight.arc = THREE.MathUtils.clamp(distance * 0.045, 0.28, 2.35);
  targetFov = view.fov;
  return duration;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function smoothstep(edge0, edge1, value) {
  const x = THREE.MathUtils.clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return x * x * (3 - 2 * x);
}

function updateCameraFlight(elapsed, delta) {
  camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 4.8, delta);
  camera.updateProjectionMatrix();

  if (!flight.active) {
    updateOrbitCamera(delta);
    return;
  }

  const raw = THREE.MathUtils.clamp((elapsed - flight.startedAt) / flight.duration, 0, 1);
  const eased = easeInOutCubic(raw);
  camera.position.lerpVectors(flight.startPosition, flight.endPosition, eased);
  camera.position.y += Math.sin(raw * Math.PI) * flight.arc;
  currentLookAt.lerpVectors(flight.startLookAt, flight.endLookAt, eased);

  if (raw >= 1) {
    flight.active = false;
    camera.position.copy(flight.endPosition);
    currentLookAt.copy(flight.endLookAt);
    setOrbitFromView({ position: flight.endPosition, lookAt: flight.endLookAt, fov: targetFov }, true);
  }
}

function updateOrbitCamera(delta) {
  orbit.target.lerp(orbit.desiredTarget, 1 - Math.exp(-4.2 * delta));
  orbit.yaw = THREE.MathUtils.damp(orbit.yaw, orbit.desiredYaw, 6.2, delta);
  orbit.pitch = THREE.MathUtils.damp(orbit.pitch, orbit.desiredPitch, 6.2, delta);
  orbit.distance = THREE.MathUtils.damp(orbit.distance, orbit.desiredDistance, 5.4, delta);
  camera.position.lerp(orbitPositionFromState(orbit.target, orbit.yaw, orbit.pitch, orbit.distance, orbitPositionScratch), 1 - Math.exp(-6.5 * delta));
  currentLookAt.lerp(orbit.target, 1 - Math.exp(-8 * delta));
}

function init() {
  addBackground();
  addLights();
  addBase();
  addRoads();
  addBuildings();

  sections.forEach((section, index) => scene.add(createLaunchPad(section, index)));
  controlRoom.group = createControlRoom();
  scene.add(controlRoom.group);
  buildTrafficBarriers();
  addLifeLayer();
  optimizeStaticShadows();

  bindEvents();
  if (window.location.protocol === "file:") loading.textContent = "Open through localhost for imported 3D assets";
  setTimeout(() => loading.classList.add("hidden"), window.location.protocol === "file:" ? 3200 : 550);
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xb6b0a8, 0.32));
  scene.add(new THREE.HemisphereLight(0x40536d, 0x100707, 0.72));

  const key = new THREE.DirectionalLight(0xffffff, 3.6);
  key.position.set(-12, 20, 15);
  key.castShadow = true;
  const shadowSize = window.innerWidth <= 760 ? 512 : 1024;
  key.shadow.mapSize.set(shadowSize, shadowSize);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  key.shadow.camera.left = -24;
  key.shadow.camera.right = 24;
  key.shadow.camera.top = 24;
  key.shadow.camera.bottom = -24;
  key.shadow.bias = -0.00008;
  key.shadow.normalBias = 0.052;
  scene.add(key);

  const coolRim = new THREE.DirectionalLight(0x9bc7ff, 0.82);
  coolRim.position.set(-14, 8, -16);
  scene.add(coolRim);

  const redWash = new THREE.DirectionalLight(0xff3030, 0.28);
  redWash.position.set(8, 5, 8);
  scene.add(redWash);
}

function optimizeStaticShadows() {
  const dynamicRoots = [controlRoom.group, ...vehicles.map((vehicle) => vehicle.group), ...astronauts.map((walker) => walker.group)].filter(Boolean);
  scene.traverse((child) => {
    if (!child.isMesh) return;
    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    const isDynamic = dynamicRoots.some((root) => isDescendantOf(child, root));
    const isDecorative = material?.isMeshBasicMaterial || material?.transparent || material === materials.hitbox;
    if (isDynamic || isDecorative) {
      child.castShadow = false;
      return;
    }
    if (!child.castShadow) return;
    child.geometry.computeBoundingSphere?.();
    const radius = child.geometry.boundingSphere?.radius ?? 1;
    if (radius < 0.72 || perf.lowPower) child.castShadow = false;
  });
}

function isDescendantOf(child, root) {
  let current = child;
  while (current) {
    if (current === root) return true;
    current = current.parent;
  }
  return false;
}

function addBackground() {
  const skySphere = new THREE.Mesh(
    new THREE.SphereGeometry(92, 32, 16),
    new THREE.MeshBasicMaterial({
      map: createGalaxyTexture(),
      fog: false,
      depthWrite: false,
      side: THREE.BackSide,
    }),
  );
  skySphere.position.set(0, 10, 0);
  scene.add(skySphere);
  galaxyLayers.push({ object: skySphere, speed: 0.00018, drift: 0, axis: "y" });

  const starCount = window.innerWidth <= 760 ? 420 : 720;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const radius = THREE.MathUtils.randFloat(55, 87);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = THREE.MathUtils.randFloat(0.08, Math.PI * 0.88);
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = Math.cos(phi) * radius + 12;
    positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * radius;
    const blue = Math.random() > 0.7;
    colors[i * 3] = blue ? 0.55 : 1;
    colors[i * 3 + 1] = blue ? 0.75 : 0.95;
    colors[i * 3 + 2] = 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.026, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.52, fog: false }),
  );
  scene.add(stars);
  galaxyLayers.push({ object: stars, speed: 0.0006, drift: 0, axis: "y" });
}

function createGalaxyTexture() {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 1024;
  canvasTexture.height = 512;
  const ctx = canvasTexture.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvasTexture.width, canvasTexture.height);
  gradient.addColorStop(0, "#020409");
  gradient.addColorStop(0.35, "#06101f");
  gradient.addColorStop(0.65, "#08172b");
  gradient.addColorStop(1, "#010307");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < 120; i += 1) {
    const x = Math.random() * canvasTexture.width;
    const band = Math.sin((x / canvasTexture.width) * Math.PI * 2 - 0.9);
    const y = canvasTexture.height * 0.44 + band * 180 + (Math.random() - 0.5) * 220;
    const r = 55 + Math.random() * 170;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(80, 145, 255, 0.11)");
    g.addColorStop(0.42, "rgba(38, 90, 180, 0.045)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.2, r * 0.2, -0.34 + band * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 820; i += 1) {
    const x = Math.random() * canvasTexture.width;
    const y = Math.random() * canvasTexture.height;
    const s = Math.random() > 0.965 ? 2.6 : 0.75 + Math.random() * 1.2;
    ctx.fillStyle = Math.random() > 0.76 ? "rgba(146,190,255,0.82)" : "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlanet(ctx, 35, 900, 265, "rgba(96,170,255,0.92)", true);
  drawPlanet(ctx, 1760, 210, 75, "rgba(78,150,255,0.72)", false);
  drawPlanet(ctx, 1820, 280, 17, "rgba(136,175,230,0.42)", false);
  drawPlanet(ctx, 510, 845, 34, "rgba(130,178,240,0.48)", false);

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawPlanet(ctx, x, y, radius, rimColor, cityLights) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  const atmosphere = ctx.createRadialGradient(x + radius * 0.18, y - radius * 0.18, radius * 0.66, x, y, radius * 1.2);
  atmosphere.addColorStop(0, "rgba(0,0,0,0)");
  atmosphere.addColorStop(0.78, "rgba(0,0,0,0)");
  atmosphere.addColorStop(0.9, rimColor);
  atmosphere.addColorStop(1, "rgba(42,112,255,0)");
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();
  const body = ctx.createRadialGradient(x + radius * 0.32, y - radius * 0.28, radius * 0.1, x, y, radius);
  body.addColorStop(0, "#08172a");
  body.addColorStop(0.44, "#020407");
  body.addColorStop(1, "#000000");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rimColor;
  ctx.lineWidth = Math.max(2, radius * 0.018);
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.006, -Math.PI * 0.08, Math.PI * 1.18);
  ctx.stroke();
  if (cityLights) {
    for (let i = 0; i < 90; i += 1) {
      const angle = -2.1 + Math.random() * 1.05;
      const distance = radius * (0.25 + Math.random() * 0.6);
      ctx.fillStyle = "rgba(255,150,72,0.62)";
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * distance + Math.random() * 48, y + Math.sin(angle) * distance + Math.random() * 70, 1.2 + Math.random() * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function addBase() {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(31, 0.32, 28), materials.base);
  deck.position.set(0, -0.2, -0.6);
  deck.receiveShadow = true;
  scene.add(deck);

  addBox(31.5, 0.18, 0.26, 0, 0.03, 13.4, materials.bevel);
  addBox(31.5, 0.18, 0.26, 0, 0.03, -14.6, materials.bevel);
  addBox(0.26, 0.18, 28.4, -15.6, 0.03, -0.6, materials.bevel);
  addBox(0.26, 0.18, 28.4, 15.6, 0.03, -0.6, materials.bevel);

  [
    [-9.2, 7.0, 5.8, 3.7],
    [7.8, 6.1, 6.3, 3.3],
    [-10.3, -4.9, 4.6, 4.4],
    [7.1, -5.4, 5.2, 4.1],
    [-1.8, -10.6, 6.4, 2.1],
    [0.2, 10.2, 7.6, 2.0],
  ].forEach(([x, z, sx, sz]) => {
    const plate = addBox(sx, 0.026, sz, x, 0.006, z, materials.deckPanel);
    plate.castShadow = false;
  });

  [
    [-12.0, 1.7, 1.8, 0.16, 0],
    [11.8, 1.0, 2.0, 0.16, 0],
    [-4.9, 11.1, 2.4, 0.14, Math.PI * 0.5],
    [5.0, -12.4, 2.6, 0.14, Math.PI * 0.5],
    [-1.8, -1.8, 2.8, 0.12, 0.18],
    [3.7, 2.6, 2.2, 0.12, -0.32],
  ].forEach(([x, z, sx, sz, rotation]) => {
    const inset = addBox(sx, 0.018, sz, x, 0.026, z, materials.deckInset);
    inset.rotation.y = rotation;
    inset.castShadow = false;
  });

  for (let x = -13; x <= 13; x += 3.25) {
    const seam = addBox(0.018, 0.012, 26, x, 0.018, -0.6, materials.roadEdge);
    seam.castShadow = false;
  }
  for (let z = -12.5; z <= 11.5; z += 3.1) {
    const seam = addBox(29, 0.012, 0.018, 0, 0.02, z, materials.roadEdge);
    seam.castShadow = false;
  }

  [
    [-14.1, 0, -0.6, Math.PI * 0.5],
    [14.1, 0, -0.6, Math.PI * 0.5],
    [0, 0, 12.0, 0],
    [0, 0, -13.2, 0],
  ].forEach(([x, , z, rotation]) => {
    const rail = addBox(rotation ? 0.06 : 4.8, 0.055, rotation ? 4.8 : 0.06, x, 0.06, z, materials.roadEdge);
    rail.rotation.y = rotation;
  });

  for (let x = -13.4; x <= 13.4; x += 3.2) {
    addGlowDash(x, 0.12, 12.6, 0);
    addGlowDash(x, 0.12, -13.8, 0);
  }

  [
    [-6.0, 0.105, 11.7], [-2.0, 0.105, 11.7], [2.0, 0.105, 11.7], [6.0, 0.105, 11.7],
    [-6.0, 0.105, -12.9], [-2.0, 0.105, -12.9], [2.0, 0.105, -12.9], [6.0, 0.105, -12.9],
  ].forEach(([x, y, z]) => {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), materials.redLight);
    marker.position.set(x, y + 0.03, z);
    scene.add(marker);
  });
}

function addRoads() {
  const center = new THREE.Vector3(-1.8, 0.04, 0.4);
  sections.forEach((section) => {
    if (section.id !== "projects") {
      const bend = center.clone().lerp(section.position, 0.52);
      bend.x += section.position.x > center.x ? -0.75 : 0.75;
      bend.z += section.position.z > center.z ? -0.45 : 0.45;
      const route = curve([center, bend, section.position.clone().setY(0.04)], false);
      scene.add(createCurvedRoad(route, 0.88, { segments: 14, dashEvery: 4 }));
      scene.add(createTunnel(route, 1.62, { segments: 10 }));
    }
  });

  scene.add(createCurvedRoad(curve(vehicleRouteAPoints(0.04), true), 0.78, { segments: 58, dashEvery: 5, opacity: 0.88 }));
  scene.add(createCurvedRoad(curve(vehicleRouteBPoints(0.045), true), 0.6, { segments: 46, dashEvery: 5, opacity: 0.74 }));
  addPadApproachLights(center);
}

function vehicleRouteAPoints(y = 0.075) {
  return [
    [-14.25, y, 8.7], [-11.4, y, 12.05], [-3.8, y, 12.55], [5.4, y, 11.92],
    [12.55, y, 8.42], [14.08, y, 2.2], [13.58, y, -5.58], [10.0, y, -12.66],
    [1.0, y, -13.12], [-7.78, y, -12.16], [-13.35, y, -8.0], [-14.46, y, -0.8],
  ];
}

function vehicleRouteBPoints(y = 0.082) {
  return [
    [-13.18, y, 4.8], [-10.0, y, 10.62], [-1.0, y, 11.62], [4.55, y, 11.3],
    [11.78, y, 8.82], [12.92, y, 3.82], [13.02, y, -1.18], [11.1, y, -7.2],
    [8.4, y, -12.0], [-0.82, y, -11.92], [-8.42, y, -10.56], [-12.82, y, -5.56], [-13.72, y, 0.42],
  ];
}

function createCurvedRoad(route, width, options = {}) {
  const group = new THREE.Group();
  const segments = options.segments ?? 48;
  const dashEvery = options.dashEvery ?? 6;
  const roadMaterial = options.opacity ? materials.road.clone() : materials.road;
  if (options.opacity) {
    roadMaterial.transparent = true;
    roadMaterial.opacity = options.opacity;
  }

  for (let i = 0; i < segments; i += 1) {
    const a = route.getPointAt(i / segments);
    const b = route.getPointAt((i + 1) / segments);
    const delta = b.clone().sub(a);
    const length = Math.max(delta.length(), 0.05);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, length * 1.04), roadMaterial);
    slab.position.copy(a).add(b).multiplyScalar(0.5);
    slab.position.y = 0.035;
    slab.rotation.y = Math.atan2(delta.x, delta.z);
    slab.receiveShadow = true;
    group.add(slab);

    if (options.edges !== false) {
      const rotation = slab.rotation.y;
      const side = new THREE.Vector3(Math.cos(rotation), 0, -Math.sin(rotation));
      [-1, 1].forEach((direction) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.026, length * 0.98), materials.roadEdge);
        edge.position.copy(slab.position).add(side.clone().multiplyScalar(direction * (width * 0.5 - 0.025)));
        edge.position.y = 0.064;
        edge.rotation.y = rotation;
        edge.receiveShadow = true;
        group.add(edge);
      });
    }

    if (i % dashEvery === 0) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.03, 0.36), materials.redLight);
      const t = (i + 0.5) / segments;
      const point = route.getPointAt(t);
      const tangent = route.getTangentAt(t).normalize();
      dash.position.set(point.x, 0.086, point.z);
      dash.rotation.y = Math.atan2(tangent.x, tangent.z);
      group.add(dash);

      const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
      [-1, 1].forEach((direction) => {
        const markerMat = i % (dashEvery * 2) === 0 ? materials.whiteLight.clone() : materials.redDim.clone();
        markerMat.opacity = i % (dashEvery * 2) === 0 ? 0.28 : 0.48;
        const edgeMarker = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.022, 0.2), markerMat);
        edgeMarker.position.copy(point).add(side.clone().multiplyScalar(direction * (width * 0.5 + 0.11)));
        edgeMarker.position.y = 0.094;
        edgeMarker.rotation.y = Math.atan2(tangent.x, tangent.z);
        group.add(edgeMarker);
      });
    }
  }

  return group;
}

function createTunnel(route, width, options = {}) {
  const group = new THREE.Group();
  const segments = options.segments ?? 10;
  const ribMaterial = materials.roadEdge.clone();
  const panelMaterial = materials.black.clone();
  const whiteGuide = materials.whiteLight.clone();
  whiteGuide.opacity = 0.28;
  const redGuide = materials.redDim.clone();
  redGuide.opacity = 0.42;

  const ribHeight = 1.48;
  const halfWidth = width * 0.5;
  const ribRadius = 0.026;

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const point = route.getPointAt(t);
    const tangent = route.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const leftBottom = point.clone().add(side.clone().multiplyScalar(-halfWidth));
    const rightBottom = point.clone().add(side.clone().multiplyScalar(halfWidth));
    const leftTop = leftBottom.clone().setY(1.0);
    const rightTop = rightBottom.clone().setY(1.0);
    leftBottom.y = 0.1;
    rightBottom.y = 0.1;
    const roofLeft = point.clone().add(side.clone().multiplyScalar(-halfWidth * 0.54)).setY(ribHeight);
    const roofRight = point.clone().add(side.clone().multiplyScalar(halfWidth * 0.54)).setY(ribHeight);

    group.add(beam(leftBottom, leftTop, ribRadius, ribMaterial));
    group.add(beam(rightBottom, rightTop, ribRadius, ribMaterial));
    group.add(beam(leftTop, roofLeft, ribRadius, ribMaterial));
    group.add(beam(rightTop, roofRight, ribRadius, ribMaterial));
    group.add(beam(roofLeft, roofRight, ribRadius, ribMaterial));

    if (i % 2 === 0) {
      const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.11), redGuide.clone());
      beacon.position.copy(point).setY(1.42);
      beacon.rotation.y = Math.atan2(tangent.x, tangent.z);
      group.add(beacon);
    }
  }

  for (let i = 0; i < segments; i += 1) {
    const a = route.getPointAt(i / segments);
    const b = route.getPointAt((i + 1) / segments);
    const delta = b.clone().sub(a);
    const length = Math.max(delta.length(), 0.05);
    const rotation = Math.atan2(delta.x, delta.z);
    const side = new THREE.Vector3(Math.cos(rotation), 0, -Math.sin(rotation));
    const center = a.clone().add(b).multiplyScalar(0.5);

    [-1, 1].forEach((direction) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, length * 0.88), panelMaterial);
      rail.position.copy(center).add(side.clone().multiplyScalar(direction * (halfWidth + 0.08)));
      rail.position.y = 0.22;
      rail.rotation.y = rotation;
      rail.castShadow = true;
      rail.receiveShadow = true;
      group.add(rail);

      const stripMaterial = i % 2 === 0 ? redGuide.clone() : whiteGuide.clone();
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, length * 0.52), stripMaterial);
      strip.position.copy(center).add(side.clone().multiplyScalar(direction * (halfWidth + 0.14)));
      strip.position.y = 0.42;
      strip.rotation.y = rotation;
      group.add(strip);
    });
  }

  return group;
}

function addPadApproachLights(center) {
  sections.forEach((section, index) => {
    const direction = section.position.clone().sub(center);
    direction.y = 0;
    direction.normalize();
    const side = new THREE.Vector3().crossVectors(up, direction).normalize();
    for (let i = 0; i < 3; i += 1) {
      const distance = 2.95 + i * 0.52;
      const base = section.position.clone().add(direction.clone().multiplyScalar(-distance));
      [-1, 1].forEach((sideDir) => {
        const mat = (i + index) % 2 ? materials.redDim.clone() : materials.whiteLight.clone();
        mat.opacity = (i + index) % 2 ? 0.42 : 0.3;
        const marker = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.024, 0.24), mat);
        marker.position.copy(base).add(side.clone().multiplyScalar(sideDir * 0.42));
        marker.position.y = 0.11;
        marker.rotation.y = Math.atan2(direction.x, direction.z);
        scene.add(marker);
      });
    }
  });
}

function createRoad(from, to, width) {
  const route = curve([from.clone().setY(0.04), from.clone().lerp(to, 0.5).setY(0.04), to.clone().setY(0.04)], false);
  return createCurvedRoad(route, width, { segments: 14, dashEvery: 4 });
}

function addRoadDashes(route, group, segments, dashEvery) {
  for (let i = 0; i < segments; i += dashEvery) {
    const t = (i + 0.5) / segments;
    const point = route.getPointAt(t);
    const tangent = route.getTangentAt(t).normalize();
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.028, 0.5), materials.redLight);
    dash.position.set(point.x, 0.085, point.z);
    dash.rotation.y = Math.atan2(tangent.x, tangent.z);
    group.add(dash);
  }
}

function addBuildings() {
  buildingSpecs.forEach((spec, index) => {
    const building = createSpaceBaseBuilding(spec.type, index);
    building.position.set(spec.x, spec.y, spec.z);
    building.rotation.y = spec.rotationY;
    building.scale.setScalar(spec.scale);
    scene.add(building);
  });

  const heroTower = createControlTowerModule({ scale: heroTowerSpec.scale, hero: true, phase: 1.9 });
  heroTower.position.set(heroTowerSpec.x, heroTowerSpec.y, heroTowerSpec.z);
  heroTower.rotation.y = heroTowerSpec.rotationY;
  scene.add(heroTower);
}

function createSpaceBaseBuilding(type, index) {
  if (type === "command") return createCommandCenterBuilding(index);
  if (type === "hangar") return createHangarBuilding(index);
  return createResearchLabBuilding(index);
}

function createCommandCenterBuilding(index) {
  const group = new THREE.Group();
  const darkPanel = materials.deckPanel.clone();
  const windowMat = materials.towerGlass.clone();
  windowMat.opacity = 0.58;
  const redSlit = materials.redLight.clone();
  redSlit.transparent = true;
  redSlit.opacity = 0.76;

  const lower = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.92, 0.42, 32), materials.black);
  lower.position.y = 0.24;
  lower.castShadow = true;
  lower.receiveShadow = true;
  group.add(lower);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.55, 0.2, 32), darkPanel);
  deck.position.y = 0.58;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);
  const ringTop = ring(1.34, 0.018, 0.18);
  ringTop.position.y = 0.72;
  group.add(ringTop);

  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const module = new THREE.Group();
    module.position.set(Math.cos(angle) * 1.64, 0.52, Math.sin(angle) * 1.64);
    module.rotation.y = -angle;
    addChildBox(module, 0.52, 0.34, 0.3, 0, 0, 0, i % 2 ? materials.bevel : materials.roadEdge);
    addChildBox(module, 0.3, 0.04, 0.034, 0, 0.05, -0.17, redSlit.clone());
    group.add(module);
  }

  addChildBox(group, 1.35, 0.56, 1.02, 0, 1.02, -0.08, materials.tower);
  addChildBox(group, 1.74, 0.18, 1.3, 0, 1.42, -0.08, materials.bevel);
  addChildBox(group, 1.1, 0.26, 0.045, 0, 1.03, -0.61, windowMat);
  [-0.36, 0, 0.36].forEach((x) => addChildBox(group, 0.032, 0.3, 0.06, x, 1.03, -0.64, materials.roadEdge));

  const ramp = addChildBox(group, 0.78, 0.12, 0.95, 0, 0.13, -2.0, materials.deckPanel);
  ramp.rotation.x = -0.12;
  addChildBox(group, 0.46, 0.36, 0.08, 0, 0.43, -1.55, materials.deckInset);
  for (let i = -1; i <= 1; i += 1) {
    addChildBox(group, 0.34, 0.04, 0.04, i * 0.44, 0.72, -1.55, redSlit.clone());
  }

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.019, 1.08, 8), materials.roadEdge);
  mast.position.set(0.62, 2.07, 0.18);
  group.add(mast);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 6), materials.redLight.clone());
  bulb.position.set(0.62, 2.64, 0.18);
  group.add(bulb);
  const light = fakeLight(0.64);
  light.position.copy(bulb.position);
  group.add(light);
  beacons.push({ bulb, light, phase: index * 0.62 + 0.4 });

  const dishArm = beam(new THREE.Vector3(-0.85, 1.1, 0.22), new THREE.Vector3(-1.3, 1.42, 0.46), 0.018, materials.roadEdge);
  group.add(dishArm);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.026, 18), materials.bevel);
  dish.position.set(-1.42, 1.5, 0.53);
  dish.rotation.z = Math.PI * 0.5;
  dish.rotation.y = -0.42;
  group.add(dish);

  const shadow = contactShadow(4.4, 3.6, 0.38);
  shadow.position.y = 0.012;
  group.add(shadow);
  return group;
}

function createHangarBuilding(index) {
  const group = new THREE.Group();
  const redSlit = materials.redLight.clone();
  redSlit.transparent = true;
  redSlit.opacity = 0.7;
  addChildBox(group, 4.2, 0.26, 2.34, 0, 0.18, 0, materials.black);
  const shell = addChildBox(group, 3.55, 1.1, 1.72, 0, 0.78, 0, materials.deckPanel);
  shell.castShadow = true;
  const roof = addChildBox(group, 3.32, 0.28, 1.96, 0, 1.46, -0.02, materials.bevel);
  roof.rotation.x = -0.035;
  const door = addChildBox(group, 1.34, 0.78, 0.08, 0, 0.72, -0.92, materials.deckInset);
  door.castShadow = false;
  addChildBox(group, 1.6, 0.11, 0.09, 0, 1.17, -0.98, materials.roadEdge);
  addChildBox(group, 0.12, 0.86, 0.09, -0.82, 0.72, -0.98, materials.roadEdge);
  addChildBox(group, 0.12, 0.86, 0.09, 0.82, 0.72, -0.98, materials.roadEdge);
  const ramp = addChildBox(group, 1.8, 0.11, 1.3, 0, 0.1, -1.7, materials.deckPanel);
  ramp.rotation.x = -0.08;

  [-1, 1].forEach((side) => {
    addChildBox(group, 0.46, 0.82, 1.96, side * 2.0, 0.62, 0, materials.tower);
    addChildBox(group, 0.08, 0.62, 1.58, side * 2.25, 0.62, 0.1, materials.roadEdge);
    addChildBox(group, 0.055, 0.08, 0.88, side * 2.31, 0.88, -0.1, redSlit.clone());
  });

  for (let i = -2; i <= 2; i += 1) {
    addChildBox(group, 0.44, 0.045, 0.05, i * 0.62, 0.98, -1.02, redSlit.clone());
    addChildBox(group, 0.36, 0.035, 0.08, i * 0.66, 1.62, 0.88, materials.roadEdge);
  }

  const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.14, 8), materials.bevel);
  beaconBase.position.set(1.2, 1.72, 0.62);
  group.add(beaconBase);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 6), materials.redLight.clone());
  bulb.position.set(1.2, 1.86, 0.62);
  group.add(bulb);
  const light = fakeLight(0.58);
  light.position.copy(bulb.position);
  group.add(light);
  beacons.push({ bulb, light, phase: index * 0.72 + 1.2 });

  const shadow = contactShadow(5.0, 3.3, 0.36);
  shadow.position.y = 0.012;
  group.add(shadow);
  return group;
}

function createResearchLabBuilding(index) {
  const group = new THREE.Group();
  const redSlit = materials.redLight.clone();
  redSlit.transparent = true;
  redSlit.opacity = 0.68;
  const domeGlass = materials.glass.clone();
  domeGlass.color.setHex(0x11161b);
  domeGlass.emissive.setHex(0x3b0b0c);
  domeGlass.emissiveIntensity = 0.38;
  domeGlass.opacity = 0.52;

  addChildBox(group, 3.2, 0.24, 2.62, 0, 0.16, 0, materials.black);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.54, 1.72, 0.44, 32), materials.deckPanel);
  base.position.y = 0.42;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.18, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), domeGlass);
  dome.position.y = 0.72;
  dome.castShadow = true;
  dome.receiveShadow = true;
  group.add(dome);
  const domeRing = ring(1.18, 0.014, 0.14);
  domeRing.position.y = 0.72;
  group.add(domeRing);

  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const rib = beam(new THREE.Vector3(0, 0.72, 0), new THREE.Vector3(Math.cos(angle) * 1.08, 1.38, Math.sin(angle) * 1.08), 0.01, materials.roadEdge);
    group.add(rib);
  }

  [-1, 1].forEach((side) => {
    addChildBox(group, 0.72, 0.72, 1.04, side * 1.46, 0.55, 0.1, materials.tower);
    addChildBox(group, 0.05, 0.42, 0.58, side * 1.84, 0.58, 0.04, redSlit.clone());
  });
  addChildBox(group, 0.66, 0.5, 0.08, 0, 0.42, -1.42, materials.deckInset);
  const ramp = addChildBox(group, 0.98, 0.1, 0.9, 0, 0.09, -1.92, materials.deckPanel);
  ramp.rotation.x = -0.1;

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.017, 0.86, 8), materials.roadEdge);
  mast.position.set(-0.92, 1.65, 0.5);
  group.add(mast);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 6), materials.redLight.clone());
  bulb.position.set(-0.92, 2.1, 0.5);
  group.add(bulb);
  const light = fakeLight(0.5);
  light.position.copy(bulb.position);
  group.add(light);
  beacons.push({ bulb, light, phase: index * 0.8 + 2.1 });

  const shadow = contactShadow(4.2, 3.6, 0.34);
  shadow.position.y = 0.012;
  group.add(shadow);
  return group;
}

function buildTrafficBarriers() {
  trafficBarriers.length = 0;
  sections.forEach((section) => {
    const index = sections.indexOf(section);
    addCircleBarrier(section.position.x, section.position.z, 3.32, 4.42);
    const towerX = section.position.x + (sections.indexOf(section) % 2 === 0 ? -2.9 : 2.9);
    const towerZ = section.position.z + (sections.indexOf(section) % 3 === 0 ? -0.36 : 0.34);
    addCircleBarrier(towerX, towerZ, 1.16, 1.72);
    const armX = section.position.x + (index % 2 === 0 ? -1.92 : 1.92);
    addCircleBarrier(armX, towerZ, 0.58, 1.06);
  });
  buildingSpecs.forEach((spec) => {
    if (spec.barrier === "circle") {
      addCircleBarrier(spec.x, spec.z, spec.radius, spec.slowRadius);
    } else {
      addBoxBarrier(spec.x, spec.z, spec.halfX, spec.halfZ);
    }
  });
  addBoxBarrier(heroTowerSpec.x, heroTowerSpec.z, heroTowerSpec.halfX, heroTowerSpec.halfZ);
}

function addCircleBarrier(x, z, radius, slowRadius) {
  trafficBarriers.push({ type: "circle", x, z, radius, slowRadius });
}

function addBoxBarrier(x, z, halfX, halfZ) {
  trafficBarriers.push({ type: "box", x, z, halfX, halfZ });
}

function resolveTrafficPoint(point) {
  trafficResolution.blocked = false;
  trafficResolution.speedScale = 1;
  point.x = THREE.MathUtils.clamp(point.x, -14.75, 14.75);
  point.z = THREE.MathUtils.clamp(point.z, -13.25, 12.85);

  trafficBarriers.forEach((barrier) => {
    if (barrier.type === "circle") {
      const dx = point.x - barrier.x;
      const dz = point.z - barrier.z;
      const distance = Math.hypot(dx, dz);
      if (distance < barrier.radius) {
        const invDistance = distance > 0.001 ? 1 / distance : 1;
        const pushX = distance > 0.001 ? dx * invDistance : 1;
        const pushZ = distance > 0.001 ? dz * invDistance : 0;
        point.x = barrier.x + pushX * barrier.radius;
        point.z = barrier.z + pushZ * barrier.radius;
        trafficResolution.blocked = true;
        trafficResolution.speedScale = Math.min(trafficResolution.speedScale, 0.16);
      } else if (distance < barrier.slowRadius) {
        const clearance = THREE.MathUtils.clamp((distance - barrier.radius) / (barrier.slowRadius - barrier.radius), 0, 1);
        trafficResolution.speedScale = Math.min(trafficResolution.speedScale, THREE.MathUtils.lerp(0.42, 1, clearance));
      }
    } else {
      const dx = point.x - barrier.x;
      const dz = point.z - barrier.z;
      const overlapX = barrier.halfX - Math.abs(dx);
      const overlapZ = barrier.halfZ - Math.abs(dz);
      if (overlapX > 0 && overlapZ > 0) {
        if (overlapX < overlapZ) {
          point.x = barrier.x + (dx < 0 ? -barrier.halfX : barrier.halfX);
        } else {
          point.z = barrier.z + (dz < 0 ? -barrier.halfZ : barrier.halfZ);
        }
        trafficResolution.blocked = true;
        trafficResolution.speedScale = Math.min(trafficResolution.speedScale, 0.12);
      }
    }
  });

  return trafficResolution;
}

function isTrafficBlocked(point, margin = 0.18) {
  if (point.x < -14.85 + margin || point.x > 14.85 - margin || point.z < -13.35 + margin || point.z > 12.95 - margin) return true;
  for (const barrier of trafficBarriers) {
    if (barrier.type === "circle") {
      const distance = Math.hypot(point.x - barrier.x, point.z - barrier.z);
      if (distance < barrier.radius + margin) return true;
    } else if (Math.abs(point.x - barrier.x) < barrier.halfX + margin && Math.abs(point.z - barrier.z) < barrier.halfZ + margin) {
      return true;
    }
  }
  return false;
}

function segmentHitsBarrier(from, to, margin = 0.18) {
  for (let i = 1; i <= 8; i += 1) {
    trafficSample.lerpVectors(from, to, i / 8);
    if (isTrafficBlocked(trafficSample, margin)) return true;
  }
  return false;
}

function trafficSlowScaleAt(point) {
  let scale = 1;
  for (const barrier of trafficBarriers) {
    if (barrier.type === "circle") {
      const distance = Math.hypot(point.x - barrier.x, point.z - barrier.z);
      if (distance < barrier.slowRadius) {
        const clearance = THREE.MathUtils.clamp((distance - barrier.radius) / Math.max(barrier.slowRadius - barrier.radius, 0.01), 0, 1);
        scale = Math.min(scale, THREE.MathUtils.lerp(0.26, 1, clearance));
      }
    } else {
      const dx = Math.abs(point.x - barrier.x) - barrier.halfX;
      const dz = Math.abs(point.z - barrier.z) - barrier.halfZ;
      const edgeDistance = Math.max(dx, dz);
      if (edgeDistance < 0.95) scale = Math.min(scale, THREE.MathUtils.lerp(0.34, 1, THREE.MathUtils.clamp(edgeDistance / 0.95, 0, 1)));
    }
  }
  return scale;
}

function createLaunchPad(section, index) {
  const group = new THREE.Group();
  group.position.copy(section.position);

  const pad = createDetailedPad(index);
  group.add(pad.group);

  const rocket = createRocket(section, index);
  rocket.position.y = 0.58;
  group.add(rocket);

  const slide = createSlide(section, index);
  slide.group.position.set((index % 2 === 0 ? 1 : -1) * 2.96, 2.44, 1.42);
  group.add(slide.group);

  const exhaust = createExhaust();
  exhaust.group.position.set(0, 0.62, 0);
  group.add(exhaust.group);

  const gantry = createSupportGantry(index);
  gantry.position.set(index % 2 === 0 ? -2.86 : 2.86, 0.25, index % 3 === 0 ? -0.34 : 0.34);
  gantry.rotation.y = index % 2 === 0 ? 0.08 : Math.PI - 0.08;
  group.add(gantry);

  const padLight = fakeLight(0.5);
  padLight.position.set(0, 1.25, 0);
  group.add(padLight);

  const activeHalo = ring(2.75, 0.055, 0);
  activeHalo.position.y = 0.73;
  group.add(activeHalo);

  refs.set(section.id, { group, rocket, slide, exhaust, padLight, activeHalo, pad, phase: index * 0.72 });
  return group;
}

function createDetailedPad(index) {
  const group = new THREE.Group();
  const phase = index * 0.62;

  const lower = new THREE.Mesh(new THREE.CylinderGeometry(2.56, 2.78, 0.46, 44), materials.black);
  lower.position.y = 0.16;
  lower.castShadow = true;
  lower.receiveShadow = true;
  group.add(lower);

  const mid = new THREE.Mesh(new THREE.CylinderGeometry(2.28, 2.42, 0.18, 44), materials.deckPanel);
  mid.position.y = 0.48;
  mid.castShadow = true;
  mid.receiveShadow = true;
  group.add(mid);

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.92, 2.05, 0.09, 44), materials.base);
  deck.position.y = 0.62;
  deck.receiveShadow = true;
  group.add(deck);

  const outerRing = ring(2.2, 0.024, 0.22);
  outerRing.position.y = 0.7;
  group.add(outerRing);
  const midRing = ring(1.55, 0.018, 0.16);
  midRing.position.y = 0.714;
  group.add(midRing);
  const innerRing = ring(0.66, 0.015, 0.18);
  innerRing.position.y = 0.724;
  group.add(innerRing);

  const crosshair = [];
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.022, 0.026), materials.redDim.clone());
    line.position.y = 0.736;
    line.position.x = Math.cos(angle) * 0.72;
    line.position.z = Math.sin(angle) * 0.72;
    line.rotation.y = -angle;
    group.add(line);
    crosshair.push(line);
  }

  const rimDashes = [];
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2 + phase * 0.04;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.038, 0.062), materials.redDim.clone());
    dash.position.set(Math.cos(angle) * 1.82, 0.75, Math.sin(angle) * 1.82);
    dash.rotation.y = -angle;
    group.add(dash);
    rimDashes.push(dash);
  }

  const chaseDashes = [];
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const dashMaterial = materials.redLight.clone();
    dashMaterial.transparent = true;
    dashMaterial.opacity = 0.62;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.042, 0.07), dashMaterial);
    dash.position.set(Math.cos(angle) * 2.35, 0.56, Math.sin(angle) * 2.35);
    dash.rotation.y = -angle;
    group.add(dash);
    chaseDashes.push(dash);
  }

  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = i % 3 === 0 ? 2.42 : 2.36;
    const armor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.18, 0.28), i % 2 ? materials.bevel : materials.roadEdge);
    armor.position.set(Math.cos(angle) * radius, 0.55, Math.sin(angle) * radius);
    armor.rotation.y = -angle;
    armor.receiveShadow = true;
    group.add(armor);
  }

  const beacons = [];
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const module = new THREE.Group();
    module.position.set(Math.cos(angle) * 2.54, 0.7, Math.sin(angle) * 2.54);
    module.rotation.y = -angle;

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.24, 0.42), materials.black);
    box.receiveShadow = true;
    module.add(box);
    const slitMaterial = materials.redLight.clone();
    slitMaterial.transparent = true;
    slitMaterial.opacity = 0.66;
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.028), slitMaterial);
    slit.position.set(0, 0.02, -0.225);
    module.add(slit);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 6), materials.redLight.clone());
    beacon.position.set(0.18, 0.18, -0.1);
    module.add(beacon);
    beacons.push({ beacon, slit, phase: phase + i * 0.7 });
    group.add(module);
  }

  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const ramp = new THREE.Group();
    ramp.position.set(Math.cos(angle) * 2.55, 0.33, Math.sin(angle) * 2.55);
    ramp.rotation.y = -angle;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 1.0), materials.deckPanel);
    slab.position.z = 0.22;
    slab.rotation.x = -0.08;
    slab.receiveShadow = true;
    ramp.add(slab);
    for (let r = -1; r <= 1; r += 1) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.028, 0.035), materials.redDim.clone());
      stripe.position.set(0, 0.1, 0.08 + r * 0.22);
      ramp.add(stripe);
    }
    group.add(ramp);
  }

  const shadow = contactShadow(3.7, 2.85, 0.38);
  shadow.position.y = 0.668;
  group.add(shadow);

  return {
    group,
    outerRing,
    midRing,
    innerRing,
    crosshair,
    rimDashes,
    chaseDashes,
    beacons,
  };
}

function createRocket(section, index) {
  const sectionId = section.id;
  const group = new THREE.Group();
  group.userData.sectionId = sectionId;

  const variants = [
    { bodyHeight: 3.15, lowerRadius: 0.43, upperRadius: 0.33, noseHeight: 0.82, noseRadius: 0.36, shoulder: 0.22, bands: [1.55, 2.72], panels: 4, panelHeight: 0.38, redY: [1.04, 3.34], boosters: 0, fins: "compact", nozzles: 3, antenna: false },
    { bodyHeight: 3.28, lowerRadius: 0.38, upperRadius: 0.32, noseHeight: 1.04, noseRadius: 0.34, shoulder: 0.18, bands: [2.88], panels: 6, panelHeight: 0.5, redY: [1.18, 3.42], boosters: 2, fins: "clean", nozzles: 1, antenna: false },
    { bodyHeight: 3.0, lowerRadius: 0.5, upperRadius: 0.42, noseHeight: 0.74, noseRadius: 0.44, shoulder: 0.28, bands: [1.42, 2.2, 3.0], panels: 5, panelHeight: 0.72, redY: [1.0, 2.68], boosters: 0, fins: "cargo", nozzles: 4, antenna: false },
    { bodyHeight: 3.65, lowerRadius: 0.31, upperRadius: 0.27, noseHeight: 0.92, noseRadius: 0.29, shoulder: 0.16, bands: [2.0, 3.28], panels: 4, panelHeight: 0.82, redY: [1.34, 3.58], boosters: 3, fins: "slim", nozzles: 1, antenna: false },
    { bodyHeight: 3.38, lowerRadius: 0.46, upperRadius: 0.36, noseHeight: 0.88, noseRadius: 0.38, shoulder: 0.2, bands: [1.48, 2.76], panels: 4, panelHeight: 0.58, redY: [1.06, 3.52], boosters: 4, fins: "heavy", nozzles: 5, antenna: false },
    { bodyHeight: 2.72, lowerRadius: 0.36, upperRadius: 0.31, noseHeight: 0.78, noseRadius: 0.32, shoulder: 0.18, bands: [1.36, 2.4], panels: 5, panelHeight: 0.46, redY: [1.02, 2.92], boosters: 2, fins: "compact", nozzles: 2, antenna: true },
  ];
  const spec = variants[index % variants.length];
  const bodyBase = 0.72;
  const bodyCenter = bodyBase + spec.bodyHeight * 0.5;
  const bodyTop = bodyBase + spec.bodyHeight;

  const body = addInteractive(new THREE.CylinderGeometry(spec.upperRadius, spec.lowerRadius, spec.bodyHeight, 40, 5), materials.white, sectionId, group, 0, bodyCenter, 0);
  body.castShadow = true;
  const shoulder = addInteractive(new THREE.CylinderGeometry(spec.noseRadius, spec.upperRadius, spec.shoulder, 40), materials.white, sectionId, group, 0, bodyTop + spec.shoulder * 0.5, 0);
  shoulder.castShadow = true;
  addInteractive(new THREE.ConeGeometry(spec.noseRadius, spec.noseHeight, 40), materials.white, sectionId, group, 0, bodyTop + spec.shoulder + spec.noseHeight * 0.5, 0);

  spec.bands.forEach((y, i) => {
    const radius = THREE.MathUtils.lerp(spec.lowerRadius, spec.upperRadius, THREE.MathUtils.clamp((y - bodyBase) / spec.bodyHeight, 0, 1)) + 0.012;
    addInteractive(new THREE.CylinderGeometry(radius, radius, i === 0 ? 0.16 : 0.105, 40), materials.rocketBlack, sectionId, group, 0, y, 0);
  });
  spec.redY.forEach((y) => {
    const radius = THREE.MathUtils.lerp(spec.lowerRadius, spec.upperRadius, THREE.MathUtils.clamp((y - bodyBase) / spec.bodyHeight, 0, 1)) + 0.018;
    addInteractive(new THREE.CylinderGeometry(radius, radius, 0.044, 40), materials.red, sectionId, group, 0, y, 0);
  });

  for (let i = 0; i < spec.panels; i += 1) {
    const angle = (i / spec.panels) * Math.PI * 2 + (index % 2 ? Math.PI / spec.panels : 0);
    const radius = spec.lowerRadius + 0.028;
    const panel = addInteractive(new THREE.BoxGeometry(0.035, spec.panelHeight, 0.012), materials.rocketBlack, sectionId, group, Math.cos(angle) * radius, bodyBase + spec.bodyHeight * (0.38 + (i % 2) * 0.17), Math.sin(angle) * radius);
    panel.rotation.y = -angle;
    if (i % 3 === 0) {
      const redTick = addInteractive(new THREE.BoxGeometry(0.04, 0.15, 0.014), materials.red, sectionId, group, Math.cos(angle) * (radius + 0.01), bodyBase + spec.bodyHeight * 0.23, Math.sin(angle) * (radius + 0.01));
      redTick.rotation.y = -angle;
    }
  }

  const windowCount = index === 2 ? 6 : index === 3 ? 2 : 4;
  for (let i = 0; i < windowCount; i += 1) {
    const angle = (i / windowCount) * Math.PI * 2 + Math.PI * 0.08;
    const radius = spec.upperRadius + 0.028;
    const windowPanel = addInteractive(new THREE.BoxGeometry(0.09, 0.16, 0.018), materials.rocketBlack, sectionId, group, Math.cos(angle) * radius, bodyTop - 0.58 - (i % 2) * 0.22, Math.sin(angle) * radius);
    windowPanel.rotation.y = -angle;
  }

  if (spec.antenna) {
    const cap = addInteractive(new THREE.CylinderGeometry(0.018, 0.028, 0.42, 8), materials.rocketBlack, sectionId, group, 0, bodyTop + spec.shoulder + spec.noseHeight + 0.2, 0);
    cap.castShadow = true;
    addInteractive(new THREE.SphereGeometry(0.042, 10, 6), materials.red, sectionId, group, 0, bodyTop + spec.shoulder + spec.noseHeight + 0.45, 0);
  }

  const nozzleRadius = spec.nozzles > 3 ? 0.15 : 0.22;
  for (let i = 0; i < spec.nozzles; i += 1) {
    const angle = (i / Math.max(spec.nozzles, 1)) * Math.PI * 2;
    const offset = spec.nozzles === 1 ? 0 : spec.lowerRadius * 0.45;
    const nozzle = addInteractive(new THREE.ConeGeometry(nozzleRadius, 0.38, 20), materials.rocketBlack, sectionId, group, Math.cos(angle) * offset, 0.26, Math.sin(angle) * offset);
    nozzle.rotation.x = Math.PI;
  }

  const boosterAngles = spec.boosters === 2 ? [0, Math.PI] : spec.boosters === 3 ? [0, Math.PI * 0.67, Math.PI * 1.33] : spec.boosters === 4 ? [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5] : [];
  boosterAngles.forEach((angle, i) => {
    const booster = new THREE.Group();
    const boosterHeight = spec.fins === "heavy" ? 2.14 : spec.fins === "slim" ? 2.28 : 1.72;
    addInteractive(new THREE.CylinderGeometry(0.12, 0.15, boosterHeight, 22, 3), materials.white, sectionId, booster, 0, 0, 0);
    addInteractive(new THREE.ConeGeometry(0.14, 0.34, 22), materials.white, sectionId, booster, 0, boosterHeight * 0.58, 0);
    const foot = addInteractive(new THREE.ConeGeometry(0.13, 0.25, 18), materials.rocketBlack, sectionId, booster, 0, -boosterHeight * 0.55, 0);
    foot.rotation.x = Math.PI;
    addInteractive(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20), materials.red, sectionId, booster, 0, -0.05, 0);
    const radius = spec.lowerRadius + 0.28 + (i % 2) * 0.04;
    booster.position.set(Math.cos(angle) * radius, 1.42, Math.sin(angle) * radius);
    group.add(booster);
  });

  const finScale = spec.fins === "heavy" ? [0.2, 0.92, 0.38] : spec.fins === "cargo" ? [0.17, 0.82, 0.34] : spec.fins === "slim" ? [0.1, 0.72, 0.24] : [0.12, 0.68, 0.26];
  [[spec.lowerRadius + 0.16, 0, finScale[0], finScale[1], finScale[2]], [-(spec.lowerRadius + 0.16), 0, finScale[0], finScale[1], finScale[2]], [0, spec.lowerRadius + 0.16, finScale[2], finScale[1], finScale[0]], [0, -(spec.lowerRadius + 0.16), finScale[2], finScale[1], finScale[0]]].forEach(([x, z, sx, sy, sz]) => {
    const fin = addInteractive(new THREE.BoxGeometry(sx, sy, sz), materials.rocketBlack, sectionId, group, x, 0.74, z);
    fin.rotation.y = x ? Math.sign(x) * 0.06 : 0;
    fin.castShadow = true;
  });

  const hitHeight = bodyTop + spec.shoulder + spec.noseHeight + (spec.antenna ? 0.6 : 0.22);
  const hitbox = new THREE.Mesh(new THREE.CylinderGeometry(spec.lowerRadius + 1.08, spec.lowerRadius + 0.94, hitHeight + 0.9, 18), materials.hitbox);
  hitbox.position.y = hitHeight * 0.5;
  hitbox.userData.sectionId = sectionId;
  hitTargets.push(hitbox);
  group.add(hitbox);
  return group;
}

function createSlide(section, index) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.62, 1.62, 0.1), materials.black.clone());
  frame.material.emissive = new THREE.Color(0x350404);
  frame.material.emissiveIntensity = 0.42;
  frame.position.z = -0.045;
  frame.castShadow = true;
  group.add(frame);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.36, 1.36), new THREE.MeshBasicMaterial({ map: createSlideTexture(section), transparent: true, opacity: 0.92 }));
  screen.position.z = 0.02;
  group.add(screen);
  const redLine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.035, 0.04), materials.redLight);
  redLine.position.set(0, -0.61, 0.06);
  group.add(redLine);
  const glow = fakeLight(0.58);
  glow.position.set(0, 0.2, 0.5);
  group.add(glow);
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(2.82, 1.82, 0.28), materials.hitbox);
  hitbox.position.z = 0.08;
  hitbox.userData.sectionId = section.id;
  hitTargets.push(hitbox);
  group.add(hitbox);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.42, 10), materials.tower);
  post.position.set(0, -1.06, -0.04);
  post.castShadow = true;
  group.add(post);
  group.rotation.y = index % 2 === 0 ? -0.55 : 0.55;
  return { group, screen, frame, glow, redLine };
}

function createSlideTexture(section) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 304;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, "#111115");
  g.addColorStop(0.5, "#060608");
  g.addColorStop(1, "#170607");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "rgba(255, 74, 74, 0.84)";
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, c.width - 36, c.height - 36);
  ctx.fillStyle = "rgba(255, 74, 74, 0.95)";
  ctx.fillRect(44, 70, 92, 7);
  ctx.fillStyle = "rgba(178,176,173,0.92)";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText("PORTFOLIO PAD", 34, 39);
  ctx.fillStyle = "#f7f6ef";
  ctx.font = "800 39px Arial, sans-serif";
  ctx.fillText(section.label.toUpperCase(), 34, 97);
  ctx.fillStyle = "rgba(255,74,74,0.9)";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText(section.rocketName, 34, 125);
  ctx.fillStyle = "rgba(247,246,239,0.82)";
  ctx.font = "500 19px Arial, sans-serif";
  wrapText(ctx, previewText(section), 34, 165, c.width - 68, 24, 3);
  ctx.fillStyle = "rgba(255,74,74,0.78)";
  ctx.font = "800 14px Arial, sans-serif";
  ctx.fillText("CLICK TO OPEN", 34, c.height - 33);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function previewText(section) {
  if (section.contact) return "Email, LinkedIn, and phone contact details.";
  if (section.list) return section.list.slice(0, 2).join(" ");
  return section.paragraphs?.join(" ") ?? "";
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines += 1;
      if (lines >= maxLines) {
        ctx.fillText(`${line.replace(/[.,;:]?$/, "")}...`, x, y);
        return;
      }
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function createControlRoom() {
  const group = new THREE.Group();
  group.position.copy(ROOM_ORIGIN);
  controlRoom.monitors.length = 0;
  const compactRoom = window.innerWidth <= 760;

  const roomDark = materials.black.clone();
  roomDark.color.setHex(0x080b10);
  const roomPanel = materials.deckPanel.clone();
  roomPanel.color.setHex(0x141820);
  const softWhite = materials.whiteLight.clone();
  softWhite.opacity = 0.56;
  const softBlue = materials.blueGlow.clone();
  softBlue.opacity = 0.34;
  const glass = materials.glass.clone();
  glass.opacity = 0.4;
  glass.emissive.setHex(0x0a2a4c);
  glass.emissiveIntensity = 0.62;

  const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.35, 7.72, 0.22, 72), roomDark);
  floor.position.y = -0.08;
  floor.receiveShadow = true;
  group.add(floor);

  const floorGlow = new THREE.Mesh(new THREE.TorusGeometry(5.58, 0.035, 8, 96), softWhite.clone());
  floorGlow.rotation.x = Math.PI / 2;
  floorGlow.position.y = 0.055;
  group.add(floorGlow);

  const innerFloorGlow = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.018, 8, 72), softBlue.clone());
  innerFloorGlow.rotation.x = Math.PI / 2;
  innerFloorGlow.position.y = 0.07;
  group.add(innerFloorGlow);

  const ceilingDisc = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.7, 0.18, 64), materials.deckPanel);
  ceilingDisc.position.y = 3.62;
  group.add(ceilingDisc);
  const ceilingRingA = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.045, 8, 96), softWhite.clone());
  ceilingRingA.rotation.x = Math.PI / 2;
  ceilingRingA.position.y = 3.48;
  group.add(ceilingRingA);
  const ceilingRingB = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.032, 8, 72), softBlue.clone());
  ceilingRingB.rotation.x = Math.PI / 2;
  ceilingRingB.position.y = 3.44;
  group.add(ceilingRingB);

  const wallRadius = 6.05;
  for (let i = 0; i < 18; i += 1) {
    const angle = THREE.MathUtils.degToRad(-150 + i * (300 / 17));
    const x = Math.sin(angle) * wallRadius;
    const z = -Math.cos(angle) * wallRadius;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(i % 3 === 0 ? 0.28 : 0.18, 2.08, 0.12), i % 3 === 0 ? materials.roadEdge : roomPanel);
    panel.position.set(x, 1.52, z);
    panel.rotation.y = angle;
    panel.castShadow = true;
    panel.receiveShadow = true;
    group.add(panel);

    if (i % 2 === 0) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.035, 0.03), softBlue.clone());
      strip.position.set(Math.sin(angle) * (wallRadius - 0.1), 0.46, -Math.cos(angle) * (wallRadius - 0.1));
      strip.rotation.y = angle;
      group.add(strip);
    }
  }

  [-2.65, 0, 2.65].forEach((x) => {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.05, 0.04), glass.clone());
    pane.position.set(x, 1.95, -5.92);
    pane.castShadow = false;
    group.add(pane);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.22, 0.055), materials.roadEdge);
    frame.position.set(x, 1.95, -5.98);
    group.add(frame);
  });

  const door = addChildBox(group, 0.94, 1.95, 0.16, -5.65, 1.16, -1.2, materials.deckInset);
  door.rotation.y = -0.65;
  const doorGlow = addChildBox(group, 0.76, 1.62, 0.035, -5.72, 1.16, -1.12, softWhite.clone());
  doorGlow.rotation.y = -0.65;
  addChildBox(group, 0.48, 0.05, 0.04, -5.48, 2.18, -1.32, materials.redLight.clone()).rotation.y = -0.65;

  const sideDisplay = addChildBox(group, 1.22, 1.46, 0.08, 5.72, 1.85, -1.35, materials.black.clone());
  sideDisplay.rotation.y = 0.68;
  const sideScreen = addChildBox(group, 1.02, 1.18, 0.032, 5.62, 1.85, -1.28, softBlue.clone());
  sideScreen.rotation.y = 0.68;

  const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.72, 0.58, 48), materials.black);
  tableBase.position.set(0, 0.34, -0.38);
  tableBase.castShadow = true;
  tableBase.receiveShadow = true;
  group.add(tableBase);
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(2.18, 2.02, 0.16, 48), materials.deckPanel);
  tableTop.position.set(0, 0.72, -0.38);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  group.add(tableTop);
  const tableRing = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.028, 8, 72), softBlue.clone());
  tableRing.rotation.x = Math.PI / 2;
  tableRing.position.set(0, 0.82, -0.38);
  group.add(tableRing);

  const spaceDisplay = createNeedSpaceDisplay();
  spaceDisplay.group.position.set(0, 1.08, 0.58);
  group.add(spaceDisplay.group);
  controlRoom.spaceDisplay = spaceDisplay;

  const buttonOffset = compactRoom ? 0.78 : 1.28;
  [-buttonOffset, buttonOffset].forEach((x) => {
    const button = createRoomButton(x < 0 ? "Enter Base" : "View Full Base", x < 0 ? "enter" : "overview");
    button.group.position.set(x, compactRoom ? 1.02 : 1.08, compactRoom ? 1.34 : 1.46);
    button.baseScale = compactRoom ? 0.82 : 1;
    button.group.scale.setScalar(button.baseScale);
    group.add(button.group);
    if (x < 0) controlRoom.enterButton = button;
    else controlRoom.overviewButton = button;
  });

  const centralTexture = createRoomCentralTexture(null);
  const centralMonitor = createPhysicalMonitor(2.08, 1.16, centralTexture, { central: true, color: 0xff4242 });
  centralMonitor.group.position.set(0, 1.38, -1.22);
  centralMonitor.group.rotation.x = -0.035;
  group.add(centralMonitor.group);
  const centralScreen = centralMonitor.screen;
  controlRoom.centerScreen = centralScreen;
  controlRoom.centerTexture = centralTexture;

  const monitorY = 1.92;
  const monitorZ = -5.28;
  sections.forEach((section, index) => {
    const x = -4.0 + index * 1.6;
    const monitor = createRoomMonitor(section, index);
    monitor.group.position.set(x, monitorY + (index % 2) * 0.04, monitorZ + Math.abs(x) * 0.11);
    monitor.group.rotation.y = -x * 0.105;
    group.add(monitor.group);
    controlRoom.monitors.push(monitor);
  });

  const chairPositions = [
    [-3.75, 0, 1.92, -0.56],
    [3.75, 0, 1.92, 0.56],
    [-4.72, 0, -0.75, -1.18],
    [4.72, 0, -0.75, 1.18],
  ];
  chairPositions.forEach(([x, y, z, rot]) => {
    const chair = createRoomChair();
    chair.position.set(x, y, z);
    chair.rotation.y = rot;
    group.add(chair);
  });

  return group;
}

function createRoomChair() {
  const group = new THREE.Group();
  const cushion = materials.black.clone();
  cushion.color.setHex(0x0c0d10);
  const armor = materials.deckPanel.clone();
  armor.color.setHex(0x171a21);
  const accentBlue = materials.blueGlow.clone();
  accentBlue.opacity = 0.72;

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 32), accentBlue.clone());
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.07;
  group.add(baseRing);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.09, 28), materials.black);
  base.position.y = 0.08;
  base.castShadow = true;
  group.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.44, 12), materials.roadEdge);
  stem.position.y = 0.35;
  stem.castShadow = true;
  group.add(stem);

  const seatShell = addChildBox(group, 0.82, 0.18, 0.68, 0, 0.62, 0, armor);
  seatShell.castShadow = true;
  const seatCushion = addChildBox(group, 0.68, 0.16, 0.56, 0, 0.74, -0.03, cushion);
  seatCushion.castShadow = true;
  const frontRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.68, 14), cushion);
  frontRoll.position.set(0, 0.78, -0.35);
  frontRoll.rotation.z = Math.PI / 2;
  frontRoll.castShadow = true;
  group.add(frontRoll);

  const backShell = addChildBox(group, 0.78, 1.38, 0.18, 0, 1.34, 0.29, armor);
  backShell.rotation.x = -0.18;
  backShell.castShadow = true;
  const headArmor = addChildBox(group, 0.52, 0.34, 0.16, 0, 2.06, 0.18, materials.black);
  headArmor.rotation.x = -0.18;
  headArmor.castShadow = true;
  for (let i = 0; i < 4; i += 1) {
    const pad = addChildBox(group, 0.58 - i * 0.035, 0.18, 0.05, 0, 1.0 + i * 0.24, 0.13 - i * 0.045, cushion);
    pad.rotation.x = -0.2;
    pad.castShadow = true;
  }
  [-1, 1].forEach((side) => {
    const sideArmor = addChildBox(group, 0.12, 1.08, 0.14, side * 0.48, 1.35, 0.25, materials.roadEdge);
    sideArmor.rotation.z = side * 0.11;
    sideArmor.rotation.x = -0.18;
    sideArmor.castShadow = true;

    const arm = addChildBox(group, 0.18, 0.18, 0.68, side * 0.62, 0.92, -0.02, armor);
    arm.rotation.z = side * -0.06;
    arm.castShadow = true;
    const console = addChildBox(group, 0.22, 0.06, 0.28, side * 0.62, 1.04, -0.25, materials.black);
    console.castShadow = true;
    for (let i = 0; i < 3; i += 1) {
      const key = addChildBox(group, 0.045, 0.018, 0.045, side * 0.56 + i * side * 0.052, 1.085, -0.32, accentBlue.clone());
      key.castShadow = false;
    }
    const support = addChildBox(group, 0.1, 0.42, 0.1, side * 0.5, 0.64, 0.04, materials.roadEdge);
    support.rotation.z = side * -0.18;
  });

  addChildBox(group, 0.62, 0.045, 0.05, 0, 0.42, -0.33, accentBlue.clone());
  group.scale.setScalar(0.72);
  return group;
}

function createNeedSpaceDisplay() {
  const group = new THREE.Group();
  const spinner = new THREE.Group();
  const blue = materials.blueGlow.clone();
  blue.opacity = 0.34;
  const white = materials.whiteLight.clone();
  white.opacity = 0.28;

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.86, 0.08, 32), materials.black);
  base.position.y = 0.02;
  group.add(base);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.012, 8, 48), blue.clone());
  ringA.rotation.x = Math.PI / 2;
  ringA.position.y = 0.09;
  group.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.009, 8, 36), white.clone());
  ringB.rotation.x = Math.PI / 2;
  ringB.position.y = 0.11;
  group.add(ringB);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.22, 0.56, 20), blue.clone());
  core.position.y = 0.34;
  core.material.opacity = 0.16;
  group.add(core);

  spinner.position.y = 0.45;
  group.add(spinner);

  const display = { group, spinner, rings: [ringA, ringB, core], pointMaterials: [] };
  loadNeedSpaceAsset().then((model) => {
    if (!model) return;
    gltfBox.setFromObject(model);
    gltfBox.getCenter(gltfCenter);
    gltfBox.getSize(gltfSize);
    const maxAxis = Math.max(gltfSize.x, gltfSize.y, gltfSize.z, 0.001);
    const scale = (perf.lowPower ? 1.28 : 1.78) / maxAxis;
    model.scale.multiplyScalar(scale);
    model.position.copy(gltfCenter).multiplyScalar(-scale);
    model.rotation.set(-0.16, 0.24, 0.08);
    model.traverse((child) => {
      if (child.isPoints) {
        child.frustumCulled = false;
        child.material.opacity = perf.lowPower ? 0.66 : 0.86;
        display.pointMaterials.push(child.material);
      }
    });
    spinner.add(model);
  });

  return display;
}

function loadNeedSpaceAsset() {
  if (spaceAssetPromise) return spaceAssetPromise;
  spaceAssetPromise = (async () => {
    if (window.location.protocol === "file:") return createFallbackSpacePoints();
    const response = await fetch(SPACE_ASSET_URL);
    if (!response.ok) return createFallbackSpacePoints();
    const { gltf, binary } = parseGlb(await response.arrayBuffer());
    const sceneDef = gltf.scenes?.[gltf.scene ?? 0];
    if (!sceneDef) return createFallbackSpacePoints();
    const group = new THREE.Group();
    sceneDef.nodes?.forEach((nodeIndex) => group.add(createGltfNode(gltf, binary, nodeIndex)));
    return group;
  })().catch(() => createFallbackSpacePoints());
  return spaceAssetPromise;
}

function parseGlb(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 12;
  let gltf = null;
  let binary = null;
  while (offset < arrayBuffer.byteLength) {
    const length = view.getUint32(offset, true);
    const type = new TextDecoder().decode(new Uint8Array(arrayBuffer, offset + 4, 4)).replace(/\0/g, "");
    const start = offset + 8;
    if (type === "JSON") gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(arrayBuffer, start, length)));
    if (type === "BIN") binary = arrayBuffer.slice(start, start + length);
    offset = start + length;
  }
  return { gltf, binary };
}

function createGltfNode(gltf, binary, nodeIndex) {
  const node = gltf.nodes[nodeIndex];
  const object = new THREE.Group();
  object.name = node.name ?? "";
  if (node.mesh !== undefined) {
    gltf.meshes[node.mesh].primitives.forEach((primitive) => object.add(createGltfPrimitive(gltf, binary, primitive)));
  }
  node.children?.forEach((childIndex) => object.add(createGltfNode(gltf, binary, childIndex)));
  if (node.matrix) {
    object.matrix.fromArray(node.matrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
  } else {
    if (node.translation) object.position.fromArray(node.translation);
    if (node.rotation) object.quaternion.fromArray(node.rotation);
    if (node.scale) object.scale.fromArray(node.scale);
  }
  return object;
}

function createGltfPrimitive(gltf, binary, primitive) {
  const geometry = new THREE.BufferGeometry();
  const positions = gltfAccessorArray(gltf, binary, primitive.attributes.POSITION);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const sourceColors = primitive.attributes.COLOR_0 !== undefined ? gltfAccessorArray(gltf, binary, primitive.attributes.COLOR_0) : null;
  if (sourceColors) {
    const colorSize = gltfAccessorItemSize(gltf.accessors[primitive.attributes.COLOR_0].type);
    const colors = colorSize === 3 ? sourceColors : rgbFromRgba(sourceColors);
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }
  geometry.computeBoundingSphere();

  if ((primitive.mode ?? 4) === 0) {
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: perf.lowPower ? 0.03 : 0.045,
        color: 0x8ed8ff,
        vertexColors: !!sourceColors,
        transparent: true,
        opacity: 0.86,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
  }

  const indices = primitive.indices !== undefined ? gltfAccessorArray(gltf, binary, primitive.indices) : null;
  if (indices) geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return new THREE.Mesh(geometry, materials.blueGlow.clone());
}

function rgbFromRgba(source) {
  const colors = new Float32Array((source.length / 4) * 3);
  for (let i = 0, j = 0; i < source.length; i += 4, j += 3) {
    colors[j] = source[i];
    colors[j + 1] = source[i + 1];
    colors[j + 2] = source[i + 2];
  }
  return colors;
}

function createFallbackSpacePoints() {
  const count = perf.lowPower ? 1400 : 2400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = i * 0.034;
    const radius = 0.2 + Math.random() * 1.25;
    positions[i * 3] = Math.cos(angle) * radius * (0.55 + Math.random() * 0.45);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1.25 + Math.sin(angle * 0.4) * 0.18;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.42;
    colors[i * 3] = Math.random() > 0.78 ? 1 : 0.42;
    colors[i * 3 + 1] = 0.64 + Math.random() * 0.28;
    colors[i * 3 + 2] = 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: perf.lowPower ? 0.018 : 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.68,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function loadControlRoomMonitorAsset() {
  if (controlRoomMonitorAssetPromise) return controlRoomMonitorAssetPromise;
  controlRoomMonitorAssetPromise = (async () => {
    if (window.location.protocol === "file:") return null;
    const gltfResponse = await fetch(`${CONTROL_MONITOR_ASSET_BASE}Control%20Room%20Monitor.gltf`);
    const gltf = await gltfResponse.json();
    const binResponse = await fetch(`${CONTROL_MONITOR_ASSET_BASE}${gltf.buffers[0].uri}`);
    const binary = await binResponse.arrayBuffer();
    const loader = new THREE.TextureLoader();
    const textures = gltf.images.map((image) => {
      const texture = loader.load(`${CONTROL_MONITOR_ASSET_BASE}${image.uri}`);
      texture.flipY = false;
      if (!image.name?.includes("_N") && !image.name?.includes("Phong")) texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    });
    const materialList = gltf.materials.map((source, index) => {
      const pbr = source.pbrMetallicRoughness ?? {};
      const material = new THREE.MeshStandardMaterial({
        map: pbr.baseColorTexture ? textures[gltf.textures[pbr.baseColorTexture.index].source] : null,
        normalMap: source.normalTexture ? textures[gltf.textures[source.normalTexture.index].source] : null,
        metalness: index === 0 ? 0.22 : 0.36,
        roughness: index === 0 ? 0.52 : 0.42,
        side: source.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      });
      return material;
    });

    const template = new THREE.Group();
    gltf.meshes[0].primitives.forEach((primitive) => {
      const geometry = new THREE.BufferGeometry();
      const position = gltfAccessorArray(gltf, binary, primitive.attributes.POSITION);
      const normal = gltfAccessorArray(gltf, binary, primitive.attributes.NORMAL);
      const uv = gltfAccessorArray(gltf, binary, primitive.attributes.TEXCOORD_0);
      const index = gltfAccessorArray(gltf, binary, primitive.indices);
      geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
      geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
      geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geometry.setIndex(new THREE.BufferAttribute(index, 1));
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, materialList[primitive.material] ?? materials.black);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      template.add(mesh);
    });
    return template;
  })().catch(() => null);
  return controlRoomMonitorAssetPromise;
}

function gltfAccessorArray(gltf, binary, accessorIndex) {
  if (accessorIndex === undefined || accessorIndex === null) return null;
  const accessor = gltf.accessors[accessorIndex];
  const view = gltf.bufferViews[accessor.bufferView];
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const itemSize = gltfAccessorItemSize(accessor.type);
  const length = accessor.count * itemSize;
  const ArrayType = gltfAccessorArrayType(accessor.componentType);
  const componentBytes = ArrayType.BYTES_PER_ELEMENT;
  const packedStride = itemSize * componentBytes;
  const stride = view.byteStride ?? packedStride;
  if (stride === packedStride) return new ArrayType(binary, offset, length);

  const dataView = new DataView(binary, offset, (accessor.count - 1) * stride + packedStride);
  const output = new ArrayType(length);
  for (let i = 0; i < accessor.count; i += 1) {
    for (let item = 0; item < itemSize; item += 1) {
      const byteOffset = i * stride + item * componentBytes;
      output[i * itemSize + item] = readGltfComponent(dataView, byteOffset, accessor.componentType);
    }
  }
  return output;
}

function gltfAccessorItemSize(type) {
  if (type === "VEC4") return 4;
  if (type === "VEC3") return 3;
  if (type === "VEC2") return 2;
  return 1;
}

function gltfAccessorArrayType(componentType) {
  if (componentType === 5126) return Float32Array;
  if (componentType === 5125) return Uint32Array;
  if (componentType === 5123) return Uint16Array;
  if (componentType === 5121) return Uint8Array;
  return Float32Array;
}

function readGltfComponent(view, byteOffset, componentType) {
  if (componentType === 5126) return view.getFloat32(byteOffset, true);
  if (componentType === 5125) return view.getUint32(byteOffset, true);
  if (componentType === 5123) return view.getUint16(byteOffset, true);
  if (componentType === 5121) return view.getUint8(byteOffset);
  return view.getFloat32(byteOffset, true);
}

function attachDownloadedMonitorModel(group, width, height, proceduralParts, options = {}) {
  if (options.central) return;
  loadControlRoomMonitorAsset().then((template) => {
    if (!template) return;
    const model = template.clone(true);
    model.rotation.y = Math.PI / 2;
    const scale = (width / 4.02) * (options.central ? 1.04 : 1.0);
    model.scale.setScalar(scale);
    model.position.set(0, -0.05, -0.02);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    group.add(model);
    proceduralParts.forEach((part) => {
      if (part) part.visible = false;
    });
  });
}

function createPhysicalMonitor(width, height, texture, options = {}) {
  const group = new THREE.Group();
  const proceduralParts = [];
  const casing = materials.black.clone();
  casing.color.setHex(0x07080b);
  casing.emissive = new THREE.Color(options.color ?? 0x071018);
  casing.emissiveIntensity = options.central ? 0.22 : 0.14;
  const bevelMat = materials.roadEdge.clone();
  const lightMat = options.color === 0xff4242 ? materials.redLight.clone() : materials.blueGlow.clone();
  lightMat.transparent = true;
  lightMat.opacity = options.central ? 0.74 : 0.58;

  const back = new THREE.Mesh(new THREE.BoxGeometry(width + 0.18, height + 0.18, 0.14), casing);
  back.position.z = -0.035;
  back.castShadow = true;
  back.receiveShadow = true;
  group.add(back);
  proceduralParts.push(back);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.98 }),
  );
  screen.position.z = options.central ? 0.215 : 0.13;
  screen.renderOrder = 4;
  group.add(screen);

  const borderZ = 0.064;
  const topBorder = addChildBox(group, width + 0.22, 0.055, 0.05, 0, height * 0.5 + 0.05, borderZ, bevelMat);
  const bottomBorder = addChildBox(group, width + 0.22, 0.055, 0.05, 0, -height * 0.5 - 0.05, borderZ, bevelMat);
  const leftBorder = addChildBox(group, 0.055, height + 0.16, 0.05, -width * 0.5 - 0.055, 0, borderZ, bevelMat);
  const rightBorder = addChildBox(group, 0.055, height + 0.16, 0.05, width * 0.5 + 0.055, 0, borderZ, bevelMat);
  [topBorder, bottomBorder, leftBorder, rightBorder].forEach((part) => {
    part.castShadow = true;
    proceduralParts.push(part);
  });

  const lightBar = addChildBox(group, width * 0.36, 0.024, 0.045, 0, -height * 0.5 - 0.105, 0.088, lightMat);
  lightBar.castShadow = false;

  const standHeight = options.central ? 0.44 : 0.62;
  const stand = addChildBox(group, 0.12, standHeight, 0.14, 0, -height * 0.5 - standHeight * 0.5 - 0.16, -0.02, casing);
  stand.castShadow = true;
  proceduralParts.push(stand);
  const base = addChildBox(group, width * (options.central ? 0.46 : 0.58), 0.07, options.central ? 0.48 : 0.42, 0, -height * 0.5 - standHeight - 0.2, -0.02, materials.roadEdge);
  base.castShadow = true;
  proceduralParts.push(base);
  if (!options.central) {
    const rearRing = new THREE.Mesh(new THREE.TorusGeometry(height * 0.18, 0.012, 8, 24), materials.redDim.clone());
    rearRing.position.set(0, -0.02, -0.12);
    rearRing.rotation.y = Math.PI;
    group.add(rearRing);
    proceduralParts.push(rearRing);
  }

  attachDownloadedMonitorModel(group, width, height, proceduralParts, options);

  return { group, screen, back, lightBar };
}

function createRoomButton(label, action) {
  const group = new THREE.Group();
  const texture = createRoomButtonTexture(label);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.38),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95 }),
  );
  screen.position.z = 0.08;
  screen.renderOrder = 3;
  group.add(screen);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.5, 0.08), materials.black.clone());
  frame.castShadow = true;
  frame.renderOrder = 1;
  group.add(frame);
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.62, 0.22), materials.hitbox);
  hitbox.position.z = 0.1;
  hitbox.userData.roomAction = action;
  hitTargets.push(hitbox);
  group.add(hitbox);
  return { group, screen, frame, texture, action };
}

function createRoomMonitor(section, index) {
  const group = new THREE.Group();
  const texture = createRoomMonitorTexture(section, controlRoom.selectedId === section.id);
  const monitor = createPhysicalMonitor(1.18, 0.66, texture, { color: section.id === controlRoom.selectedId ? 0xff4242 : 0x61a8ff });
  monitor.group.scale.setScalar(0.96);
  group.add(monitor.group);
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.54, 1.46, 0.32), materials.hitbox);
  hitbox.position.set(0, -0.2, 0.12);
  hitbox.userData.roomAction = "preview";
  hitbox.userData.sectionId = section.id;
  hitTargets.push(hitbox);
  group.add(hitbox);
  return { group, section, index, screen: monitor.screen, frame: monitor.back, lightBar: monitor.lightBar, texture };
}

function createRoomCentralTexture(section) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 432;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#03070c";
  ctx.fillRect(0, 0, c.width, c.height);
  const bg = ctx.createRadialGradient(c.width * 0.5, c.height * 0.5, 20, c.width * 0.5, c.height * 0.5, c.width * 0.6);
  bg.addColorStop(0, "rgba(76, 173, 255, 0.25)");
  bg.addColorStop(0.55, "rgba(14, 42, 70, 0.2)");
  bg.addColorStop(1, "rgba(255, 48, 48, 0.08)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "rgba(158, 218, 255, 0.42)";
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, c.width - 48, c.height - 48);
  ctx.strokeStyle = "rgba(255, 72, 72, 0.78)";
  ctx.beginPath();
  ctx.moveTo(42, 72);
  ctx.lineTo(182, 72);
  ctx.stroke();
  ctx.fillStyle = "rgba(180, 218, 255, 0.84)";
  ctx.font = "700 21px Arial, sans-serif";
  ctx.fillText("CONTROL ROOM MONITOR", 42, 58);

  ctx.fillStyle = "#f7f7ef";
  ctx.font = "800 42px Arial, sans-serif";
  ctx.fillText(section ? section.label.toUpperCase() : "WELCOME", 42, 128);
  ctx.fillStyle = "rgba(255, 75, 75, 0.92)";
  ctx.font = "800 24px Arial, sans-serif";
  ctx.fillText(section ? section.rocketName : "Welcome to Farouk Portfolio", 42, 164);
  ctx.fillStyle = "rgba(247, 248, 242, 0.86)";
  ctx.font = "500 25px Arial, sans-serif";
  wrapText(
    ctx,
    section ? previewText(section) : "Put your seatbelt on. The launch base is coming online.",
    42,
    218,
    c.width - 84,
    34,
    4,
  );
  ctx.fillStyle = "rgba(162, 218, 255, 0.78)";
  ctx.font = "700 18px Arial, sans-serif";
  ctx.fillText(section ? "SELECT ENTER BASE TO FLY TO THIS ROCKET" : "SELECT A ROCKET MONITOR OR VIEW THE FULL BASE", 42, c.height - 52);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRoomMonitorTexture(section, active) {
  const c = document.createElement("canvas");
  c.width = perf.lowPower ? 320 : 384;
  c.height = perf.lowPower ? 180 : 216;
  const ctx = c.getContext("2d");
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData = { canvas: c, ctx, section, active, boot: 0, scan: 0 };
  redrawRoomMonitorTexture(texture, active, 0, 0);
  return texture;
}

function redrawRoomMonitorTexture(texture, active, boot = 1, scan = 0) {
  const { canvas: c, ctx, section } = texture.userData;
  const index = sections.indexOf(section);
  const sky = ctx.createLinearGradient(0, 0, 0, c.height);
  sky.addColorStop(0, "#d9e2ea");
  sky.addColorStop(0.42, "#8a98a6");
  sky.addColorStop(0.74, "#343a42");
  sky.addColorStop(1, "#08090c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  for (let i = 0; i < 7; i += 1) {
    const x = c.width * 0.14 + i * c.width * 0.12 + (index % 2) * c.width * 0.028;
    ctx.beginPath();
    ctx.arc(x, c.height * 0.19 + (i % 3) * c.height * 0.04, c.width * (0.045 + (i % 4) * 0.012), 0, Math.PI * 2);
    ctx.fill();
  }

  const smokeBase = c.height - c.height * 0.2;
  for (let i = 0; i < 14; i += 1) {
    const x = c.width * 0.07 + i * c.width * 0.07;
    const radius = c.width * (0.045 + ((i + index) % 5) * 0.012);
    const puff = ctx.createRadialGradient(x, smokeBase + (i % 3) * 8, 2, x, smokeBase + (i % 3) * 8, radius);
    puff.addColorStop(0, "rgba(255,255,255,0.78)");
    puff.addColorStop(0.58, "rgba(235,230,220,0.4)");
    puff.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = puff;
    ctx.beginPath();
    ctx.arc(x, smokeBase + (i % 3) * 8, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#111217";
  ctx.fillRect(0, c.height - c.height * 0.18, c.width, c.height * 0.18);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, c.height - c.height * 0.185, c.width, 2);

  const rocketX = c.width * 0.5 + (index - 2.5) * c.width * 0.008;
  const rocketY = c.height * 0.26;
  const rocketHeight = c.height * 0.44;
  const rocketWidth = c.width * 0.07;
  ctx.fillStyle = "#f4f3eb";
  ctx.beginPath();
  ctx.moveTo(rocketX, rocketY - rocketWidth * 1.28);
  ctx.quadraticCurveTo(rocketX + rocketWidth * 0.88, rocketY - rocketWidth * 0.3, rocketX + rocketWidth * 0.82, rocketY + rocketWidth * 0.28);
  ctx.lineTo(rocketX + rocketWidth * 0.82, rocketY + rocketHeight);
  ctx.lineTo(rocketX - rocketWidth * 0.82, rocketY + rocketHeight);
  ctx.lineTo(rocketX - rocketWidth * 0.82, rocketY + rocketWidth * 0.28);
  ctx.quadraticCurveTo(rocketX - rocketWidth * 0.88, rocketY - rocketWidth * 0.3, rocketX, rocketY - rocketWidth * 1.28);
  ctx.fill();
  ctx.strokeStyle = "rgba(16,18,22,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#101116";
  ctx.fillRect(rocketX - rocketWidth * 0.56, rocketY + rocketHeight * 0.21, rocketWidth * 1.12, rocketWidth * 0.36);
  ctx.fillRect(rocketX - rocketWidth * 0.54, rocketY + rocketHeight * 0.58, rocketWidth * 1.08, rocketHeight * 0.26);
  ctx.fillStyle = "#cc2e2e";
  ctx.fillRect(rocketX - rocketWidth * 0.82, rocketY + rocketHeight * 0.44, rocketWidth * 1.64, 3);
  ctx.fillStyle = "#ecebe5";
  ctx.beginPath();
  ctx.moveTo(rocketX - rocketWidth * 0.82, rocketY + rocketHeight - rocketWidth * 0.2);
  ctx.lineTo(rocketX - rocketWidth * 1.95, rocketY + rocketHeight + rocketWidth * 1.0);
  ctx.lineTo(rocketX - rocketWidth * 0.72, rocketY + rocketHeight + rocketWidth * 0.66);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rocketX + rocketWidth * 0.82, rocketY + rocketHeight - rocketWidth * 0.2);
  ctx.lineTo(rocketX + rocketWidth * 1.95, rocketY + rocketHeight + rocketWidth * 1.0);
  ctx.lineTo(rocketX + rocketWidth * 0.72, rocketY + rocketHeight + rocketWidth * 0.66);
  ctx.closePath();
  ctx.fill();
  const flame = ctx.createRadialGradient(rocketX, rocketY + rocketHeight + rocketWidth * 0.9, 3, rocketX, rocketY + rocketHeight + rocketWidth * 0.9, rocketWidth * 1.8);
  flame.addColorStop(0, "#fff6d8");
  flame.addColorStop(0.32, "#ff9f33");
  flame.addColorStop(0.8, "rgba(255,66,42,0.52)");
  flame.addColorStop(1, "rgba(255,66,42,0)");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.ellipse(rocketX, rocketY + rocketHeight + rocketWidth * 1.0, rocketWidth * 1.45, rocketWidth * 1.95, 0, 0, Math.PI * 2);
  ctx.fill();

  const bootMask = 1 - THREE.MathUtils.clamp(boot, 0, 1);
  ctx.fillStyle = `rgba(0,0,0,${0.42 + bootMask * 0.45})`;
  ctx.fillRect(0, 0, c.width, c.height);
  const scanY = ((scan % 1) * c.height) | 0;
  const scanGradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
  scanGradient.addColorStop(0, "rgba(120,200,255,0)");
  scanGradient.addColorStop(0.5, active ? "rgba(255,72,72,0.26)" : "rgba(116,206,255,0.22)");
  scanGradient.addColorStop(1, "rgba(120,200,255,0)");
  ctx.fillStyle = scanGradient;
  ctx.fillRect(0, Math.max(0, scanY - 22), c.width, 44);
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  for (let y = 0; y < c.height; y += 8) ctx.fillRect(0, y, c.width, 1);

  ctx.strokeStyle = active ? "rgba(255, 70, 70, 0.95)" : "rgba(132, 204, 255, 0.72)";
  ctx.lineWidth = active ? 5 : 3;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
  ctx.fillStyle = "rgba(3, 5, 8, 0.76)";
  ctx.fillRect(13, c.height - c.height * 0.29, c.width - 26, c.height * 0.22);
  ctx.fillStyle = active ? "#ff4b4b" : "rgba(135, 211, 255, 0.94)";
  ctx.font = `800 ${Math.round(c.width * 0.04)}px Arial, sans-serif`;
  ctx.fillText(`0${index + 1}`, 20, c.height - c.height * 0.19);
  ctx.fillStyle = "#f8f7ef";
  ctx.font = `800 ${Math.round(c.width * 0.065)}px Arial, sans-serif`;
  ctx.fillText(section.label.toUpperCase(), c.width * 0.12, c.height - c.height * 0.19);
  ctx.fillStyle = active ? "rgba(255, 75, 75, 0.96)" : "rgba(185, 221, 255, 0.92)";
  ctx.font = `700 ${Math.round(c.width * 0.034)}px Arial, sans-serif`;
  ctx.fillText(section.rocketName, c.width * 0.12, c.height - c.height * 0.105);
  ctx.fillStyle = active ? "rgba(255, 75, 75, 0.9)" : "rgba(132, 204, 255, 0.7)";
  ctx.font = `800 ${Math.round(c.width * 0.028)}px Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(active ? "SELECTED" : "PREVIEW", c.width - 20, c.height - c.height * 0.105);
  ctx.textAlign = "left";
  texture.userData.active = active;
  texture.userData.boot = boot;
  texture.userData.scan = scan;
  texture.needsUpdate = true;
}

function createRoomButtonTexture(label) {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 132;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#07090d";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = label.includes("Enter") ? "rgba(255, 68, 68, 0.92)" : "rgba(142, 213, 255, 0.72)";
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, c.width - 24, c.height - 24);
  ctx.fillStyle = label.includes("Enter") ? "rgba(255, 68, 68, 0.2)" : "rgba(97, 168, 255, 0.18)";
  ctx.fillRect(22, 22, c.width - 44, c.height - 44);
  ctx.fillStyle = "#f8f7ef";
  ctx.font = "800 34px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.toUpperCase(), c.width / 2, c.height / 2 + 2);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function updateRoomPreview(sectionId = controlRoom.selectedId) {
  const section = byId.get(sectionId) ?? byId.get("home");
  controlRoom.selectedId = section.id;
  controlRoom.previewActive = true;

  if (controlRoom.centerScreen) {
    controlRoom.centerTexture?.dispose?.();
    const texture = createRoomCentralTexture(section);
    controlRoom.centerTexture = texture;
    controlRoom.centerScreen.material.map = texture;
    controlRoom.centerScreen.material.needsUpdate = true;
  }

  controlRoom.monitors.forEach((monitor) => {
    const active = monitor.section.id === section.id;
    redrawRoomMonitorTexture(monitor.texture, active, 1, 0);
    monitor.frame.material.emissive.setHex(active ? 0x580606 : 0x06111b);
    monitor.frame.material.emissiveIntensity = active ? 0.7 : 0.22;
  });
  controlRoom.monitorRedrawAt = 0;
}

function animateControlRoom(elapsed, delta) {
  if (!controlRoom.group) return;
  controlRoom.group.visible = roomMode || controlRoom.leaving;
  if (!controlRoom.group.visible) return;

  const pulse = 0.5 + Math.sin(elapsed * 2.2) * 0.5;
  if (elapsed >= controlRoom.monitorRedrawAt) {
    const boot = smoothstep(0.12, 1.35, elapsed);
    const scan = (elapsed * 0.42) % 1;
    controlRoom.monitors.forEach((monitor) => redrawRoomMonitorTexture(monitor.texture, monitor.section.id === controlRoom.selectedId, boot, scan));
    controlRoom.monitorRedrawAt = elapsed + (boot < 1 ? 0.08 : 0.16);
  }

  if (controlRoom.spaceDisplay) {
    controlRoom.spaceDisplay.spinner.rotation.y += delta * 0.42;
    controlRoom.spaceDisplay.spinner.rotation.x = Math.sin(elapsed * 0.5) * 0.055;
    controlRoom.spaceDisplay.rings.forEach((ring, index) => {
      ring.material.opacity = 0.15 + pulse * (index === 0 ? 0.28 : 0.16);
      ring.rotation.z += delta * (index % 2 ? -0.26 : 0.34);
    });
    controlRoom.spaceDisplay.pointMaterials.forEach((material) => {
      material.opacity = THREE.MathUtils.damp(material.opacity, perf.lowPower ? 0.55 + pulse * 0.08 : 0.66 + pulse * 0.16, 4, delta);
    });
  }

  controlRoom.monitors.forEach((monitor) => {
    const id = `room:preview:${monitor.section.id}`;
    const isHover = hoveredRoomTarget === id;
    const isSelected = monitor.section.id === controlRoom.selectedId;
    const targetScale = isHover || isSelected ? 1.04 : 1;
    monitor.group.scale.lerp(scaleScratch.set(targetScale, targetScale, targetScale), 1 - Math.exp(-8 * delta));
    monitor.screen.material.opacity = THREE.MathUtils.damp(monitor.screen.material.opacity, isHover || isSelected ? 1 : 0.9, 6, delta);
    monitor.frame.material.emissiveIntensity = THREE.MathUtils.damp(monitor.frame.material.emissiveIntensity, isSelected ? 0.62 + pulse * 0.24 : isHover ? 0.48 : 0.22, 7, delta);
  });

  [controlRoom.enterButton, controlRoom.overviewButton].forEach((button) => {
    if (!button) return;
    const isHover = hoveredRoomTarget === `room:${button.action}:`;
    const scale = (button.baseScale ?? 1) * (isHover ? 1.05 : 1);
    button.group.scale.lerp(scaleScratch.set(scale, scale, scale), 1 - Math.exp(-8 * delta));
    button.screen.material.opacity = THREE.MathUtils.damp(button.screen.material.opacity, isHover ? 1 : 0.92, 7, delta);
  });
}

function createSupportGantry(index) {
  const group = new THREE.Group();
  const dark = materials.tower;
  const edge = materials.roadEdge;
  const redSlit = materials.redLight.clone();
  redSlit.transparent = true;
  redSlit.opacity = 0.74;

  const base = addChildBox(group, 1.24, 0.28, 1.18, 0, 0.16, 0, materials.black);
  base.castShadow = true;
  addChildBox(group, 1.05, 0.12, 0.98, 0, 0.38, 0, materials.deckPanel);
  addChildBox(group, 0.56, 0.06, 0.065, 0, 0.5, -0.54, redSlit.clone());
  addChildBox(group, 0.56, 0.06, 0.065, 0, 0.5, 0.54, redSlit.clone());
  addChildBox(group, 0.065, 0.06, 0.46, -0.56, 0.5, 0, redSlit.clone());
  addChildBox(group, 0.065, 0.06, 0.46, 0.56, 0.5, 0, redSlit.clone());

  const postX = 0.42;
  const postZ = 0.42;
  [[-postX, -postZ], [postX, -postZ], [-postX, postZ], [postX, postZ]].forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.045, 4.05, 8), dark);
    post.position.set(x, 2.45, z);
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);
  });

  for (let level = 0; level < 6; level += 1) {
    const y0 = 0.72 + level * 0.58;
    const y1 = y0 + 0.5;
    group.add(beam(new THREE.Vector3(-postX, y0, -postZ), new THREE.Vector3(postX, y1, -postZ), 0.018, edge));
    group.add(beam(new THREE.Vector3(postX, y0, -postZ), new THREE.Vector3(-postX, y1, -postZ), 0.014, edge));
    group.add(beam(new THREE.Vector3(-postX, y0, postZ), new THREE.Vector3(postX, y1, postZ), 0.018, edge));
    group.add(beam(new THREE.Vector3(postX, y0, postZ), new THREE.Vector3(-postX, y1, postZ), 0.014, edge));
    group.add(beam(new THREE.Vector3(-postX, y0, -postZ), new THREE.Vector3(-postX, y1, postZ), 0.016, edge));
    group.add(beam(new THREE.Vector3(postX, y0, postZ), new THREE.Vector3(postX, y1, -postZ), 0.016, edge));

    if (level % 2 === 0) {
      const utility = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.045, 0.04), redSlit.clone());
      utility.position.set(postX + 0.04, y0 + 0.2, -postZ - 0.035);
      group.add(utility);
    }
  }

  for (let y = 0.98; y <= 3.85; y += 0.72) {
    addChildBox(group, 1.05, 0.04, 0.055, 0, y, -0.45, edge);
    addChildBox(group, 1.05, 0.04, 0.055, 0, y, 0.45, edge);
    addChildBox(group, 0.055, 0.04, 1.05, -0.45, y, 0, edge);
    addChildBox(group, 0.055, 0.04, 1.05, 0.45, y, 0, edge);
  }

  const topDeck = addChildBox(group, 1.1, 0.18, 1.08, 0, 4.54, 0, materials.deckPanel);
  topDeck.castShadow = true;
  addChildBox(group, 0.82, 0.12, 0.76, 0, 4.71, 0, materials.black);
  addChildBox(group, 0.64, 0.045, 0.055, 0, 4.81, -0.42, redSlit.clone());

  const armRoot = addChildBox(group, 0.34, 0.52, 0.34, 0.54, 3.16, 0, materials.black);
  armRoot.castShadow = true;
  const arm = addChildBox(group, 1.46, 0.16, 0.22, 1.28, 3.2, 0, materials.deckPanel);
  arm.castShadow = true;
  addChildBox(group, 1.2, 0.035, 0.035, 1.28, 3.34, -0.15, edge);
  addChildBox(group, 1.2, 0.035, 0.035, 1.28, 3.34, 0.15, edge);
  addChildBox(group, 0.2, 0.1, 0.44, 2.04, 3.16, 0, materials.roadEdge);
  addChildBox(group, 0.34, 0.055, 0.05, 1.86, 3.29, -0.25, redSlit.clone());
  group.add(beam(new THREE.Vector3(0.72, 2.98, -0.18), new THREE.Vector3(1.92, 3.08, -0.18), 0.014, edge));
  group.add(beam(new THREE.Vector3(0.72, 2.98, 0.18), new THREE.Vector3(1.92, 3.08, 0.18), 0.014, edge));

  [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.62], [0.62, 0.62]].forEach(([x, z]) => {
    const foot = addChildBox(group, 0.32, 0.1, 0.32, x * 1.1, 0.06, z * 1.1, materials.bevel);
    foot.castShadow = true;
    group.add(beam(new THREE.Vector3(x * 0.62, 0.34, z * 0.62), new THREE.Vector3(x * 1.1, 0.12, z * 1.1), 0.026, edge));
  });

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.76, 8), edge);
  mast.position.set(0.32, 5.18, 0.2);
  group.add(mast);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6), materials.redLight.clone());
  bulb.position.set(0.32, 5.58, 0.2);
  group.add(bulb);
  const light = fakeLight(0.7);
  light.position.copy(bulb.position);
  group.add(light);
  beacons.push({ bulb, light, phase: index * 0.58 + 0.25 });

  const shadow = contactShadow(2.05, 1.85, 0.32);
  shadow.position.y = 0.012;
  group.add(shadow);
  return group;
}

function createTower(index) {
  return createSupportGantry(index);
}

function createControlTowerModule({ scale = 1, compact = false, hero = false, phase = 0 } = {}) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const redGlass = materials.towerGlass.clone();
  redGlass.opacity = hero ? 0.7 : 0.64;
  const redSlit = materials.redLight.clone();
  redSlit.transparent = true;
  redSlit.opacity = hero ? 0.82 : 0.68;

  const box = (sx, sy, sz, x, y, z, material, cast = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const base = box(3.4, 0.64, 2.28, 0, 0.34, 0, materials.black);
  const plinth = box(3.82, 0.18, 2.68, 0, 0.09, 0, materials.deckPanel);
  const topRail = box(3.22, 0.12, 2.06, 0, 0.73, 0, materials.bevel);
  const centerCore = box(1.42, 0.72, 1.1, 0, 1.06, 0.08, materials.tower);
  const cabin = box(2.78, 0.58, 1.46, 0, 1.55, -0.06, materials.deckPanel);
  const roof = box(3.02, 0.18, 1.72, 0, 1.94, -0.06, materials.bevel);
  roof.rotation.x = 0.025;
  const roofCap = box(2.28, 0.1, 1.08, 0, 2.08, -0.04, materials.black);
  roofCap.rotation.x = 0.025;

  const frontWindow = box(1.86, 0.28, 0.035, 0, 1.58, -0.805, redGlass, false);
  frontWindow.rotation.x = -0.08;
  const frontFrameTop = box(2.08, 0.045, 0.05, 0, 1.75, -0.835, materials.roadEdge, false);
  const frontFrameBottom = box(2.08, 0.045, 0.05, 0, 1.39, -0.805, materials.roadEdge, false);
  [frontFrameTop, frontFrameBottom].forEach((frame) => {
    frame.rotation.x = -0.08;
  });
  [-0.68, 0, 0.68].forEach((x) => {
    const mullion = box(0.035, 0.34, 0.055, x, 1.58, -0.84, materials.roadEdge, false);
    mullion.rotation.x = -0.08;
  });
  [-1, 1].forEach((side) => {
    const sideGlass = box(0.04, 0.26, 0.74, side * 1.43, 1.57, -0.08, redGlass.clone(), false);
    sideGlass.rotation.z = side * -0.12;
    const sideArmor = box(0.18, 0.5, 1.34, side * 1.58, 1.48, -0.04, materials.black);
    sideArmor.rotation.z = side * -0.08;
    const buttress = box(0.22, 0.68, 0.3, side * 1.52, 0.56, -0.8, materials.bevel);
    buttress.rotation.z = side * -0.28;
    const rearButtress = box(0.22, 0.62, 0.3, side * 1.54, 0.55, 0.84, materials.bevel);
    rearButtress.rotation.z = side * -0.24;
    const sideSlit = box(0.045, 0.08, 0.56, side * 1.73, 0.68, 0.34, redSlit.clone(), false);
    sideSlit.rotation.z = side * -0.08;
  });

  box(0.58, 0.58, 0.07, 0, 0.44, -1.17, materials.deckInset);
  box(0.08, 0.72, 0.06, -0.39, 0.47, -1.205, materials.roadEdge, false);
  box(0.08, 0.72, 0.06, 0.39, 0.47, -1.205, materials.roadEdge, false);
  box(0.78, 0.075, 0.06, 0, 0.83, -1.205, materials.roadEdge, false);
  box(0.78, 0.075, 0.06, 0, 0.12, -1.205, materials.roadEdge, false);
  box(0.36, 0.05, 0.08, 0, 0.62, -1.25, redSlit.clone(), false);
  const ramp = box(1.08, 0.12, 0.98, 0, 0.08, -1.72, materials.deckPanel);
  ramp.rotation.x = -0.12;

  for (let i = -1; i <= 1; i += 1) {
    const vent = box(0.64, 0.045, 0.035, i * 0.78, 0.56, 1.17, materials.roadEdge, false);
    vent.rotation.x = 0.03;
    const slit = box(0.42, 0.045, 0.04, i * 0.78, 0.72, 1.19, redSlit.clone(), false);
    slit.rotation.x = 0.03;
  }

  for (let i = 0; i < 4; i += 1) {
    const x = -1.2 + i * 0.8;
    const deckLight = box(0.36, 0.035, 0.04, x, 0.84, -1.08, redSlit.clone(), false);
    deckLight.rotation.x = -0.04;
  }

  const mastBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.18, 10), materials.bevel);
  mastBase.position.set(0.82, 2.22, 0.34);
  mastBase.castShadow = true;
  group.add(mastBase);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, hero ? 1.08 : 0.78, 8), materials.roadEdge);
  mast.position.set(0.82, hero ? 2.83 : 2.67, 0.34);
  mast.castShadow = true;
  group.add(mast);
  const shortMast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, hero ? 0.68 : 0.46, 8), materials.roadEdge);
  shortMast.position.set(-0.78, hero ? 2.62 : 2.48, 0.42);
  group.add(shortMast);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.028, 18), materials.roadEdge);
  dish.position.set(-0.54, 2.3, 0.42);
  dish.rotation.z = Math.PI * 0.5;
  dish.rotation.y = 0.35;
  group.add(dish);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(hero ? 0.065 : 0.052, 10, 6), materials.redLight.clone());
  bulb.position.set(0.82, hero ? 3.42 : 3.08, 0.34);
  group.add(bulb);
  const light = fakeLight(hero ? 1.05 : 0.72);
  light.position.copy(bulb.position);
  group.add(light);
  beacons.push({ bulb, light, phase });

  if (!compact) {
    const rearPanel = box(1.96, 0.58, 0.12, 0, 0.54, 1.24, materials.deckInset);
    rearPanel.rotation.x = 0.02;
    const rearBar = box(1.42, 0.05, 0.06, 0, 0.86, 1.32, redSlit.clone(), false);
    rearBar.rotation.x = 0.02;
    const shadow = contactShadow(4.5, 3.2, 0.42);
    shadow.position.y = 0.015;
    group.add(shadow);
  }

  return group;
}

function addLifeLayer() {
  const routeA = curve(vehicleRouteAPoints(0.075), true);
  const routeB = curve(vehicleRouteBPoints(0.082), true);
  const roverA = createRover(0xff3535, 0);
  const roverB = createRover(0xff4545, 1);
  scene.add(roverA, roverB);
  vehicles.push(vehicleAI(roverA, routeA, 1.18, 0.17, 0.14));
  vehicles.push(vehicleAI(roverB, routeB, 1.04, 0.56, -0.14));
  addAstronauts();
}

function curve(points, closed = true) {
  return new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), closed, "centripetal", 0.45);
}

function vehicleAI(group, route, cruiseSpeed, progress, laneOffset) {
  const routeLength = route.getLength();
  const vehicle = {
    group,
    route,
    cruiseSpeed,
    currentSpeed: cruiseSpeed * 0.58,
    distance: routeLength * progress,
    progress: ((progress % 1) + 1) % 1,
    laneOffset,
    steer: 0,
    routeLength,
    lastBlocked: false,
    accel: 1.7,
    brake: 4.8,
    waitUntil: 0,
    waitBias: 0.8 + Math.random() * 0.3,
    routeSamples: [],
  };
  vehicle.routeSamples = buildSafeRouteSamples(vehicle);
  vehicle.distance = nearestSafeRouteDistance(vehicle, vehicle.distance);
  lanePointAtDistance(vehicle, vehicle.distance, scratch);
  group.position.copy(scratch);
  group.userData.lastPosition.copy(scratch);
  group.userData.lastSafePosition.copy(scratch);
  return vehicle;
}

function lanePoint(vehicle, progress, target) {
  const p = vehicle.route.getPointAt(((progress % 1) + 1) % 1);
  const tangent = vehicle.route.getTangentAt(((progress % 1) + 1) % 1).normalize();
  sideScratch.crossVectors(up, tangent).normalize().multiplyScalar(vehicle.laneOffset);
  return target.copy(p).add(sideScratch);
}

function lanePointAtDistance(vehicle, distance, target, updateProgress = true) {
  const progress = (((distance / vehicle.routeLength) % 1) + 1) % 1;
  if (updateProgress) vehicle.progress = progress;
  return lanePoint(vehicle, progress, target);
}

function normalizeRouteDistance(vehicle, distance) {
  return ((distance % vehicle.routeLength) + vehicle.routeLength) % vehicle.routeLength;
}

function circularRouteGap(vehicle, a, b) {
  const gap = Math.abs(normalizeRouteDistance(vehicle, a) - normalizeRouteDistance(vehicle, b));
  return Math.min(gap, vehicle.routeLength - gap);
}

function buildSafeRouteSamples(vehicle) {
  const samples = [];
  const count = 180;
  const candidate = new THREE.Vector3();
  const previous = new THREE.Vector3();
  let hasPrevious = false;
  for (let i = 0; i < count; i += 1) {
    const distance = (i / count) * vehicle.routeLength;
    lanePointAtDistance(vehicle, distance, candidate, false);
    const safe = !isTrafficBlocked(candidate, 0.32) && (!hasPrevious || !segmentHitsBarrier(previous, candidate, 0.26));
    if (safe) samples.push({ distance, point: candidate.clone() });
    previous.copy(candidate);
    hasPrevious = true;
  }
  return samples;
}

function nearestSafeRouteDistance(vehicle, distance) {
  const normalized = normalizeRouteDistance(vehicle, distance);
  if (!vehicle.routeSamples.length) return normalized;
  let best = vehicle.routeSamples[0];
  let bestGap = Infinity;
  vehicle.routeSamples.forEach((sample) => {
    const gap = circularRouteGap(vehicle, normalized, sample.distance);
    if (gap < bestGap) {
      best = sample;
      bestGap = gap;
    }
  });
  return best.distance;
}

function routeBlockedAhead(vehicle, distance, range, margin = 0.28) {
  const steps = Math.max(4, Math.ceil(range / 0.42));
  const previous = trafficPrevious;
  lanePointAtDistance(vehicle, distance, previous, false);
  for (let i = 1; i <= steps; i += 1) {
    lanePointAtDistance(vehicle, distance + (range * i) / steps, lookScratch, false);
    if (isTrafficBlocked(lookScratch, margin) || segmentHitsBarrier(previous, lookScratch, margin)) return true;
    previous.copy(lookScratch);
  }
  return false;
}

function createRover(accentColor, variant = 0) {
  const group = new THREE.Group();
  group.scale.setScalar(variant === 0 ? 0.47 : 0.44);

  const bodyMat = standard(0x090a0d, 0.5, 0.46);
  const panelMat = standard(0x1a1b20, 0.42, 0.48);
  const armorMat = standard(0x23242a, 0.46, 0.4);
  const edgeMat = standard(0x34353a, 0.5, 0.36);
  const tireMat = standard(0x020203, 0.08, 0.78);
  const treadMat = standard(0x17181c, 0.1, 0.7);
  const glassMat = materials.glass.clone();
  glassMat.color.setHex(0x070a0d);
  glassMat.emissive.setHex(0x142233);
  glassMat.emissiveIntensity = 0.28;
  glassMat.opacity = 0.68;
  const redMat = materials.redLight.clone();
  redMat.color.setHex(accentColor);
  const redGlowMat = materials.redGlow.clone();
  redGlowMat.color.setHex(accentColor);
  redGlowMat.opacity = 0.26;

  const belly = addChildBox(group, 1.56, 0.24, 2.36, 0, 0.43, 0.03, bodyMat);
  belly.receiveShadow = true;
  const chassis = addChildBox(group, 1.72, 0.16, 2.64, 0, 0.31, 0.05, edgeMat);
  chassis.rotation.x = 0.02;
  const nose = addChildBox(group, 1.34, 0.2, 0.82, 0, 0.64, -1.04, panelMat);
  nose.rotation.x = -0.2;
  const hoodPlate = addChildBox(group, 1.08, 0.035, 0.58, 0, 0.78, -1.04, armorMat);
  hoodPlate.rotation.x = -0.22;
  const bumper = addChildBox(group, 1.46, 0.18, 0.24, 0, 0.43, -1.42, edgeMat);
  bumper.rotation.x = 0.08;
  const lowerLip = addChildBox(group, 1.0, 0.12, 0.18, 0, 0.28, -1.55, bodyMat);
  lowerLip.rotation.x = 0.12;
  const cabin = addChildBox(group, 1.08, 0.56, 0.92, 0, 0.86, -0.28, panelMat);
  cabin.rotation.x = -0.07;
  const roof = addChildBox(group, 1.2, 0.14, 0.76, 0, 1.19, -0.23, armorMat);
  roof.rotation.x = -0.05;
  const roofPanel = addChildBox(group, 0.82, 0.075, 0.48, 0, 1.31, -0.18, bodyMat);
  roofPanel.rotation.x = -0.05;
  const rearBox = addChildBox(group, 1.18, 0.46, 0.78, 0, 0.73, 1.07, bodyMat);
  rearBox.rotation.x = 0.04;
  const cargoTop = addChildBox(group, 1.08, 0.08, 0.68, 0, 1.0, 1.08, armorMat);
  cargoTop.rotation.x = 0.03;
  const rearRail = addChildBox(group, 1.36, 0.13, 0.34, 0, 0.58, 1.52, edgeMat);
  rearRail.rotation.x = -0.03;

  const windshield = addChildBox(group, 1.0, 0.07, 0.72, 0, 0.99, -0.74, glassMat);
  windshield.rotation.x = -0.66;
  const windshieldTop = addChildBox(group, 1.08, 0.04, 0.055, 0, 1.18, -0.49, edgeMat);
  windshieldTop.rotation.x = -0.66;
  const windshieldBase = addChildBox(group, 1.08, 0.04, 0.055, 0, 0.78, -1.05, edgeMat);
  windshieldBase.rotation.x = -0.66;
  [-1, 1].forEach((side) => {
    const frame = addChildBox(group, 0.035, 0.045, 0.72, side * 0.52, 0.99, -0.74, edgeMat);
    frame.rotation.x = -0.66;
    frame.rotation.z = side * -0.08;
  });
  const roofGlass = addChildBox(group, 0.78, 0.055, 0.38, 0, 1.285, -0.2, glassMat);
  roofGlass.rotation.x = -0.04;
  [-1, 1].forEach((side) => {
    const sideGlass = addChildBox(group, 0.06, 0.34, 0.68, side * 0.58, 0.9, -0.18, glassMat);
    sideGlass.rotation.z = side * -0.22;
    sideGlass.rotation.x = -0.08;
    const door = addChildBox(group, 0.065, 0.5, 0.98, side * 0.74, 0.66, 0.1, panelMat);
    door.rotation.z = side * -0.2;
    const lowerArmor = addChildBox(group, 0.09, 0.2, 1.28, side * 0.84, 0.46, 0.28, armorMat);
    lowerArmor.rotation.z = side * -0.13;
    const rearCargoSide = addChildBox(group, 0.08, 0.36, 0.66, side * 0.7, 0.76, 1.13, armorMat);
    rearCargoSide.rotation.z = side * -0.08;
    const sill = addChildBox(group, 0.08, 0.1, 1.55, side * 0.86, 0.36, 0.14, edgeMat);
    sill.rotation.z = side * -0.08;
    const sideRed = addChildBox(group, 0.035, 0.08, 0.38, side * 0.91, 0.66, 1.28, redMat);
    sideRed.rotation.z = side * -0.08;
  });

  const frontBar = addChildBox(group, 0.92, 0.05, 0.052, 0, 0.58, -1.56, redMat);
  const roofBar = addChildBox(group, 0.54, 0.052, 0.06, 0, 1.36, -0.55, redMat);
  const leftHead = addChildBox(group, 0.24, 0.068, 0.045, -0.48, 0.52, -1.56, redMat);
  const rightHead = addChildBox(group, 0.24, 0.068, 0.045, 0.48, 0.52, -1.56, redMat);
  const cargoLight = addChildBox(group, 0.7, 0.05, 0.052, 0, 0.78, 1.59, redMat);
  [frontBar, roofBar, leftHead, rightHead, cargoLight].forEach((light) => {
    light.material = redMat;
  });

  const rearGlow = addChildBox(group, 0.62, 0.1, 0.045, 0, 0.64, 1.72, redGlowMat.clone());
  rearGlow.material.opacity = 0.34;
  const underglow = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.9), redGlowMat.clone());
  underglow.material.opacity = 0.075;
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.055;
  group.add(underglow);

  const wheelRotators = [];
  const frontWheels = [];
  const tireRadius = 0.37;
  const wheelPositions = [[-0.94, -0.9, true], [0.94, -0.9, true], [-0.96, 0.9, false], [0.96, 0.9, false]];
  wheelPositions.forEach(([x, z, front]) => {
    const steering = new THREE.Group();
    steering.position.set(x, 0.34, z);
    const axle = new THREE.Group();
    steering.add(axle);

    const tire = new THREE.Mesh(new THREE.CylinderGeometry(tireRadius, tireRadius, 0.32, 28), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    axle.add(tire);

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const tread = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.052, 0.12), treadMat);
      tread.position.set(0, Math.cos(angle) * 0.382, Math.sin(angle) * 0.382);
      tread.rotation.x = angle;
      tread.castShadow = false;
      axle.add(tread);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.35, 20), edgeMat);
    hub.rotation.z = Math.PI / 2;
    axle.add(hub);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.365, 16), bodyMat);
    cap.rotation.z = Math.PI / 2;
    axle.add(cap);
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.01, 6, 28), redGlowMat.clone());
    ringMesh.material.opacity = 0.32;
    ringMesh.rotation.y = Math.PI / 2;
    axle.add(ringMesh);

    const fender = addChildBox(group, 0.46, 0.12, 0.64, x, 0.67, z, armorMat);
    fender.rotation.z = Math.sign(x) * -0.08;
    fender.rotation.x = z < 0 ? -0.08 : 0.08;
    group.add(steering);
    group.add(beam(new THREE.Vector3(Math.sign(x) * 0.5, 0.52, z * 0.68), new THREE.Vector3(x * 0.92, 0.34, z), 0.035, edgeMat));
    group.add(beam(new THREE.Vector3(Math.sign(x) * 0.62, 0.66, z * 0.62), new THREE.Vector3(x * 0.88, 0.42, z), 0.015, redMat));
    wheelRotators.push(axle);
    if (front) frontWheels.push(steering);
  });

  const antennaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 8), edgeMat);
  antennaBase.position.set(0.46, 1.2, 1.18);
  group.add(antennaBase);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.78, 8), edgeMat);
  antenna.position.set(0.46, 1.62, 1.18);
  group.add(antenna);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 6), redMat);
  beacon.position.set(0.46, 2.03, 1.18);
  group.add(beacon);
  const beaconLight = fakeLight(0.52);
  beaconLight.position.copy(beacon.position);
  group.add(beaconLight);

  const shadow = contactShadow(2.28, 2.45, 0.42);
  shadow.position.y = 0.008;
  group.add(shadow);
  group.userData = {
    wheelRotators,
    frontWheels,
    beacon,
    beaconLight,
    rearGlow,
    underglow,
    wheelRadius: tireRadius,
    currentSpeed: 0,
    lastPosition: new THREE.Vector3(),
    lastSafePosition: new THREE.Vector3(),
  };
  return group;
}

function addAstronauts() {
  const routes = [
    { points: [[-6.55, 0.1, 8.9], [-5.55, 0.1, 8.15], [-6.18, 0.1, 7.35], [-7.1, 0.1, 7.88]], speed: 0.38, phase: 0.2 },
    { points: [[-3.8, 0.1, 2.25], [-2.88, 0.1, 2.88], [-2.22, 0.1, 1.95], [-3.2, 0.1, 1.35]], speed: 0.34, phase: 1.3 },
    { points: [[2.35, 0.1, -8.65], [3.55, 0.1, -8.35], [4.25, 0.1, -8.92], [3.02, 0.1, -9.52]], speed: 0.32, phase: 2.6 },
    { points: [[8.55, 0.1, 2.55], [9.3, 0.1, 3.18], [10.05, 0.1, 2.42], [9.35, 0.1, 1.72]], speed: 0.3, phase: 3.8 },
  ];

  routes.forEach((routeSpec, index) => {
    const route = curve(routeSpec.points, true);
    const astronaut = createAstronaut(index);
    scene.add(astronaut);
    const routeLength = route.getLength();
    const walker = {
      group: astronaut,
      route,
      routeLength,
      distance: routeLength * ((index * 0.21) % 1),
      speed: routeSpec.speed,
      phase: routeSpec.phase,
    };
    route.getPointAt((walker.distance / routeLength) % 1, scratch);
    astronaut.position.copy(scratch);
    astronauts.push(walker);
  });
}

function createAstronaut(index) {
  const group = new THREE.Group();
  group.scale.setScalar(0.2);
  const suit = materials.white.clone();
  suit.roughness = 0.48;
  const fabric = standard(0xd9d7ce, 0.02, 0.72);
  const visor = materials.rocketBlack.clone();
  const redMat = index % 2 ? materials.redDim.clone() : materials.redLight.clone();
  redMat.transparent = true;
  redMat.opacity = 0.72;

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.46, 12), suit);
  body.position.y = 0.72;
  body.castShadow = true;
  group.add(body);
  const chest = addChildBox(group, 0.22, 0.16, 0.06, 0, 0.74, -0.18, materials.deckInset);
  chest.castShadow = true;
  addChildBox(group, 0.1, 0.025, 0.07, 0, 0.81, -0.215, redMat.clone());
  const backpack = addChildBox(group, 0.22, 0.34, 0.12, 0, 0.74, 0.2, fabric);
  backpack.castShadow = true;

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), suit);
  helmet.position.y = 1.08;
  helmet.castShadow = true;
  group.add(helmet);
  const faceplate = addChildBox(group, 0.24, 0.12, 0.045, 0, 1.08, -0.18, visor);
  faceplate.rotation.x = -0.08;

  const limbMat = fabric;
  const leftArm = createAstronautLimb(0.05, 0.33, limbMat);
  leftArm.position.set(-0.2, 0.9, -0.02);
  group.add(leftArm);
  const rightArm = createAstronautLimb(0.05, 0.33, limbMat);
  rightArm.position.set(0.2, 0.9, -0.02);
  group.add(rightArm);
  const leftLeg = createAstronautLimb(0.06, 0.38, limbMat);
  leftLeg.position.set(-0.08, 0.5, 0);
  group.add(leftLeg);
  const rightLeg = createAstronautLimb(0.06, 0.38, limbMat);
  rightLeg.position.set(0.08, 0.5, 0);
  group.add(rightLeg);
  [-1, 1].forEach((side) => {
    const boot = addChildBox(group, 0.12, 0.07, 0.17, side * 0.08, 0.1, -0.02, materials.rocketBlack);
    boot.castShadow = true;
  });

  const shadow = contactShadow(0.72, 0.42, 0.36);
  shadow.position.y = 0.012;
  group.add(shadow);
  group.userData = { leftArm, rightArm, leftLeg, rightLeg };
  return group;
}

function createAstronautLimb(radius, length, material) {
  const pivot = new THREE.Group();
  const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.92, length, 8), material);
  limb.position.y = -length * 0.5;
  limb.castShadow = true;
  pivot.add(limb);
  return pivot;
}

function createExhaust() {
  const group = new THREE.Group();
  const flameMaterial = materials.redGlow.clone();
  flameMaterial.opacity = 0.18;
  flameMaterial.depthWrite = false;
  const flameCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.05, 24), flameMaterial);
  flameCone.position.y = -0.32;
  flameCone.rotation.x = Math.PI;
  flameCone.scale.set(0.72, 0.75, 0.72);
  group.add(flameCone);
  const hotCore = sprite(exhaustTexture, 0xffffff, 0.18, 0.34, 1.24);
  hotCore.position.y = -0.08;
  const core = sprite(exhaustTexture, 0xfff2f2, 0.24, 0.58, 1.45);
  const wide = sprite(exhaustTexture, 0xff3030, 0.14, 1.15, 2.05);
  wide.position.y = -0.2;
  group.add(wide, core, hotCore);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 28), materials.redGlow.clone());
  glow.material.opacity = 0.12;
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.08;
  group.add(glow);
  const light = fakeLight(0.18);
  group.add(light);
  const puffs = [];
  for (let i = 0; i < 6; i += 1) {
    const puff = sprite(steamTexture, 0xd9d9d9, 0.04, 0.34, 0.34);
    puff.userData = { angle: (i / 6) * Math.PI * 2, radius: 0.34 + (i % 3) * 0.16, speed: 0.14 + i * 0.018, phase: i / 6 };
    group.add(puff);
    puffs.push(puff);
  }
  const embers = [];
  for (let i = 0; i < 10; i += 1) {
    const ember = sprite(exhaustTexture, i % 3 === 0 ? 0xffffff : 0xff4a35, 0.08, 0.075, 0.075);
    ember.userData = {
      angle: (i / 10) * Math.PI * 2,
      radius: 0.08 + Math.random() * 0.18,
      speed: 0.55 + i * 0.035,
      phase: i / 10,
    };
    group.add(ember);
    embers.push(ember);
  }
  return { group, flameCone, hotCore, core, wide, glow, light, puffs, embers };
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  const motion = perf.animationScale;
  updateCameraFlight(elapsed, delta);
  animateControlRoom(elapsed, delta);
  if (!introActive && document.body.classList.contains("intro-complete")) syncPortfolioChrome();
  camera.lookAt(currentLookAt);

  const baseAnimationActive = !roomMode || controlRoom.leaving;
  if (baseAnimationActive) {
    galaxyLayers.forEach((layer) => {
      layer.object.rotation[layer.axis ?? "z"] += delta * layer.speed;
      layer.object.position.x += Math.sin(elapsed * 0.045 + layer.speed * 1000) * layer.drift * delta;
    });
    animateVehicles(elapsed, delta);
    animateAstronauts(elapsed, delta);
    beacons.forEach((beacon) => {
      const pulse = Math.max(0, Math.sin(elapsed * 4.4 + beacon.phase));
      beacon.light.intensity = 0.4 + pulse * 2.2;
      beacon.bulb.scale.setScalar(0.9 + pulse * 0.45);
    });

    refs.forEach((ref, id) => {
      const isActive = selectedId === id;
      const isHovered = hoveredId === id;
      const thrust = isActive ? 1 : isHovered ? 0.62 : 0.28;
      const bob = (isActive ? 0.12 : isHovered ? 0.08 : 0.045) * motion;
      const lift = (isActive ? 0.16 : isHovered ? 0.08 : 0.02) * motion;
      const flicker = 0.5 + Math.sin(elapsed * 13.2 + ref.phase * 2.1) * 0.5;
      ref.rocket.position.y = 0.58 + lift + Math.sin(elapsed * 1.55 + ref.phase) * bob;
      ref.rocket.rotation.y = Math.sin(elapsed * 0.52 + ref.phase) * (isActive ? 0.07 : 0.04);
      ref.rocket.rotation.x = Math.sin(elapsed * 0.82 + ref.phase) * (isActive ? 0.018 : 0.01);
      ref.padLight.intensity = THREE.MathUtils.damp(ref.padLight.intensity, isActive ? 3.45 : isHovered ? 2.15 : 0.48, 5.5, delta);
      dampOpacity(ref.activeHalo.material, isActive ? 0.52 : isHovered ? 0.28 : 0, delta);
      animatePad(ref.pad, isActive, isHovered, elapsed, delta, ref.phase);
      animateExhaust(ref.exhaust, thrust, flicker, elapsed, delta, ref.phase);
      animateSlide(ref.slide, isActive, isHovered, elapsed, delta, ref.phase);
    });
  }

  if (shadowFramesRemaining > 0) {
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.needsUpdate = true;
    shadowFramesRemaining -= 1;
  } else {
    renderer.shadowMap.autoUpdate = false;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function syncPortfolioChrome() {
  if (introActive) return;
  const isMobilePanel = getResponsiveMode() === "mobile" && document.body.classList.contains("panel-open");
  topHud.style.opacity = isMobilePanel ? "0.72" : "1";
  topHud.style.transform = "translateY(0)";
  sectionDock.style.opacity = isMobilePanel ? "0" : "1";
  sectionDock.style.transform = isMobilePanel ? "translateY(16px)" : "translateY(0)";
  sectionDock.style.pointerEvents = isMobilePanel ? "none" : "auto";
}

function animatePad(pad, isActive, isHovered, elapsed, delta, phase) {
  const pulse = 0.5 + Math.sin(elapsed * 2.4 + phase) * 0.5;
  const activeBoost = isActive ? 0.34 : isHovered ? 0.18 : 0;
  dampOpacity(pad.outerRing.material, 0.2 + activeBoost + pulse * 0.08, delta);
  dampOpacity(pad.midRing.material, 0.14 + activeBoost * 0.55 + pulse * 0.06, delta);
  dampOpacity(pad.innerRing.material, 0.18 + activeBoost * 0.7 + pulse * 0.08, delta);
  pad.crosshair.forEach((line, i) => {
    line.material.opacity = THREE.MathUtils.damp(line.material.opacity, 0.28 + activeBoost * 0.5 + Math.sin(elapsed * 2 + phase + i) * 0.06, 6, delta);
  });
  pad.rimDashes.forEach((dash, i) => {
    const chase = Math.max(0, Math.sin(elapsed * 3.2 + phase + i * 0.58));
    dash.material.opacity = THREE.MathUtils.damp(dash.material.opacity, 0.36 + activeBoost * 0.65 + chase * 0.2, 8, delta);
  });
  pad.chaseDashes.forEach((dash, i) => {
    const chase = Math.max(0, Math.sin(elapsed * 4.4 + phase + i * 0.8));
    dash.material.opacity = THREE.MathUtils.damp(dash.material.opacity, 0.34 + activeBoost * 0.9 + chase * 0.5, 9, delta);
    dash.scale.x = THREE.MathUtils.damp(dash.scale.x, 0.88 + chase * 0.24 + activeBoost * 0.16, 8, delta);
  });
  pad.beacons.forEach((item, i) => {
    const beaconPulse = Math.max(0, Math.sin(elapsed * 4.8 + item.phase + i));
    const scale = 0.9 + beaconPulse * (isActive ? 0.52 : isHovered ? 0.38 : 0.22);
    item.beacon.scale.setScalar(scale);
    item.slit.material.opacity = THREE.MathUtils.damp(item.slit.material.opacity, 0.46 + beaconPulse * 0.38 + activeBoost * 0.4, 7, delta);
  });
}

function animateVehicles(elapsed, delta) {
  vehicles.forEach((vehicle, index) => {
    vehicle.distance = normalizeRouteDistance(vehicle, vehicle.distance);
    lanePointAtDistance(vehicle, vehicle.distance, scratch);
    if (isTrafficBlocked(scratch, 0.26)) {
      vehicle.distance = nearestSafeRouteDistance(vehicle, vehicle.distance);
      lanePointAtDistance(vehicle, vehicle.distance, scratch);
      vehicle.currentSpeed = 0;
      vehicle.group.userData.lastSafePosition.copy(scratch);
    }
    const previousDistance = vehicle.distance;
    const previousSafe = vehicle.group.userData.lastSafePosition;
    const tangent = vehicle.route.getTangentAt(vehicle.progress).normalize();
    const lookAheadDistance = THREE.MathUtils.clamp(1.25 + vehicle.currentSpeed * 0.82, 1.25, 3.65);
    const futureProgress = (((vehicle.distance + lookAheadDistance) / vehicle.routeLength) % 1 + 1) % 1;
    const farFutureProgress = (((vehicle.distance + lookAheadDistance * 2.1) / vehicle.routeLength) % 1 + 1) % 1;
    const future = vehicle.route.getTangentAt(futureProgress).normalize();
    const farFuture = vehicle.route.getTangentAt(farFutureProgress).normalize();
    const corner = Math.max(tangent.angleTo(future), future.angleTo(farFuture) * 0.72);
    let desired = vehicle.cruiseSpeed * vehicle.waitBias * THREE.MathUtils.clamp(1.08 - corner * 1.65, 0.34, 1.06);
    if (elapsed < vehicle.waitUntil) desired = 0;

    vehicles.forEach((other) => {
      if (other !== vehicle) {
        const distance = scratch.distanceTo(other.group.position);
        if (distance < 2.15) {
          const otherTangent = other.route.getTangentAt(other.progress).normalize();
          const sameFlow = tangent.dot(otherTangent) > -0.25;
          const yieldAmount = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(distance, 0.62, 2.15, 0.06, sameFlow ? 0.9 : 0.68), 0.06, 0.94);
          desired *= yieldAmount;
        }
      }
    });

    if (routeBlockedAhead(vehicle, vehicle.distance + 0.12, lookAheadDistance * 2.55, 0.28)) {
      desired *= 0.1;
    } else {
      for (let i = 1; i <= 6; i += 1) {
        lanePointAtDistance(vehicle, vehicle.distance + i * 0.62, lookScratch, false);
        if (isTrafficBlocked(lookScratch, 0.24)) {
          desired *= THREE.MathUtils.mapLinear(i, 1, 6, 0.05, 0.58);
          break;
        }
      }
    }
    desired *= trafficSlowScaleAt(scratch);

    const response = desired < vehicle.currentSpeed ? vehicle.brake : vehicle.accel;
    vehicle.currentSpeed = THREE.MathUtils.damp(vehicle.currentSpeed, desired, response, delta);
    const nextDistance = normalizeRouteDistance(vehicle, vehicle.distance + vehicle.currentSpeed * delta);
    lanePointAtDistance(vehicle, nextDistance, scratch);
    const wasBlocked = isTrafficBlocked(scratch, 0.2) || segmentHitsBarrier(previousSafe, scratch, 0.18);
    if (wasBlocked) {
      vehicle.currentSpeed = 0;
      vehicle.waitUntil = elapsed + 0.42 + index * 0.08;
      vehicle.distance = nearestSafeRouteDistance(vehicle, previousDistance);
      lanePointAtDistance(vehicle, vehicle.distance, scratch);
      if (isTrafficBlocked(scratch, 0.24)) {
        scratch.copy(previousSafe);
      } else {
        previousSafe.copy(scratch);
      }
    } else {
      vehicle.distance = nextDistance;
      vehicle.group.userData.lastSafePosition.copy(scratch);
    }

    lanePointAtDistance(vehicle, vehicle.distance + lookAheadDistance, lookScratch, false);
    if (isTrafficBlocked(lookScratch, 0.22)) lanePointAtDistance(vehicle, nearestSafeRouteDistance(vehicle, vehicle.distance + 0.55), lookScratch, false);
    vehicle.group.position.copy(scratch);
    vehicle.group.position.y += Math.sin(elapsed * 6.2 + index) * 0.006 + (wasBlocked ? 0.012 : 0);
    lookObject.position.copy(scratch);
    lookObject.lookAt(lookScratch);
    const steerSign = Math.sign(trafficSample.copy(tangent).cross(future).y || 0);
    const steer = steerSign * THREE.MathUtils.clamp(corner * 1.72, 0, 0.38);
    vehicle.steer = THREE.MathUtils.damp(vehicle.steer, steer, 6.5, delta);
    const accelLean = THREE.MathUtils.clamp((desired - vehicle.currentSpeed) * 0.018, -0.045, 0.045);
    leanEuler.set(accelLean, 0, -vehicle.steer * 0.14, "XYZ");
    leanQuat.setFromEuler(leanEuler);
    lookObject.quaternion.multiply(leanQuat);
    vehicle.group.quaternion.slerp(lookObject.quaternion, 1 - Math.exp(-5.2 * delta));
    const moved = scratch.distanceTo(vehicle.group.userData.lastPosition);
    vehicle.group.userData.lastPosition.copy(scratch);
    vehicle.group.userData.wheelRotators.forEach((wheel) => {
      wheel.rotation.x += moved / vehicle.group.userData.wheelRadius;
    });
    vehicle.group.userData.frontWheels.forEach((wheelGroup) => {
      wheelGroup.rotation.y = vehicle.steer;
    });
    const pulse = 0.45 + Math.sin(elapsed * 8.5 + index) * 0.35;
    vehicle.group.userData.currentSpeed = vehicle.currentSpeed;
    vehicle.group.userData.beaconLight.intensity = 0.42 + pulse * 0.56;
    vehicle.group.userData.beacon.scale.setScalar(1 + pulse * 0.5);
    vehicle.group.userData.rearGlow.material.opacity = 0.2 + (vehicle.currentSpeed / vehicle.cruiseSpeed) * 0.18;
    vehicle.group.userData.underglow.material.opacity = 0.05 + pulse * 0.06;
  });
}

function animateAstronauts(elapsed, delta) {
  astronauts.forEach((walker, index) => {
    const progress = (((walker.distance / walker.routeLength) % 1) + 1) % 1;
    scratch.copy(walker.route.getPointAt(progress));
    let speedScale = 1;
    vehicles.forEach((vehicle) => {
      const distance = scratch.distanceTo(vehicle.group.position);
      if (distance < 1.55) speedScale = Math.min(speedScale, THREE.MathUtils.mapLinear(distance, 0.65, 1.55, 0.04, 0.82));
    });
    walker.distance = (walker.distance + walker.speed * speedScale * delta) % walker.routeLength;
    const nextProgress = (((walker.distance + 0.24) / walker.routeLength) % 1 + 1) % 1;
    scratch.copy(walker.route.getPointAt((((walker.distance / walker.routeLength) % 1) + 1) % 1));
    lookScratch.copy(walker.route.getPointAt(nextProgress));
    walker.group.position.copy(scratch);
    walker.group.position.y += Math.sin(elapsed * 5.2 + walker.phase) * 0.012;
    lookObject.position.copy(scratch);
    lookObject.lookAt(lookScratch);
    walker.group.quaternion.slerp(lookObject.quaternion, 1 - Math.exp(-7 * delta));

    const walk = Math.sin(elapsed * 5.6 + walker.phase + index * 0.4) * (0.52 * speedScale);
    const armSwing = walk * 0.76;
    walker.group.userData.leftArm.rotation.x = armSwing;
    walker.group.userData.rightArm.rotation.x = -armSwing;
    walker.group.userData.leftLeg.rotation.x = -walk;
    walker.group.userData.rightLeg.rotation.x = walk;
    walker.group.userData.leftArm.rotation.z = 0.16;
    walker.group.userData.rightArm.rotation.z = -0.16;
  });
}

function animateSlide(slide, isActive, isHovered, elapsed, delta, phase) {
  slide.group.getWorldPosition(scratch);
  lookScratch.set(camera.position.x, scratch.y, camera.position.z);
  slide.group.lookAt(lookScratch);
  slide.group.position.y = 2.34 + Math.sin(elapsed * 1.2 + phase + 1.8) * (isActive ? 0.08 : isHovered ? 0.05 : 0.025);
  const scale = isActive ? 1.08 : isHovered ? 1.04 : 1;
  slide.group.scale.lerp(scaleScratch.set(scale, scale, scale), 1 - Math.exp(-6 * delta));
  slide.glow.intensity = THREE.MathUtils.damp(slide.glow.intensity, isActive ? 1.8 : isHovered ? 1.05 : 0.48, 7, delta);
  slide.screen.material.opacity = THREE.MathUtils.damp(slide.screen.material.opacity, isActive ? 1 : isHovered ? 0.98 : 0.9, 7, delta);
  slide.redLine.scale.x = 1 + Math.sin(elapsed * 3 + phase) * (isActive ? 0.08 : 0.03);
}

function animateExhaust(exhaust, thrust, flicker, elapsed, delta, phase) {
  exhaust.flameCone.material.opacity = THREE.MathUtils.damp(exhaust.flameCone.material.opacity, 0.08 + thrust * 0.24 + flicker * 0.06, 10, delta);
  exhaust.flameCone.scale.set(0.48 + thrust * 0.32 + flicker * 0.08, 0.55 + thrust * 0.68 + flicker * 0.16, 0.48 + thrust * 0.32 + flicker * 0.08);
  exhaust.flameCone.rotation.y = elapsed * 1.4 + phase;
  exhaust.hotCore.material.opacity = THREE.MathUtils.damp(exhaust.hotCore.material.opacity, 0.1 + thrust * 0.46 + flicker * 0.12, 10, delta);
  exhaust.core.material.opacity = THREE.MathUtils.damp(exhaust.core.material.opacity, 0.1 + thrust * 0.38 + flicker * 0.1, 9, delta);
  exhaust.wide.material.opacity = THREE.MathUtils.damp(exhaust.wide.material.opacity, 0.06 + thrust * 0.24 + flicker * 0.07, 9, delta);
  exhaust.glow.material.opacity = THREE.MathUtils.damp(exhaust.glow.material.opacity, 0.08 + thrust * 0.24 + flicker * 0.05, 9, delta);
  exhaust.light.intensity = THREE.MathUtils.damp(exhaust.light.intensity, 0.34 + thrust * 1.55, 8, delta);
  exhaust.hotCore.scale.set(0.28 + thrust * 0.2 + flicker * 0.06, 0.8 + thrust * 0.72 + flicker * 0.18, 1);
  exhaust.core.scale.set(0.42 + thrust * 0.24 + flicker * 0.08, 1.05 + thrust * 0.9 + flicker * 0.28, 1);
  exhaust.wide.scale.set(0.86 + thrust * 0.32 + flicker * 0.12, 1.55 + thrust * 1.1 + flicker * 0.34, 1);
  exhaust.puffs.forEach((puff) => {
    const cycle = (elapsed * puff.userData.speed + puff.userData.phase + phase * 0.08) % 1;
    const angle = puff.userData.angle + elapsed * 0.18;
    const radius = puff.userData.radius + cycle * (0.72 + thrust * 0.28);
    puff.position.set(Math.cos(angle) * radius, -0.1 + cycle * 0.34, Math.sin(angle) * radius);
    puff.scale.setScalar((0.22 + cycle * 0.62) * (0.88 + thrust * 0.3));
    puff.material.opacity = (0.025 + thrust * 0.09) * Math.sin(cycle * Math.PI);
  });
  exhaust.embers.forEach((ember, i) => {
    const cycle = (elapsed * ember.userData.speed + ember.userData.phase + phase * 0.13) % 1;
    const angle = ember.userData.angle + elapsed * (0.8 + i * 0.02);
    const radius = ember.userData.radius + cycle * (0.28 + thrust * 0.18);
    ember.position.set(Math.cos(angle) * radius, -0.18 - cycle * (0.48 + thrust * 0.22), Math.sin(angle) * radius);
    ember.scale.setScalar(0.22 + cycle * 0.34 + flicker * 0.05);
    ember.material.opacity = (0.018 + thrust * 0.13) * Math.sin(cycle * Math.PI);
  });
}

function bindEvents() {
  window.addEventListener("resize", onResize);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("pointerleave", () => {
    if (!orbit.isDragging) setHovered(null);
  });
  launchButton?.addEventListener("click", startIntroLaunch);
  launchButton?.addEventListener("pointerup", (event) => {
    event.preventDefault();
    startIntroLaunch();
  });
  launchButton?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startIntroLaunch();
    }
  });
  closeButton.addEventListener("click", returnToBase);
  dockButtons.forEach((button) => {
    button.addEventListener("click", () => selectSection(button.dataset.section));
    button.addEventListener("mouseenter", () => setHovered(button.dataset.section));
    button.addEventListener("mouseleave", () => setHovered(null));
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  perf.pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 760 ? 1 : 1.18);
  perf.lowPower = window.innerWidth <= 760 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  renderer.setPixelRatio(perf.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.autoUpdate = true;
  shadowFramesRemaining = 3;
  const nextMode = getResponsiveMode();
  if (roomMode) {
    responsiveMode = nextMode;
    if (!controlRoom.leaving) setCameraToView(introCameraView(), true);
    return;
  }
  if (nextMode !== responsiveMode) {
    responsiveMode = nextMode;
    const view = selectedId ? sectionCameraView(byId.get(selectedId)) : baseCameraView();
    startCameraFlight(view, 0.75);
  } else {
    targetFov = selectedId ? sectionCameraView(byId.get(selectedId)).fov : baseCameraView().fov;
    orbit.desiredDistance = clampOrbitDistance(orbit.desiredDistance);
  }
  syncPortfolioChrome();
}

function startIntroLaunch() {
  enterControlRoomSelection();
}

function enterControlRoomSelection() {
  enterBaseFromControlRoom(controlRoom.selectedId);
}

function enterBaseOverviewFromControlRoom() {
  enterBaseFromControlRoom(null);
}

function enterBaseFromControlRoom(sectionId) {
  if (!roomMode || controlRoom.leaving) return;
  const section = sectionId ? byId.get(sectionId) : null;
  triggerHyperspace(section ? section.label : "Full Base");
  controlRoom.leaving = true;
  roomMode = false;
  introActive = false;
  hoveredId = null;
  hoveredRoomTarget = null;
  selectedId = section ? section.id : null;
  clearTimeout(panelTimer);
  panel.classList.remove("visible");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("intro-active", "intro-launching", "panel-open");
  document.body.classList.add("intro-complete");
  launchIntro?.classList.add("hidden");
  launchIntro?.setAttribute("aria-hidden", "true");
  syncOrbitToCurrent();
  syncPortfolioChrome();

  if (section) {
    updatePanel(section);
    updateDockButtons();
    document.body.classList.add("panel-open");
    const duration = startCameraFlight(sectionCameraView(section), getResponsiveMode() === "mobile" ? 2.35 : 2.15);
    panelTimer = setTimeout(() => {
      panel.classList.add("visible");
      panel.setAttribute("aria-hidden", "false");
      controlRoom.leaving = false;
      if (controlRoom.group) controlRoom.group.visible = false;
      syncPortfolioChrome();
    }, Math.round(duration * 720));
  } else {
    updateDockButtons();
    startCameraFlight(baseCameraView(), getResponsiveMode() === "mobile" ? 2.2 : 1.95);
    setTimeout(() => {
      controlRoom.leaving = false;
      if (controlRoom.group) controlRoom.group.visible = false;
      syncPortfolioChrome();
    }, 1650);
  }
}

function triggerHyperspace(destination) {
  if (!warpOverlay) return;
  clearWarpTimers();
  warpOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("warp-active");
  warpOverlay.getBoundingClientRect();
  setWarpPhase("warp-charging", `Charging jump to ${destination}`);
  warpTimers.push(
    setTimeout(() => setWarpPhase("warp-tunnel", "Light-speed tunnel engaged"), 360),
    setTimeout(() => setWarpPhase("warp-exit", `Dropping into ${destination}`), 1840),
    setTimeout(() => {
      document.body.classList.remove("warp-active", "warp-charging", "warp-tunnel", "warp-exit");
      if (warpStatus) warpStatus.textContent = "Jumping to launch base";
      warpOverlay.setAttribute("aria-hidden", "true");
      warpTimers = [];
    }, 2580),
  );
}

function clearWarpTimers() {
  warpTimers.forEach((timer) => clearTimeout(timer));
  warpTimers = [];
  document.body.classList.remove("warp-active", "warp-charging", "warp-tunnel", "warp-exit");
}

function setWarpPhase(phase, status) {
  document.body.classList.remove("warp-charging", "warp-tunnel", "warp-exit");
  document.body.classList.add(phase);
  if (warpStatus) warpStatus.textContent = status;
  if (phase === "warp-exit") {
    shadowFramesRemaining = Math.max(shadowFramesRemaining, 2);
  }
}

function handleRoomSelection(token) {
  if (!roomMode || !token?.startsWith("room:")) return;
  const [, action, sectionId] = token.split(":");
  if (action === "preview" && sectionId) {
    updateRoomPreview(sectionId);
    return;
  }
  if (action === "enter") {
    enterControlRoomSelection();
    return;
  }
  if (action === "overview") {
    enterBaseOverviewFromControlRoom();
  }
}

function handlePointerSelection(id) {
  if (id?.startsWith?.("room:")) {
    handleRoomSelection(id);
    return;
  }
  selectSection(id);
}

function onPointerDown(event) {
  if (controlRoom.leaving) return;
  event.preventDefault();
  if (flight.active) {
    flight.active = false;
    syncOrbitToCurrent();
  }
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  canvas.setPointerCapture?.(event.pointerId);
  if (activePointers.size === 1) {
    orbit.isDragging = true;
    orbit.pointerId = event.pointerId;
    orbit.lastX = event.clientX;
    orbit.lastY = event.clientY;
    orbit.dragTotal = 0;
    orbit.clickCandidateId = getIdFromPointer(event);
  } else {
    orbit.clickCandidateId = null;
    orbit.pinchDistance = activePointerDistance();
  }
  canvas.style.cursor = "grabbing";
}

function onPointerMove(event) {
  if (controlRoom.leaving) return;
  if (activePointers.has(event.pointerId)) {
    const previous = activePointers.get(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size >= 2) {
      const nextDistance = activePointerDistance();
      if (orbit.pinchDistance > 0 && nextDistance > 0) {
        orbit.desiredDistance = clampOrbitDistance(orbit.desiredDistance * (orbit.pinchDistance / nextDistance));
        orbit.dragTotal += Math.abs(nextDistance - orbit.pinchDistance) + 10;
      }
      orbit.pinchDistance = nextDistance;
      setHovered(null);
      return;
    }
    if (orbit.isDragging && event.pointerId === orbit.pointerId) {
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      orbit.desiredYaw -= dx * 0.0062;
      orbit.desiredPitch = clampOrbitPitch(orbit.desiredPitch + dy * 0.0048);
      orbit.desiredDistance = clampOrbitDistance(orbit.desiredDistance);
      orbit.dragTotal += Math.hypot(dx, dy);
      if (orbit.dragTotal > 4) orbit.clickCandidateId = null;
      setHovered(null);
      return;
    }
  }
  const id = getIdFromPointer(event);
  setHovered(id);
  canvas.style.cursor = id ? "pointer" : "default";
}

function onPointerUp(event) {
  if (controlRoom.leaving) return;
  const wasSinglePointer = activePointers.size === 1;
  const clickId = wasSinglePointer && orbit.isDragging && event.pointerId === orbit.pointerId && orbit.dragTotal < 6 ? orbit.clickCandidateId : null;
  activePointers.delete(event.pointerId);
  canvas.releasePointerCapture?.(event.pointerId);
  if (clickId) handlePointerSelection(clickId);
  if (activePointers.size === 0) {
    orbit.isDragging = false;
    orbit.pointerId = null;
    orbit.pinchDistance = 0;
    orbit.clickCandidateId = null;
    const hoverId = getIdFromPointer(event);
    setHovered(hoverId);
    canvas.style.cursor = hoverId ? "pointer" : "default";
  } else {
    const [nextPointerId, nextPointer] = activePointers.entries().next().value;
    orbit.pointerId = nextPointerId;
    orbit.lastX = nextPointer.x;
    orbit.lastY = nextPointer.y;
    orbit.dragTotal = 8;
    orbit.pinchDistance = activePointerDistance();
  }
}

function onPointerCancel(event) {
  if (controlRoom.leaving) return;
  activePointers.delete(event.pointerId);
  if (activePointers.size === 0) {
    orbit.isDragging = false;
    orbit.pointerId = null;
    orbit.pinchDistance = 0;
    orbit.clickCandidateId = null;
    canvas.style.cursor = "default";
  }
}

function onWheel(event) {
  event.preventDefault();
  if (controlRoom.leaving) return;
  if (flight.active) {
    flight.active = false;
    syncOrbitToCurrent();
  }
  orbit.desiredDistance = clampOrbitDistance(orbit.desiredDistance * Math.exp(event.deltaY * 0.001));
}

function activePointerDistance() {
  const points = Array.from(activePointers.values());
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function getIdFromPointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hitTargets, false)[0]?.object;
  if (!hit) return null;
  if (hit.userData.roomAction) return `room:${hit.userData.roomAction}:${hit.userData.sectionId ?? ""}`;
  if (roomMode) return null;
  return hit.userData.sectionId ?? null;
}

function setHovered(id) {
  if (id?.startsWith?.("room:")) {
    if (hoveredRoomTarget === id) return;
    hoveredRoomTarget = id;
    hoveredId = null;
    return;
  }
  hoveredRoomTarget = null;
  if (hoveredId === id) return;
  hoveredId = id;
}

function selectSection(id) {
  if (introActive) return;
  const section = byId.get(id);
  if (!section) return;
  selectedId = id;
  document.body.classList.add("panel-open");
  panel.classList.remove("visible");
  panel.setAttribute("aria-hidden", "true");
  clearTimeout(panelTimer);
  updatePanel(section);
  updateDockButtons();
  syncPortfolioChrome();
  const duration = startCameraFlight(sectionCameraView(section));
  const delay = Math.round(duration * 680);
  panelTimer = setTimeout(() => {
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
  }, delay);
}

function returnToBase() {
  selectedId = null;
  document.body.classList.remove("panel-open");
  clearTimeout(panelTimer);
  panel.classList.remove("visible");
  panel.setAttribute("aria-hidden", "true");
  startCameraFlight(baseCameraView(), 1.08);
  updateDockButtons();
  syncPortfolioChrome();
}

function updatePanel(section) {
  panelKicker.textContent = `${section.label} Section`;
  panelTitle.textContent = section.rocketName;
  panelContent.replaceChildren();
  if (section.intro) panelContent.append(paragraph(section.intro));
  section.paragraphs?.forEach((text) => panelContent.append(paragraph(text)));
  if (section.list) {
    const list = document.createElement("ul");
    section.list.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.append(item);
    });
    panelContent.append(list);
  }
  if (section.contact) {
    panelContent.append(paragraph("Contact:"));
    const list = document.createElement("div");
    list.className = "contact-list";
    section.contact.forEach((item) => {
      const row = item.href ? document.createElement("a") : document.createElement("span");
      row.textContent = `${item.label}: ${item.value}`;
      if (item.href) row.href = item.href;
      list.append(row);
    });
    panelContent.append(list);
  }
}

function paragraph(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

function updateDockButtons() {
  dockButtons.forEach((button) => button.classList.toggle("active", button.dataset.section === (selectedId ?? "home")));
}

function addInteractive(geometry, material, sectionId, parent, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.userData.sectionId = sectionId;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addBox(sx, sy, sz, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addChildBox(parent, sx, sy, sz, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addGlowDash(x, y, z, rotationY) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.035, 0.08), materials.redLight);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotationY;
  mesh.castShadow = false;
  scene.add(mesh);
  return mesh;
}

function ring(radius, tube, opacity) {
  const material = materials.redGlow.clone();
  material.opacity = opacity;
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 48), material);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function contactShadow(width, depth, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: softShadowTexture, color: 0x000000, transparent: true, opacity, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function beam(start, end, radius, material) {
  const direction = end.clone().sub(start);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 8), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = false;
  return mesh;
}

function sprite(texture, color, opacity, sx, sy) {
  const spriteMesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  spriteMesh.scale.set(sx, sy, 1);
  return spriteMesh;
}

function dampOpacity(material, target, delta) {
  material.opacity = THREE.MathUtils.damp(material.opacity, target, 7, delta);
}

function createSoftDiscTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.5)");
  g.addColorStop(0.46, "rgba(0,0,0,0.22)");
  g.addColorStop(0.78, "rgba(0,0,0,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function createExhaustTexture() {
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 192;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(48, 26, 2, 48, 94, 84);
  g.addColorStop(0, "rgba(255,255,255,0.86)");
  g.addColorStop(0.18, "rgba(255,70,70,0.72)");
  g.addColorStop(0.58, "rgba(255,24,24,0.24)");
  g.addColorStop(1, "rgba(255,24,24,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 192);
  return new THREE.CanvasTexture(c);
}

function createSteamTexture() {
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 96;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
  g.addColorStop(0, "rgba(255,255,255,0.28)");
  g.addColorStop(0.45, "rgba(170,170,170,0.11)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 96);
  return new THREE.CanvasTexture(c);
}
