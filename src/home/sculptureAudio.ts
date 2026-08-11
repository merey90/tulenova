import {
  ContrabassFluteNote,
  findNearestContrabassNote,
  frequencyToMidi,
  loadContrabassFluteSamples,
  playbackRateForMidi,
} from './contrabassFluteSamples';
import {
  BASS_FLUTE_PERFORMANCE_URL,
  CENTER_TECHNIQUE_MAP,
  clampPerformanceTime,
  ExtendedTechnique,
  hoverSegmentEndForTime,
  midiToPerformancePosition,
  PERFORMANCE_PLAYABLE_END_SEC,
  performancePositionToTimeSec,
  techniqueToPerformancePosition,
} from './bassFlutePerformance';
import { attachQuadStereoPanner, QuadStereoRouter, quadPointFromSide } from './quadStereo';

const FLUTE_HOVER_GAIN = (intensity: number) => 0.64 + intensity * 0.88;
const FLUTE_SPATIAL_SPREAD = 2.05;
const PERFORMANCE_IMMERSION_SPREAD = 2.9;
const PERFORMANCE_ROOM_SPREAD = 3;
const SPATIAL_EDGE_STRETCH_X = 1.24;
const SPATIAL_EDGE_STRETCH_Y = 1.18;
const PERFORMANCE_LIVE_LEVEL = 1.68;
const PERFORMANCE_QUAD_DRY_LEVEL = 1.38;
const PERFORMANCE_QUAD_ROOM_LEVEL = 1.62;
export const INSTALLATION_MASTER_OUTPUT = 1.08;
export const INSTALLATION_DEFAULT_VOLUME = 1;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const stretchEdgeSpatial = (x: number, y: number): { x: number; y: number } => ({
  x: clamp(x * SPATIAL_EDGE_STRETCH_X, -1, 1),
  y: clamp(y * SPATIAL_EDGE_STRETCH_Y, -1, 1),
});

export type CenterApproachSide = 'left' | 'right' | 'top' | 'bottom';

export class SculptureAudio {
  private context: AudioContext | null = null;

  private masterGain: GainNode | null = null;

  private crackleGain: GainNode | null = null;

  private crackleFilter: BiquadFilterNode | null = null;

  private noiseBuffer: AudioBuffer | null = null;

  private crackleNode: AudioBufferSourceNode | null = null;

  private fluteBreathGain: GainNode | null = null;

  private fluteBreathFilter: BiquadFilterNode | null = null;

  private fluteBreathNode: AudioBufferSourceNode | null = null;

  private fluteToneOsc: OscillatorNode | null = null;

  private fluteToneGain: GainNode | null = null;

  private fluteVibratoOsc: OscillatorNode | null = null;

  private fluteVibratoGain: GainNode | null = null;

  private contrabassNotes: ContrabassFluteNote[] = [];

  private contrabassLoaded = false;

  private contrabassLoopGain: GainNode | null = null;

  private contrabassLoopFilter: BiquadFilterNode | null = null;

  private contrabassLoopSource: AudioBufferSourceNode | null = null;

  private activeContrabassMidi: number | null = null;

  private performanceElement: HTMLAudioElement | null = null;

  private performanceSource: MediaElementAudioSourceNode | null = null;

  private performanceGain: GainNode | null = null;

  private performanceLiveLevel: GainNode | null = null;

  private performanceQuadDryLevel: GainNode | null = null;

  private performanceQuadRoomLevel: GainNode | null = null;

  private performanceToneFilter: BiquadFilterNode | null = null;

  private performancePresence: BiquadFilterNode | null = null;

  private performanceCompressor: DynamicsCompressorNode | null = null;

  private performanceAmbienceSend: GainNode | null = null;

  private performanceReverbSend: GainNode | null = null;

  private performanceWarmth: BiquadFilterNode | null = null;

  private performanceAir: BiquadFilterNode | null = null;

  private performanceQuad: QuadStereoRouter | null = null;

  private performanceQuadRoom: QuadStereoRouter | null = null;

  private fieldQuad: QuadStereoRouter | null = null;

  private performanceLoaded = false;

  private performanceTargetTime = 0;

  private fluteToneTarget = 73.42;

  private lastMetallic = 0;

  private lastGrain = 0;

  private lastKeyClick = 0;

  private lastFlutter = 0;

  private lastCenterTechnique = 0;

  private lastNodePitchMidi: number | null = null;

  private lastNodePitchTime = 0;

  private lastNodeTechnique: ExtendedTechnique | null = null;

  private lastNodeTechniqueTime = 0;

  private centerTechniqueIndex = 0;

  private clickTechniqueIndex = 0;

  private performancePauseTimer: number | null = null;

  private hoverSustainActive = false;

  private hoverPitchMidi: number | null = null;

  private hoverTechnique: ExtendedTechnique | null = null;

  private hoverTechniqueMarkerIndex: number | null = null;

  private hoverSegmentStartSec = 0;

  private hoverSegmentEndSec = 0;

  private hoverIntensity = 0.75;

  private hoverQuadX = 0;

  private hoverQuadY = 0;

  private performanceSpatialX = 0;

  private performanceSpatialY = 0;

  private spatialDriftPhase = 0;

  private enabled = false;

  private disposed = false;

  private masterVolume = INSTALLATION_DEFAULT_VOLUME;

