import * as THREE from 'three';
import { ShoeShape } from './products';

export interface ShoePartRig {
  name: string;
  label: string;
  mesh: THREE.Object3D;
  assembledPos: THREE.Vector3;
  explodedOffset: THREE.Vector3;
  assembledRot: THREE.Euler;
  explodedRot: THREE.Euler;
}

export interface ProceduralShoeRig {
  root: THREE.Group;
  parts: ShoePartRig[];
  materials: {
    upper: THREE.MeshPhysicalMaterial;
    accent: THREE.MeshPhysicalMaterial;
    sole: THREE.MeshStandardMaterial;
    welt: THREE.MeshStandardMaterial;
    insole: THREE.MeshStandardMaterial;
    metal: THREE.MeshPhysicalMaterial;
    lace: THREE.MeshStandardMaterial;
  };
  setFinish: (upperHex: string, soleHex: string, isSuede?: boolean) => void;
  dispose: () => void;
}

function createLeatherTextures(maxAniso: number): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 256;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Subtle organic leather pebble grain
  for (let i = 0; i < 4200; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const px = Math.abs(x) * size;
    const py = Math.abs(y) * size;
    const r = 0.8 + (i % 3) * 0.55;
    const shade = 105 + (i % 50);
    bCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
    bCtx.beginPath();
    bCtx.arc(px, py, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);
  bumpMap.anisotropy = maxAniso;

  const roughMap = new THREE.CanvasTexture(bumpCanvas);
  roughMap.wrapS = THREE.RepeatWrapping;
  roughMap.wrapT = THREE.RepeatWrapping;
  roughMap.repeat.set(4, 4);
  roughMap.anisotropy = maxAniso;

  return { bumpMap, roughnessMap: roughMap };
}

function createWeltStitchTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#241710';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#D4AF6A';
  for (let x = 6; x < 256; x += 14) {
    ctx.fillRect(x, 26, 8, 6);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 1);
  tex.anisotropy = maxAniso;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
  grad.addColorStop(0, 'rgba(0,0,0,0.68)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Foot outline half-width function at normalized length t in [0 (heel), 1 (toe)]
function footHalfWidth(t: number, isSneaker: boolean): number {
  const base = isSneaker ? 1.12 : 1.0;
  if (t < 0.25) {
    // Heel curve
    const u = t / 0.25;
    return (0.24 + 0.14 * Math.sin((u * Math.PI) / 2)) * base;
  }
  if (t < 0.55) {
    // Midfoot arch taper
    const u = (t - 0.25) / 0.3;
    return (0.38 - 0.05 * Math.sin(u * Math.PI) + 0.08 * u) * base;
  }
  if (t < 0.85) {
    // Forefoot ball
    const u = (t - 0.55) / 0.3;
    return (0.46 + 0.03 * Math.sin(u * Math.PI)) * base;
  }
  // Almond toe taper
  const u = (t - 0.85) / 0.15;
  return 0.46 * Math.cos((u * Math.PI) / 2) * 0.94 * base + 0.05;
}

// Foot centerline lateral curve (slight anatomical S-curve)
function footCenterX(t: number): number {
  return Math.sin(t * Math.PI * 1.4) * 0.05;
}

function createFootShape(scale = 1, isSneaker = false): THREE.Shape {
  const shape = new THREE.Shape();
  const steps = 40;
  const length = 2.4 * scale;

  const rightPts: THREE.Vector2[] = [];
  const leftPts: THREE.Vector2[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = (t - 0.5) * length;
    const cx = footCenterX(t) * scale;
    const hw = footHalfWidth(t, isSneaker) * scale;
    rightPts.push(new THREE.Vector2(cx + hw, z));
    leftPts.push(new THREE.Vector2(cx - hw * 0.92, z));
  }

  shape.moveTo(rightPts[0].x, rightPts[0].y);
  for (let i = 1; i < rightPts.length; i++) {
    shape.lineTo(rightPts[i].x, rightPts[i].y);
  }
  for (let i = leftPts.length - 1; i >= 0; i--) {
    shape.lineTo(leftPts[i].x, leftPts[i].y);
  }
  shape.closePath();
  return shape;
}

// Builds a smooth organic sculpted 3D shoe upper BufferGeometry
function createSculptedUpperGeometry(shapeType: ShoeShape): THREE.BufferGeometry {
  const lenSegs = 36;
  const arcSegs = 22;
  const length = 2.32;
  const isSneaker = shapeType === 'sneaker' || shapeType === 'runner';
  const isSlipper = shapeType === 'slipper';
  const isLoafer = shapeType === 'loafer';

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lenSegs; i++) {
    const t = i / lenSegs; // 0 = heel, 1 = toe
    const z = (t - 0.5) * length;
    const cx = footCenterX(t);
    const hw = footHalfWidth(t, isSneaker) * 0.96;

    // Height profile along shoe length
    let maxHeight = 0.42;
    if (t < 0.34) {
      // Collar / heel cup height
      const collarDip = isSlipper ? 0.16 : isLoafer ? 0.42 : isSneaker ? 0.56 : 0.5;
      maxHeight = collarDip + 0.14 * Math.sin((t / 0.34) * Math.PI * 0.5);
    } else if (t < 0.68) {
      // Instep / vamp slope
      const u = (t - 0.34) / 0.34;
      const startH = isSlipper ? 0.42 : isSneaker ? 0.68 : 0.64;
      maxHeight = THREE.MathUtils.lerp(startH, 0.33, Math.pow(u, 0.9));
    } else {
      // Toe box curve down to welt
      const u = (t - 0.68) / 0.32;
      maxHeight = 0.33 * Math.cos((u * Math.PI) / 2) + 0.04;
    }

    // Hollow collar opening dip at ankle (t in [0.06, 0.34])
    const isCollarZone = t > 0.05 && t < 0.36;

    for (let j = 0; j <= arcSegs; j++) {
      const s = j / arcSegs; // 0 = right sole edge, 0.5 = top ridge, 1 = left sole edge
      const angle = s * Math.PI;
      const xOffset = Math.cos(angle) * hw;
      let y = Math.sin(angle) * maxHeight;

      // Sculpted toe box fullness
      if (t > 0.72) {
        y *= 0.88 + 0.12 * Math.sin(angle);
      }

      // Ankle opening indentation for realism
      if (isCollarZone && s > 0.25 && s < 0.75) {
        const openingDepth = Math.sin(((t - 0.05) / 0.31) * Math.PI);
        const sideFactor = Math.sin(((s - 0.25) / 0.5) * Math.PI);
        y -= openingDepth * sideFactor * (isSlipper ? 0.26 : 0.19);
      }

      // Slight heel spring
      const heelRise = t < 0.2 ? (0.2 - t) * 0.08 : 0;

      positions.push(cx + xOffset, Math.max(0.0, y) + heelRise, z);
      uvs.push(t * 2, s);
    }
  }

  for (let i = 0; i < lenSegs; i++) {
    for (let j = 0; j < arcSegs; j++) {
      const a = i * (arcSegs + 1) + j;
      const b = (i + 1) * (arcSegs + 1) + j;
      const c = (i + 1) * (arcSegs + 1) + (j + 1);
      const d = i * (arcSegs + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Builds a curved toe cap or mudguard overlay
function createToeCapGeometry(isSneaker: boolean): THREE.BufferGeometry {
  const lenSegs = 14;
  const arcSegs = 18;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lenSegs; i++) {
    const u = i / lenSegs;
    const t = 0.68 + u * 0.32;
    const z = (t - 0.5) * 2.34;
    const cx = footCenterX(t);
    const hw = footHalfWidth(t, isSneaker) * 0.985;
    const maxHeight = 0.345 * Math.cos((u * Math.PI) / 2) + 0.045;

    for (let j = 0; j <= arcSegs; j++) {
      const s = j / arcSegs;
      const angle = s * Math.PI;
      const x = cx + Math.cos(angle) * hw;
      const y = Math.sin(angle) * maxHeight;
      positions.push(x, y, z);
      uvs.push(u, s);
    }
  }

  for (let i = 0; i < lenSegs; i++) {
    for (let j = 0; j < arcSegs; j++) {
      const a = i * (arcSegs + 1) + j;
      const b = (i + 1) * (arcSegs + 1) + j;
      const c = (i + 1) * (arcSegs + 1) + (j + 1);
      const d = i * (arcSegs + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildProceduralShoe(
  shapeType: ShoeShape,
  upperHex: string,
  soleHex: string,
  maxAnisotropy: number
): ProceduralShoeRig {
  const isSneaker = shapeType === 'sneaker' || shapeType === 'runner';
  const isSlipper = shapeType === 'slipper';
  const isLoafer = shapeType === 'loafer';

  const { bumpMap, roughnessMap } = createLeatherTextures(maxAnisotropy);
  const weltTex = createWeltStitchTexture(maxAnisotropy);
  const shadowTex = createContactShadowTexture();

  const upperMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(upperHex),
    roughness: isSlipper ? 0.78 : 0.34,
    metalness: 0.04,
    clearcoat: isSlipper ? 0.0 : 0.28,
    clearcoatRoughness: 0.25,
    bumpMap,
    bumpScale: isSlipper ? 0.015 : 0.008,
    roughnessMap,
    sheen: isSlipper ? 0.55 : 0.12,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#E8D3B0'),
    side: THREE.DoubleSide,
  });

  const accentMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(upperHex).offsetHSL(0, 0.04, -0.06),
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.42,
    clearcoatRoughness: 0.18,
    bumpMap,
    bumpScale: 0.006,
    side: THREE.DoubleSide,
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(soleHex),
    roughness: isSneaker ? 0.62 : 0.45,
    metalness: 0.05,
  });

  const weltMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3A2518'),
    map: weltTex,
    roughness: 0.42,
    metalness: 0.12,
  });

  const insoleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C89B62'),
    roughness: 0.68,
    metalness: 0.05,
    bumpMap,
    bumpScale: 0.004,
  });

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D8B467'),
    metalness: 0.94,
    roughness: 0.18,
    anisotropy: 0.75,
    clearcoat: 0.3,
  });

  const laceMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(isSneaker ? '#EDE6D8' : '#261810'),
    roughness: 0.55,
    metalness: 0.04,
  });

  const root = new THREE.Group();
  const parts: ShoePartRig[] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  // 1. OUTSOLE + HEEL STACK
  const soleGroup = new THREE.Group();
  const soleShape = createFootShape(1.04, isSneaker);
  const soleGeo = new THREE.ExtrudeGeometry(soleShape, {
    depth: isSneaker ? 0.16 : 0.085,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 24,
  });
  soleGeo.rotateX(Math.PI / 2);
  geometriesToDispose.push(soleGeo);
  const soleMesh = new THREE.Mesh(soleGeo, soleMat);
  soleMesh.castShadow = true;
  soleMesh.receiveShadow = true;
  soleGroup.add(soleMesh);

  if (!isSneaker) {
    // Stacked leather dress heel block
    const heelBlockGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.15, 24);
    heelBlockGeo.scale(1, 1, 1.32);
    geometriesToDispose.push(heelBlockGeo);
    const heelBlock = new THREE.Mesh(heelBlockGeo, soleMat);
    heelBlock.position.set(0.02, -0.13, -0.82);
    heelBlock.castShadow = true;
    soleGroup.add(heelBlock);
  }

  root.add(soleGroup);
  parts.push({
    name: 'sole',
    label: 'Sculpted Outsole & Heel',
    mesh: soleGroup,
    assembledPos: new THREE.Vector3(0, -0.02, 0),
    explodedOffset: new THREE.Vector3(0, -0.78, 0.12),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(0.14, -0.18, 0.05),
  });

  // 2. GOODYEAR WELT
  const weltShape = createFootShape(1.055, isSneaker);
  const weltGeo = new THREE.ExtrudeGeometry(weltShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.014,
    bevelSegments: 2,
  });
  weltGeo.rotateX(Math.PI / 2);
  geometriesToDispose.push(weltGeo);
  const weltMesh = new THREE.Mesh(weltGeo, weltMat);
  weltMesh.castShadow = true;
  root.add(weltMesh);
  parts.push({
    name: 'welt',
    label: '360° Stitched Welt',
    mesh: weltMesh,
    assembledPos: new THREE.Vector3(0, 0.022, 0),
    explodedOffset: new THREE.Vector3(-0.35, -0.38, -0.12),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(-0.08, 0.22, -0.06),
  });

  // 3. INNER FOOTBED / PADDING
  const insoleGroup = new THREE.Group();
  const insoleShape = createFootShape(0.89, isSneaker);
  const insoleGeo = new THREE.ExtrudeGeometry(insoleShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
  });
  insoleGeo.rotateX(Math.PI / 2);
  geometriesToDispose.push(insoleGeo);
  const insoleMesh = new THREE.Mesh(insoleGeo, insoleMat);
  insoleMesh.receiveShadow = true;
  insoleGroup.add(insoleMesh);

  // Brushed gold atelier crest on heel pad
  const crestGeo = new THREE.BoxGeometry(0.18, 0.012, 0.24);
  geometriesToDispose.push(crestGeo);
  const crestMesh = new THREE.Mesh(crestGeo, metalMat);
  crestMesh.position.set(0.02, 0.008, -0.68);
  insoleGroup.add(crestMesh);

  root.add(insoleGroup);
  parts.push({
    name: 'insole',
    label: 'Contoured Cork & Leather Footbed',
    mesh: insoleGroup,
    assembledPos: new THREE.Vector3(0, 0.075, 0),
    explodedOffset: new THREE.Vector3(0.45, 0.32, -0.15),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(0.12, 0.16, 0.1),
  });

  // 4. UPPER LEATHER BODY
  const upperGeo = createSculptedUpperGeometry(shapeType);
  geometriesToDispose.push(upperGeo);
  const upperMesh = new THREE.Mesh(upperGeo, upperMat);
  upperMesh.castShadow = true;
  upperMesh.receiveShadow = true;
  root.add(upperMesh);
  parts.push({
    name: 'upper',
    label: 'Full-Grain Calfskin Upper',
    mesh: upperMesh,
    assembledPos: new THREE.Vector3(0, 0.01, 0),
    explodedOffset: new THREE.Vector3(0, 0.26, 0),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(-0.04, 0.08, 0),
  });

  // 5. TOE CAP / MEDALLION OVERLAY
  const toeCapGeo = createToeCapGeometry(isSneaker);
  geometriesToDispose.push(toeCapGeo);
  const toeCapMesh = new THREE.Mesh(toeCapGeo, accentMat);
  toeCapMesh.castShadow = true;
  root.add(toeCapMesh);
  parts.push({
    name: 'toecap',
    label: 'Burnished Cap-Toe Panel',
    mesh: toeCapMesh,
    assembledPos: new THREE.Vector3(0, 0.014, 0.01),
    explodedOffset: new THREE.Vector3(0.2, 0.12, 0.82),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(0.15, 0.25, -0.08),
  });

  // 6. HEEL COUNTER & COLLAR STABILIZER
  const heelGroup = new THREE.Group();
  const heelGeo = new THREE.CylinderGeometry(
    0.34,
    0.36,
    isSlipper ? 0.16 : 0.36,
    24,
    1,
    true,
    Math.PI * 0.65,
    Math.PI * 0.7
  );
  geometriesToDispose.push(heelGeo);
  const heelMesh = new THREE.Mesh(
    heelGeo,
    shapeType === 'runner' ? metalMat : accentMat
  );
  heelMesh.rotation.y = Math.PI;
  heelMesh.position.set(0.02, isSlipper ? 0.12 : 0.24, -0.82);
  heelMesh.castShadow = true;
  heelGroup.add(heelMesh);

  root.add(heelGroup);
  parts.push({
    name: 'heel',
    label: 'Architectural Heel Counter',
    mesh: heelGroup,
    assembledPos: new THREE.Vector3(0, 0.01, 0),
    explodedOffset: new THREE.Vector3(-0.22, 0.18, -0.78),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(-0.18, -0.25, 0.05),
  });

  // 7. TONGUE OR BUCKLE STRAP
  const tongueGroup = new THREE.Group();
  if (isSlipper || isLoafer) {
    // Strap + Brushed Gold Buckle / Medallion
    const strapGeo = new THREE.BoxGeometry(0.74, 0.045, 0.18);
    geometriesToDispose.push(strapGeo);
    const strap = new THREE.Mesh(strapGeo, accentMat);
    strap.position.set(0.02, 0.43, 0.15);
    strap.rotation.x = 0.28;
    strap.castShadow = true;
    tongueGroup.add(strap);

    const buckleGeo = isSlipper
      ? new THREE.TorusGeometry(0.085, 0.018, 12, 24)
      : new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24);
    geometriesToDispose.push(buckleGeo);
    const buckle = new THREE.Mesh(buckleGeo, metalMat);
    buckle.position.set(isSlipper ? -0.31 : 0.02, 0.46, 0.16);
    buckle.rotation.y = isSlipper ? Math.PI / 2 : 0;
    buckle.rotation.x = isSlipper ? 0 : 0.28;
    tongueGroup.add(buckle);
  } else {
    // Curved padded leather tongue
    const tongueGeo = new THREE.BoxGeometry(0.32, 0.42, 0.055, 6, 8, 1);
    const pos = tongueGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      pos.setZ(i, pos.getZ(i) + Math.pow(y + 0.2, 2) * 0.22 - Math.abs(x) * 0.18);
    }
    tongueGeo.computeVertexNormals();
    geometriesToDispose.push(tongueGeo);

    const tongueMesh = new THREE.Mesh(tongueGeo, accentMat);
    tongueMesh.position.set(0.03, 0.52, 0.12);
    tongueMesh.rotation.x = -0.58;
    tongueMesh.castShadow = true;
    tongueGroup.add(tongueMesh);
  }

  root.add(tongueGroup);
  parts.push({
    name: 'tongue',
    label: isSlipper || isLoafer ? 'Brass Buckle Strap' : 'Padded Leather Tongue',
    mesh: tongueGroup,
    assembledPos: new THREE.Vector3(0, 0, 0),
    explodedOffset: new THREE.Vector3(0.05, 0.85, 0.24),
    assembledRot: new THREE.Euler(0, 0, 0),
    explodedRot: new THREE.Euler(0.22, -0.15, 0.12),
  });

  // 8. METALLIC EYELETS (InstancedMesh) & 9. WAXED SHOELACES (for laced silhouettes)
  if (!isSlipper && !isLoafer) {
    const eyeletGeo = new THREE.TorusGeometry(0.022, 0.007, 10, 18);
    geometriesToDispose.push(eyeletGeo);
    const eyeletCount = 10;
    const eyeletInst = new THREE.InstancedMesh(eyeletGeo, metalMat, eyeletCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < 5; i++) {
      const z = -0.02 + i * 0.115;
      const y = 0.56 - i * 0.042;
      const spread = 0.145 + i * 0.006;

      // Right side eyelet
      dummy.position.set(0.03 + spread, y, z);
      dummy.rotation.set(Math.PI / 2 - 0.3, 0.25, 0);
      dummy.updateMatrix();
      eyeletInst.setMatrixAt(i * 2, dummy.matrix);

      // Left side eyelet
      dummy.position.set(0.03 - spread, y, z);
      dummy.rotation.set(Math.PI / 2 - 0.3, -0.25, 0);
      dummy.updateMatrix();
      eyeletInst.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    eyeletInst.instanceMatrix.needsUpdate = true;
    eyeletInst.computeBoundingSphere();

    root.add(eyeletInst);
    parts.push({
      name: 'eyelets',
      label: 'Brushed-Gold Eyelets',
      mesh: eyeletInst,
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedOffset: new THREE.Vector3(-0.55, 0.62, 0.3),
      assembledRot: new THREE.Euler(0, 0, 0),
      explodedRot: new THREE.Euler(0.1, 0.3, -0.15),
    });

    // Crossed Shoelaces using TubeGeometry
    const lacesGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const z1 = -0.02 + i * 0.115;
      const z2 = -0.02 + (i + 1) * 0.115;
      const y1 = 0.575 - i * 0.042;
      const y2 = 0.575 - (i + 1) * 0.042;
      const s1 = 0.14 + i * 0.006;
      const s2 = 0.14 + (i + 1) * 0.006;

      const curveA = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03 + s1, y1, z1),
        new THREE.Vector3(0.03, (y1 + y2) * 0.5 + 0.025, (z1 + z2) * 0.5),
        new THREE.Vector3(0.03 - s2, y2, z2),
      ]);
      const tubeA = new THREE.TubeGeometry(curveA, 14, 0.013, 8, false);
      geometriesToDispose.push(tubeA);
      lacesGroup.add(new THREE.Mesh(tubeA, laceMat));

      const curveB = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03 - s1, y1, z1),
        new THREE.Vector3(0.03, (y1 + y2) * 0.5 + 0.015, (z1 + z2) * 0.5),
        new THREE.Vector3(0.03 + s2, y2, z2),
      ]);
      const tubeB = new THREE.TubeGeometry(curveB, 14, 0.013, 8, false);
      geometriesToDispose.push(tubeB);
      lacesGroup.add(new THREE.Mesh(tubeB, laceMat));
    }

    root.add(lacesGroup);
    parts.push({
      name: 'laces',
      label: 'Waxed Cotton Laces',
      mesh: lacesGroup,
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedOffset: new THREE.Vector3(0.32, 1.05, 0.45),
      assembledRot: new THREE.Euler(0, 0, 0),
      explodedRot: new THREE.Euler(-0.18, 0.35, 0.12),
    });
  }

  // Contact shadow plane grounded under shoe
  const shadowGeo = new THREE.PlaneGeometry(3.2, 4.2);
  shadowGeo.rotateX(-Math.PI / 2);
  geometriesToDispose.push(shadowGeo);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.position.y = -0.24;
  root.add(shadowPlane);

  // Subtle decorative gold pedestal ring
  const ringGeo = new THREE.RingGeometry(1.42, 1.45, 64);
  ringGeo.rotateX(-Math.PI / 2);
  geometriesToDispose.push(ringGeo);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc9a461,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = -0.235;
  root.add(ringMesh);

  return {
    root,
    parts,
    materials: {
      upper: upperMat,
      accent: accentMat,
      sole: soleMat,
      welt: weltMat,
      insole: insoleMat,
      metal: metalMat,
      lace: laceMat,
    },
    setFinish(newUpperHex: string, newSoleHex: string, isSuedeMode = false) {
      upperMat.color.set(newUpperHex);
      upperMat.roughness = isSuedeMode ? 0.82 : 0.34;
      upperMat.clearcoat = isSuedeMode ? 0.0 : 0.28;
      upperMat.sheen = isSuedeMode ? 0.65 : 0.12;
      accentMat.color.set(newUpperHex).offsetHSL(0, 0.03, -0.05);
      soleMat.color.set(newSoleHex);
    },
    dispose() {
      geometriesToDispose.forEach((g) => g.dispose());
      bumpMap.dispose();
      roughnessMap.dispose();
      weltTex.dispose();
      shadowTex.dispose();
      upperMat.dispose();
      accentMat.dispose();
      soleMat.dispose();
      weltMat.dispose();
      insoleMat.dispose();
      metalMat.dispose();
      laceMat.dispose();
      shadowMat.dispose();
      ringMat.dispose();
    },
  };
}
