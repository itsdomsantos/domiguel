import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  RoundedBox,
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import * as THREE from 'three';

const BRAND = '#7c5cff';
const BRAND_2 = '#00d4ff';
const SURFACE = '#12121f';
const SURFACE_2 = '#191927';
const INK = '#08080f';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Texturas geradas em canvas (sem ficheiros externos) ---------- */

// Ecrã do monitor: um "editor de código" estilizado com a marca.
function makeScreenTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d');

  // Fundo
  const bg = ctx.createLinearGradient(0, 0, 1024, 640);
  bg.addColorStop(0, '#0b0b16');
  bg.addColorStop(1, '#111124');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 640);

  // Barra de topo
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, 0, 1024, 64);
  const dots = ['#ff5f57', '#febc2e', '#28c840'];
  dots.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(40 + i * 34, 32, 9, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('domdotdev.jsx', 170, 40);

  // Título gradiente grande
  const grad = ctx.createLinearGradient(70, 0, 640, 0);
  grad.addColorStop(0, BRAND);
  grad.addColorStop(1, BRAND_2);
  ctx.fillStyle = grad;
  ctx.font = '800 68px system-ui, sans-serif';
  ctx.fillText('Dom Dot.', 70, 190);
  ctx.fillStyle = '#f2f2f7';
  ctx.font = '800 58px system-ui, sans-serif';
  ctx.fillText('Developments', 70, 258);

  // "Linhas de código" decorativas
  const lines = [
    { x: 70, w: 260, c: 'rgba(124,92,255,0.85)' },
    { x: 70, w: 420, c: 'rgba(255,255,255,0.18)' },
    { x: 110, w: 300, c: 'rgba(0,212,255,0.7)' },
    { x: 110, w: 480, c: 'rgba(255,255,255,0.18)' },
    { x: 70, w: 200, c: 'rgba(255,255,255,0.18)' },
    { x: 110, w: 360, c: 'rgba(124,92,255,0.6)' },
  ];
  lines.forEach((l, i) => {
    ctx.fillStyle = l.c;
    const y = 330 + i * 44;
    ctx.beginPath();
    ctx.roundRect(l.x, y, l.w, 16, 8);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Etiqueta para os chips flutuantes.
function makeLabelTexture(label, color) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(0, 0, 512, 256, 40);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(6, 6, 500, 244, 36);
  ctx.stroke();
  // ponto colorido
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(70, 128, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2f2f7';
  ctx.font = '700 64px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 120, 132);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- Peças da cena ---------- */

function Monitor() {
  const screenTex = useMemo(() => makeScreenTexture(), []);
  return (
    <group position={[0, 0.35, 0]}>
      {/* Moldura */}
      <RoundedBox args={[4.1, 2.55, 0.16]} radius={0.07} smoothness={4}>
        <meshStandardMaterial color={INK} metalness={0.7} roughness={0.3} />
      </RoundedBox>
      {/* Ecrã */}
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[3.75, 2.22]} />
        <meshStandardMaterial
          map={screenTex}
          emissive="#ffffff"
          emissiveMap={screenTex}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>
      {/* Pescoço */}
      <mesh position={[0, -1.55, -0.1]}>
        <boxGeometry args={[0.28, 0.9, 0.22]} />
        <meshStandardMaterial color={SURFACE_2} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Base */}
      <RoundedBox args={[1.5, 0.14, 0.9]} radius={0.06} smoothness={4} position={[0, -1.98, -0.1]}>
        <meshStandardMaterial color={SURFACE_2} metalness={0.6} roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

function Keyboard() {
  const keys = useMemo(() => {
    const arr = [];
    const cols = 12;
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        arr.push([
          -1.32 + col * 0.24,
          0,
          -0.33 + r * 0.22,
        ]);
      }
    }
    return arr;
  }, []);

  return (
    <group position={[0, -1.94, 1.5]}>
      <RoundedBox args={[3.1, 0.16, 1.1]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={SURFACE} metalness={0.5} roughness={0.5} />
      </RoundedBox>
      {keys.map((p, i) => (
        <mesh key={i} position={[p[0], 0.11, p[2]]}>
          <boxGeometry args={[0.19, 0.06, 0.17]} />
          <meshStandardMaterial
            color={i % 17 === 0 ? BRAND : SURFACE_2}
            emissive={i % 17 === 0 ? BRAND : '#000000'}
            emissiveIntensity={i % 17 === 0 ? 0.6 : 0}
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function Mug() {
  return (
    <group position={[2.35, -1.75, 1.35]}>
      <mesh>
        <cylinderGeometry args={[0.26, 0.24, 0.5, 32]} />
        <meshStandardMaterial color={BRAND} metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.14, 0.04, 12, 24]} />
        <meshStandardMaterial color={BRAND} metalness={0.2} roughness={0.4} />
      </mesh>
      {/* café */}
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial color="#2a1b12" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Desk() {
  return (
    <RoundedBox
      args={[9, 0.4, 4.2]}
      radius={0.1}
      smoothness={4}
      position={[0, -2.22, 0.4]}
      receiveShadow
    >
      <meshStandardMaterial color="#15151f" metalness={0.3} roughness={0.7} />
    </RoundedBox>
  );
}

function Chip({ label, color, position, floatSpeed }) {
  const tex = useMemo(() => makeLabelTexture(label, color), [label, color]);
  return (
    <Float
      speed={prefersReducedMotion ? 0 : floatSpeed}
      rotationIntensity={prefersReducedMotion ? 0 : 0.5}
      floatIntensity={prefersReducedMotion ? 0 : 0.9}
      position={position}
    >
      <RoundedBox args={[1.25, 0.62, 0.1]} radius={0.09} smoothness={4}>
        <meshStandardMaterial
          map={tex}
          emissive="#ffffff"
          emissiveMap={tex}
          emissiveIntensity={0.25}
          metalness={0.2}
          roughness={0.6}
          toneMapped={false}
        />
      </RoundedBox>
    </Float>
  );
}

function Rig() {
  const ref = useRef();
  useFrame((state) => {
    if (prefersReducedMotion || !ref.current) return;
    // leve inclinação a seguir o rato
    const { x, y } = state.pointer;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x * 0.25, 0.05);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y * 0.12, 0.05);
  });

  return (
    <group ref={ref}>
      <Float
        speed={prefersReducedMotion ? 0 : 1.2}
        rotationIntensity={0}
        floatIntensity={prefersReducedMotion ? 0 : 0.4}
      >
        <Monitor />
        <Keyboard />
        <Mug />
      </Float>
      <Desk />

      <Chip label="React" color={BRAND_2} position={[-3.2, 1.6, 0.6]} floatSpeed={1.4} />
      <Chip label="Three.js" color={BRAND} position={[3.1, 1.9, 0.2]} floatSpeed={1.1} />
      <Chip label="Node.js" color="#34d399" position={[3.4, -0.2, 1.2]} floatSpeed={1.6} />
      <Chip label="UI / UX" color={BRAND} position={[-3.5, -0.1, 1.1]} floatSpeed={1.3} />
    </group>
  );
}

export default function ComputerScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      shadows
      style={{ width: '100%', height: '100%' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.6, 8.5]} fov={42} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} castShadow />
      <pointLight position={[-5, 2, 4]} intensity={40} distance={18} color={BRAND} />
      <pointLight position={[5, 1, 5]} intensity={30} distance={18} color={BRAND_2} />

      <Rig />

      <ContactShadows
        position={[0, -2.42, 0.4]}
        opacity={0.5}
        scale={16}
        blur={2.6}
        far={5}
        color="#000000"
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={11}
        minPolarAngle={0.7}
        maxPolarAngle={1.65}
        autoRotate={!prefersReducedMotion}
        autoRotateSpeed={0.5}
        target={[0, -0.2, 0.2]}
      />
    </Canvas>
  );
}