  async ensureStarted(): Promise<void> {
    if (this.disposed) return;

    if (!this.context) {
      this.context = new AudioContext();
      this.setupGraph();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.enabled = true;
    this.startCrackleBed();
    this.startFluteBreathBed();
    this.startFluteTone();
    this.setupPerformanceLayer();
    void this.loadPerformanceRecording();
    void this.loadContrabassSamples();
  }

  private setupPerformanceLayer(): void {
    if (!this.context || !this.masterGain || this.performanceElement) return;

    const element = new Audio(BASS_FLUTE_PERFORMANCE_URL);
    element.preload = 'auto';
    element.crossOrigin = 'anonymous';
    element.loop = false;

    this.performanceElement = element;
    this.performanceSource = this.context.createMediaElementSource(element);

    this.performanceGain = this.context.createGain();
    this.performanceGain.gain.value = 0.0001;

    this.performanceLiveLevel = this.context.createGain();
    this.performanceLiveLevel.gain.value = PERFORMANCE_LIVE_LEVEL;

    this.performanceQuadDryLevel = this.context.createGain();
    this.performanceQuadDryLevel.gain.value = PERFORMANCE_QUAD_DRY_LEVEL;

    this.performanceQuadRoomLevel = this.context.createGain();
    this.performanceQuadRoomLevel.gain.value = PERFORMANCE_QUAD_ROOM_LEVEL;

    this.performanceWarmth = this.context.createBiquadFilter();
    this.performanceWarmth.type = 'lowshelf';
    this.performanceWarmth.frequency.value = 190;
    this.performanceWarmth.gain.value = 2.4;

    this.performanceToneFilter = this.context.createBiquadFilter();
    this.performanceToneFilter.type = 'lowpass';
    this.performanceToneFilter.frequency.value = 5800;
    this.performanceToneFilter.Q.value = 0.52;

    this.performancePresence = this.context.createBiquadFilter();
    this.performancePresence.type = 'peaking';
    this.performancePresence.frequency.value = 860;
    this.performancePresence.Q.value = 0.85;
    this.performancePresence.gain.value = 3.4;

    this.performanceAir = this.context.createBiquadFilter();
    this.performanceAir.type = 'highshelf';
    this.performanceAir.frequency.value = 5200;
    this.performanceAir.gain.value = 2.8;

    this.performanceCompressor = this.context.createDynamicsCompressor();
    this.performanceCompressor.threshold.value = -26;
    this.performanceCompressor.knee.value = 22;
    this.performanceCompressor.ratio.value = 2.8;
    this.performanceCompressor.attack.value = 0.004;
    this.performanceCompressor.release.value = 0.2;

    this.performanceAmbienceSend = this.context.createGain();
    this.performanceAmbienceSend.gain.value = 0.28;

    this.performanceReverbSend = this.context.createGain();
    this.performanceReverbSend.gain.value = 0.32;

    const ambDelayA = this.context.createDelay(0.14);
    ambDelayA.delayTime.value = 0.041;
    const ambDelayB = this.context.createDelay(0.2);
    ambDelayB.delayTime.value = 0.073;
    const ambDelayC = this.context.createDelay(0.26);
    ambDelayC.delayTime.value = 0.109;
    const ambFeedback = this.context.createGain();
    ambFeedback.gain.value = 0.42;
    const ambDamp = this.context.createBiquadFilter();
    ambDamp.type = 'lowpass';
    ambDamp.frequency.value = 3200;
    const ambWet = this.context.createGain();
    ambWet.gain.value = 0.72;

    const hallConvolver = this.context.createConvolver();
    hallConvolver.buffer = this.createHallImpulseBuffer();
    hallConvolver.normalize = false;
    const hallWet = this.context.createGain();
    hallWet.gain.value = 0.66;
    const hallDamp = this.context.createBiquadFilter();
    hallDamp.type = 'lowpass';
    hallDamp.frequency.value = 3600;

    this.performanceQuad = new QuadStereoRouter(this.context, this.masterGain, {
      rlDelaySec: 0.044,
      rrDelaySec: 0.053,
      rearMix: 0.96,
      frontBoost: 1.2,
      rearCutoffHz: 2600,
      sharpenPower: 0.38,
    });

    this.performanceQuadRoom = new QuadStereoRouter(this.context, this.masterGain, {
      rlDelaySec: 0.058,
      rrDelaySec: 0.068,
      rearMix: 1.12,
      frontBoost: 0.84,
      rearCutoffHz: 3000,
      sharpenPower: 0.32,
    });

    this.performanceSource.connect(this.performanceWarmth);
    this.performanceWarmth.connect(this.performanceToneFilter);
    this.performanceToneFilter.connect(this.performancePresence);
    this.performancePresence.connect(this.performanceAir);
    this.performanceAir.connect(this.performanceCompressor);
    this.performanceCompressor.connect(this.performanceLiveLevel);
    this.performanceLiveLevel.connect(this.performanceGain);
    this.performanceGain.connect(this.performanceQuadDryLevel);
    this.performanceQuadDryLevel.connect(this.performanceQuad.input);

    this.performanceGain.connect(this.performanceAmbienceSend);
    this.performanceAmbienceSend.connect(ambDelayA);
    ambDelayA.connect(ambDelayB);
    ambDelayB.connect(ambDelayC);
    ambDelayC.connect(ambFeedback);
    ambFeedback.connect(ambDelayA);
    ambDelayC.connect(ambDamp);
    ambDamp.connect(ambWet);
    ambWet.connect(this.performanceQuadRoomLevel);

    this.performanceGain.connect(this.performanceReverbSend);
    this.performanceReverbSend.connect(hallConvolver);
    hallConvolver.connect(hallDamp);
    hallDamp.connect(hallWet);
    hallWet.connect(this.performanceQuadRoomLevel);
    this.performanceQuadRoomLevel.connect(this.performanceQuadRoom.input);

    this.performanceElement.addEventListener('timeupdate', () => {
      this.enforcePerformancePlaybackLimit();
    });

    this.performanceElement.addEventListener('ended', () => {
      this.enforcePerformancePlaybackLimit();
    });
  }

  private enforcePerformancePlaybackLimit(): void {
    if (!this.performanceElement) return;

    if (this.performanceElement.currentTime > PERFORMANCE_PLAYABLE_END_SEC - 0.08) {
      this.performanceElement.pause();
      this.performanceElement.currentTime = Math.max(0, PERFORMANCE_PLAYABLE_END_SEC - 0.12);
    }

    if (this.hoverSustainActive) {
      this.enforceHoverSegmentBounds();
      return;
    }

    if (this.performanceElement.currentTime >= PERFORMANCE_PLAYABLE_END_SEC - 0.12) {
      this.performanceElement.pause();
      this.performanceElement.currentTime = PERFORMANCE_PLAYABLE_END_SEC - 0.12;

      if (this.context && this.performanceGain) {
        const now = this.context.currentTime;
        this.performanceGain.gain.cancelScheduledValues(now);
        this.performanceGain.gain.setTargetAtTime(0.0001, now, 0.05);
      }
    }
  }

  private enforceHoverSegmentBounds(): void {
    if (!this.hoverSustainActive || !this.performanceElement) return;

    const current = this.performanceElement.currentTime;

    if (current >= PERFORMANCE_PLAYABLE_END_SEC - 0.12) {
      if (this.context && this.performanceGain) {
        const now = this.context.currentTime;
        const targetGain = FLUTE_HOVER_GAIN(this.hoverIntensity);
        this.performanceGain.gain.cancelScheduledValues(now);
        this.performanceGain.gain.setValueAtTime(targetGain * 0.5, now);
        this.performanceElement.currentTime = this.hoverSegmentStartSec;
        this.performanceGain.gain.linearRampToValueAtTime(targetGain, now + 0.14);
      } else {
        this.performanceElement.currentTime = this.hoverSegmentStartSec;
      }
      return;
    }

    if (current >= this.hoverSegmentEndSec - 0.04) {
      if (this.context && this.performanceGain) {
        const now = this.context.currentTime;
        const targetGain = FLUTE_HOVER_GAIN(this.hoverIntensity);
        this.performanceGain.gain.cancelScheduledValues(now);
        this.performanceGain.gain.setValueAtTime(targetGain * 0.5, now);
        this.performanceElement.currentTime = this.hoverSegmentStartSec;
        this.performanceGain.gain.linearRampToValueAtTime(targetGain, now + 0.14);
      } else {
        this.performanceElement.currentTime = this.hoverSegmentStartSec;
      }
    }
  }

  private async loadPerformanceRecording(): Promise<void> {
    if (!this.performanceElement || this.disposed) return;

    try {
      await new Promise<void>((resolve, reject) => {
        const element = this.performanceElement;
        if (!element) {
          reject(new Error('Performance element unavailable'));
          return;
        }

        const handleReady = () => {
          element.removeEventListener('loadedmetadata', handleReady);
          element.removeEventListener('error', handleError);
          resolve();
        };

        const handleError = () => {
          element.removeEventListener('loadedmetadata', handleReady);
          element.removeEventListener('error', handleError);
          reject(new Error('Failed to load bass flute performance'));
        };

        if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
          resolve();
          return;
        }

        element.addEventListener('loadedmetadata', handleReady);
        element.addEventListener('error', handleError);
        element.load();
      });

      this.performanceLoaded = true;
      this.performanceTargetTime = clampPerformanceTime(PERFORMANCE_PLAYABLE_END_SEC * 0.18);
      this.performanceElement.currentTime = this.performanceTargetTime;
    } catch {
      this.performanceLoaded = false;
    }
  }

