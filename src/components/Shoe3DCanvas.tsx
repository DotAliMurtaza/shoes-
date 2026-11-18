import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, EyeOff, Layers, RotateCw } from 'lucide-react';
import { ShoeShape } from '../lib/products';
import { buildProceduralShoe, ProceduralShoeRig } from '../lib/shoe3dBuilder';

export interface ShoeFinishPreset {
  name: string;
  upperHex: string;
  soleHex: string;
  isSuede?: boolean;
}

export const HERO_FINISHES: ShoeFinishPreset[] = [
  { name: 'Burnished Cognac', upperHex: '#7A3E1D', soleHex: '#261710', isSuede: false },
  { name: 'Obsidian Calf', upperHex: '#191716', soleHex: '#0F0D0C', isSuede: false },
  { name: 'Espresso Suede', upperHex: '#463226', soleHex: '#1F140E', isSuede: true },
  { name: 'Champagne Gold', upperHex: '#B68F4C', soleHex: '#2A1D13', isSuede: false },
];

type CameraPreset = 'hero' | 'profile' | 'top' | 'sole';

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; label: string }> = {
  hero: { pos: [2.75, 1.35, 2.55], label: 'Hero 3/4' },
  profile: { pos: [3.2, 0.45, 0.15], label: 'Profile' },
  top: { pos: [0.1, 3.15, 0.9], label: 'Top View' },
  sole: { pos: [2.1, -0.85, 2.25], label: 'Sole & Welt' },
};

// Pre-allocated math helpers (zero GC inside animation loop)
const _targetPos = new THREE.Vector3();
const _targetCam = new THREE.Vector3();

interface Shoe3DCanvasProps {
  shapeType?: ShoeShape;
  upperHex?: string;
  soleHex?: string;
  scrollProgress?: number;
  allowExplodeControls?: boolean;
  initialExploded?: boolean;
  heightClass?: string;
  showParticles?: boolean;
}

