import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createProceduralTextures } from './textures';
import { createMcCharacter } from './character3d';
import type {
  GameSettings,
  McAnimationState,
  Team,
  ZoneId,
} from '../types/game';

export type CameraPreset =
  | 'home'
  | 'map'
  | 'zone1'
  | 'zone2'
  | 'zone3'
  | 'zone4'
  | 'zone5'
  | 'mc'
  | 'chest';

interface BurstCoin {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotSpeed: number;
  active: boolean;
}

interface FireworkSpark {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

// Reusable math objects (Zero GC inside render loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _dummy = new THREE.Object3D();

export class IslandSceneController {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock = new THREE.Clock();
  private isSoftwareGl: boolean;

  private frameId = 0;
  private disposed = false;
  private contextLost = false;

  // Dynamic Scene References
  private oceanTimeUniform = { value: 0 };
  private clouds: { group: THREE.Group; speed: number; baseZ: number }[] = [];
  private palmTrees: { group: THREE.Group; phase: number }[] = [];
  private floatingCoins: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
  private waterfallStrips: THREE.Mesh[] = [];
  private smokePuffs: { mesh: THREE.Mesh; basePos: THREE.Vector3; phase: number }[] = [];
  private crystalLights: THREE.PointLight[] = [];

  // Trail & Team Pawns
  private trailCurve!: THREE.CatmullRomCurve3;
  private teamPawns: Map<
    string,
    { group: THREE.Group; currentT: number; targetT: number }
  > = new Map();

  // MC 3D
  private mcRig!: ReturnType<typeof createMcCharacter>;
  private mcState: McAnimationState = 'idle';

  // Giant Treasure Chest & Finale
  private chestGroup!: THREE.Group;
  private chestLidPivot!: THREE.Group;
  private chestBeaconLight!: THREE.PointLight;
  private chestBeamMesh!: THREE.Mesh;
  private chestDiamond!: THREE.Mesh;
  private chestOpening = false;
  private chestOpenProgress = 0;
  private chestShakeTime = 0;
  private burstCoins: BurstCoin[] = [];
  private fireworkSparks: FireworkSpark[] = [];
  private fireworksTimer = 0;

  // Lighting & Atmosphere for Finale Dimming
  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private baseKeyIntensity = 1.65;
  private baseHemiIntensity = 0.85;

  // Camera Smoothing
  private camTargetPos = new THREE.Vector3(0, 18, 34);
  private camTargetLook = new THREE.Vector3(0, 2.5, 0);
  private isCameraTransitioning = true;
  private currentPreset: CameraPreset = 'home';

  // Settings
  private settings: GameSettings;
  private textures!: ReturnType<typeof createProceduralTextures>;
  private envRT: THREE.WebGLRenderTarget | null = null;

  constructor(container: HTMLElement, initialSettings: GameSettings) {
    this.container = container;
    this.settings = { ...initialSettings };

    // 1. Detect software WebGL cleanly from GPU renderer string
    this.isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 240);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && initialSettings.graphicsQuality === 'high',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.applyQualitySettings(initialSettings);

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    // Context lost/restored resilience
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener(
      'webglcontextrestored',
      this.onContextRestored,
    );

    // 2. Scene, Sky & Horizon Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x52c4e2);
    this.scene.fog = new THREE.FogExp2(0x52c4e2, 0.0072);

    // 3. Studio Environment Reflection (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRT = pmrem.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    // 4. Camera & OrbitControls
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 260);
    this.camera.position.copy(this.camTargetPos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 62;
    this.controls.target.copy(this.camTargetLook);
    this.controls.addEventListener('start', () => {
      this.isCameraTransitioning = false;
    });

    // 5. Procedural Textures & World Assembly
    const maxAniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 8);
    this.textures = createProceduralTextures(maxAniso);

