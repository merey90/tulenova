export const BASS_FLUTE_PERFORMANCE_URL = '/audio/bass-flute-performance.mp3';

export const BASS_FLUTE_PERFORMANCE_DURATION_SEC = 697.99;

/** Audience applause begins around this point in the live recording. */
export const PERFORMANCE_APPLAUSE_START_SEC = 687;

/** Last second of playable performance material (flute only). */
export const PERFORMANCE_PLAYABLE_END_SEC = 686;

/** Max sustained hover loop length per marker. */
export const PERFORMANCE_HOVER_SEGMENT_SEC = 18;

export type ExtendedTechnique = 'key-click' | 'slap' | 'jet-whistle' | 'tongue-stop' | 'multiphonic' | 'split-tone';

export interface PitchMarker {
  timeSec: number;
  label: string;
}

export const PITCH_MARKERS: Record<number, PitchMarker> = {
  33: { timeSec: 46.32, label: 'A1' },
  34: { timeSec: 49.32, label: 'A#1' },
  35: { timeSec: 52.32, label: 'B1' },
  36: { timeSec: 55.32, label: 'C2' },
  37: { timeSec: 58.32, label: 'C#2' },
  38: { timeSec: 61.32, label: 'D2' },
  39: { timeSec: 64.32, label: 'D#2' },
  40: { timeSec: 67.32, label: 'E2' },
  41: { timeSec: 70.32, label: 'F2' },
  42: { timeSec: 73.32, label: 'F#2' },
  43: { timeSec: 76.32, label: 'G2' },
  44: { timeSec: 79.32, label: 'G#2' },
  45: { timeSec: 239.49, label: 'A2' },
  46: { timeSec: 346.21, label: 'A#2' },
  47: { timeSec: 393.69, label: 'B2' },
  48: { timeSec: 478.63, label: 'C3' },
  49: { timeSec: 527.02, label: 'C#3' },
  50: { timeSec: 79.67, label: 'D3' },
  51: { timeSec: 343.96, label: 'D#3' },
  52: { timeSec: 562.4, label: 'E3' },
  53: { timeSec: 55.66, label: 'F3' },
  54: { timeSec: 344.61, label: 'F#3' },
  55: { timeSec: 462.59, label: 'G3' },
  56: { timeSec: 251.01, label: 'G#3' },
  57: { timeSec: 616.61, label: 'A3' },
};

export const TECHNIQUE_MARKERS: Record<ExtendedTechnique, number[]> = {
  'tongue-stop': [463.49, 544.16, 353.38, 605, 18, 105, 195, 275, 365, 445, 525],
  multiphonic: [413.41, 606.67, 240.4, 243.46, 45, 130, 215, 300, 385, 470, 555],
  'split-tone': [60, 145, 225, 305, 395, 480, 565],
  'key-click': [12, 88, 164, 240, 320, 410, 500, 590],
  slap: [24, 96, 180, 260, 350, 430, 520, 610],
  'jet-whistle': [8, 72, 150, 230, 310, 390, 470, 550],
};

export const CENTER_TECHNIQUE_MAP: Record<'left' | 'right' | 'top' | 'bottom', ExtendedTechnique> = {
  left: 'multiphonic',
  right: 'split-tone',
  top: 'jet-whistle',
  bottom: 'tongue-stop',
};

export const TECHNIQUE_CYCLE: ExtendedTechnique[] = [
  'key-click',
  'slap',
  'jet-whistle',
  'tongue-stop',
  'multiphonic',
  'split-tone',
];

export const NODE_COUNT = 128;
export const RING_COUNT = 4;
export const RING_NODES = 32;
export const TOTAL_NODES = NODE_COUNT + RING_COUNT * RING_NODES;

export interface InstallationPointMarker {
  index: number;
  layer: 'sphere' | 'ring';
  ring: number | null;
  midi: number;
  pitchLabel: string;
  pitchTimeSec: number;
  technique: ExtendedTechnique | null;
  techniqueTimeSec: number | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const timeSecToPosition = (timeSec: number, durationSec = PERFORMANCE_PLAYABLE_END_SEC): number =>
  clamp(timeSec / durationSec, 0.02, 0.98);

export const clampPerformanceTime = (timeSec: number): number => clamp(timeSec, 0, PERFORMANCE_PLAYABLE_END_SEC);

export const hoverSegmentEndForTime = (timeSec: number): number =>
  Math.min(clampPerformanceTime(timeSec) + PERFORMANCE_HOVER_SEGMENT_SEC, PERFORMANCE_PLAYABLE_END_SEC);

export const midiToPerformancePosition = (midi: number): number => {
  const marker = PITCH_MARKERS[midi];
  if (marker) return timeSecToPosition(marker.timeSec);
  return 0.04 + ((midi - 33) / 24) * 0.9;
};

export const techniqueToTimeSec = (technique: ExtendedTechnique, markerIndex = 0): number => {
  const markers = TECHNIQUE_MARKERS[technique];
  if (!markers.length) return 0;
  return markers[((markerIndex % markers.length) + markers.length) % markers.length];
};

export const techniqueToPerformancePosition = (technique: ExtendedTechnique, markerIndex = 0): number =>
  timeSecToPosition(techniqueToTimeSec(technique, markerIndex));

export const pointerToPerformancePosition = (pointerX: number): number => {
  const normalized = (pointerX + 1) / 2;
  return 0.02 + normalized * 0.96;
};

export const ringNodeTechnique = (ring: number, ringIndex: number): ExtendedTechnique =>
  TECHNIQUE_CYCLE[(ring * 7 + ringIndex) % TECHNIQUE_CYCLE.length];

export const ringNodeTechniqueMarkerIndex = (ring: number, ringIndex: number): number => ring * 11 + ringIndex;

export const buildInstallationPointCatalog = (): InstallationPointMarker[] => {
  const points: InstallationPointMarker[] = [];

  for (let index = 0; index < TOTAL_NODES; index += 1) {
    const isRing = index >= NODE_COUNT;
    const normalized = index / Math.max(1, TOTAL_NODES - 1);
    const midi = Math.round(33 + normalized * 24);
    const pitch = PITCH_MARKERS[midi] ?? {
      timeSec: midiToPerformancePosition(midi) * BASS_FLUTE_PERFORMANCE_DURATION_SEC,
      label: '?',
    };

    if (isRing) {
      const ring = Math.floor((index - NODE_COUNT) / RING_NODES);
      const ringIndex = (index - NODE_COUNT) % RING_NODES;
      const technique = ringNodeTechnique(ring, ringIndex);
      const techniqueTimeSec = techniqueToTimeSec(technique, ringNodeTechniqueMarkerIndex(ring, ringIndex));

      points.push({
        index,
        layer: 'ring',
        ring,
        midi,
        pitchLabel: pitch.label,
        pitchTimeSec: pitch.timeSec,
        technique,
        techniqueTimeSec,
      });
    } else {
      points.push({
        index,
        layer: 'sphere',
        ring: null,
        midi,
        pitchLabel: pitch.label,
        pitchTimeSec: pitch.timeSec,
        technique: null,
        techniqueTimeSec: null,
      });
    }
  }

  return points;
};

export const INSTALLATION_POINT_CATALOG = buildInstallationPointCatalog();