  private async loadContrabassSamples(): Promise<void> {
    if (!this.context || this.disposed) return;

    try {
      this.contrabassNotes = await loadContrabassFluteSamples(this.context);
      this.contrabassLoaded = true;
      this.stopFluteSynthTone();
    } catch {
      this.contrabassLoaded = false;
    }
  }

  private stopFluteSynthTone(): void {
    if (this.fluteToneOsc) {
      this.fluteToneOsc.stop();
      this.fluteToneOsc.disconnect();
      this.fluteToneOsc = null;
    }

    if (this.fluteVibratoOsc) {
      this.fluteVibratoOsc.stop();
      this.fluteVibratoOsc.disconnect();
      this.fluteVibratoOsc = null;
    }
  }

  private setupGraph(): void {
    if (!this.context) return;

    const { context } = this;
    this.noiseBuffer = this.createNoiseBuffer(2);

    this.masterGain = context.createGain();
    this.masterGain.gain.value = INSTALLATION_MASTER_OUTPUT * this.masterVolume;

    this.fieldQuad = new QuadStereoRouter(context, this.masterGain);

    this.crackleGain = context.createGain();
    this.crackleGain.gain.value = 0.0001;

    this.crackleFilter = context.createBiquadFilter();
    this.crackleFilter.type = 'bandpass';
    this.crackleFilter.frequency.value = 4200;
    this.crackleFilter.Q.value = 0.7;

    this.crackleGain.connect(this.crackleFilter);
    this.crackleFilter.connect(this.fieldQuad.input);

    this.fluteBreathGain = context.createGain();
    this.fluteBreathGain.gain.value = 0.0001;

    this.fluteBreathFilter = context.createBiquadFilter();
    this.fluteBreathFilter.type = 'bandpass';
    this.fluteBreathFilter.frequency.value = 220;
    this.fluteBreathFilter.Q.value = 0.28;

    this.fluteBreathGain.connect(this.fluteBreathFilter);
    this.fluteBreathFilter.connect(this.fieldQuad.input);

    this.fluteToneGain = context.createGain();
    this.fluteToneGain.gain.value = 0.0001;
    this.fluteToneGain.connect(this.fieldQuad.input);

    this.contrabassLoopGain = context.createGain();
    this.contrabassLoopGain.gain.value = 0.0001;

    this.contrabassLoopFilter = context.createBiquadFilter();
    this.contrabassLoopFilter.type = 'lowpass';
    this.contrabassLoopFilter.frequency.value = 1400;
    this.contrabassLoopFilter.Q.value = 0.5;

    this.contrabassLoopGain.connect(this.contrabassLoopFilter);
    this.contrabassLoopFilter.connect(this.fieldQuad.input);

    this.masterGain.connect(context.destination);
  }

  private createHallImpulseBuffer(durationSec = 3.6): AudioBuffer {
    if (!this.context) throw new Error('Audio context unavailable');

    const sampleRate = this.context.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = this.context.createBuffer(2, length, sampleRate);
    const earlyReflections = [0.019, 0.031, 0.047, 0.061, 0.079, 0.098];

    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);

