import { useEffect, useRef } from 'react';
import { ringNodeTechnique, ringNodeTechniqueMarkerIndex, ExtendedTechnique } from './bassFlutePerformance';
import { CONTRABASS_MAX_MIDI, CONTRABASS_MIN_MIDI } from './contrabassFluteSamples';
import { pearlRgba } from './installationColors';
import { CenterApproachSide, INSTALLATION_DEFAULT_VOLUME, SculptureAudio } from './sculptureAudio';
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
  midi: number;
  technique: ExtendedTechnique | null;
  techniqueMarkerIndex: number;
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

const NODE_COUNT = 128;
const RING_COUNT = 4;
const RING_NODES = 32;
const RING_RADIUS_BASE = 210;
const RING_RADIUS_STEP = 50;
const SCULPTURE_SCALE = 2.48;
const SCULPTURE_EXTENT_X = 450;
const SCULPTURE_EXTENT_Y = 255;
const HORIZONTAL_STRETCH = 1.52;
const VERTICAL_STRETCH = 1.18;
const POINTER_REACH = 0.96;
const NODE_HOVER_RADIUS = 56;
const EDGE_ZONE = 0.54;
const SPATIAL_EDGE_STRETCH_X = 1.18;
const SPATIAL_EDGE_STRETCH_Y = 1.14;

const stretchSpatialCoord = (value: number, axis: 'x' | 'y') =>
  clamp(value * (axis === 'x' ? SPATIAL_EDGE_STRETCH_X : SPATIAL_EDGE_STRETCH_Y), -1, 1);

const pointerToSpatial = (x: number, y: number) => ({
  x: stretchSpatialCoord(x, 'x'),
  y: stretchSpatialCoord(y, 'y'),
});

const screenToSpatial = (px: number, py: number, width: number, height: number) =>
  pointerToSpatial((px / width) * 2 - 1, (py / height) * 2 - 1);

const resolveEdgeHover = (x: number, y: number): { intensity: number; midi: number } | null => {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const edgeStrength = Math.max(absX, absY);

  if (edgeStrength < EDGE_ZONE) return null;

  const intensity = clamp((edgeStrength - EDGE_ZONE) / (1.02 - EDGE_ZONE), 0.48, 1);
  const alongEdge = absX >= absY ? y : x;
  const normalized = clamp((alongEdge + 1) / 2, 0, 1);
  const midi = Math.round(CONTRABASS_MIN_MIDI + normalized * (CONTRABASS_MAX_MIDI - CONTRABASS_MIN_MIDI));

  return { intensity, midi };
};

const createSculpture = (): Point3D[] => {
  const points: Point3D[] = [];
  const fibonacciAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < NODE_COUNT; index += 1) {
    const t = index / (NODE_COUNT - 1);
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = fibonacciAngle * index;
    const radius = (118 + Math.sin(index * 0.7) * 18) * SCULPTURE_SCALE;

    points.push({
      bx: radius * Math.sin(inclination) * Math.cos(azimuth),
      by: radius * Math.sin(inclination) * Math.sin(azimuth) * 0.58,
      bz: radius * Math.cos(inclination),
      x: 0,
      y: 0,
      z: 0,
      ring: -1,
      phase: index * 0.31,
      midi: CONTRABASS_MIN_MIDI,
      technique: null,
      techniqueMarkerIndex: 0,
    });
  }

  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    const ringRadius = (RING_RADIUS_BASE + ring * RING_RADIUS_STEP) * SCULPTURE_SCALE;
    const tiltX = ring * 0.85 + 0.4;
    const tiltY = ring * 1.1 + 0.2;

    for (let index = 0; index < RING_NODES; index += 1) {
      const angle = (index / RING_NODES) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      const y = Math.sin(angle * 2 + ring) * 16 * SCULPTURE_SCALE;

      points.push({
        bx: x,
        by: y * Math.cos(tiltX) + z * Math.sin(tiltX) * 0.35,
        bz: z * Math.cos(tiltY) + y * Math.sin(tiltY) * 0.25,
        x: 0,
        y: 0,
        z: 0,
        ring,
        phase: index * 0.22 + ring,
        midi: CONTRABASS_MIN_MIDI,
        technique: ringNodeTechnique(ring, index),
        techniqueMarkerIndex: ringNodeTechniqueMarkerIndex(ring, index),
      });
    }
  }

  assignContrabassPitches(points);

  return points;
};

