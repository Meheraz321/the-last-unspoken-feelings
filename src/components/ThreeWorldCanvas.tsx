import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Eye, CloudRain, Wind, Compass, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface ThreeWorldCanvasProps {
  scrollProgress: number; // 0 to 1 based on page scroll
}

export const ThreeWorldCanvas: React.FC<ThreeWorldCanvasProps> = ({ scrollProgress }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<'street' | 'lamp' | 'void' | 'orbit'>('street');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [rainDensity, setRainDensity] = useState<'gentle' | 'storm' | 'mist'>('gentle');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const petalsRef = useRef<THREE.Group | null>(null);
  const rainGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const lampLightRef = useRef<THREE.PointLight | null>(null);

  const stateRef = useRef({
    scrollProgress: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    preset: 'street',
    targetCamPos: new THREE.Vector3(0, 1.8, 7.5),
    targetLookAt: new THREE.Vector3(0, 2.2, 0),
    currentCamPos: new THREE.Vector3(0, 1.8, 7.5),
    currentLookAt: new THREE.Vector3(0, 2.2, 0),
    time: 0,
    rainSpeed: 18,
  });

  useEffect(() => {
    stateRef.current.scrollProgress = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    stateRef.current.preset = activeCamPreset;
  }, [activeCamPreset]);

  useEffect(() => {
    stateRef.current.rainSpeed = rainDensity === 'storm' ? 32 : rainDensity === 'mist' ? 8 : 18;
  }, [rainDensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard as instructed in Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#08090D');
    scene.fog = new THREE.FogExp2('#08090D', 0.042);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 1.8, 7.5);
    camera.lookAt(0, 2.2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !isSoftwareGl,
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // 3. Lighting Rig
    // Ambient moonfill
    const hemiLight = new THREE.HemisphereLight('#85818A', '#08090D', 0.35);
    scene.add(hemiLight);

    // Solitary warm streetlamp light
    const lampLight = new THREE.PointLight('#F59E0B', 2.8, 14, 1.4);
    lampLight.position.set(0, 3.4, 0);
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    // Downward streetlamp spotlight cone
    const spotLight = new THREE.SpotLight('#FBBF24', 2.2, 16, Math.PI / 4, 0.6, 1.2);
    spotLight.position.set(0, 3.5, 0);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Soft distant rim backlight (broken wine aura)
    const rimLight = new THREE.DirectionalLight('#541E2B', 0.9);
    rimLight.position.set(-5, 6, -8);
    scene.add(rimLight);

    // 4. Procedural Wet Cobblestone/Asphalt Ground Plane
    const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    // Procedural wet dark asphalt canvas texture
    const canvasTexture = (() => {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 512;
      const ctx = cv.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0E0F14';
        ctx.fillRect(0, 0, 512, 512);

        // Cobblestone / wet pavement grid pattern
        ctx.strokeStyle = '#181920';
        ctx.lineWidth = 2;
        for (let x = 0; x < 512; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 512);
          ctx.stroke();
        }
        for (let y = 0; y < 512; y += 18) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
        }

        // Wet puddle reflections noise
        for (let i = 0; i < 400; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          const pr = Math.random() * 6 + 1;
          ctx.fillStyle = 'rgba(25, 27, 36, 0.4)';
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const tex = new THREE.CanvasTexture(cv);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 12);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();

    const groundMat = new THREE.MeshStandardMaterial({
      map: canvasTexture,
      roughness: 0.18, // very wet reflective surface
      metalness: 0.35,
      color: new THREE.Color('#15161E'),
    });

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    scene.add(groundMesh);

    // 5. Procedural 3D Victorian Streetlamp Model (8 Distinct Parts)
    const lampGroup = new THREE.Group();

    // Part 1: Hexagonal Stone/Iron Base
    const baseGeo = new THREE.CylinderGeometry(0.42, 0.52, 0.5, 8);
    const ironMat = new THREE.MeshStandardMaterial({
      color: '#1A1C24',
      roughness: 0.65,
      metalness: 0.75,
    });
    const baseMesh = new THREE.Mesh(baseGeo, ironMat);
    baseMesh.position.y = 0.25;
    lampGroup.add(baseMesh);

    // Part 2: Main Column Shaft
    const columnGeo = new THREE.CylinderGeometry(0.09, 0.14, 2.8, 12);
    const columnMesh = new THREE.Mesh(columnGeo, ironMat);
    columnMesh.position.y = 1.75;
    lampGroup.add(columnMesh);

    // Part 3: Middle Decorative Fluted Collar
    const collarGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
    const collarMesh = new THREE.Mesh(collarGeo, ironMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 2.1;
    lampGroup.add(collarMesh);

    // Part 4: Upper Lantern Bracket
    const bracketGeo = new THREE.CylinderGeometry(0.24, 0.1, 0.3, 8);
    const bracketMesh = new THREE.Mesh(bracketGeo, ironMat);
    bracketMesh.position.y = 3.25;
    lampGroup.add(bracketMesh);

    // Part 5: Glass Lantern Housing
    const glassGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.65, 4);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#FEF3C7',
      transmission: 0.85,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 3.65;
    glassMesh.rotation.y = Math.PI / 4;
    lampGroup.add(glassMesh);

    // Part 6: Glowing Amber Bulb (Filament)
    const bulbGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: '#F59E0B',
      emissive: new THREE.Color('#FBBF24'),
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.y = 3.65;
    lampGroup.add(bulbMesh);

    // Part 7: Spire Canopy Top
    const roofGeo = new THREE.ConeGeometry(0.35, 0.4, 4);
    const roofMesh = new THREE.Mesh(roofGeo, ironMat);
    roofMesh.position.y = 4.15;
    roofMesh.rotation.y = Math.PI / 4;
    lampGroup.add(roofMesh);

    // Part 8: Ornamental Finial Peak
    const finialGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const finialMesh = new THREE.Mesh(finialGeo, ironMat);
    finialMesh.position.y = 4.4;
    lampGroup.add(finialMesh);

    lampGroup.position.set(0, 0, 0);
    scene.add(lampGroup);

    // 6. 3D Floating Rose Petals (Curved 3D Meshes)
    const petalsGroup = new THREE.Group();
    petalsRef.current = petalsGroup;

    const petalColors = ['#541E2B', '#752B3B', '#9B5968', '#3C151E'];
    const petalMeshes: {
      mesh: THREE.Mesh;
      rotSpeed: THREE.Vector3;
      fallSpeed: number;
      driftSpeed: number;
    }[] = [];

    // Curved petal geometry
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.12, -0.08, 0.22, 0.12, 0, 0.28);
    petalShape.bezierCurveTo(-0.22, 0.12, -0.12, -0.08, 0, 0);

    const petalGeo = new THREE.ShapeGeometry(petalShape);

    for (let i = 0; i < 70; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        side: THREE.DoubleSide,
        roughness: 0.5,
        transparent: true,
        opacity: Math.random() * 0.4 + 0.5,
      });

      const pMesh = new THREE.Mesh(petalGeo, mat);
      const scale = Math.random() * 0.6 + 0.6;
      pMesh.scale.set(scale, scale, scale);

      pMesh.position.set(
        (Math.random() - 0.5) * 12,
        Math.random() * 7 + 0.2,
        (Math.random() - 0.5) * 10
      );

      pMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      petalsGroup.add(pMesh);
      petalMeshes.push({
        mesh: pMesh,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.02
        ),
        fallSpeed: Math.random() * 0.015 + 0.008,
        driftSpeed: (Math.random() - 0.45) * 0.008,
      });
    }
    scene.add(petalsGroup);

    // 7. 3D Rain Particle Field (Lines Geometry)
    const rainCount = 1400;
    const rainPositions = new Float32Array(rainCount * 6); // 2 vertices per rain streak

    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * 22;
      const y = Math.random() * 12;
      const z = (Math.random() - 0.5) * 18;
      const streakLen = Math.random() * 0.35 + 0.2;

      // Top vertex
      rainPositions[i * 6] = x;
      rainPositions[i * 6 + 1] = y;
      rainPositions[i * 6 + 2] = z;

      // Bottom vertex
      rainPositions[i * 6 + 3] = x - 0.03; // slight wind slant
      rainPositions[i * 6 + 4] = y - streakLen;
      rainPositions[i * 6 + 5] = z;
    }

    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeoRef.current = rainGeo;

    const rainMat = new THREE.LineBasicMaterial({
      color: '#9E9DA8',
      transparent: true,
      opacity: 0.42,
    });

    const rainLines = new THREE.LineSegments(rainGeo, rainMat);
    scene.add(rainLines);

    // 8. 3D Floating Memory Embers (Starlight)
    const emberCount = 80;
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 16;
      emberPositions[i * 3 + 1] = Math.random() * 6 + 0.5;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: '#9B5968',
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // Mouse tilt listener
    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 1.5;
      stateRef.current.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 0.8;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      stateRef.current.time += dt;

      // Interpolate mouse coordinates
      stateRef.current.mouse.x += (stateRef.current.mouse.targetX - stateRef.current.mouse.x) * 0.05;
      stateRef.current.mouse.y += (stateRef.current.mouse.targetY - stateRef.current.mouse.y) * 0.05;

      const p = stateRef.current.scrollProgress;
      const preset = stateRef.current.preset;

      // Determine Target Camera Position based on preset or scroll progress
      if (preset === 'street') {
        // Interpolate camera along path as user scrolls
        // Scroll: 0 -> Hero, 0.25 -> Memories, 0.5 -> Diary, 0.75 -> Star Void, 1.0 -> Final Goodbye
        const camX = Math.sin(p * Math.PI) * 1.8 + stateRef.current.mouse.x * 0.8;
        const camY = THREE.MathUtils.lerp(1.8, 3.2, p) - stateRef.current.mouse.y * 0.4;
        const camZ = THREE.MathUtils.lerp(7.5, 3.2, Math.sin(p * Math.PI * 0.8)) + (p > 0.8 ? (p - 0.8) * 15 : 0);

        stateRef.current.targetCamPos.set(camX, camY, camZ);
        stateRef.current.targetLookAt.set(0, THREE.MathUtils.lerp(2.2, 1.4, p), 0);
      } else if (preset === 'lamp') {
        stateRef.current.targetCamPos.set(1.4 + stateRef.current.mouse.x * 0.4, 3.6, 2.2);
        stateRef.current.targetLookAt.set(0, 3.5, 0);
      } else if (preset === 'void') {
        stateRef.current.targetCamPos.set(0, 6.0, 4.0);
        stateRef.current.targetLookAt.set(0, 8.0, -4.0);
      } else if (preset === 'orbit') {
        const angle = stateRef.current.time * 0.25;
        stateRef.current.targetCamPos.set(Math.sin(angle) * 6.5, 2.8, Math.cos(angle) * 6.5);
        stateRef.current.targetLookAt.set(0, 2.2, 0);
      }

      // Silky-Smooth Camera Damping
      stateRef.current.currentCamPos.lerp(stateRef.current.targetCamPos, 0.05);
      stateRef.current.currentLookAt.lerp(stateRef.current.targetLookAt, 0.05);

      camera.position.copy(stateRef.current.currentCamPos);
      camera.lookAt(stateRef.current.currentLookAt);

      // Flickering & breathing streetlamp filament
      if (lampLightRef.current) {
        const flicker = Math.sin(stateRef.current.time * 8) * 0.08 + Math.cos(stateRef.current.time * 19) * 0.04;
        lampLightRef.current.intensity = 2.8 + flicker;
      }

      // Update 3D Rain lines
      if (rainGeoRef.current) {
        const posAttr = rainGeoRef.current.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const fallSpeed = stateRef.current.rainSpeed * dt;

        for (let i = 0; i < rainCount; i++) {
          positions[i * 6 + 1] -= fallSpeed; // top Y
          positions[i * 6 + 4] -= fallSpeed; // bottom Y

          // If fallen below ground, respawn at top
          if (positions[i * 6 + 1] < 0) {
            const newY = Math.random() * 4 + 10;
            const streakLen = Math.random() * 0.35 + 0.2;
            positions[i * 6 + 1] = newY;
            positions[i * 6 + 4] = newY - streakLen;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Animate 3D Petals
      petalMeshes.forEach((pItem) => {
        const m = pItem.mesh;
        m.position.y -= pItem.fallSpeed * (dt * 60);
        m.position.x += Math.sin(stateRef.current.time + m.position.y) * 0.005 + pItem.driftSpeed;
        m.rotation.x += pItem.rotSpeed.x;
        m.rotation.y += pItem.rotSpeed.y;
        m.rotation.z += pItem.rotSpeed.z;

        if (m.position.y < 0.05) {
          m.position.y = Math.random() * 4 + 7;
          m.position.x = (Math.random() - 0.5) * 12;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      groundGeo.dispose();
      groundMat.dispose();
      canvasTexture.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      petalGeo.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const { language } = useLanguage();
  const t = translations[language].threeControls;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Subtle vignette darkening towards edges */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#08090D]/50 to-[#08090D]/90 pointer-events-none" />

      {/* Ergonomic 3D Viewport Controls Dock (Pinned to Bottom Center, Collapsible) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center max-w-[94vw]">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setControlsOpen(!controlsOpen)}
          className="flex items-center gap-1.5 px-3 py-1 mb-1.5 rounded-full text-[11px] font-serif-bengali text-[#85818A] hover:text-[#F1EFF0] bg-[#15151C]/80 hover:bg-[#201D26] border border-white/10 backdrop-blur-md shadow-md transition-all duration-300 cursor-pointer"
          title="Toggle 3D Viewport Controls"
        >
          <Camera className="w-3.5 h-3.5 text-[#9B5968]" />
          <span>{controlsOpen ? t.close : t.title}</span>
          {controlsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {/* Collapsible Panel */}
        {controlsOpen && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#15151C]/95 border border-[#541E2B]/50 shadow-2xl backdrop-blur-md text-xs text-[#D9D5D6]">
            {/* Camera Presets */}
            <div className="flex items-center gap-1 bg-[#08090D]/60 p-1 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-serif-luxury text-[#85818A] px-2">3D Angle:</span>
              <button
                onClick={() => setActiveCamPreset('street')}
                className={`px-3 py-1 rounded-lg text-xs font-serif-bengali transition-colors cursor-pointer ${
                  activeCamPreset === 'street'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'text-[#85818A] hover:text-[#D9D5D6]'
                }`}
              >
                {t.presets.street}
              </button>

              <button
                onClick={() => setActiveCamPreset('lamp')}
                className={`px-3 py-1 rounded-lg text-xs font-serif-bengali transition-colors cursor-pointer ${
                  activeCamPreset === 'lamp'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'text-[#85818A] hover:text-[#D9D5D6]'
                }`}
              >
                {t.presets.lamp}
              </button>

              <button
                onClick={() => setActiveCamPreset('void')}
                className={`px-3 py-1 rounded-lg text-xs font-serif-bengali transition-colors cursor-pointer ${
                  activeCamPreset === 'void'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'text-[#85818A] hover:text-[#D9D5D6]'
                }`}
              >
                {t.presets.void}
              </button>

              <button
                onClick={() => setActiveCamPreset('orbit')}
                className={`px-3 py-1 rounded-lg text-xs font-serif-bengali transition-colors cursor-pointer ${
                  activeCamPreset === 'orbit'
                    ? 'bg-[#541E2B] text-[#F1EFF0]'
                    : 'text-[#85818A] hover:text-[#D9D5D6]'
                }`}
              >
                {t.presets.orbit}
              </button>
            </div>

            {/* Rain Controls */}
            <div className="flex items-center gap-1 bg-[#08090D]/60 p-1 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-serif-luxury text-[#85818A] px-2 flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-[#9B5968]" />
                Rain:
              </span>
              {(['gentle', 'storm', 'mist'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRainDensity(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif-bengali capitalize transition-colors cursor-pointer ${
                    rainDensity === mode
                      ? 'bg-[#541E2B] text-[#F1EFF0]'
                      : 'text-[#85818A] hover:text-[#D9D5D6]'
                  }`}
                >
                  {t.rainModes[mode]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