    this.setupLighting();
    this.buildOceanAndSky();
    this.buildIslandAndFiveZones();
    this.buildMcExplorer();
    this.buildGiantTreasureChest();
    this.buildFinaleParticles();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    window.addEventListener('resize', this.onResize);
    this.setCameraPreset('home', true);
    this.tick();
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.contextLost = true;
  };

  private onContextRestored = () => {
    this.contextLost = false;
  };

  private onResize = () => {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 240);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xbef0ff, 0x265c42, this.baseHemiIntensity);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff1d0, this.baseKeyIntensity);
    this.keyLight.position.set(24, 34, 22);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.near = 4;
    this.keyLight.shadow.camera.far = 95;
    const d = 28;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.025;
    this.scene.add(this.keyLight);

    const rimLight = new THREE.DirectionalLight(0x61ddb5, 0.55);
    rimLight.position.set(-22, 16, -24);
    this.scene.add(rimLight);
  }

  private buildOceanAndSky() {
    // Ocean with custom vertex wave displacement on PBR MeshPhysicalMaterial
    const oceanGeo = new THREE.CircleGeometry(140, 64);
    oceanGeo.rotateX(-Math.PI / 2);

    const oceanMat = new THREE.MeshPhysicalMaterial({
      color: 0x087e9a,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 0.75,
      clearcoatRoughness: 0.16,
      flatShading: false,
    });

    oceanMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.oceanTimeUniform;
      shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float distFromCenter = length(transformed.xz);
         float wave = sin(transformed.x * 0.22 + uTime * 1.6) * 0.22
                    + cos(transformed.z * 0.19 + uTime * 1.25) * 0.18;
         transformed.y += wave * smoothstep(10.0, 26.0, distFromCenter);`,
      );
    };

    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.y = -0.35;
    ocean.receiveShadow = true;
    this.scene.add(ocean);

    // Shallow turquoise lagoon ring around island
    const lagoonGeo = new THREE.RingGeometry(15.5, 21.5, 48);
    lagoonGeo.rotateX(-Math.PI / 2);
    const lagoonMat = new THREE.MeshBasicMaterial({
      color: 0x61ddb5,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
    const lagoon = new THREE.Mesh(lagoonGeo, lagoonMat);
    lagoon.position.y = -0.15;
    this.scene.add(lagoon);

    // Stylized Low-Poly Clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfff6df,
      roughness: 0.9,
      metalness: 0,
    });

    const cloudCoords = [
      [-26, 17, -18, 1.3],
      [-6, 20, -28, 1.6],
      [18, 18, -22, 1.2],
      [28, 16, 4, 1.4],
      [-28, 19, 12, 1.15],
    ];

    cloudCoords.forEach(([cx, cy, cz, sc], idx) => {
      const cg = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7, 1), cloudMat);
      const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 1), cloudMat);
      p2.position.set(1.4, -0.25, 0.2);
      const p3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 1), cloudMat);
      p3.position.set(-1.35, -0.3, -0.1);
      cg.add(p1, p2, p3);
      cg.position.set(cx, cy, cz);
      cg.scale.setScalar(sc);
      this.scene.add(cg);
      this.clouds.push({ group: cg, speed: 0.35 + (idx % 3) * 0.14, baseZ: cz });
    });
  }

  private createPalmTree(scale = 1, leanAngle = 0.22): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x8a5832,
      roughness: 0.85,
      metalness: 0.02,
    });
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x2ca868,
      roughness: 0.6,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x5c3618,
      roughness: 0.7,
    });

    // Multi-segment curved trunk
    let curY = 0;
    let curX = 0;
    const segCount = 5;
    for (let i = 0; i < segCount; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 - i * 0.022, 0.24 - i * 0.022, 0.85, 8),
        trunkMat,
      );
      seg.position.set(curX, curY + 0.4, 0);
      seg.rotation.z = -leanAngle * (i / segCount);
      seg.castShadow = true;
      group.add(seg);
      curY += 0.78;
      curX += Math.sin(leanAngle * (i / segCount)) * 0.35;
    }

    const crownGroup = new THREE.Group();
    crownGroup.position.set(curX, curY + 0.1, 0);
    group.add(crownGroup);

    for (let f = 0; f < 6; f++) {
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.2, 5), frondMat);
      frond.scale.set(1, 1, 0.22);
      const angle = (f / 6) * Math.PI * 2;
      frond.rotation.y = angle;
      frond.rotation.z = -Math.PI / 2.6;
      frond.position.set(Math.cos(angle) * 0.9, -0.1, Math.sin(angle) * 0.9);
      frond.castShadow = true;
      crownGroup.add(frond);
    }

    for (let c = 0; c < 3; c++) {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), coconutMat);
      const ang = (c / 3) * Math.PI * 2;
      nut.position.set(Math.cos(ang) * 0.22, -0.18, Math.sin(ang) * 0.22);
      crownGroup.add(nut);
    }

    group.scale.setScalar(scale);
    return group;
  }

  private createLushTree(scale = 1, tint = 0x238b55): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6f4324, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.72 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.42, 1.7, 9), trunkMat);
    trunk.position.y = 0.85;
    trunk.castShadow = true;
    group.add(trunk);

    const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 1), leafMat);
    canopy1.position.y = 2.2;
    canopy1.castShadow = true;
    const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), leafMat);
    canopy2.position.set(0.55, 1.85, 0.35);
    const canopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), leafMat);
    canopy3.position.set(-0.5, 1.9, -0.3);
    group.add(canopy1, canopy2, canopy3);

    group.scale.setScalar(scale);
    return group;
  }

  private buildIslandAndFiveZones() {
    const sandMat = new THREE.MeshStandardMaterial({
      map: this.textures.sandMap,
      roughness: 0.85,
      metalness: 0.02,
    });
    const grassMat = new THREE.MeshStandardMaterial({
      map: this.textures.grassMap,
      roughness: 0.78,
      metalness: 0.02,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.textures.stoneMap,
      roughness: 0.75,
      metalness: 0.06,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: this.textures.woodMap,
      roughness: 0.72,
      metalness: 0.05,
    });

    // Base Sandy Island Rim
    const beachBase = new THREE.Mesh(
      new THREE.CylinderGeometry(16.8, 19.5, 1.4, 32),
      sandMat,
    );
    beachBase.position.y = 0.25;
    beachBase.receiveShadow = true;
    this.scene.add(beachBase);

    // Main Lush Jungle Plateau
    const jungleBase = new THREE.Mesh(
      new THREE.CylinderGeometry(13.8, 15.2, 1.1, 28),
      grassMat,
    );
    jungleBase.position.y = 1.05;
    jungleBase.receiveShadow = true;
    this.scene.add(jungleBase);

    // Elevated Zones Platform Mounds (5 Distinct Zones arranged counterclockwise around the island)
    // Zone 1: Front-Left (-9, 1.6, 8) - Rừng Khởi Đầu
    // Zone 2: Back-Left (-10, 2.0, -4) - Cầu Ánh Sáng & Thác nước
    // Zone 3: Back-Center (0, 2.4, -10) - Hang Động Bí Ẩn
    // Zone 4: Back-Right (10, 2.8, -3) - Núi Lửa Thử Thách
    // Zone 5: Front-Right / Summit Temple (5.5, 3.6, 6.5) - Đảo Kho Báu & Đền Cổ

    // ---------------- KHU VỰC 1: RỪNG KHỞI ĐẦU ----------------
    const z1Pos = new THREE.Vector3(-8.5, 1.6, 7.5);
    const z1Pad = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.3, 0.5, 16), grassMat);
    z1Pad.position.set(z1Pos.x, 1.45, z1Pos.z);
    z1Pad.receiveShadow = true;
    this.scene.add(z1Pad);

    // Wooden Welcome Gate
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-7.5, 1.65, 8.2);
    gateGroup.rotation.y = 0.65;
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.2, 8), woodMat);
    postL.position.set(-1.3, 1.6, 0);
    postL.castShadow = true;
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.2, 8), woodMat);
    postR.position.set(1.3, 1.6, 0);
    postR.castShadow = true;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.48, 0.36), woodMat);
    lintel.position.set(0, 3.15, 0);
    lintel.castShadow = true;
    const gateBanner = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.38, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.35, metalness: 0.65 }),
    );
    gateBanner.position.set(0, 3.15, 0);
    gateGroup.add(postL, postR, lintel, gateBanner);
    this.scene.add(gateGroup);

    // Ancient Banyan & Forest Trees + Rune Stones
    const banyan = this.createLushTree(1.45, 0x1e7e4c);
    banyan.position.set(-11.4, 1.5, 6.4);
    const tree1b = this.createLushTree(1.0, 0x2ea666);
    tree1b.position.set(-9.6, 1.5, 10.6);
    this.scene.add(banyan, tree1b);

    [
      [-6.1, 1.6, 10.2],
      [-10.8, 1.6, 4.2],
    ].forEach(([rx, ry, rz]) => {
      const rune = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), stoneMat);
      rune.position.set(rx, ry + 0.35, rz);
      rune.castShadow = true;
      this.scene.add(rune);
    });

    // ---------------- KHU VỰC 2: CẦU ÁNH SÁNG & THÁC NƯỚC ----------------
    // River stream channel + canyon rock + multi-tier waterfall + wooden suspension bridge
    const riverMat = new THREE.MeshPhysicalMaterial({
      color: 0x3ec8e0,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
    });
    const riverStrip = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 11), riverMat);
    riverStrip.rotation.x = -Math.PI / 2;
    riverStrip.rotation.z = -0.35;
    riverStrip.position.set(-8.8, 1.62, -2.5);
    this.scene.add(riverStrip);

    // Waterfall cliff + 3-tier waterfall
    const cliffGroup = new THREE.Group();
    cliffGroup.position.set(-11.2, 1.6, -5.2);
    const cliffRock = new THREE.Mesh(new THREE.ConeGeometry(2.9, 5.8, 7), stoneMat);
    cliffRock.position.y = 2.8;
    cliffRock.castShadow = true;
    cliffGroup.add(cliffRock);

    for (let t = 0; t < 3; t++) {
      const wf = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5 - t * 0.12, 2.0),
        new THREE.MeshBasicMaterial({
          color: t % 2 === 0 ? 0x61ddb5 : 0xc7f9ff,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        }),
      );
      wf.position.set(0.8 + t * 0.28, 3.6 - t * 1.35, 0.8 + t * 0.25);
      wf.rotation.y = 0.7;
      wf.rotation.x = -0.25;
      cliffGroup.add(wf);
      this.waterfallStrips.push(wf);
    }
    this.scene.add(cliffGroup);

    // Wooden Light Bridge spanning the river
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-8.8, 1.95, -2.6);
    bridgeGroup.rotation.y = 0.52;
    for (let p = -4; p <= 4; p++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.36), woodMat);
      plank.position.set(0, Math.cos(p * 0.25) * 0.25, p * 0.45);
      plank.castShadow = true;
      bridgeGroup.add(plank);
    }
    // Glowing lantern crystals on bridge posts
    const glowCyanMat = new THREE.MeshStandardMaterial({
      color: 0x61ddb5,
      emissive: 0x61ddb5,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });
    [
      [-0.9, 0.9, -1.7],
      [0.9, 0.9, -1.7],
      [-0.9, 0.9, 1.7],
      [0.9, 0.9, 1.7],
    ].forEach(([lx, ly, lz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.1, 6), woodMat);
      post.position.set(lx, ly - 0.3, lz);
      const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glowCyanMat);
      lantern.position.set(lx, ly + 0.3, lz);
      bridgeGroup.add(post, lantern);
    });
    this.scene.add(bridgeGroup);

    // ---------------- KHU VỰC 3: HANG ĐỘNG BÍ ẨN ----------------
    const caveGroup = new THREE.Group();
    caveGroup.position.set(-0.2, 1.6, -10.2);

    const caveMound = new THREE.Mesh(new THREE.DodecahedronGeometry(3.8, 1), stoneMat);
    caveMound.scale.set(1.3, 0.95, 1.0);
    caveMound.position.y = 1.9;
    caveMound.castShadow = true;
    caveMound.receiveShadow = true;
    caveGroup.add(caveMound);

    // Dark cave mouth arch
    const caveMouth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.65, 1.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x102533, roughness: 0.95 }),
    );
    caveMouth.rotation.x = Math.PI / 2;
    caveMouth.position.set(0, 1.25, 2.25);
    caveGroup.add(caveMouth);

    // Glowing multi-colored PBR Crystals
    const crystalColors = [0xff5ea8, 0x61ddb5, 0x7b61ff, 0xffd166, 0x38bdf8];
    const crystalOffsets = [
      [-2.3, 0.8, 2.6, 0.2],
      [-1.7, 0.6, 3.1, -0.25],
      [2.1, 0.9, 2.4, -0.2],
      [2.6, 0.7, 1.9, 0.3],
      [0.4, 3.7, 0.5, 0.1],
    ];
    crystalOffsets.forEach(([cx, cy, cz, tilt], idx) => {
      const cColor = crystalColors[idx % crystalColors.length];
      const cMat = new THREE.MeshPhysicalMaterial({
        color: cColor,
        emissive: cColor,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.1,
        clearcoat: 1.0,
      });
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.55, 6), cMat);
      crystal.position.set(cx, cy, cz);
      crystal.rotation.z = tilt;
      crystal.castShadow = true;
      caveGroup.add(crystal);
    });

    // Small decorative side treasure chest outside cave
    const miniChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.55, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x9c5d2f, roughness: 0.55 }),
    );
    miniChest.position.set(1.6, 0.35, 3.3);
    const miniTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.14, 0.59),
      new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.85, roughness: 0.25 }),
    );
    miniTrim.position.set(1.6, 0.45, 3.3);
    caveGroup.add(miniChest, miniTrim);

    const caveLight = new THREE.PointLight(0x9b72ff, 2.4, 10);
    caveLight.position.set(0, 1.4, 3.4);
    caveGroup.add(caveLight);
    this.crystalLights.push(caveLight);
    this.scene.add(caveGroup);

    // ---------------- KHU VỰC 4: NÚI LỬA THỬ THÁCH ----------------
    const volcanoGroup = new THREE.Group();
    volcanoGroup.position.set(9.8, 1.6, -3.8);

    const volcanoConeMat = new THREE.MeshStandardMaterial({
      color: 0x4b4248,
      roughness: 0.88,
      metalness: 0.08,
    });
    const volcanoCone = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 4.4, 6.2, 12),
      volcanoConeMat,
    );
    volcanoCone.position.y = 3.1;
    volcanoCone.castShadow = true;
    volcanoCone.receiveShadow = true;
    volcanoGroup.add(volcanoCone);

    // Glowing Lava Crater & Lava Stream
    const lavaMat = new THREE.MeshStandardMaterial({
      map: this.textures.lavaMap,
      emissive: 0xff5a00,
      emissiveMap: this.textures.lavaMap,
      emissiveIntensity: 1.5,
      roughness: 0.35,
    });
    const crater = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.1, 0.35, 14), lavaMat);
    crater.position.y = 6.12;
    volcanoGroup.add(crater);

    const lavaStream = new THREE.Mesh(new THREE.BoxGeometry(0.95, 5.4, 0.35), lavaMat);
    lavaStream.position.set(-1.35, 2.8, 1.85);
    lavaStream.rotation.x = 0.36;
    lavaStream.rotation.z = 0.42;
    volcanoGroup.add(lavaStream);

    // Stone bridge crossing the lava stream
    const stoneBridge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.38, 1.4), stoneMat);
    stoneBridge.position.set(-2.3, 1.15, 2.9);
    stoneBridge.rotation.y = 0.65;
    stoneBridge.castShadow = true;
    volcanoGroup.add(stoneBridge);

    const volcanoLight = new THREE.PointLight(0xff6b2b, 3.2, 13);
    volcanoLight.position.set(0, 6.9, 0);
    volcanoGroup.add(volcanoLight);
    this.crystalLights.push(volcanoLight);

    // Volcanic smoke puffs
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xe2d4c8,
      roughness: 1,
      transparent: true,
      opacity: 0.65,
    });
    for (let s = 0; s < 5; s++) {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + s * 0.08, 1), smokeMat);
      const basePos = new THREE.Vector3(9.8 + (s % 2 === 0 ? 0.2 : -0.2), 8.2 + s * 0.9, -3.8);
      puff.position.copy(basePos);
      this.scene.add(puff);
      this.smokePuffs.push({ mesh: puff, basePos, phase: s * 1.25 });
    }
    this.scene.add(volcanoGroup);

    // ---------------- KHU VỰC 5: ĐẢO KHO BÁU & ĐỀN CỔ ----------------
    const templeGroup = new THREE.Group();
    templeGroup.position.set(4.5, 1.6, 6.2);

    // Stepped ancient temple pyramid
    for (let step = 0; step < 3; step++) {
      const size = 6.2 - step * 1.4;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(size, 0.72, size), stoneMat);
      tier.position.y = 0.36 + step * 0.72;
      tier.castShadow = true;
      tier.receiveShadow = true;
      templeGroup.add(tier);
    }

    // 4 Golden temple pillars
    const pillarGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.28,
      metalness: 0.82,
    });
    [
      [-1.7, -1.7],
      [1.7, -1.7],
      [-1.7, 1.7],
      [1.7, 1.7],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.3, 12), stoneMat);
      col.position.set(px, 3.2, pz);
      col.castShadow = true;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.65), pillarGoldMat);
      cap.position.set(px, 4.35, pz);
      templeGroup.add(col, cap);
    });
    this.scene.add(templeGroup);

    // Swaying Coconut Palms around beach & Zone 5
    const palmCoords: [number, number, number, number][] = [
      [11.8, 1.0, 9.8, 1.15],
      [9.4, 1.3, 11.8, 0.95],
      [-13.5, 1.0, 2.2, 1.05],
      [13.4, 1.0, 3.8, 1.1],
      [-3.5, 1.1, 13.0, 0.92],
    ];
    palmCoords.forEach(([x, y, z, sc], idx) => {
      const palm = this.createPalmTree(sc, 0.26);
      palm.position.set(x, y, z);
      palm.rotation.y = idx * 1.25;
      this.scene.add(palm);
      this.palmTrees.push({ group: palm, phase: idx * 1.1 });
    });

    // ---------------- WINDING TRAIL & MILESTONES ----------------
    this.trailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.5, 1.75, 9.6),  // Start / Zone 1
      new THREE.Vector3(-8.8, 1.75, 4.5),
      new THREE.Vector3(-8.8, 2.1, -2.5),  // Zone 2 Bridge
      new THREE.Vector3(-5.0, 1.8, -7.8),
      new THREE.Vector3(-0.2, 1.8, -6.5),  // Zone 3 Cave entrance
      new THREE.Vector3(5.2, 1.85, -5.2),
      new THREE.Vector3(8.2, 2.4, -0.5),   // Zone 4 Volcano pass
      new THREE.Vector3(7.4, 2.5, 3.5),
      new THREE.Vector3(4.5, 3.85, 6.2),   // Zone 5 Temple Apex
    ]);

    const stepCount = 34;
    const stepMat = new THREE.MeshStandardMaterial({
      color: 0xffe4a0,
      roughness: 0.7,
      metalness: 0.05,
    });
    for (let i = 0; i <= stepCount; i++) {
      const t = i / stepCount;
      const pt = this.trailCurve.getPointAt(t);
      const stone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.48, 0.14, 8),
        stepMat,
      );
      stone.position.set(pt.x, pt.y - 0.04, pt.z);
      stone.receiveShadow = true;
      this.scene.add(stone);
    }

    // Floating Rotating Gold Coins along the sky/trail
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xff9f43,
      emissiveIntensity: 0.35,
      metalness: 0.92,
      roughness: 0.18,
    });
    const coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.09, 16);
    coinGeo.rotateX(Math.PI / 2);

    [0.12, 0.34, 0.56, 0.78, 0.92].forEach((t, idx) => {
      const pt = this.trailCurve.getPointAt(t);
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(pt.x, pt.y + 1.35, pt.z);
      coin.castShadow = true;
      this.scene.add(coin);
      this.floatingCoins.push({ mesh: coin, baseY: pt.y + 1.35, phase: idx * 1.3 });
    });
  }

  private buildMcExplorer() {
    this.mcRig = createMcCharacter(this.textures.contactShadowMap);
    this.mcRig.root.position.set(-5.2, 1.6, 9.6);
    this.mcRig.root.rotation.y = 0.45;
    this.mcRig.root.scale.setScalar(1.35);
    this.scene.add(this.mcRig.root);
  }

  private buildGiantTreasureChest() {
    this.chestGroup = new THREE.Group();
    this.chestGroup.position.set(4.5, 3.76, 6.2);
    this.chestGroup.rotation.y = -0.35;

    const woodMat = new THREE.MeshStandardMaterial({
      map: this.textures.woodMap,
      roughness: 0.52,
      metalness: 0.08,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.18,
      metalness: 0.94,
    });

    // Chest Lower Base
    const baseBox = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.05, 1.35), woodMat);
    baseBox.position.y = 0.525;
    baseBox.castShadow = true;
    baseBox.receiveShadow = true;
    this.chestGroup.add(baseBox);

    // Gold reinforcement bands on base
    [-0.92, 0, 0.92].forEach((bx) => {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 1.42), goldMat);
      band.position.set(bx, 0.54, 0);
      this.chestGroup.add(band);
    });

    // Gold Lock Plate
    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.14), goldMat);
    lockPlate.position.set(0, 0.85, 0.7);
    this.chestGroup.add(lockPlate);

    // Interior Mound of Gold Coins + Glowing Giant Diamond
    const goldPile = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      goldMat,
    );
    goldPile.scale.set(1.05, 0.55, 0.65);
    goldPile.position.set(0, 0.82, 0);
    this.chestGroup.add(goldPile);

    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0x61ddb5,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.05,
      metalness: 0.15,
      clearcoat: 1.0,
    });
    this.chestDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), diamondMat);
    this.chestDiamond.position.set(0, 1.25, 0);
    this.chestGroup.add(this.chestDiamond);

    // Hinged Lid Pivot (rear edge at z = -0.68, y = 1.05)
    this.chestLidPivot = new THREE.Group();
    this.chestLidPivot.position.set(0, 1.05, -0.67);
    this.chestGroup.add(this.chestLidPivot);

    const lidCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 2.12, 16, 1, false, 0, Math.PI),
      woodMat,
    );
    lidCylinder.rotation.z = Math.PI / 2;
    lidCylinder.position.set(0, 0, 0.67);
    lidCylinder.castShadow = true;
    this.chestLidPivot.add(lidCylinder);

    [-0.92, 0, 0.92].forEach((bx) => {
      const lidBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.71, 0.71, 0.15, 16, 1, false, 0, Math.PI),
        goldMat,
      );
      lidBand.rotation.z = Math.PI / 2;
      lidBand.position.set(bx, 0, 0.67);
      this.chestLidPivot.add(lidBand);
    });

    // Golden Light Beam & Beacon PointLight
    this.chestBeaconLight = new THREE.PointLight(0xffd166, 2.2, 14);
    this.chestBeaconLight.position.set(0, 2.1, 0.2);
    this.chestGroup.add(this.chestBeaconLight);

    const beamGeo = new THREE.CylinderGeometry(2.2, 0.7, 7.5, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.chestBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.chestBeamMesh.position.set(0, 4.2, 0);
    this.chestGroup.add(this.chestBeamMesh);

    this.scene.add(this.chestGroup);
  }

  private buildFinaleParticles() {
    const coinGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xff9f43,
      emissiveIntensity: 0.5,
      metalness: 0.92,
      roughness: 0.15,
    });

    for (let i = 0; i < 24; i++) {
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.burstCoins.push({
        mesh,
        vel: new THREE.Vector3(),
        rotSpeed: 4 + (i % 5),
        active: false,
      });
    }

    const sparkGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const sparkColors = [0xffd166, 0x61ddb5, 0xff9f43, 0xff5ea8, 0x38bdf8];
    for (let i = 0; i < 36; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({
        color: sparkColors[i % sparkColors.length],
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(sparkGeo, sparkMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.fireworkSparks.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1.5,
      });
    }
  }

  public syncTeams(teams: Team[], totalQuestions: number) {
    const activeIds = new Set(teams.map((t) => t.id));
    // Remove stale pawns
    for (const [id, entry] of this.teamPawns.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(entry.group);
        this.teamPawns.delete(id);
      }
    }

    teams.forEach((team, idx) => {
      const targetT =
        totalQuestions > 0
          ? THREE.MathUtils.clamp(team.progressStep / totalQuestions, 0, 1)
          : 0;

      let entry = this.teamPawns.get(team.id);
      if (!entry) {
        const pawnGroup = new THREE.Group();
        const colorHex = new THREE.Color(team.color);

        const baseMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.35,
          metalness: 0.25,
        });
        const gemMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.65,
          roughness: 0.15,
          metalness: 0.5,
        });

        const pedestal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.42, 0.25, 12),
          baseMat,
        );
        pedestal.position.y = 0.125;
        pedestal.castShadow = true;
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.72, 10), baseMat);
        body.position.y = 0.58;
        body.castShadow = true;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), gemMat);
        gem.position.y = 1.15;
        pawnGroup.add(pedestal, body, gem);

        const startPt = this.trailCurve.getPointAt(targetT);
        const offsetAngle = (idx / Math.max(teams.length, 1)) * Math.PI * 2;
        pawnGroup.position.set(
          startPt.x + Math.cos(offsetAngle) * 0.55,
          startPt.y,
          startPt.z + Math.sin(offsetAngle) * 0.55,
        );
        this.scene.add(pawnGroup);
        entry = { group: pawnGroup, currentT: targetT, targetT };
        this.teamPawns.set(team.id, entry);
      } else {
        entry.targetT = targetT;
      }
    });
  }

  public setMcState(state: McAnimationState) {
    this.mcState = state;
  }

  public setCameraPreset(preset: CameraPreset, immediate = false) {
    this.currentPreset = preset;
    this.isCameraTransitioning = true;

    switch (preset) {
      case 'home':
        this.camTargetPos.set(-4, 15, 31);
        this.camTargetLook.set(0, 2.2, 1.5);
        break;
      case 'map':
        this.camTargetPos.set(0, 24, 28);
        this.camTargetLook.set(0, 1.8, -1);
        break;
      case 'zone1':
        this.camTargetPos.set(-14, 9.5, 17);
        this.camTargetLook.set(-8.2, 2.6, 8.2);
        break;
      case 'zone2':
        this.camTargetPos.set(-17, 10.5, 3.5);
        this.camTargetLook.set(-9.4, 2.8, -3.2);
        break;
      case 'zone3':
        this.camTargetPos.set(-2.5, 9.5, 1.5);
        this.camTargetLook.set(-0.2, 2.8, -8.5);
        break;
      case 'zone4':
        this.camTargetPos.set(17, 11.5, 7);
        this.camTargetLook.set(9.4, 3.6, -2.5);
        break;
      case 'zone5':
        this.camTargetPos.set(12.5, 10.5, 15.5);
        this.camTargetLook.set(4.5, 4.0, 6.2);
        break;
      case 'mc':
        this.camTargetPos.set(-1.6, 4.8, 15.8);
        this.camTargetLook.set(-5.2, 3.1, 9.6);
        break;
      case 'chest':
        this.camTargetPos.set(6.8, 6.9, 12.2);
        this.camTargetLook.set(4.5, 4.9, 6.2);
        break;
    }

    if (immediate) {
      this.camera.position.copy(this.camTargetPos);
      this.controls.target.copy(this.camTargetLook);
      this.controls.update();
    }
  }

  public focusZone(zoneId: ZoneId) {
    this.setCameraPreset(`zone${zoneId}` as CameraPreset);
  }

  public triggerChestOpening() {
    this.chestOpening = true;
    this.chestOpenProgress = 0;
    this.chestShakeTime = 0.85;
    this.fireworksTimer = 0;
    this.setCameraPreset('chest');

    // Launch burst coins
    if (this.settings.enableParticles) {
      this.burstCoins.forEach((c, idx) => {
        c.active = true;
        c.mesh.visible = true;
        c.mesh.position.set(4.5, 4.8, 6.2);
        const angle = (idx / this.burstCoins.length) * Math.PI * 2;
        const speed = 2.2 + (idx % 4) * 0.7;
        c.vel.set(Math.cos(angle) * speed, 6.0 + (idx % 3) * 1.4, Math.sin(angle) * speed);
      });
    }
  }

  public resetChest() {
    this.chestOpening = false;
    this.chestOpenProgress = 0;
    this.chestShakeTime = 0;
    this.chestLidPivot.rotation.x = 0;
    (this.chestBeamMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    this.chestGroup.position.set(4.5, 3.76, 6.2);
    this.burstCoins.forEach((c) => {
      c.active = false;
      c.mesh.visible = false;
    });
    this.fireworkSparks.forEach((s) => {
      s.life = 0;
      s.mesh.visible = false;
    });
  }

  public applyQualitySettings(next: GameSettings) {
    this.settings = { ...next };
    const isLow = next.graphicsQuality === 'low' || this.isSoftwareGl;
    this.renderer.setPixelRatio(isLow ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && next.enableShadows && next.graphicsQuality === 'high';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private spawnFireworkBurst() {
    if (!this.settings.enableParticles) return;
    const originX = 4.5 + (Math.random() - 0.5) * 6;
    const originY = 9.5 + Math.random() * 2.5;
    const originZ = 5.5 + (Math.random() - 0.5) * 5;
    this.fireworkSparks.forEach((s, i) => {
      s.mesh.visible = true;
      s.mesh.position.set(originX, originY, originZ);
      const phi = Math.acos(1 - (2 * (i + 0.5)) / this.fireworkSparks.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const spd = 3.5 + (i % 3) * 0.8;
      s.vel.set(
        Math.sin(phi) * Math.cos(theta) * spd,
        Math.cos(phi) * spd,
        Math.sin(phi) * Math.sin(theta) * spd,
      );
      s.maxLife = 1.2 + (i % 4) * 0.15;
      s.life = s.maxLife;
    });
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    if (!sync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const poll = () => {
      if (this.disposed) {
        gl.deleteSync(sync);
        return;
      }
      const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (this.disposed) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    if (!this.contextLost) {
      this.oceanTimeUniform.value = elapsed;

      // Gentle camera drift on Home screen if user is not dragging
      if (this.currentPreset === 'home' && this.isCameraTransitioning) {
        _v1.set(
          Math.sin(elapsed * 0.16) * 10 - 2,
          14.5 + Math.sin(elapsed * 0.25) * 1.2,
          29.5 + Math.cos(elapsed * 0.16) * 4,
        );
        this.camera.position.lerp(_v1, 1 - Math.exp(-2.5 * dt));
        this.controls.target.lerp(this.camTargetLook, 1 - Math.exp(-3.5 * dt));
      } else if (this.isCameraTransitioning) {
        this.camera.position.lerp(this.camTargetPos, 1 - Math.exp(-4.5 * dt));
        this.controls.target.lerp(this.camTargetLook, 1 - Math.exp(-5.0 * dt));
        if (this.camera.position.distanceTo(this.camTargetPos) < 0.08) {
          this.isCameraTransitioning = false;
        }
      }
      this.controls.update();

      // Clouds drift
      for (const c of this.clouds) {
        c.group.position.x += c.speed * dt;
        if (c.group.position.x > 42) c.group.position.x = -42;
      }

      // Palm trees gentle sway
      for (const p of this.palmTrees) {
        p.group.rotation.z = Math.sin(elapsed * 1.3 + p.phase) * 0.035;
      }

      // Floating gold coins
      for (const fc of this.floatingCoins) {
        fc.mesh.rotation.y += dt * 1.8;
        fc.mesh.position.y = fc.baseY + Math.sin(elapsed * 2.2 + fc.phase) * 0.24;
      }

      // Waterfall shimmer
      for (let i = 0; i < this.waterfallStrips.length; i++) {
        const wf = this.waterfallStrips[i];
        wf.position.y -= dt * 0.45;
        if (wf.position.y < 0.8) wf.position.y = 3.6 - i * 0.6;
      }

      // Volcano smoke rising
      for (const puff of this.smokePuffs) {
        puff.mesh.visible = this.settings.enableParticles;
        if (this.settings.enableParticles) {
          const cycle = (elapsed * 0.55 + puff.phase) % 3.2;
          puff.mesh.position.y = puff.basePos.y + cycle * 1.1;
          puff.mesh.position.x = puff.basePos.x + Math.sin(elapsed + puff.phase) * 0.35;
          const sc = 0.6 + cycle * 0.32;
          puff.mesh.scale.setScalar(sc);
        }
      }

      // Smooth team pawns along 3D trail
      let pawnIndex = 0;
      const pawnCount = Math.max(this.teamPawns.size, 1);
      for (const entry of this.teamPawns.values()) {
        entry.currentT = THREE.MathUtils.damp(entry.currentT, entry.targetT, 4.5, dt);
        this.trailCurve.getPointAt(THREE.MathUtils.clamp(entry.currentT, 0, 1), _v2);
        const angle = (pawnIndex / pawnCount) * Math.PI * 2;
        const spread = pawnCount > 1 ? 0.48 : 0;
        entry.group.position.set(
          _v2.x + Math.cos(angle) * spread,
          _v2.y + Math.sin(elapsed * 3 + pawnIndex) * 0.08,
          _v2.z + Math.sin(angle) * spread,
        );
        entry.group.rotation.y += dt * 1.2;
        pawnIndex++;
      }

      // MC 3D animation
      this.mcRig.update(this.mcState, elapsed, dt);

      // Giant Treasure Chest Finale Sequence
      this.chestDiamond.rotation.y += dt * 1.6;
      if (this.chestOpening) {
        if (this.chestShakeTime > 0) {
          this.chestShakeTime -= dt;
          this.chestGroup.position.x = 4.5 + Math.sin(elapsed * 42) * 0.07;
        } else {
          this.chestGroup.position.x = 4.5;
          this.chestOpenProgress = Math.min(this.chestOpenProgress + dt * 0.9, 1);
          const eased = 1 - Math.pow(1 - this.chestOpenProgress, 3);
          this.chestLidPivot.rotation.x = -eased * 1.85;

          const beamMat = this.chestBeamMesh.material as THREE.MeshBasicMaterial;
          beamMat.opacity = eased * 0.36;
          this.chestBeaconLight.intensity = 2.2 + eased * 4.5;
          this.chestDiamond.position.y = 1.25 + eased * 1.15;

          this.keyLight.intensity = THREE.MathUtils.damp(
            this.keyLight.intensity,
            0.9,
            3,
            dt,
          );
          this.hemiLight.intensity = THREE.MathUtils.damp(
            this.hemiLight.intensity,
            0.45,
            3,
            dt,
          );

          if (this.settings.enableParticles) {
            this.fireworksTimer -= dt;
            if (this.fireworksTimer <= 0) {
              this.spawnFireworkBurst();
              this.fireworksTimer = 1.35;
            }
          }
        }
      } else {
        this.keyLight.intensity = THREE.MathUtils.damp(
          this.keyLight.intensity,
          this.baseKeyIntensity,
          4,
          dt,
        );
        this.hemiLight.intensity = THREE.MathUtils.damp(
          this.hemiLight.intensity,
          this.baseHemiIntensity,
          4,
          dt,
        );
        this.chestBeaconLight.intensity = 2.0 + Math.sin(elapsed * 2.5) * 0.5;
      }

      // Burst coins physics
      for (const c of this.burstCoins) {
        if (!c.active) continue;
        c.vel.y -= 9.5 * dt;
        c.mesh.position.addScaledVector(c.vel, dt);
        c.mesh.rotation.y += c.rotSpeed * dt;
        c.mesh.rotation.x += c.rotSpeed * 0.5 * dt;
        if (c.mesh.position.y < 3.85) {
          c.mesh.position.y = 3.85;
          c.vel.y *= -0.42;
          c.vel.x *= 0.72;
          c.vel.z *= 0.72;
          if (Math.abs(c.vel.y) < 0.35) {
            c.vel.set(0, 0, 0);
          }
        }
      }

      // Firework sparks physics
      for (const s of this.fireworkSparks) {
        if (s.life <= 0) {
          s.mesh.visible = false;
          continue;
        }
        s.life -= dt;
        s.vel.y -= 3.2 * dt;
        s.mesh.position.addScaledVector(s.vel, dt);
        const mat = s.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, s.life / s.maxLife);
      }

      // Keep dummy reference cleanly unused-free
      _dummy.position.set(0, 0, 0);

      this.renderer.render(this.scene, this.camera);
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener(
      'webglcontextrestored',
      this.onContextRestored,
    );
    this.controls.dispose();
    this.textures.dispose();
    this.envRT?.dispose();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
