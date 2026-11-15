import * as THREE from 'three';
import type { McAnimationState } from '../types/game';

export interface McCharacterRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  mouthMesh: THREE.Mesh;
  mapScroll: THREE.Group;
  update: (state: McAnimationState, elapsed: number, dt: number) => void;
}

export function createMcCharacter(contactShadowMap: THREE.Texture): McCharacterRig {
  const root = new THREE.Group();
  root.name = 'MC_Explorer';

  // Ground contact shadow
  const shadowGeo = new THREE.PlaneGeometry(1.5, 1.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowMap,
    transparent: true,
    depthWrite: false,
    opacity: 0.5,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  root.add(shadowPlane);

  // Materials (varied roughness & metalness)
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffcfa8,
    roughness: 0.65,
    metalness: 0.02,
  });
  const tunicMat = new THREE.MeshStandardMaterial({
    color: 0x238b55,
    roughness: 0.72,
    metalness: 0.05,
  });
  const vestMat = new THREE.MeshStandardMaterial({
    color: 0xd99b43,
    roughness: 0.68,
    metalness: 0.08,
  });
  const shortsMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.8,
    metalness: 0.04,
  });
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x4e321a,
    roughness: 0.55,
    metalness: 0.1,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    roughness: 0.2,
    metalness: 0.9,
  });
  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x087e9a,
    roughness: 0.7,
    metalness: 0.08,
  });
  const hatMat = new THREE.MeshStandardMaterial({
    color: 0xc98a3b,
    roughness: 0.75,
    metalness: 0.05,
  });
  const hatBandMat = new THREE.MeshStandardMaterial({
    color: 0xff9f43,
    roughness: 0.5,
    metalness: 0.12,
  });
  const darkEyeMat = new THREE.MeshStandardMaterial({
    color: 0x16212c,
    roughness: 0.15,
    metalness: 0.1,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.0,
  });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xff8a7a,
    roughness: 0.8,
    metalness: 0.0,
  });

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // 1. Legs & Explorer Boots (bottom-center pivot at y=0)
  const makeLeg = (xOffset: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(xOffset, 0.58, 0);

    const upperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.1, 0.34, 12),
      shortsMat,
    );
    upperLeg.position.y = -0.15;
    upperLeg.castShadow = true;
    legPivot.add(upperLeg);

    const lowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.08, 0.22, 12),
      skinMat,
    );
    lowerLeg.position.y = -0.36;
    legPivot.add(lowerLeg);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.18, 0.28),
      bootMat,
    );
    boot.position.set(0, -0.49, 0.04);
    boot.castShadow = true;
    legPivot.add(boot);

    return legPivot;
  };

  const leftLegPivot = makeLeg(-0.18);
  const rightLegPivot = makeLeg(0.18);
  bodyPivot.add(leftLegPivot, rightLegPivot);

  // 2. Torso + Adventurer Vest + Belt + Gold Buckle
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.34, 0.68, 16),
    tunicMat,
  );
  torso.position.y = 0.92;
  torso.castShadow = true;
  bodyPivot.add(torso);

  const vest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.305, 0.35, 0.5, 16, 1, false, 0.35, Math.PI * 1.65),
    vestMat,
  );
  vest.position.y = 0.95;
  vest.rotation.y = Math.PI * 0.68;
  bodyPivot.add(vest);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.355, 0.36, 0.1, 16),
    bootMat,
  );
  belt.position.y = 0.66;
  bodyPivot.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.06), goldMat);
  buckle.position.set(0, 0.66, 0.35);
  bodyPivot.add(buckle);

  // 3. Backpack + Rolled Sleeping Mat
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.5, 0.24),
    backpackMat,
  );
  backpack.position.set(0, 0.96, -0.34);
  backpack.castShadow = true;
  bodyPivot.add(backpack);

  const bedroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.52, 12),
    hatBandMat,
  );
  bedroll.rotation.z = Math.PI / 2;
  bedroll.position.set(0, 1.24, -0.34);
  bodyPivot.add(bedroll);

  // 4. Articulated Arms + Map Scroll in Right Hand
  const makeArm = (side: -1 | 1) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.38, 1.18, 0);

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.09, 0.28, 10),
      tunicMat,
    );
    sleeve.position.y = -0.12;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.07, 0.24, 10),
      skinMat,
    );
    forearm.position.y = -0.34;
    armPivot.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), skinMat);
    hand.position.y = -0.47;
    armPivot.add(hand);

    return armPivot;
  };

  const leftArmPivot = makeArm(-1);
  const rightArmPivot = makeArm(1);
  bodyPivot.add(leftArmPivot, rightArmPivot);

  // Treasure Map in right hand
  const mapScroll = new THREE.Group();
  mapScroll.position.set(0, -0.48, 0.14);
  mapScroll.rotation.x = Math.PI / 2.2;
  const parchmentMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c2,
    roughness: 0.78,
    metalness: 0.02,
  });
  const scrollBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.38, 12),
    parchmentMat,
  );
  const scrollRibbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.06, 12),
    hatBandMat,
  );
  mapScroll.add(scrollBody, scrollRibbon);
  rightArmPivot.add(mapScroll);

  // 5. Head, Friendly Face & Wide-Brimmed Explorer Hat
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.32, 0);
  bodyPivot.add(headGroup);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 12), skinMat);
  neck.position.y = 0.04;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), skinMat);
  head.position.y = 0.32;
  head.castShadow = true;
  headGroup.add(head);

  // Eyes + sparkle
  [-0.11, 0.11].forEach((ex) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), whiteMat);
    eyeWhite.position.set(ex, 0.35, 0.27);
    eyeWhite.scale.set(1, 1.15, 0.6);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.033, 10, 10), darkEyeMat);
    pupil.position.set(ex, 0.35, 0.298);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.022, 0.03), bootMat);
    brow.position.set(ex, 0.43, 0.27);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), cheekMat);
    cheek.position.set(ex * 1.55, 0.27, 0.25);
    cheek.scale.set(1, 0.65, 0.4);
    headGroup.add(eyeWhite, pupil, brow, cheek);
  });

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), skinMat);
  nose.position.set(0, 0.3, 0.32);
  headGroup.add(nose);

  // Animated mouth
  const mouthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xb83b3b, roughness: 0.5 }),
  );
  mouthMesh.position.set(0, 0.21, 0.285);
  mouthMesh.scale.set(1.3, 0.45, 0.5);
  headGroup.add(mouthMesh);

  // Wide-brimmed Explorer Hat
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.56, -0.01);
  hatGroup.rotation.x = -0.12;
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.58, 0.045, 22), hatMat);
  brim.castShadow = true;
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.24, 18), hatMat);
  crown.position.y = 0.13;
  crown.castShadow = true;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.328, 0.06, 18), hatBandMat);
  band.position.y = 0.05;
  const hatStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), goldMat);
  hatStar.position.set(0, 0.12, 0.3);
  hatGroup.add(brim, crown, band, hatStar);
  headGroup.add(hatGroup);

  let currentBounce = 0;

  const update = (state: McAnimationState, elapsed: number, dt: number) => {
    const safeDt = Math.min(dt, 0.05);

    let targetBounce = Math.sin(elapsed * 2.4) * 0.03;
    let targetHeadYaw = Math.sin(elapsed * 1.1) * 0.08;
    let targetHeadPitch = 0;
    let targetLeftArmZ = -0.22 + Math.sin(elapsed * 2) * 0.05;
    let targetRightArmZ = 0.22 - Math.sin(elapsed * 2) * 0.05;
    let targetRightArmX = -0.35;
    let targetLeftArmX = 0;
    let targetBodyRotY = 0;
    let targetMouthScaleY = 0.35;

    switch (state) {
      case 'talking': {
        targetBounce = Math.abs(Math.sin(elapsed * 5)) * 0.04;
        targetHeadYaw = Math.sin(elapsed * 3.2) * 0.14;
        targetRightArmX = -0.85 + Math.sin(elapsed * 6) * 0.22;
        targetLeftArmX = -0.35 + Math.cos(elapsed * 5) * 0.18;
        targetMouthScaleY = 0.45 + Math.abs(Math.sin(elapsed * 14)) * 0.85;
        break;
      }
      case 'happy':
      case 'excited': {
        const speed = state === 'excited' ? 9 : 6.5;
        targetBounce = Math.abs(Math.sin(elapsed * speed)) * 0.22;
        targetLeftArmZ = -2.45 + Math.sin(elapsed * speed) * 0.2;
        targetRightArmZ = 2.45 - Math.sin(elapsed * speed) * 0.2;
        targetRightArmX = -0.2;
        targetHeadPitch = -0.12;
        targetMouthScaleY = 0.9;
        break;
      }
      case 'sad': {
        targetBounce = -0.04;
        targetHeadPitch = 0.22;
        targetHeadYaw = Math.sin(elapsed * 3.5) * 0.18;
        targetLeftArmZ = -0.08;
        targetRightArmZ = 0.08;
        targetRightArmX = 0.1;
        targetMouthScaleY = 0.25;
        break;
      }
      case 'pointing': {
        targetBounce = Math.sin(elapsed * 2.5) * 0.03;
        targetRightArmX = -1.35;
        targetRightArmZ = 0.45;
        targetHeadYaw = -0.2;
        targetMouthScaleY = 0.55;
        break;
      }
      case 'celebrating': {
        targetBounce = Math.abs(Math.sin(elapsed * 8)) * 0.28;
        targetLeftArmZ = -2.6 + Math.sin(elapsed * 10) * 0.25;
        targetRightArmZ = 2.6 - Math.sin(elapsed * 10) * 0.25;
        targetBodyRotY = Math.sin(elapsed * 3) * 0.35;
        targetMouthScaleY = 1.0;
        break;
      }
      case 'idle':
      default:
        break;
    }

    currentBounce = THREE.MathUtils.damp(currentBounce, targetBounce, 10, safeDt);
    bodyPivot.position.y = currentBounce;
    bodyPivot.rotation.y = THREE.MathUtils.damp(
      bodyPivot.rotation.y,
      targetBodyRotY,
      8,
      safeDt,
    );

    headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, targetHeadYaw, 10, safeDt);
    headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, targetHeadPitch, 10, safeDt);

    leftArmPivot.rotation.z = THREE.MathUtils.damp(leftArmPivot.rotation.z, targetLeftArmZ, 12, safeDt);
    leftArmPivot.rotation.x = THREE.MathUtils.damp(leftArmPivot.rotation.x, targetLeftArmX, 12, safeDt);
    rightArmPivot.rotation.z = THREE.MathUtils.damp(rightArmPivot.rotation.z, targetRightArmZ, 12, safeDt);
    rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, targetRightArmX, 12, safeDt);

    mouthMesh.scale.y = THREE.MathUtils.damp(mouthMesh.scale.y, targetMouthScaleY, 18, safeDt);
  };

  return {
    root,
    bodyPivot,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    mouthMesh,
    mapScroll,
    update,
  };
}