      for (let index = 0; index < length; index += 1) {
        const time = index / sampleRate;
        let sample = (Math.random() * 2 - 1) * Math.exp(-time * 2.4);

        for (const reflectionTime of earlyReflections) {
          if (Math.abs(time - reflectionTime) < 0.00045) {
            sample += (channel === 0 ? 0.34 : 0.28) * (1 - reflectionTime * 2.2);
          }
        }

        data[index] = sample * (channel === 0 ? 1 : 0.93);
      }
    }

    return buffer;
  }

  private connectQuad(source: AudioNode, x: number, y: number): void {
    if (!this.context || !this.masterGain) return;
    const point = stretchEdgeSpatial(x, y);
    attachQuadStereoPanner(this.context, source, this.masterGain, point, FLUTE_SPATIAL_SPREAD);
  }

  private isPerformancePlaying(): boolean {
    return Boolean(
      this.performanceLoaded &&
        this.performanceElement &&
        !this.performanceElement.paused &&
        !this.performanceElement.ended
    );
  }

  private updatePerformanceQuadPosition(x: number, y: number, time: number): void {
    const point = stretchEdgeSpatial(x, y);
    this.performanceSpatialX = point.x;
    this.performanceSpatialY = point.y;
    this.performanceQuad?.setPosition(point.x, point.y, time, PERFORMANCE_IMMERSION_SPREAD);
    const roomX = clamp(point.x * 0.82, -1, 1);
    const roomY = clamp(point.y + 0.58, -1, 1);
    this.performanceQuadRoom?.setPosition(roomX, roomY, time, PERFORMANCE_ROOM_SPREAD);
  }

  private syncPerformanceSpatialization(pointerX: number, pointerY: number, time: number): void {
    if (!this.performanceLoaded || !this.performanceQuad) return;

    if (this.hoverSustainActive) {
      this.spatialDriftPhase += 0.021;
      const driftX = clamp(this.hoverQuadX + Math.sin(this.spatialDriftPhase) * 0.22, -1, 1);
      const driftY = clamp(this.hoverQuadY + Math.cos(this.spatialDriftPhase * 0.79) * 0.16, -1, 1);
      this.updatePerformanceQuadPosition(driftX, driftY, time);
      return;
    }

    this.spatialDriftPhase = 0;

    if (this.isPerformancePlaying()) {
      this.updatePerformanceQuadPosition(pointerX, pointerY, time);
    }
  }

  private setHoverQuadPosition(x: number, y: number): void {
    if (!this.context) return;

    const point = stretchEdgeSpatial(x, y);
    this.hoverQuadX = point.x;
    this.hoverQuadY = point.y;
    this.updatePerformanceQuadPosition(point.x, point.y, this.context.currentTime);
    this.fieldQuad?.setPosition(point.x, point.y, this.context.currentTime, FLUTE_SPATIAL_SPREAD);
  }

  private updateFieldQuadPosition(pointerX: number, pointerY: number, time: number): void {
    if (this.hoverSustainActive) {
      this.fieldQuad?.setPosition(this.hoverQuadX, this.hoverQuadY, time, FLUTE_SPATIAL_SPREAD);
      return;
    }

    const point = stretchEdgeSpatial(pointerX, pointerY);
    this.fieldQuad?.setPosition(point.x, point.y, time, FLUTE_SPATIAL_SPREAD);
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.context) throw new Error('Audio context unavailable');

    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private startCrackleBed(): void {
    if (!this.context || !this.noiseBuffer || !this.crackleGain || this.crackleNode) return;

    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    source.connect(this.crackleGain);
    source.start();
    this.crackleNode = source;

    const now = this.context.currentTime;
    this.crackleGain.gain.setTargetAtTime(0.018, now, 0.4);
  }

  private startFluteBreathBed(): void {
    if (!this.context || !this.noiseBuffer || !this.fluteBreathGain || this.fluteBreathNode) return;

    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    source.connect(this.fluteBreathGain);
    source.start();
    this.fluteBreathNode = source;

    const now = this.context.currentTime;
    this.fluteBreathGain.gain.setTargetAtTime(0.018, now, 0.5);
  }

  private startFluteTone(): void {
    if (!this.context || !this.fluteToneGain || this.fluteToneOsc) return;

    const { context } = this;

    this.fluteVibratoOsc = context.createOscillator();
    this.fluteVibratoOsc.type = 'sine';
    this.fluteVibratoOsc.frequency.value = 2.6;

    this.fluteVibratoGain = context.createGain();
    this.fluteVibratoGain.gain.value = 2.2;

    this.fluteToneOsc = context.createOscillator();
    this.fluteToneOsc.type = 'sine';
    this.fluteToneOsc.frequency.value = this.fluteToneTarget;

    this.fluteVibratoOsc.connect(this.fluteVibratoGain);
    this.fluteVibratoGain.connect(this.fluteToneOsc.frequency);

    this.fluteToneOsc.connect(this.fluteToneGain);
    this.fluteToneOsc.start();
    this.fluteVibratoOsc.start();
  }

  private pointerToFluteFrequency(pointerX: number, pointerY: number): number {
    const pitchPosition = clamp((1 - pointerY) * 0.5 + 0.5 + pointerX * 0.08, 0, 1);
    const minMidi = 33;
    const maxMidi = 57;
    const midi = minMidi + pitchPosition * (maxMidi - minMidi);
    return 440 * 2 ** ((midi - 69) / 12);
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = clamp(volume, 0, 1);

    if (!this.masterGain || !this.context) return;

    this.masterGain.gain.setTargetAtTime(
      INSTALLATION_MASTER_OUTPUT * this.masterVolume,
      this.context.currentTime,
      0.04
    );
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  updateFromMotion(active: number, speed: number, pointerX: number, pointerY: number): void {
    if (!this.enabled || !this.context || !this.crackleGain || !this.crackleFilter) return;

    const motion = clamp(speed * 8 + active * 0.35, 0, 1);
    const now = this.context.currentTime;
    const performanceFocus = this.hoverSustainActive ? 0.48 : this.isPerformancePlaying() ? 0.68 : 1;

    this.crackleGain.gain.setTargetAtTime((0.012 + motion * 0.09) * performanceFocus, now, 0.08);
    this.crackleFilter.frequency.setTargetAtTime(1800 + motion * 5200 + pointerY * 900, now, 0.12);
    this.crackleFilter.Q.setTargetAtTime(0.5 + motion * 2.2, now, 0.15);

    if (this.performanceToneFilter) {
      const openness = this.hoverSustainActive ? 1 : motion * 0.65 + active * 0.2;
      this.performanceToneFilter.frequency.setTargetAtTime(5000 + openness * 3600, now, 0.16);
    }

    if (this.performanceWarmth) {
      const warmth = this.hoverSustainActive ? 2.8 : 1.8 + motion * 0.9;
      this.performanceWarmth.gain.setTargetAtTime(warmth, now, 0.2);
    }

    if (this.performanceAir) {
      const air = this.hoverSustainActive ? 3.4 : 2.2 + motion * 1.2;
      this.performanceAir.gain.setTargetAtTime(air, now, 0.18);
    }

    if (this.performanceAmbienceSend) {
      const ambience = this.hoverSustainActive ? 0.48 : this.isPerformancePlaying() ? 0.4 : 0.3;
      this.performanceAmbienceSend.gain.setTargetAtTime(ambience, now, 0.22);
    }

    if (this.performanceReverbSend) {
      const reverb = this.hoverSustainActive ? 0.54 : this.isPerformancePlaying() ? 0.44 : 0.34;
      this.performanceReverbSend.gain.setTargetAtTime(reverb, now, 0.24);
    }

    if (this.performancePresence) {
      const body = this.hoverSustainActive ? 4 : 2.6 + motion * 1.5;
      this.performancePresence.gain.setTargetAtTime(body, now, 0.18);
    }

    this.updateFieldQuadPosition(pointerX, pointerY, now);
    this.syncPerformanceSpatialization(pointerX, pointerY, now);
    this.updateFluteLayers(motion, active, pointerX, pointerY);

    this.maybeTriggerMetallic(motion, pointerX, pointerY);
    this.maybeTriggerGrains(motion, pointerX);
    this.maybeTriggerFlutter(motion, pointerX, pointerY);
  }

  private schedulePerformancePause(delayMs = 1400): void {
    if (this.performancePauseTimer !== null) {
      window.clearTimeout(this.performancePauseTimer);
    }

    this.performancePauseTimer = window.setTimeout(() => {
      this.performancePauseTimer = null;
      if (!this.performanceElement || !this.performanceGain || this.hoverSustainActive) return;

      const now = this.context?.currentTime ?? 0;
      this.performanceGain.gain.cancelScheduledValues(now);
      this.performanceGain.gain.setTargetAtTime(0.0001, now, 0.08);
      this.performanceElement.pause();
    }, delayMs);
  }

  private updateHoverGain(intensity: number): void {
    if (!this.performanceGain || !this.context) return;
    this.hoverIntensity = intensity;
    const now = this.context.currentTime;
    this.performanceGain.gain.setTargetAtTime(FLUTE_HOVER_GAIN(intensity), now, 0.1);
  }

  private sustainHoverAtTime(timeSec: number, x: number, y: number, intensity: number, switching: boolean): void {
    if (!this.performanceLoaded || !this.performanceElement || !this.performanceGain || !this.context) return;

    if (this.performancePauseTimer !== null) {
      window.clearTimeout(this.performancePauseTimer);
      this.performancePauseTimer = null;
    }

    const clampedTime = clampPerformanceTime(timeSec);
    this.hoverSegmentStartSec = clampedTime;
    this.hoverSegmentEndSec = hoverSegmentEndForTime(clampedTime);

    const now = this.context.currentTime;
    const targetGain = FLUTE_HOVER_GAIN(intensity);
    this.hoverIntensity = intensity;

    this.performanceElement.currentTime = clampedTime;
    this.performanceTargetTime = clampedTime;
    this.performanceElement.playbackRate = 1;

    this.performanceGain.gain.cancelScheduledValues(now);
    this.performanceGain.gain.setValueAtTime(this.performanceGain.gain.value, now);

    if (switching) {
      this.performanceGain.gain.linearRampToValueAtTime(targetGain * 0.45, now + 0.05);
      this.performanceGain.gain.linearRampToValueAtTime(targetGain, now + 0.24);
    } else {
      this.performanceGain.gain.linearRampToValueAtTime(targetGain, now + 0.1);
    }

    void this.performanceElement.play().catch(() => undefined);
    this.setHoverQuadPosition(x, y);
    this.hoverSustainActive = true;
  }

  private sustainHoverContrabass(midi: number, intensity: number): void {
    if (!this.contrabassLoaded || !this.context || !this.contrabassLoopGain || !this.contrabassNotes.length) return;

    const now = this.context.currentTime;
    const nearest = findNearestContrabassNote(this.contrabassNotes, midi);
    const playbackRate = playbackRateForMidi(nearest.midi, midi);

    if (this.activeContrabassMidi !== nearest.midi) {
      this.startContrabassLoop(nearest, playbackRate);
      this.activeContrabassMidi = nearest.midi;
    } else if (this.contrabassLoopSource) {
      this.contrabassLoopSource.playbackRate.setTargetAtTime(playbackRate, now, 0.1);
    }

    this.contrabassLoopGain.gain.setTargetAtTime(0.12 + intensity * 0.28, now, 0.12);
    this.hoverSustainActive = true;
  }

  private releaseHoverPerformance(): void {
    if (!this.hoverSustainActive && this.hoverPitchMidi === null && this.hoverTechnique === null) return;

    this.hoverSustainActive = false;
    this.hoverPitchMidi = null;
    this.hoverTechnique = null;
    this.hoverTechniqueMarkerIndex = null;
    this.hoverQuadX = 0;
    this.hoverQuadY = 0;
    this.performanceSpatialX = 0;
    this.performanceSpatialY = 0;
    this.spatialDriftPhase = 0;

    if (this.context && this.contrabassLoopGain) {
      this.contrabassLoopGain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.14);
      this.stopContrabassLoop();
    }

    this.schedulePerformancePause(350);
  }

  updateNodeHover(
    target:
      | { kind: 'pitch'; midi: number }
      | { kind: 'technique'; technique: ExtendedTechnique; markerIndex: number }
      | null,
    x: number,
    y: number,
    intensity: number
  ): void {
    if (!this.enabled || !this.context) return;

    if (!target) {
      this.releaseHoverPerformance();
      return;
    }

    if (target.kind === 'pitch') {
      const samePitch = this.hoverPitchMidi === target.midi && this.hoverTechnique === null;
      if (samePitch) {
        this.setHoverQuadPosition(x, y);
        this.updateHoverGain(intensity);
        return;
      }

      const switching = this.hoverSustainActive;
      this.hoverTechnique = null;
      this.hoverTechniqueMarkerIndex = null;
      this.hoverPitchMidi = target.midi;

      if (this.performanceLoaded && this.performanceElement) {
        this.sustainHoverAtTime(
          performancePositionToTimeSec(midiToPerformancePosition(target.midi)),
          x,
          y,
          intensity,
          switching
        );
        return;
      }

      this.sustainHoverContrabass(target.midi, intensity);
      this.setHoverQuadPosition(x, y);
      return;
    }

    const sameTechnique =
      this.hoverTechnique === target.technique && this.hoverTechniqueMarkerIndex === target.markerIndex;
    if (sameTechnique) {
      this.setHoverQuadPosition(x, y);
      this.updateHoverGain(intensity);
      return;
    }

    const switching = this.hoverSustainActive;
    this.hoverPitchMidi = null;
    this.hoverTechnique = target.technique;
    this.hoverTechniqueMarkerIndex = target.markerIndex;

    if (this.performanceLoaded && this.performanceElement) {
      this.sustainHoverAtTime(
        performancePositionToTimeSec(techniqueToPerformancePosition(target.technique, target.markerIndex)),
        x,
        y,
        intensity,
        switching
      );
      return;
    }

    this.playRecordedTechniqueFallback(target.technique, intensity, x, y);
    this.hoverSustainActive = true;
  }

  private seekPerformanceToTime(
    timeSec: number,
    intensity: number,
    burst = true,
    pointerX = this.performanceSpatialX,
    pointerY = this.performanceSpatialY
  ): void {
    if (!this.performanceLoaded || !this.context || !this.performanceElement || !this.performanceGain) return;

    this.performanceElement.currentTime = clampPerformanceTime(timeSec);
    this.performanceTargetTime = this.performanceElement.currentTime;
    this.performanceElement.playbackRate = 1;

    const now = this.context.currentTime;
    const peak = 0.52 + intensity * 0.78;
    this.updatePerformanceQuadPosition(pointerX, pointerY, now);
    this.performanceGain.gain.cancelScheduledValues(now);
    this.performanceGain.gain.setValueAtTime(0.0001, now);
    this.performanceGain.gain.linearRampToValueAtTime(peak, now + 0.04);

    if (burst && !this.hoverSustainActive) {
      this.performanceGain.gain.setTargetAtTime(0.0001, now + 0.45, 0.28);
      void this.performanceElement.play().catch(() => undefined);
      this.schedulePerformancePause(1500);
      return;
    }

    if (burst) {
      this.performanceGain.gain.setTargetAtTime(0.38 + intensity * 0.44, now + 0.45, 0.2);
    }

    void this.performanceElement.play().catch(() => undefined);
  }

  private seekPerformanceToMidi(midi: number, intensity: number, pointerX?: number, pointerY?: number): void {
    if (!this.performanceLoaded || !this.context || !this.performanceElement || !this.performanceGain) return;

    this.seekPerformanceToTime(
      performancePositionToTimeSec(midiToPerformancePosition(midi)),
      intensity,
      true,
      pointerX,
      pointerY
    );
  }

  private seekPerformanceToTechnique(
    technique: ExtendedTechnique,
    markerIndex: number,
    intensity: number,
    pointerX?: number,
    pointerY?: number
  ): void {
    if (!this.performanceLoaded || !this.context || !this.performanceElement || !this.performanceGain) return;

    this.seekPerformanceToTime(
      performancePositionToTimeSec(techniqueToPerformancePosition(technique, markerIndex)),
      intensity,
      true,
      pointerX,
      pointerY
    );
  }

  private updateFluteLayers(motion: number, active: number, pointerX: number, pointerY: number): void {
    if (
      !this.context ||
      !this.fluteBreathGain ||
      !this.fluteBreathFilter ||
      !this.fluteToneGain ||
      !this.fluteToneOsc
    ) {
      return;
    }

    const now = this.context.currentTime;
    const spatialX = this.hoverSustainActive ? this.hoverQuadX : pointerX;
    const spatialY = this.hoverSustainActive ? this.hoverQuadY : pointerY;
    const targetFreq = this.pointerToFluteFrequency(spatialX, spatialY);
    this.fluteToneTarget += (targetFreq - this.fluteToneTarget) * 0.06;
    this.fluteToneOsc.frequency.setTargetAtTime(this.fluteToneTarget, now, 0.1);

    this.fluteBreathGain.gain.setTargetAtTime(
      (this.performanceLoaded ? 0.01 + motion * 0.05 + active * 0.022 : 0.01 + motion * 0.075 + active * 0.038) *
        (this.hoverSustainActive ? 0.42 : this.isPerformancePlaying() ? 0.62 : 1),
      now,
      0.1
    );
    this.fluteBreathFilter.frequency.setTargetAtTime(120 + motion * 480 + active * 220, now, 0.14);
    this.fluteBreathFilter.Q.setTargetAtTime(0.22 + motion * 0.3, now, 0.15);

    this.fluteToneGain.gain.setTargetAtTime(
      this.performanceLoaded || active <= 0.08 ? 0.0001 : 0.004 + active * 0.022 + motion * 0.008,
      now,
      0.14
    );

    this.updateContrabassSampleLayer(active, motion, pointerX, pointerY);
  }

  private updateContrabassSampleLayer(active: number, motion: number, pointerX: number, pointerY: number): void {
    if (this.performanceLoaded) {
      if (this.context && this.contrabassLoopGain) {
        this.contrabassLoopGain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.08);
      }
      this.stopContrabassLoop();
      return;
    }

    if (!this.contrabassLoaded || !this.context || !this.contrabassLoopGain || !this.contrabassNotes.length) {
      return;
    }

    const now = this.context.currentTime;
    const targetGain = active > 0.08 ? 0.008 + active * 0.05 + motion * 0.02 : 0.0001;

    if (targetGain <= 0.0002) {
      this.contrabassLoopGain.gain.setTargetAtTime(0.0001, now, 0.12);
      return;
    }

    const targetMidi = frequencyToMidi(this.pointerToFluteFrequency(pointerX, pointerY));
    const nearest = findNearestContrabassNote(this.contrabassNotes, targetMidi);
    const playbackRate = playbackRateForMidi(nearest.midi, targetMidi);

    if (this.activeContrabassMidi !== nearest.midi) {
      this.startContrabassLoop(nearest, playbackRate);
      this.activeContrabassMidi = nearest.midi;
    } else if (this.contrabassLoopSource) {
      this.contrabassLoopSource.playbackRate.setTargetAtTime(playbackRate, now, 0.1);
    }

    this.contrabassLoopGain.gain.setTargetAtTime(targetGain, now, 0.12);
    this.contrabassLoopFilter?.frequency.setTargetAtTime(900 + motion * 700 + active * 500, now, 0.14);
  }

  private startContrabassLoop(note: ContrabassFluteNote, playbackRate: number): void {
    if (!this.context || !this.contrabassLoopGain) return;

    this.stopContrabassLoop();

    const source = this.context.createBufferSource();
    source.buffer = note.buffer;
    source.loop = true;
    source.loopStart = note.buffer.duration * 0.18;
    source.loopEnd = note.buffer.duration * 0.82;
    source.playbackRate.value = playbackRate;
    source.connect(this.contrabassLoopGain);
    source.start(0, note.buffer.duration * 0.12);
    this.contrabassLoopSource = source;
  }

  private stopContrabassLoop(): void {
    if (!this.contrabassLoopSource) return;

    try {
      this.contrabassLoopSource.stop();
    } catch {
      // Source may already be stopped.
    }

    this.contrabassLoopSource.disconnect();
    this.contrabassLoopSource = null;
    this.activeContrabassMidi = null;
  }

  private playContrabassStaccato(intensity: number, pointerX: number, pointerY: number): void {
    if (this.performanceLoaded) {
      const targetMidi = frequencyToMidi(this.pointerToFluteFrequency(pointerX, pointerY));
      this.seekPerformanceToMidi(targetMidi, intensity, pointerX, pointerY);
      return;
    }

    const targetMidi = frequencyToMidi(this.pointerToFluteFrequency(pointerX, pointerY));
    this.playContrabassPitchClear(targetMidi, intensity, pointerX, pointerY, 0.55);
  }

  triggerNodePitch(midi: number, intensity: number, x: number, y: number): void {
    if (!this.enabled || !this.context) return;

    const now = performance.now();
    if (midi === this.lastNodePitchMidi && now - this.lastNodePitchTime < 140) return;

    this.lastNodePitchMidi = midi;
    this.lastNodePitchTime = now;

    if (this.performanceLoaded) {
      this.seekPerformanceToMidi(midi, intensity, x, y);
      this.setHoverQuadPosition(x, y);
      return;
    }

    this.playContrabassPitchClear(midi, intensity, x, y, 0.92);
  }

  triggerNodeTechnique(
    technique: ExtendedTechnique,
    markerIndex: number,
    intensity: number,
    x: number,
    y: number
  ): void {
    if (!this.enabled || !this.context) return;

    const now = performance.now();
    if (technique === this.lastNodeTechnique && now - this.lastNodeTechniqueTime < 120) return;

    this.lastNodeTechnique = technique;
    this.lastNodeTechniqueTime = now;

    if (this.performanceLoaded) {
      this.seekPerformanceToTechnique(technique, markerIndex, intensity, x, y);
      this.setHoverQuadPosition(x, y);
      return;
    }

    this.playRecordedTechniqueFallback(technique, intensity, x, y);
  }

  private playRecordedTechniqueFallback(
    technique: ExtendedTechnique,
    intensity: number,
    pointerX: number,
    pointerY = 0
  ): void {
    switch (technique) {
      case 'key-click':
        this.playKeyClick(pointerX, true);
        break;
      case 'slap':
        this.playSlap(intensity, pointerX, pointerY);
        break;
      case 'jet-whistle':
        this.playJetWhistle(intensity, pointerX, pointerY);
        break;
      case 'tongue-stop':
        this.playTongueStop(intensity);
        break;
      case 'multiphonic':
        this.playMultiphonicCluster(intensity, pointerX, pointerY);
        break;
      case 'split-tone':
        this.playSplitToneSqueak(intensity, pointerX, pointerY);
        break;
      default:
        break;
    }
  }

  playContrabassPitchClear(midi: number, intensity: number, x: number, y: number, sustainRatio = 0.92): void {
    if (!this.contrabassLoaded || !this.context || !this.masterGain || !this.contrabassNotes.length) return;

    const { context } = this;
    const now = context.currentTime;
    const nearest = findNearestContrabassNote(this.contrabassNotes, midi);
    const playbackRate = playbackRateForMidi(nearest.midi, midi);
    const duration = Math.min(nearest.buffer.duration * sustainRatio, 2.2);

    const source = context.createBufferSource();
    source.buffer = nearest.buffer;
    source.playbackRate.value = playbackRate;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16 + intensity * 0.28, now + 0.02);
    gain.gain.setValueAtTime(0.13 + intensity * 0.22, now + duration * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    source.connect(filter);
    filter.connect(gain);
    this.connectQuad(gain, x, y);

    source.start(now);
    source.stop(now + duration + 0.02);
  }

  triggerTouchBurst(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.enabled || !this.context) return;

    this.playKeyClick(pointerX, false, pointerY);

    for (let index = 0; index < 4 + Math.floor(intensity * 6); index += 1) {
      window.setTimeout(() => {
        this.playMetallicHit(intensity * 0.9, pointerX + (Math.random() - 0.5) * 0.4, pointerY);
        this.playCrackleGrain(intensity, pointerX);
      }, index * (12 + Math.random() * 28));
    }
  }

  triggerMouseClickSounds(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.enabled || !this.context) return;

    const level = clamp(intensity, 0.5, 1);
    const clickIndex = this.clickTechniqueIndex;
    this.clickTechniqueIndex += 1;

    if (this.performanceLoaded) {
      this.seekPerformanceToTechnique('slap', clickIndex, level, pointerX, pointerY);
      window.setTimeout(
        () => this.seekPerformanceToTechnique('key-click', clickIndex + 1, level * 0.9, pointerX, pointerY),
        10
      );
      window.setTimeout(
        () => this.seekPerformanceToTechnique('jet-whistle', clickIndex + 2, level * 0.85, pointerX, pointerY),
        24
      );
      this.setHoverQuadPosition(pointerX, pointerY);
      this.playContrabassStaccato(level, pointerX, pointerY);
      return;
    }

    this.playSlap(level, pointerX, pointerY);
    this.playContrabassStaccato(level, pointerX, pointerY);
    window.setTimeout(() => this.playKeyClick(pointerX, true, pointerY), 10);
    window.setTimeout(() => this.playJetWhistle(level * 0.85, pointerX, pointerY), 24);
  }

  private playSlap(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.012 + Math.random() * 0.022;

    const noise = context.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const bandPass = context.createBiquadFilter();
    bandPass.type = 'bandpass';
    bandPass.frequency.value = 900 + (pointerY + 1) * 700 + Math.random() * 400;
    bandPass.Q.value = 0.9 + Math.random() * 0.8;

    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.1 + intensity * 0.16, now + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const thump = context.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(110 + Math.random() * 50, now);
    thump.frequency.exponentialRampToValueAtTime(55, now + duration);

    const thumpGain = context.createGain();
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.07 + intensity * 0.1, now + 0.0015);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.9);

    const bus = context.createGain();
    noise.connect(bandPass);
    bandPass.connect(noiseGain);
    thump.connect(thumpGain);
    noiseGain.connect(bus);
    thumpGain.connect(bus);
    this.connectQuad(bus, pointerX, pointerY);

    noise.start(now);
    noise.stop(now + duration + 0.01);
    thump.start(now);
    thump.stop(now + duration + 0.01);
  }

  triggerCenterTechnique(side: CenterApproachSide, intensity: number, pointerX: number, pointerY: number): void {
    if (!this.enabled || !this.context) return;

    const now = performance.now();
    if (now - this.lastCenterTechnique < 90) return;
    this.lastCenterTechnique = now;

    const level = clamp(intensity, 0.35, 1);
    const technique = CENTER_TECHNIQUE_MAP[side];
    const markerIndex = this.centerTechniqueIndex;
    this.centerTechniqueIndex += 1;

    if (this.performanceLoaded) {
      this.seekPerformanceToTechnique(technique, markerIndex, level, pointerX, pointerY);
      this.setHoverQuadPosition(pointerX, pointerY);
      return;
    }

    this.playRecordedTechniqueFallback(technique, level, pointerX, pointerY);
  }

  getApproachSideFromVelocity(vx: number, vy: number, fallbackSpeed = 0): CenterApproachSide | null {
    const speed = Math.hypot(vx, vy);
    if (speed < 0.025 && fallbackSpeed < 0.2) return null;

    if (Math.abs(vx) >= Math.abs(vy)) {
      return vx >= 0 ? 'left' : 'right';
    }

    return vy >= 0 ? 'top' : 'bottom';
  }

  private playMultiphonicCluster(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.06 + Math.random() * 0.14;
    const base = this.pointerToFluteFrequency(pointerX, pointerY);
    const ratios = [1, 1.43, 2.19, 3.07, 4.11];
    const point = quadPointFromSide('left');

    const bus = context.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.exponentialRampToValueAtTime(0.08 + intensity * 0.14, now + 0.003);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    this.connectQuad(bus, point.x, point.y);

    ratios.forEach((ratio, index) => {
      const osc = context.createOscillator();
      osc.type = index % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(base * ratio, now);
      osc.frequency.exponentialRampToValueAtTime(base * ratio * (0.92 + Math.random() * 0.06), now + duration);

      const partialGain = context.createGain();
      partialGain.gain.value = 0.08 / (index + 1);

      osc.connect(partialGain);
      partialGain.connect(bus);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    });

    const breath = context.createBufferSource();
    breath.buffer = this.noiseBuffer;

    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = base * 2.4 + 800;
    filter.Q.value = 14 + Math.random() * 10;

    const breathGain = context.createGain();
    breathGain.gain.setValueAtTime(0.0001, now);
    breathGain.gain.exponentialRampToValueAtTime(0.05 * intensity, now + 0.002);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

    breath.connect(filter);
    filter.connect(breathGain);
    breathGain.connect(bus);
    breath.start(now);
    breath.stop(now + duration + 0.02);
  }

  private playSplitToneSqueak(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.04 + Math.random() * 0.1;
    const low = this.pointerToFluteFrequency(pointerX, pointerY) * 0.8;
    const high = low * (4.5 + Math.random() * 3.5);
    const point = quadPointFromSide('right');

    const osc = context.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(low, now);
    osc.frequency.exponentialRampToValueAtTime(high, now + duration * 0.18);
    osc.frequency.exponentialRampToValueAtTime(high * 0.82, now + duration);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09 + intensity * 0.16, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const shaper = context.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(18);

    osc.connect(shaper);
    shaper.connect(gain);
    this.connectQuad(gain, point.x, point.y);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playJetWhistle(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.08 + Math.random() * 0.16;

    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;

    const highPass = context.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.setValueAtTime(1200 + Math.random() * 800, now);
    highPass.frequency.exponentialRampToValueAtTime(9000 + Math.random() * 4000, now + duration * 0.35);
    highPass.frequency.exponentialRampToValueAtTime(2400, now + duration);

    const bandPass = context.createBiquadFilter();
    bandPass.type = 'bandpass';
    bandPass.frequency.value = 5200 + pointerY * 1200;
    bandPass.Q.value = 8 + Math.random() * 12;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07 + intensity * 0.18, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const point = quadPointFromSide('top');

    source.connect(highPass);
    highPass.connect(bandPass);
    bandPass.connect(gain);
    this.connectQuad(gain, point.x, point.y);

    source.start(now);
    source.stop(now + duration + 0.02);
  }

  private playTongueStop(intensity: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.05 + Math.random() * 0.08;

    const thump = context.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(48 + Math.random() * 28, now);
    thump.frequency.exponentialRampToValueAtTime(28, now + duration);

    const thumpGain = context.createGain();
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.12 + intensity * 0.18, now + 0.002);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const crack = context.createBufferSource();
    crack.buffer = this.noiseBuffer;

    const crackFilter = context.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 1800 + Math.random() * 2600;

    const crackGain = context.createGain();
    crackGain.gain.setValueAtTime(0.0001, now);
    crackGain.gain.exponentialRampToValueAtTime(0.08 + intensity * 0.14, now + 0.001);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.35);

    const bus = context.createGain();
    const point = quadPointFromSide('bottom');

    thump.connect(thumpGain);
    thumpGain.connect(bus);
    crack.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(bus);
    this.connectQuad(bus, point.x, point.y);

    thump.start(now);
    thump.stop(now + duration + 0.02);
    crack.start(now);
    crack.stop(now + duration + 0.02);
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let index = 0; index < samples; index += 1) {
      const x = (index * 2) / samples - 1;
      curve[index] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve;
  }

  private maybeTriggerMetallic(motion: number, pointerX: number, pointerY: number): void {
    if (!this.context) return;

    const now = performance.now();
    if (now - this.lastMetallic < 28) return;
    if (Math.random() > motion * 0.55) return;

    this.lastMetallic = now;
    this.playMetallicHit(motion, pointerX, pointerY);
  }

  private maybeTriggerGrains(motion: number, pointerX: number): void {
    if (!this.context) return;

    const now = performance.now();
    if (now - this.lastGrain < 10) return;
    if (Math.random() > motion * 0.75) return;

    this.lastGrain = now;
    this.playCrackleGrain(motion, pointerX);
  }

  private maybeTriggerFlutter(motion: number, pointerX: number, pointerY: number): void {
    if (!this.context) return;

    const now = performance.now();
    if (now - this.lastFlutter < 220) return;
    if (motion < 0.45 || Math.random() > motion * 0.35) return;

    this.lastFlutter = now;
    this.playFluteFlutter(motion, pointerX, pointerY);
  }

  private playKeyClick(pointerX: number, force = false, pointerY = 0): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const now = performance.now();
    if (!force && now - this.lastKeyClick < 35) return;
    this.lastKeyClick = now;

    const { context } = this;
    const audioNow = context.currentTime;
    const duration = 0.008 + Math.random() * 0.014;

    const clickOsc = context.createOscillator();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(420 + Math.random() * 320, audioNow);
    clickOsc.frequency.exponentialRampToValueAtTime(90, audioNow + duration);

    const clickGain = context.createGain();
    clickGain.gain.setValueAtTime(0.0001, audioNow);
    clickGain.gain.exponentialRampToValueAtTime(0.035, audioNow + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, audioNow + duration);

    const noise = context.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const highPass = context.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 900;

    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.0001, audioNow);
    noiseGain.gain.exponentialRampToValueAtTime(0.018, audioNow + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, audioNow + duration * 0.8);

    const bus = context.createGain();

    clickOsc.connect(clickGain);
    clickGain.connect(bus);
    noise.connect(highPass);
    highPass.connect(noiseGain);
    noiseGain.connect(bus);
    this.connectQuad(bus, pointerX, pointerY);

    clickOsc.start(audioNow);
    clickOsc.stop(audioNow + duration + 0.01);
    noise.start(audioNow);
    noise.stop(audioNow + duration + 0.01);
  }

  private playFluteFlutter(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const bursts = 3 + Math.floor(intensity * 4);
    const baseFrequency = this.pointerToFluteFrequency(pointerX, pointerY);

    for (let index = 0; index < bursts; index += 1) {
      window.setTimeout(() => {
        this.playAirChiff(intensity * 0.8, pointerX, baseFrequency);
      }, index * (28 + Math.random() * 22));
    }
  }

  private playAirChiff(intensity: number, pointerX: number, frequency: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.03 + Math.random() * 0.07;

    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;

    const highPass = context.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 60 + Math.random() * 120;

    const bandPass = context.createBiquadFilter();
    bandPass.type = 'bandpass';
    bandPass.frequency.value = frequency * 0.55 + 60 + Math.random() * 90;
    bandPass.Q.value = 0.55 + Math.random() * 0.9;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.038 * intensity, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(highPass);
    highPass.connect(bandPass);
    bandPass.connect(gain);
    this.connectQuad(gain, pointerX, 0);

    source.start(now);
    source.stop(now + duration + 0.01);
  }

  private playMetallicHit(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.015 + Math.random() * 0.09;
    const baseFreq = 420 + (pointerX + 1) * 1800 + Math.random() * 2400 + pointerY * 600;

    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * (0.55 + Math.random() * 0.25), now + duration);
    filter.Q.value = 10 + Math.random() * 28;

    const partial = context.createOscillator();
    partial.type = 'square';
    partial.frequency.setValueAtTime(baseFreq * (1.4 + Math.random() * 0.8), now);
    partial.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + duration);

    const partialGain = context.createGain();
    partialGain.gain.setValueAtTime(0.0001, now);
    partialGain.gain.exponentialRampToValueAtTime(0.035 * intensity, now + 0.001);
    partialGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08 + intensity * 0.16, now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    partial.connect(partialGain);
    partialGain.connect(gain);
    this.connectQuad(gain, pointerX + (Math.random() - 0.5) * 0.15, pointerY);

    source.start(now);
    source.stop(now + duration + 0.02);
    partial.start(now);
    partial.stop(now + duration + 0.02);
  }

  private playCrackleGrain(intensity: number, pointerX: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.004 + Math.random() * 0.028;

    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;

    const highPass = context.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 2500 + Math.random() * 5000;

    const bandPass = context.createBiquadFilter();
    bandPass.type = 'bandpass';
    bandPass.frequency.value = 3500 + Math.random() * 7000;
    bandPass.Q.value = 2 + Math.random() * 8;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.03 + intensity * 0.08, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(highPass);
    highPass.connect(bandPass);
    bandPass.connect(gain);
    this.connectQuad(gain, pointerX + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4);

    source.start(now);
    source.stop(now + duration + 0.01);
  }

  dispose(): void {
    this.disposed = true;
    this.enabled = false;

    if (this.performancePauseTimer !== null) {
      window.clearTimeout(this.performancePauseTimer);
      this.performancePauseTimer = null;
    }

    if (this.crackleNode) {
      this.crackleNode.stop();
      this.crackleNode.disconnect();
      this.crackleNode = null;
    }

    if (this.fluteBreathNode) {
      this.fluteBreathNode.stop();
      this.fluteBreathNode.disconnect();
      this.fluteBreathNode = null;
    }

    if (this.fluteToneOsc) {
      this.fluteToneOsc.stop();
      this.fluteToneOsc.disconnect();
      this.fluteToneOsc = null;
    }

    if (this.fluteVibratoOsc) {
      this.fluteVibratoOsc.stop();
      this.fluteVibratoOsc.disconnect();
      this.fluteVibratoOsc = null;
    }

    this.stopContrabassLoop();

    if (this.performanceElement) {
      this.performanceElement.pause();
      this.performanceElement.src = '';
      this.performanceElement = null;
    }

    this.performanceSource = null;

    if (this.context) {
      void this.context.close();
      this.context = null;
    }
  }
}
