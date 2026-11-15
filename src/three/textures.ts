import * as THREE from 'three';

function makeCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export interface ProceduralTextureSet {
  sandMap: THREE.CanvasTexture;
  grassMap: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
  woodMap: THREE.CanvasTexture;
  lavaMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Golden Beach Sand
  const [sandC, sandCtx] = makeCanvas(256);
  sandCtx.fillStyle = '#f2d388';
  sandCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    sandCtx.fillStyle = i % 3 === 0 ? 'rgba(255,246,223,0.35)' : 'rgba(205,160,72,0.28)';
    sandCtx.fillRect(x, y, 2, 2);
  }
  const sandMap = new THREE.CanvasTexture(sandC);
  sandMap.wrapS = sandMap.wrapT = THREE.RepeatWrapping;
  sandMap.repeat.set(6, 6);
  sandMap.colorSpace = THREE.SRGBColorSpace;
  sandMap.anisotropy = maxAnisotropy;

  // 2. Lush Tropical Grass
  const [grassC, grassCtx] = makeCanvas(256);
  grassCtx.fillStyle = '#2d9b5f';
  grassCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1200; i++) {
    const x = (i * 97) % 256;
    const y = (i * 53) % 256;
    grassCtx.fillStyle = i % 2 === 0 ? 'rgba(97,221,181,0.22)' : 'rgba(22,102,58,0.28)';
    grassCtx.fillRect(x, y, 4, 4);
  }
  const grassMap = new THREE.CanvasTexture(grassC);
  grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
  grassMap.repeat.set(8, 8);
  grassMap.colorSpace = THREE.SRGBColorSpace;
  grassMap.anisotropy = maxAnisotropy;

  // 3. Ancient Temple Stone Tiles
  const [stoneC, stoneCtx] = makeCanvas(256);
  stoneCtx.fillStyle = '#b9b4a8';
  stoneCtx.fillRect(0, 0, 256, 256);
  stoneCtx.strokeStyle = 'rgba(72,68,62,0.45)';
  stoneCtx.lineWidth = 4;
  for (let row = 0; row < 4; row++) {
    const y = row * 64;
    stoneCtx.strokeRect(0, y, 256, 64);
    const offset = (row % 2) * 32;
    for (let col = 0; col < 4; col++) {
      stoneCtx.strokeRect((col * 64 + offset) % 256, y, 64, 64);
    }
  }
  for (let i = 0; i < 600; i++) {
    stoneCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(40,40,40,0.12)';
    stoneCtx.fillRect((i * 89) % 256, (i * 41) % 256, 3, 3);
  }
  const stoneMap = new THREE.CanvasTexture(stoneC);
  stoneMap.wrapS = stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.repeat.set(3, 3);
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.anisotropy = maxAnisotropy;

  // 4. Warm Wood Planks (for Bridge, Gate & Chest)
  const [woodC, woodCtx] = makeCanvas(256);
  woodCtx.fillStyle = '#8b5228';
  woodCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    woodCtx.fillStyle = y % 64 === 0 ? '#9c5d2f' : '#7d4822';
    woodCtx.fillRect(0, y, 256, 30);
    woodCtx.fillStyle = 'rgba(42,20,6,0.45)';
    woodCtx.fillRect(0, y + 30, 256, 2);
  }
  for (let i = 0; i < 160; i++) {
    woodCtx.fillStyle = 'rgba(55,26,8,0.22)';
    woodCtx.fillRect((i * 47) % 256, (i * 19) % 256, 28, 2);
  }
  const woodMap = new THREE.CanvasTexture(woodC);
  woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping;
  woodMap.colorSpace = THREE.SRGBColorSpace;
  woodMap.anisotropy = maxAnisotropy;

  // 5. Glowing Molten Lava Veins
  const [lavaC, lavaCtx] = makeCanvas(256);
  const grad = lavaCtx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#ff4d00');
  grad.addColorStop(0.5, '#ff9f1c');
  grad.addColorStop(1, '#ff3b00');
  lavaCtx.fillStyle = grad;
  lavaCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 45; i++) {
    lavaCtx.fillStyle = i % 2 === 0 ? 'rgba(255,235,120,0.55)' : 'rgba(120,18,0,0.45)';
    lavaCtx.beginPath();
    lavaCtx.arc((i * 61) % 256, (i * 97) % 256, 8 + (i % 12), 0, Math.PI * 2);
    lavaCtx.fill();
  }
  const lavaMap = new THREE.CanvasTexture(lavaC);
  lavaMap.wrapS = lavaMap.wrapT = THREE.RepeatWrapping;
  lavaMap.colorSpace = THREE.SRGBColorSpace;
  lavaMap.anisotropy = maxAnisotropy;

  // 6. Soft Radial Contact Shadow Decal
  const [shadC, shadCtx] = makeCanvas(128);
  const rad = shadCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
  rad.addColorStop(0, 'rgba(4, 20, 30, 0.55)');
  rad.addColorStop(0.55, 'rgba(4, 20, 30, 0.22)');
  rad.addColorStop(1, 'rgba(4, 20, 30, 0)');
  shadCtx.fillStyle = rad;
  shadCtx.fillRect(0, 0, 128, 128);
  const contactShadowMap = new THREE.CanvasTexture(shadC);

  return {
    sandMap,
    grassMap,
    stoneMap,
    woodMap,
    lavaMap,
    contactShadowMap,
    dispose: () => {
      sandMap.dispose();
      grassMap.dispose();
      stoneMap.dispose();
      woodMap.dispose();
      lavaMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
