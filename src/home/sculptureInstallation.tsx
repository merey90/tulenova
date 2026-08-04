import { useEffect, useRef } from 'react';
import { CenterApproachSide, SculptureAudio } from './sculptureAudio';
import './sculptureInstallation.scss';

interface Point3D {
  bx: number;
  by: number;
  bz: number;
  x: number;
  y: number;
  z: number;
  ring: number;
  phase: number;
}

interface Pointer {
  x: number;
  y: number;
  active: number;
  vx: number;
  vy: number;
}

interface CenterImpact {
  dirX: number;
  dirY: number;
  side: CenterApproachSide;
  strength: number;
}

const NODE_COUNT = 96;
const RING_COUNT = 3;

const createSculpture = (): Point3D[] => {
  const points: Point3D[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < NODE_COUNT; index += 1) {
    const t = index / (NODE_COUNT - 1);
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = golden * index;
    const radius = 118 + Math.sin(index * 0.7) * 18;

    points.push({
      bx: radius * Math.sin(inclination) * Math.cos(azimuth),
      by: radius * Math.sin(inclination) * Math.sin(azimuth) * 0.72,
      bz: radius * Math.cos(inclination),
      x: 0,
      y: 0,
      z: 0,
      ring: -1,
      phase: index * 0.31,
    });
  }

  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    const ringNodes = 28;
    const ringRadius = 150 + ring * 34;
    const tiltX = ring * 0.85 + 0.4;
    const tiltY = ring * 1.1 + 0.2;

    for (let index = 0; index < ringNodes; index += 1) {
      const angle = (index / ringNodes) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      const y = Math.sin(angle * 2 + ring) * 16;

      points.push({
        bx: x,
        by: y * Math.cos(tiltX) + z * Math.sin(tiltX) * 0.35,
        bz: z * Math.cos(tiltY) + y * Math.sin(tiltY) * 0.25,
        x: 0,
        y: 0,
        z: 0,
        ring,
        phase: index * 0.22 + ring,
      });
    }
  }

  return points;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const CENTER_ZONE = 0.34;

const directionFromSide = (side: CenterApproachSide): { dirX: number; dirY: number } => {
  switch (side) {
    case 'left':
      return { dirX: -1, dirY: 0 };
    case 'right':
      return { dirX: 1, dirY: 0 };
    case 'top':
      return { dirX: 0, dirY: -1 };
    case 'bottom':
      return { dirX: 0, dirY: 1 };
    default:
      return { dirX: 0, dirY: 0 };
  }
};