export default function Shoe3DCanvas({
  shapeType = 'oxford',
  upperHex = '#7A3E1D',
  soleHex = '#261710',
  scrollProgress = 0,
  allowExplodeControls = true,
  initialExploded = true,
  heightClass = 'h-full w-full',
  showParticles = true,
}: Shoe3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<ProceduralShoeRig | null>(null);

  const [explodeSlider, setExplodeSlider] = useState<number>(initialExploded ? 1 : 0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedFinishIdx, setSelectedFinishIdx] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<boolean>(false);

  // Refs synced to animation loop so React UI state never resets WebGL
  const targetExplodeRef = useRef<number>(initialExploded ? 1 : 0);
  const currentExplodeRef = useRef<number>(initialExploded ? 1 : 0);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const scrollRef = useRef<number>(scrollProgress);
  const cameraPresetTargetRef = useRef<THREE.Vector3 | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    targetExplodeRef.current = explodeSlider;
  }, [explodeSlider]);

  // Smoothly animate initial assembly on hero load
  useEffect(() => {
    if (!initialExploded) return;
    const timer = window.setTimeout(() => {
      setExplodeSlider(0);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [initialExploded]);

  // Update color finish dynamically
  useEffect(() => {
    if (!rigRef.current) return;
    if (allowExplodeControls) {
      const preset = HERO_FINISHES[selectedFinishIdx];
      rigRef.current.setFinish(preset.upperHex, preset.soleHex, preset.isSuede);
    } else {
      rigRef.current.setFinish(upperHex, soleHex, shapeType === 'slipper');
    }
  }, [selectedFinishIdx, upperHex, soleHex, shapeType, allowExplodeControls]);

  const handleSelectCamera = (preset: CameraPreset) => {
    setCameraPreset(preset);
    const [x, y, z] = CAMERA_PRESETS[preset].pos;
    cameraPresetTargetRef.current = new THREE.Vector3(x, y, z);
    userInteractedRef.current = false;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(2.75, 1.35, 2.55);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.target.set(0, 0.18, 0);
    controls.addEventListener('start', () => {
      userInteractedRef.current = true;
      cameraPresetTargetRef.current = null;
    });

    // Studio 3-point warm/cool lighting
    const hemiLight = new THREE.HemisphereLight(0xdfe8ff, 0x3b2414, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 2.4);
    keyLight.position.set(3.5, 5.2, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af6a, 1.6);
    rimLight.position.set(-3.2, 2.5, -3.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffe0b2, 1.1, 10);
    fillLight.position.set(-2.5, 0.6, 2.8);
    scene.add(fillLight);

    // Build procedural 3D shoe
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const rig = buildProceduralShoe(shapeType, upperHex, soleHex, maxAniso);
    rigRef.current = rig;
    scene.add(rig.root);

    // Floating golden dust particles (Instanced / Points)
    let particlesMesh: THREE.Points | null = null;
    let particlesGeo: THREE.BufferGeometry | null = null;
    let particlesMat: THREE.PointsMaterial | null = null;

    if (showParticles && !prefersReducedMotion) {
      const count = 72;
      const posArr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        posArr[i * 3] = (Math.random() - 0.5) * 6.5;
        posArr[i * 3 + 1] = (Math.random() - 0.25) * 3.5;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 6.5;
      }
      particlesGeo = new THREE.BufferGeometry();
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      particlesMat = new THREE.PointsMaterial({
        color: 0xd9b56f,
        size: 0.032,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });
      particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particlesMesh);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Scroll-driven partial reveal + rotation
      const scrollVal = scrollRef.current;
      const effectiveTargetExplode = Math.min(
        1,
        Math.max(0, targetExplodeRef.current + scrollVal * 0.48)
      );

      currentExplodeRef.current = prefersReducedMotion
        ? effectiveTargetExplode
        : THREE.MathUtils.damp(currentExplodeRef.current, effectiveTargetExplode, 4.5, dt);

      const exp = currentExplodeRef.current;

      // Update each shoe component position & rotation
      for (let i = 0; i < rig.parts.length; i++) {
        const part = rig.parts[i];
        const floatY =
          exp > 0.05 && !prefersReducedMotion
            ? Math.sin(elapsed * 1.4 + i * 0.85) * 0.045 * exp
            : 0;

        _targetPos.copy(part.assembledPos).addScaledVector(part.explodedOffset, exp);
        _targetPos.y += floatY;
        part.mesh.position.copy(_targetPos);

        part.mesh.rotation.set(
          THREE.MathUtils.lerp(part.assembledRot.x, part.explodedRot.x, exp),
          THREE.MathUtils.lerp(part.assembledRot.y, part.explodedRot.y, exp),
          THREE.MathUtils.lerp(part.assembledRot.z, part.explodedRot.z, exp)
        );
      }

      // Smooth root rotation driven by auto-rotate + scroll progress
      if (!prefersReducedMotion) {
        const scrollAngle = scrollVal * Math.PI * 0.85;
        const autoAngle = autoRotateRef.current ? elapsed * 0.28 : 0;
        rig.root.rotation.y = THREE.MathUtils.damp(
          rig.root.rotation.y,
          -0.35 + autoAngle + scrollAngle,
          5.0,
          dt
        );
        rig.root.position.y = Math.sin(elapsed * 1.1) * 0.035;
      }

      // Animate camera presets smoothly
      if (cameraPresetTargetRef.current && !userInteractedRef.current) {
        _targetCam.copy(cameraPresetTargetRef.current);
        camera.position.lerp(_targetCam, 1 - Math.exp(-5 * dt));
        if (camera.position.distanceTo(_targetCam) < 0.02) {
          cameraPresetTargetRef.current = null;
        }
      }

      if (particlesMesh && !prefersReducedMotion) {
        particlesMesh.rotation.y = elapsed * 0.04;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      rig.dispose();
      rigRef.current = null;
      particlesGeo?.dispose();
      particlesMat?.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, [shapeType, showParticles]);

  if (webglError) {
    return (
      <div className={`${heightClass} relative flex items-center justify-center bg-[#0F0B09] rounded-xl overflow-hidden border border-[#C9A461]/20`}>
        <img
          src="/src/assets/images/hero_leather_oxford_1794984719868.jpg"
          alt="Handcrafted VELLMONT leather Oxford"
          className="w-full h-full object-cover opacity-90"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${heightClass} select-none`}>
      {/* Dedicated isolated WebGL mount node */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D shoe assembly viewport. Drag to rotate."
      />

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      {allowExplodeControls && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-col items-center px-3">
          <button
            type="button"
            onClick={() => setControlsCollapsed((prev) => !prev)}
            className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#C9A461]/30 bg-[#120D0A]/90 px-3 py-1 text-[11px] font-medium tracking-wider text-[#E2C285] transition-colors hover:border-[#C9A461] hover:text-white whitespace-nowrap"
          >
            {controlsCollapsed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span>{controlsCollapsed ? 'Show 3D Controls' : 'Hide 3D Controls'}</span>
          </button>

          {!controlsCollapsed && (
            <div className="pointer-events-auto flex w-full max-w-[820px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C9A461]/25 bg-[#120D0A]/90 px-4 py-2.5 text-xs text-[#F5F0E8] shadow-2xl">
              {/* Explode / Assemble Slider */}
              <div className="flex items-center gap-2.5 min-w-[180px] flex-1">
                <Layers className="h-3.5 w-3.5 text-[#C9A461] shrink-0" />
                <label htmlFor="explode-range" className="text-[11px] font-medium text-[#D6CEC2] whitespace-nowrap">
                  Anatomy
                </label>
                <input
                  id="explode-range"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explodeSlider}
                  onChange={(e) => setExplodeSlider(parseFloat(e.target.value))}
                  className="h-1.5 w-full cursor-pointer accent-[#C9A461]"
                />
                <span className="w-8 text-right font-mono text-[11px] tabular-nums text-[#E2C285]">
                  {Math.round(explodeSlider * 100)}%
                </span>
              </div>

              {/* Leather Finish Swatches */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <span className="hidden sm:inline text-[11px] text-[#B8AEA0] whitespace-nowrap">
                  Finish
                </span>
                <div className="flex items-center gap-1.5">
                  {HERO_FINISHES.map((finish, idx) => (
                    <button
                      key={finish.name}
                      type="button"
                      title={finish.name}
                      aria-label={`Select ${finish.name} finish`}
                      onClick={() => setSelectedFinishIdx(idx)}
                      className={`h-5 w-5 rounded-full border transition-transform ${
                        selectedFinishIdx === idx
                          ? 'scale-110 border-[#E2C285] ring-2 ring-[#C9A461]/40'
                          : 'border-white/25 hover:scale-105'
                      }`}
                      style={{ backgroundColor: finish.upperHex }}
                    />
                  ))}
                </div>
              </div>

              {/* Camera Angle Presets */}
              <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                {(Object.keys(CAMERA_PRESETS) as CameraPreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectCamera(key)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      cameraPreset === key
                        ? 'bg-[#C9A461] text-[#0A0807]'
                        : 'text-[#D6CEC2] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {CAMERA_PRESETS[key].label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAutoRotate((r) => !r)}
                  title="Toggle 3D rotation"
                  aria-label="Toggle 3D rotation"
                  className={`ml-1 rounded-md p-1.5 transition-colors ${
                    autoRotate
                      ? 'bg-[#C9A461]/20 text-[#E2C285]'
                      : 'text-[#9C9286] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
