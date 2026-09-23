import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Intro 3D: portátil fechado → tampa abre → ecrã acende → câmara entra no ecrã.
// Este módulo é carregado à parte (React.lazy) e tudo o que cria é libertado
// ao desmontar — depois da transição não fica nenhuma cena WebGL viva.

const INK = '#0f0e0c';
const PAPER = '#ece5d3';
const ACCENT = '#ff5a1f';
const BG = '#0b0a09';

const OPEN_ANGLE = 1.85; // ~106°
const LID_DURATION = 1.2;
const SCREEN_DELAY = 0.7;
const SCREEN_DURATION = 0.6;
const ZOOM_START = 1.7;
const ZOOM_DURATION = 1.4;
const HANDOFF_AT = 0.62; // fração do zoom em que o desktop HTML começa a aparecer

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Miniatura do desktop desenhada no ecrã — é o que se vê antes do HTML assumir.
function drawScreen(ctx, w, h) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, 30);
  ctx.fillStyle = 'rgba(236, 229, 211, 0.18)';
  ctx.fillRect(0, 30, w, 1);
  ctx.fillStyle = PAPER;
  ctx.font = '700 15px Sora, system-ui, sans-serif';
  ctx.fillText('Dom Dot', 16, 20);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(90, 15, 5, 5);
  // painel lateral
  const pw = 250;
  ctx.fillStyle = '#16140f';
  ctx.fillRect(w - pw, 31, pw, h - 31);
  ctx.fillStyle = 'rgba(236, 229, 211, 0.18)';
  ctx.fillRect(w - pw, 31, 1, h - 31);
  ctx.fillStyle = PAPER;
  ctx.fillRect(w - pw + 24, 70, 150, 14);
  ctx.fillStyle = 'rgba(236, 229, 211, 0.35)';
  for (let i = 0; i < 6; i++) ctx.fillRect(w - pw + 24, 110 + i * 18, 190 - (i % 3) * 30, 6);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(w - pw + 24, 240, 60, 4);
  // ícones
  const icons = [
    () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(40, 70, 52, 40);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(40, 64, 22, 8);
    },
    () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(46, 150, 40, 50);
      ctx.fillStyle = INK;
      for (let i = 0; i < 4; i++) ctx.fillRect(52, 162 + i * 8, 26, 2);
    },
    () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(40, 244, 52, 34);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(78, 248, 10, 12);
    },
  ];
  icons.forEach((draw) => draw());
}

function drawKeyboard(ctx, w, h) {
  ctx.fillStyle = '#161512';
  ctx.fillRect(0, 0, w, h);
  const rows = 6;
  const cols = 14;
  const gap = 8;
  const kw = (w - gap * (cols + 1)) / cols;
  const kh = (h - gap * (rows + 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c > 3 && c < 10) {
        if (c === 4) {
          ctx.fillStyle = '#23211d';
          ctx.fillRect(gap + c * (kw + gap), gap + r * (kh + gap), kw * 6 + gap * 5, kh);
        }
        continue;
      }
      ctx.fillStyle = '#23211d';
      ctx.fillRect(gap + c * (kw + gap), gap + r * (kh + gap), kw, kh);
    }
  }
}

function canvasTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export default function LaptopIntro({ labels, onHandoff, onDone }) {
  const mountRef = useRef(null);
  const openRef = useRef(() => {});
  const handoffRef = useRef(onHandoff);
  const doneRef = useRef(onDone);
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState(false);

  handoffRef.current = onHandoff;
  doneRef.current = onDone;

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      doneRef.current();
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTex = pmrem.fromScene(room, 0.04).texture;
    room.dispose?.();
    scene.environment = envTex;
    scene.environmentIntensity = 0.35;

    const camera = new THREE.PerspectiveCamera(32, mount.clientWidth / mount.clientHeight, 0.01, 100);
    const lookTarget = new THREE.Vector3(0, 0.45, 0);
    const camDir = new THREE.Vector3(0, 2.3, 6).normalize();
    function placeIdleCamera() {
      // afasta a câmara em ecrãs estreitos para o portátil caber na largura
      const aspect = camera.aspect;
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max(6.6, 2.3 / (tanHalf * aspect));
      camera.position.copy(lookTarget).addScaledVector(camDir, dist);
      camera.lookAt(lookTarget);
    }
    placeIdleCamera();

    // luzes
    const key = new THREE.DirectionalLight('#ffe9d2', 1.4);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight(ACCENT, 1.1);
    rim.position.set(-4, 2, -4);
    const screenLight = new THREE.PointLight(PAPER, 0, 6, 2);
    screenLight.position.set(0, 1.3, 0.2);
    scene.add(new THREE.AmbientLight('#ffffff', 0.15), key, rim, screenLight);

    // portátil
    const shell = new THREE.MeshStandardMaterial({ color: '#2b2925', metalness: 0.7, roughness: 0.38 });
    const laptop = new THREE.Group();
    scene.add(laptop);

    const base = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.12, 2.2, 4, 0.04), shell);
    base.position.y = 0.06;
    laptop.add(base);

    const keyboardTex = canvasTexture(1024, 380, drawKeyboard);
    const keyboard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 1.0),
      new THREE.MeshStandardMaterial({ map: keyboardTex, roughness: 0.8 })
    );
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, 0.1215, -0.33);
    laptop.add(keyboard);

    const trackpad = new THREE.Mesh(
      new THREE.PlaneGeometry(1.05, 0.62),
      new THREE.MeshStandardMaterial({ color: '#34322d', metalness: 0.5, roughness: 0.5 })
    );
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, 0.1215, 0.62);
    laptop.add(trackpad);

    const ledMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 1 });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.018, 0.01), ledMat);
    led.position.set(0, 0.06, 1.102);
    laptop.add(led);

    const hinge = new THREE.Group();
    hinge.position.set(0, 0.12, -1.1);
    laptop.add(hinge);

    const lid = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.07, 2.2, 4, 0.03), shell);
    lid.position.set(0, 0.035, 1.1);
    hinge.add(lid);

    const logo = new THREE.Mesh(
      new THREE.CircleGeometry(0.09, 32),
      new THREE.MeshBasicMaterial({ color: ACCENT })
    );
    logo.rotation.x = -Math.PI / 2;
    logo.position.set(0, 0.0715, 1.1);
    hinge.add(logo);

    const screenTex = canvasTexture(1024, 672, drawScreen);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, color: 0x000000, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 1.94), screenMat);
    screen.rotation.x = Math.PI / 2; // virado para o teclado quando fechado
    screen.position.set(0, -0.0015, 1.1);
    hinge.add(screen);

    // sombra de contacto falsa
    const shadowTex = canvasTexture(256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(0,0,0,0.75)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 4.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.002;
    scene.add(shadow);

    // interação
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const state = { phase: 'idle', start: 0, handed: false };
    const clock = new THREE.Clock();

    function hitsLaptop(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObject(laptop, true).length > 0;
    }

    function open() {
      if (state.phase !== 'idle') return;
      state.phase = 'opening';
      state.start = clock.getElapsedTime();
      setOpened(true);
      setHover(false);
    }
    openRef.current = open;

    function onPointerMove(e) {
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      if (state.phase === 'idle' && e.pointerType === 'mouse') setHover(hitsLaptop(e));
    }
    function onClick(e) {
      if (hitsLaptop(e)) open();
    }
    function onResize() {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      if (state.phase === 'idle' || state.phase === 'opening') placeIdleCamera();
    }
    window.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    function startZoom(now) {
      laptop.rotation.set(0, 0, 0);
      laptop.position.set(0, 0, 0);
      laptop.updateMatrixWorld(true);
      const center = screen.getWorldPosition(new THREE.Vector3());
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(screen.getWorldQuaternion(new THREE.Quaternion()));
      // distância a que o ecrã cobre a viewport inteira (com folga)
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.min(1.94 / (2 * tanHalf), 2.96 / (2 * tanHalf * camera.aspect)) * 0.82;
      state.fromPos = camera.position.clone();
      state.toPos = center.clone().addScaledVector(normal, dist);
      state.fromLook = lookTarget.clone();
      state.toLook = center;
      state.phase = 'zoom';
      state.start = now;
    }

    const look = new THREE.Vector3();
    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      const now = clock.getElapsedTime();

      if (state.phase === 'idle') {
        const yaw = Math.sin(now * 0.45) * 0.16 + pointer.x * 0.22;
        laptop.rotation.y += (yaw - laptop.rotation.y) * 0.05;
        laptop.rotation.x += (pointer.y * 0.05 - laptop.rotation.x) * 0.05;
        laptop.position.y = Math.sin(now * 1.1) * 0.035;
        ledMat.emissiveIntensity = 0.55 + 0.45 * Math.sin(now * 2.6);
      } else if (state.phase === 'opening') {
        const t = now - state.start;
        laptop.rotation.y *= 0.9;
        laptop.rotation.x *= 0.9;
        laptop.position.y *= 0.9;
        hinge.rotation.x = -OPEN_ANGLE * easeInOutCubic(clamp01(t / LID_DURATION));
        const s = clamp01((t - SCREEN_DELAY) / SCREEN_DURATION);
        let b = 0;
        if (s > 0 && s < 0.22) b = Math.random() < 0.5 ? 0.28 : 0.06; // cintilar ao ligar
        else if (s >= 0.22) b = 0.3 + 0.7 * easeOutCubic((s - 0.22) / 0.78);
        screenMat.color.setScalar(b);
        screenLight.intensity = b * 4;
        ledMat.emissiveIntensity = 1;
        if (t >= ZOOM_START) startZoom(now);
      } else if (state.phase === 'zoom') {
        const p = clamp01((now - state.start) / ZOOM_DURATION);
        const e = easeInOutQuart(p);
        camera.position.lerpVectors(state.fromPos, state.toPos, e);
        look.lerpVectors(state.fromLook, state.toLook, e);
        camera.lookAt(look);
        if (p >= HANDOFF_AT && !state.handed) {
          state.handed = true;
          handoffRef.current();
        }
        if (p >= 1) {
          state.phase = 'done';
          cancelAnimationFrame(raf);
          doneRef.current();
          return;
        }
      }
      renderer.render(scene, camera);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`intro ${hover ? 'intro--hover' : ''}`}>
      <div className="intro__stage" ref={mountRef} />
      {!opened && (
        <div className="intro__hint">
          <span>{labels.hint}</span>
          <button type="button" className="intro__open" onClick={() => openRef.current()}>
            {labels.open}
          </button>
        </div>
      )}
    </div>
  );
}