export const SculptureInstallation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const pointsRef = useRef<Point3D[]>(createSculpture());
  const pointerRef = useRef<Pointer>({ x: 0, y: 0, active: 0, vx: 0, vy: 0 });
  const rotationRef = useRef({ x: 0.35, y: 0, z: 0 });
  const timeRef = useRef(0);
  const audioRef = useRef<SculptureAudio | null>(null);
  const centerImpactRef = useRef<CenterImpact>({ dirX: 0, dirY: 0, side: 'left', strength: 0 });
  const lastCenterHitRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const audio = new SculptureAudio();
    audioRef.current = audio;
    const points = pointsRef.current;
    const pointer = pointerRef.current;
    const rotation = rotationRef.current;
    const centerImpact = centerImpactRef.current;

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const updatePointer = (clientX: number, clientY: number, intensity = 1) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const nextY = ((clientY - rect.top) / rect.height) * 2 - 1;

      pointer.vx = nextX - pointer.x;
      pointer.vy = nextY - pointer.y;
      pointer.x = clamp(nextX, -1.2, 1.2);
      pointer.y = clamp(nextY, -1.2, 1.2);
      pointer.active = Math.min(1, pointer.active + intensity * 0.18);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY, event.pointerType === 'touch' ? 1.4 : 1);
    };

    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY, 1.6);
      void audio.ensureStarted().then(() => {
        if (event.pointerType === 'mouse') {
          audio.triggerMouseClickSounds(0.92, pointer.x, pointer.y);
        } else {
          audio.triggerTouchBurst(0.85, pointer.x, pointer.y);
        }

        if (Math.hypot(pointer.x, pointer.y) < CENTER_ZONE) {
          const side =
            audio.getApproachSideFromVelocity(pointer.vx, pointer.vy, 0.85) ??
            (Math.abs(pointer.x) > Math.abs(pointer.y)
              ? pointer.x > 0
                ? 'left'
                : 'right'
              : pointer.y > 0
              ? 'top'
              : 'bottom');

          const direction = directionFromSide(side);
          centerImpact.dirX = direction.dirX;
          centerImpact.dirY = direction.dirY;
          centerImpact.side = side;
          centerImpact.strength = 0.85;
          audio.triggerCenterTechnique(side, 0.85, pointer.x, pointer.y);
        }
      });
    };

    const detectCenterImpact = (speed: number) => {
      const distFromCenter = Math.hypot(pointer.x, pointer.y);
      if (distFromCenter > CENTER_ZONE || speed < 0.03) return;

      const side = audio.getApproachSideFromVelocity(pointer.vx, pointer.vy);
      if (!side) return;

      const now = performance.now();
      if (now - lastCenterHitRef.current < 95) return;

      lastCenterHitRef.current = now;
      const direction = directionFromSide(side);
      const strength = clamp(speed * 6 + (CENTER_ZONE - distFromCenter) * 2.2, 0.4, 1);

      centerImpact.dirX = direction.dirX;
      centerImpact.dirY = direction.dirY;
      centerImpact.side = side;
      centerImpact.strength = strength;

      audio.triggerCenterTechnique(side, strength, pointer.x, pointer.y);
    };

    const handlePointerLeave = () => {
      pointer.active *= 0.92;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerLeave);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const perspective = Math.min(width, height) * 1.35;

      timeRef.current += reducedMotion ? 0.004 : 0.012;
      const time = timeRef.current;

      pointer.active *= 0.965;
      pointer.vx *= 0.8;
      pointer.vy *= 0.8;

      if (!reducedMotion) {
        const speed = Math.hypot(pointer.vx, pointer.vy);
        audio.updateFromMotion(pointer.active, speed, pointer.x, pointer.y);
        detectCenterImpact(speed);
      }

      centerImpact.strength *= 0.952;

      const targetRotY = pointer.x * 0.85 + pointer.vx * 2.4;
      const targetRotX = -pointer.y * 0.55 + pointer.vy * 1.8;
      rotation.y += (targetRotY - rotation.y) * 0.06;
      rotation.x += (targetRotX - rotation.x) * 0.06;
      rotation.z += 0.0025 + pointer.active * 0.004;

      const cosY = Math.cos(rotation.y + time * 0.08);
      const sinY = Math.sin(rotation.y + time * 0.08);
      const cosX = Math.cos(rotation.x + time * 0.05);
      const sinX = Math.sin(rotation.x + time * 0.05);
      const cosZ = Math.cos(rotation.z);
      const sinZ = Math.sin(rotation.z);

      const projected: Array<Point3D & { px: number; py: number; depth: number; size: number }> = [];

      for (const point of points) {
        const pulse = Math.sin(time * 1.6 + point.phase) * (point.ring >= 0 ? 10 : 6);
        const breathe = Math.sin(time * 0.7 + point.phase * 0.5) * 4;

        const pointerPullX = pointer.x * 42 * pointer.active;
        const pointerPullY = -pointer.y * 42 * pointer.active;
        const pointerPullZ = (1 - Math.hypot(pointer.x, pointer.y)) * 26 * pointer.active;

        const sectorAlign = clamp((point.bx / 170) * centerImpact.dirX + (point.by / 110) * centerImpact.dirY, 0, 1);
        const sectorExpand = sectorAlign * centerImpact.strength;
        const expandPush = sectorExpand * 145;

        let x = point.bx + pointerPullX + pulse + centerImpact.dirX * expandPush;
        const y = point.by + pointerPullY + breathe + centerImpact.dirY * expandPush * 0.82;
        let z = point.bz + pointerPullZ + sectorExpand * 58;

        if (point.ring >= 0) {
          const ringSpin = time * (0.35 + point.ring * 0.12) + point.phase;
          const ringX = x * Math.cos(ringSpin) - z * Math.sin(ringSpin);
          const ringZ = x * Math.sin(ringSpin) + z * Math.cos(ringSpin);
          x = ringX;
          z = ringZ;
        }

        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;
        const x3 = x2 * cosZ - y1 * sinZ;
        const y3 = x2 * sinZ + y1 * cosZ;

        point.x = x3;
        point.y = y3;
        point.z = z2;

        const scale = perspective / (perspective + z2);
        projected.push({
          ...point,
          px: centerX + x3 * scale,
          py: centerY + y3 * scale,
          depth: z2,
          size: (point.ring >= 0 ? 2.2 : 2.8) * scale + pointer.active * 0.8 + sectorExpand * 4.2,
        });
      }

      projected.sort((a, b) => a.depth - b.depth);

      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        Math.max(width, height) * 0.55
      );
      gradient.addColorStop(0, 'rgba(163, 149, 109, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const linkDistance = 92 + centerImpact.strength * 78;

      for (let i = 0; i < projected.length; i += 1) {
        for (let j = i + 1; j < projected.length; j += 1) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.px - b.px;
          const dy = a.py - b.py;
          const distance = Math.hypot(dx, dy);

          if (distance > linkDistance) continue;

          const depthFade = 1 - (a.depth + b.depth + perspective * 2) / (perspective * 4);
          const lineBoost =
            clamp((a.bx / 170) * centerImpact.dirX + (a.by / 110) * centerImpact.dirY, 0, 1) +
            clamp((b.bx / 170) * centerImpact.dirX + (b.by / 110) * centerImpact.dirY, 0, 1);
          const alpha = (1 - distance / linkDistance) * depthFade * (0.12 + pointer.active * 0.18 + lineBoost * 0.12);

          context.beginPath();
          context.moveTo(a.px, a.py);
          context.lineTo(b.px, b.py);
          context.strokeStyle = `rgba(196, 184, 150, ${Math.max(0.04, alpha)})`;
          context.lineWidth = 0.6 + pointer.active * 0.5;
          context.stroke();
        }
      }

      for (const node of projected) {
        const glow = 0.35 + pointer.active * 0.45;
        const alpha = clamp(0.2 + glow - node.depth / (perspective * 2.5), 0.15, 1);

        context.beginPath();
        context.arc(node.px, node.py, node.size * 2.2, 0, Math.PI * 2);
        context.fillStyle = `rgba(163, 149, 109, ${alpha * 0.18})`;
        context.fill();

        context.beginPath();
        context.arc(node.px, node.py, node.size, 0, Math.PI * 2);
        context.fillStyle = node.ring >= 0 ? `rgba(196, 184, 150, ${alpha})` : `rgba(163, 149, 109, ${alpha})`;
        context.fill();
      }

      if (centerImpact.strength > 0.06) {
        const burstLength = 70 + centerImpact.strength * 280;
        const wing = 28 + centerImpact.strength * 52;
        const tipX = centerX + centerImpact.dirX * burstLength;
        const tipY = centerY + centerImpact.dirY * burstLength;
        const wingX = centerImpact.dirY * wing;
        const wingY = -centerImpact.dirX * wing;

        context.beginPath();
        context.moveTo(centerX - wingX, centerY - wingY);
        context.lineTo(tipX, tipY);
        context.lineTo(centerX + wingX, centerY + wingY);
        context.closePath();
        context.fillStyle = `rgba(163, 149, 109, ${0.03 + centerImpact.strength * 0.1})`;
        context.fill();

        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(tipX, tipY);
        context.strokeStyle = `rgba(196, 184, 150, ${0.08 + centerImpact.strength * 0.28})`;
        context.lineWidth = 1 + centerImpact.strength * 2.2;
        context.stroke();
      }

      if (pointer.active > 0.05) {
        const rippleX = centerX + pointer.x * width * 0.28;
        const rippleY = centerY + pointer.y * height * 0.28;
        const rippleRadius = 40 + pointer.active * 120 + Math.sin(time * 4) * 8;

        context.beginPath();
        context.arc(rippleX, rippleY, rippleRadius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(163, 149, 109, ${0.08 + pointer.active * 0.2})`;
        context.lineWidth = 1;
        context.stroke();

        context.beginPath();
        context.arc(rippleX, rippleY, rippleRadius * 0.62, 0, Math.PI * 2);
        context.strokeStyle = `rgba(196, 184, 150, ${0.05 + pointer.active * 0.12})`;
        context.lineWidth = 0.6;
        context.stroke();
      }

      frameRef.current = window.requestAnimationFrame(draw);
    };

    frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerLeave);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      audio.dispose();
      audioRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="sculpture-installation" aria-hidden="true" role="presentation" />;
};