const assignContrabassPitches = (points: Point3D[]): void => {
  const pitchSpan = CONTRABASS_MAX_MIDI - CONTRABASS_MIN_MIDI;
  const ranked = points
    .map((point, index) => ({
      point,
      index,
      height: point.by * 0.7 + point.bz * 0.3 + (point.ring >= 0 ? point.ring * 18 : 0),
    }))
    .sort((a, b) => a.height - b.height || a.index - b.index);

  ranked.forEach((entry, rank) => {
    const normalized = rank / Math.max(1, ranked.length - 1);
    entry.point.midi = Math.round(CONTRABASS_MIN_MIDI + normalized * pitchSpan);
  });
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

export const SculptureInstallation: React.FC<{
  volume?: number;
  interactive?: boolean;
  onAudioReady?: (startAudio: () => Promise<void>) => void;
}> = ({ volume = INSTALLATION_DEFAULT_VOLUME, interactive = true, onAudioReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactiveRef = useRef(interactive);
  const frameRef = useRef<number>();
  const pointsRef = useRef<Point3D[]>(createSculpture());
  const pointerRef = useRef<Pointer>({ x: 0, y: 0, active: 0, vx: 0, vy: 0 });
  const rotationRef = useRef({ x: 0.35, y: 0, z: 0 });
  const timeRef = useRef(0);
  const audioRef = useRef<SculptureAudio | null>(null);
  const onAudioReadyRef = useRef(onAudioReady);
  const centerImpactRef = useRef<CenterImpact>({ dirX: 0, dirY: 0, side: 'left', strength: 0 });
  const lastCenterHitRef = useRef(0);
  const projectedScreenRef = useRef<Array<{ px: number; py: number; midi: number }>>([]);

  onAudioReadyRef.current = onAudioReady;
  interactiveRef.current = interactive;

  useEffect(() => {
    audioRef.current?.setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const audio = new SculptureAudio();
    audio.setMasterVolume(volume);
    audioRef.current = audio;
    onAudioReadyRef.current?.(() => audio.ensureStarted());
    const points = pointsRef.current;
    const pointer = pointerRef.current;
    const rotation = rotationRef.current;
    const centerImpact = centerImpactRef.current;
    const touchState = { startX: 0, startY: 0, scrolling: false, pointerId: -1 };

    const isTouchPointer = (event: PointerEvent) => event.pointerType === 'touch' || event.pointerType === 'pen';

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
      pointer.x = clamp(nextX, -1.35, 1.35);
      pointer.y = clamp(nextY, -1.35, 1.35);
      pointer.active = Math.min(1, pointer.active + intensity * 0.18);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!interactiveRef.current) return;

      if (isTouchPointer(event) && event.pointerId === touchState.pointerId) {
        const dx = event.clientX - touchState.startX;
        const dy = event.clientY - touchState.startY;

        if (!touchState.scrolling && Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx) * 1.15) {
          touchState.scrolling = true;
          pointer.active *= 0.5;
          audio.updateNodeHover(null, 0, 0, 0);
          return;
        }

        if (touchState.scrolling) return;
      }

      updatePointer(event.clientX, event.clientY, isTouchPointer(event) ? 1.55 : 1);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!interactiveRef.current) return;

      if (isTouchPointer(event)) {
        touchState.startX = event.clientX;
        touchState.startY = event.clientY;
        touchState.scrolling = false;
        touchState.pointerId = event.pointerId;
      }

      updatePointer(event.clientX, event.clientY, isTouchPointer(event) ? 1.75 : 1.6);
      void audio.ensureStarted().then(() => {
        if (event.pointerType === 'mouse') {
          audio.triggerMouseClickSounds(0.92, pointer.x, pointer.y);
        } else {
          audio.triggerTouchBurst(0.9, pointer.x, pointer.y);
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

    const handlePointerLeave = (event?: PointerEvent) => {
      if (event && isTouchPointer(event) && event.pointerId === touchState.pointerId) {
        touchState.scrolling = false;
        touchState.pointerId = -1;
      }

      pointer.active *= 0.92;
      audio.updateNodeHover(null, 0, 0, 0);
    };

    const handlePointerEnter = () => {
      if (!interactiveRef.current) return;
      void audio.ensureStarted();
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerLeave);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointercancel', handlePointerLeave);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const isMobile = width < 768;
      const mobileFit = isMobile ? Math.min(width / 390, height / 760, 1) : 1;
      const horizontalStretch = HORIZONTAL_STRETCH * (isMobile ? 0.9 * mobileFit : 1);
      const verticalStretch = VERTICAL_STRETCH * (isMobile ? 0.92 * mobileFit : 1);
      const sculptureYOffset = isMobile ? height * 0.04 : 0;
      const perspective = Math.max(width * (isMobile ? 0.68 : 0.72), height * (isMobile ? 0.76 : 0.82));

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

        const pointerPullX = pointer.x * 62 * pointer.active;
        const pointerPullY = -pointer.y * 62 * pointer.active;
        const pointerPullZ = (1 - Math.hypot(pointer.x, pointer.y)) * 38 * pointer.active;

        const sectorAlign = clamp(
          (point.bx / SCULPTURE_EXTENT_X) * centerImpact.dirX + (point.by / SCULPTURE_EXTENT_Y) * centerImpact.dirY,
          0,
          1
        );
        const sectorExpand = sectorAlign * centerImpact.strength;
        const expandPush = sectorExpand * 195;

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
          px: centerX + x3 * scale * horizontalStretch,
          py: centerY + sculptureYOffset + y3 * scale * verticalStretch,
          depth: z2,
          size: (point.ring >= 0 ? 2.4 : 3.1) * scale + pointer.active * 0.9 + sectorExpand * 4.8,
        });
      }

      projected.sort((a, b) => a.depth - b.depth);
      projectedScreenRef.current = projected.map((node) => ({
        px: node.px,
        py: node.py,
        midi: node.midi,
      }));

      const pointerPx = centerX + pointer.x * width * POINTER_REACH;
      const pointerPy = centerY + pointer.y * height * POINTER_REACH;
      let closestNode: typeof projected[number] | null = null;
      let closestDistance = Infinity;

      for (const node of projected) {
        const distance = Math.hypot(node.px - pointerPx, node.py - pointerPy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNode = node;
        }
      }

      const nodeHitRadius = (isMobile ? 74 : NODE_HOVER_RADIUS) + pointer.active * (isMobile ? 22 : 16);

      if (!reducedMotion) {
        if (closestNode && closestDistance < nodeHitRadius) {
          const spatial = screenToSpatial(closestNode.px, closestNode.py, width, height);
          const pitchIntensity = clamp(1 - closestDistance / nodeHitRadius, 0.55, 1);

          if (closestNode.ring >= 0 && closestNode.technique) {
            audio.updateNodeHover(
              {
                kind: 'technique',
                technique: closestNode.technique,
                markerIndex: closestNode.techniqueMarkerIndex,
              },
              spatial.x,
              spatial.y,
              pitchIntensity
            );
          } else {
            audio.updateNodeHover({ kind: 'pitch', midi: closestNode.midi }, spatial.x, spatial.y, pitchIntensity);
          }
        } else {
          const edgeHover = resolveEdgeHover(pointer.x, pointer.y);
          if (edgeHover && pointer.active > 0.04) {
            const spatial = pointerToSpatial(pointer.x, pointer.y);
            audio.updateNodeHover({ kind: 'pitch', midi: edgeHover.midi }, spatial.x, spatial.y, edgeHover.intensity);
          } else {
            audio.updateNodeHover(null, 0, 0, 0);
          }
        }
      }

      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        Math.max(width, height) * 0.72
      );
      gradient.addColorStop(0, pearlRgba('glow', 0.1));
      gradient.addColorStop(1, 'rgba(248, 245, 240, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const linkDistance = (isMobile ? 148 : 178) + centerImpact.strength * (isMobile ? 88 : 108);
      const linkStride = isMobile ? 2 : 1;

      for (let i = 0; i < projected.length; i += linkStride) {
        for (let j = i + 1; j < projected.length; j += linkStride) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.px - b.px;
          const dy = a.py - b.py;
          const distance = Math.hypot(dx, dy);

          if (distance > linkDistance) continue;

          const depthFade = 1 - (a.depth + b.depth + perspective * 2) / (perspective * 4);
          const lineBoost =
            clamp(
              (a.bx / SCULPTURE_EXTENT_X) * centerImpact.dirX + (a.by / SCULPTURE_EXTENT_Y) * centerImpact.dirY,
              0,
              1
            ) +
            clamp(
              (b.bx / SCULPTURE_EXTENT_X) * centerImpact.dirX + (b.by / SCULPTURE_EXTENT_Y) * centerImpact.dirY,
              0,
              1
            );
          const alpha = (1 - distance / linkDistance) * depthFade * (0.12 + pointer.active * 0.18 + lineBoost * 0.12);

          context.beginPath();
          context.moveTo(a.px, a.py);
          context.lineTo(b.px, b.py);
          context.strokeStyle = pearlRgba('line', Math.max(0.04, alpha));
          context.lineWidth = 0.6 + pointer.active * 0.5;
          context.stroke();
        }
      }

      for (const node of projected) {
        const isActiveNode = closestNode === node && closestDistance < nodeHitRadius;
        const glow = 0.35 + pointer.active * 0.45 + (isActiveNode ? 0.35 : 0);
        const alpha = clamp(0.2 + glow - node.depth / (perspective * 2.5), 0.15, 1);
        const nodeSize = node.size + (isActiveNode ? 2.4 : 0);

        context.beginPath();
        context.arc(node.px, node.py, nodeSize * 2.2, 0, Math.PI * 2);
        context.fillStyle = pearlRgba('wire', alpha * (isActiveNode ? 0.32 : 0.18));
        context.fill();

        context.beginPath();
        context.arc(node.px, node.py, nodeSize, 0, Math.PI * 2);
        context.fillStyle = isActiveNode
          ? pearlRgba('highlight', alpha)
          : node.ring >= 0
          ? pearlRgba('ring', alpha)
          : pearlRgba('node', alpha);
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
        context.fillStyle = pearlRgba('wire', 0.03 + centerImpact.strength * 0.1);
        context.fill();

        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(tipX, tipY);
        context.strokeStyle = pearlRgba('line', 0.08 + centerImpact.strength * 0.28);
        context.lineWidth = 1 + centerImpact.strength * 2.2;
        context.stroke();
      }

      if (pointer.active > 0.05) {
        const rippleX = centerX + pointer.x * width * 0.38;
        const rippleY = centerY + pointer.y * height * 0.38;
        const rippleRadius = 52 + pointer.active * 150 + Math.sin(time * 4) * 10;

        context.beginPath();
        context.arc(rippleX, rippleY, rippleRadius, 0, Math.PI * 2);
        context.strokeStyle = pearlRgba('wire', 0.08 + pointer.active * 0.2);
        context.lineWidth = 1;
        context.stroke();

        context.beginPath();
        context.arc(rippleX, rippleY, rippleRadius * 0.62, 0, Math.PI * 2);
        context.strokeStyle = pearlRgba('line', 0.05 + pointer.active * 0.12);
        context.lineWidth = 0.6;
        context.stroke();
      }

      frameRef.current = window.requestAnimationFrame(draw);
    };

    frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerLeave);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointercancel', handlePointerLeave);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      audio.dispose();
      audioRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`sculpture-installation${interactive ? '' : ' sculpture-installation--passive'}`}
      aria-hidden="true"
      role="presentation"
    />
  );
};
