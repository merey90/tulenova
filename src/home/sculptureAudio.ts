import {
  ContrabassFluteNote,
  CONTRABASS_MAX_MIDI,
  CONTRABASS_MIN_MIDI,
  findNearestContrabassNote,
  frequencyToMidi,
  loadContrabassFluteSamples,
  playbackRateForMidi,
} from './contrabassFluteSamples';
import {
  BASS_FLUTE_PERFORMANCE_URL,
  CENTER_TECHNIQUE_MAP,
  ExtendedTechnique,
  midiToPerformancePosition,
  techniqueToPerformancePosition,
} from './bassFlutePerformance';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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

  private performanceFilter: BiquadFilterNode | null = null;

  private performancePanner: StereoPannerNode | null = null;

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

  private enabled = false;

  private disposed = false;

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

    this.performanceFilter = this.context.createBiquadFilter();
    this.performanceFilter.type = 'lowpass';
    this.performanceFilter.frequency.value = 2800;
    this.performanceFilter.Q.value = 0.45;

    this.performancePanner = this.context.createStereoPanner();
    this.performancePanner.pan.value = 0;

    this.performanceSource.connect(this.performanceFilter);
    this.performanceFilter.connect(this.performancePanner);
    this.performancePanner.connect(this.performanceGain);
    this.performanceGain.connect(this.masterGain);
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
      this.performanceTargetTime = this.performanceElement.duration * 0.18;
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
    this.masterGain.gain.value = 0.42;

    this.crackleGain = context.createGain();
    this.crackleGain.gain.value = 0.0001;

    this.crackleFilter = context.createBiquadFilter();
    this.crackleFilter.type = 'bandpass';
    this.crackleFilter.frequency.value = 4200;
    this.crackleFilter.Q.value = 0.7;

    this.crackleGain.connect(this.crackleFilter);
    this.crackleFilter.connect(this.masterGain);

    this.fluteBreathGain = context.createGain();
    this.fluteBreathGain.gain.value = 0.0001;

    this.fluteBreathFilter = context.createBiquadFilter();
    this.fluteBreathFilter.type = 'bandpass';
    this.fluteBreathFilter.frequency.value = 220;
    this.fluteBreathFilter.Q.value = 0.28;

    this.fluteBreathGain.connect(this.fluteBreathFilter);
    this.fluteBreathFilter.connect(this.masterGain);

    this.fluteToneGain = context.createGain();
    this.fluteToneGain.gain.value = 0.0001;
    this.fluteToneGain.connect(this.masterGain);

    this.contrabassLoopGain = context.createGain();
    this.contrabassLoopGain.gain.value = 0.0001;

    this.contrabassLoopFilter = context.createBiquadFilter();
    this.contrabassLoopFilter.type = 'lowpass';
    this.contrabassLoopFilter.frequency.value = 1400;
    this.contrabassLoopFilter.Q.value = 0.5;

    this.contrabassLoopGain.connect(this.contrabassLoopFilter);
    this.contrabassLoopFilter.connect(this.masterGain);

    this.masterGain.connect(context.destination);
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

  updateFromMotion(active: number, speed: number, pointerX: number, pointerY: number): void {
    if (!this.enabled || !this.context || !this.crackleGain || !this.crackleFilter) return;

    const motion = clamp(speed * 8 + active * 0.35, 0, 1);
    const now = this.context.currentTime;

    this.crackleGain.gain.setTargetAtTime(0.012 + motion * 0.09, now, 0.08);
    this.crackleFilter.frequency.setTargetAtTime(1800 + motion * 5200 + pointerY * 900, now, 0.12);
    this.crackleFilter.Q.setTargetAtTime(0.5 + motion * 2.2, now, 0.15);

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
      if (!this.performanceElement || !this.performanceGain) return;

      const now = this.context?.currentTime ?? 0;
      this.performanceGain.gain.cancelScheduledValues(now);
      this.performanceGain.gain.setTargetAtTime(0.0001, now, 0.08);
      this.performanceElement.pause();
    }, delayMs);
  }

  private seekPerformanceToTime(timeSec: number, intensity: number): void {
    if (!this.performanceLoaded || !this.context || !this.performanceElement || !this.performanceGain) return;

    const duration = this.performanceElement.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    this.performanceElement.currentTime = clamp(timeSec, 0, duration - 0.05);
    this.performanceTargetTime = this.performanceElement.currentTime;
    this.performanceElement.playbackRate = 1;

    const now = this.context.currentTime;
    const peak = 0.12 + intensity * 0.42;
    this.performanceGain.gain.cancelScheduledValues(now);
    this.performanceGain.gain.setValueAtTime(0.0001, now);
    this.performanceGain.gain.linearRampToValueAtTime(peak, now + 0.04);
    this.performanceGain.gain.setTargetAtTime(0.0001, now + 0.45, 0.28);

    void this.performanceElement.play().catch(() => undefined);
    this.schedulePerformancePause(1500);
  }

  private seekPerformanceToMidi(midi: number, intensity: number): void {
    if (!this.performanceLoaded || !this.context || !this.performanceElement || !this.performanceGain) return;

    const duration = this.performanceElement.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    this.seekPerformanceToTime(duration * midiToPerformancePosition(midi), intensity);
  }

  private seekPerformanceToTechnique(technique: ExtendedTechnique, markerIndex: number, intensity: number): void {
    if (!this.performanceLoaded || !this.context || !this.performanceElement || !this.performanceGain) return;

    const duration = this.performanceElement.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    this.seekPerformanceToTime(duration * techniqueToPerformancePosition(technique, markerIndex), intensity);
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
    const targetFreq = this.pointerToFluteFrequency(pointerX, pointerY);
    this.fluteToneTarget += (targetFreq - this.fluteToneTarget) * 0.06;
    this.fluteToneOsc.frequency.setTargetAtTime(this.fluteToneTarget, now, 0.1);

    this.fluteBreathGain.gain.setTargetAtTime(
      this.performanceLoaded ? 0.004 + motion * 0.03 + active * 0.012 : 0.01 + motion * 0.075 + active * 0.038,
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
      this.seekPerformanceToMidi(targetMidi, intensity);
      return;
    }

    const targetMidi = frequencyToMidi(this.pointerToFluteFrequency(pointerX, pointerY));
    this.playContrabassPitchClear(targetMidi, intensity, pointerX, 0.55);
  }

  triggerNodePitch(midi: number, intensity: number, pan: number): void {
    if (!this.enabled || !this.context) return;

    const now = performance.now();
    if (midi === this.lastNodePitchMidi && now - this.lastNodePitchTime < 140) return;

    this.lastNodePitchMidi = midi;
    this.lastNodePitchTime = now;

    if (this.performanceLoaded) {
      this.seekPerformanceToMidi(midi, intensity);
      this.performancePanner?.pan.setTargetAtTime(clamp(pan, -1, 1), this.context.currentTime, 0.06);
      return;
    }

    this.playContrabassPitchClear(midi, intensity, pan, 0.92);
  }

  triggerNodeTechnique(technique: ExtendedTechnique, markerIndex: number, intensity: number, pan: number): void {
    if (!this.enabled || !this.context) return;

    const now = performance.now();
    if (technique === this.lastNodeTechnique && now - this.lastNodeTechniqueTime < 120) return;

    this.lastNodeTechnique = technique;
    this.lastNodeTechniqueTime = now;

    if (this.performanceLoaded) {
      this.seekPerformanceToTechnique(technique, markerIndex, intensity);
      this.performancePanner?.pan.setTargetAtTime(clamp(pan, -1, 1), this.context.currentTime, 0.06);
      return;
    }

    this.playRecordedTechniqueFallback(technique, intensity, pan);
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

  playContrabassPitchClear(midi: number, intensity: number, pan: number, sustainRatio = 0.92): void {
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
    gain.gain.exponentialRampToValueAtTime(0.1 + intensity * 0.18, now + 0.02);
    gain.gain.setValueAtTime(0.08 + intensity * 0.14, now + duration * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pan, -1, 1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration + 0.02);
  }

  triggerTouchBurst(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.enabled || !this.context) return;

    this.playKeyClick(pointerX);

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
      this.seekPerformanceToTechnique('slap', clickIndex, level);
      window.setTimeout(() => this.seekPerformanceToTechnique('key-click', clickIndex + 1, level * 0.9), 10);
      window.setTimeout(() => this.seekPerformanceToTechnique('jet-whistle', clickIndex + 2, level * 0.85), 24);
      this.playContrabassStaccato(level, pointerX, pointerY);
      return;
    }

    this.playSlap(level, pointerX, pointerY);
    this.playContrabassStaccato(level, pointerX, pointerY);
    window.setTimeout(() => this.playKeyClick(pointerX, true), 10);
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

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pointerX * 0.75, -1, 1);

    noise.connect(bandPass);
    bandPass.connect(noiseGain);
    noiseGain.connect(panner);
    thump.connect(thumpGain);
    thumpGain.connect(panner);
    panner.connect(this.masterGain);

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
      this.seekPerformanceToTechnique(technique, markerIndex, level);
      this.performancePanner?.pan.setTargetAtTime(this.sideToPan(side), this.context.currentTime, 0.08);
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

  private sideToPan(side: CenterApproachSide): number {
    switch (side) {
      case 'left':
        return -0.75;
      case 'right':
        return 0.75;
      case 'top':
        return 0;
      case 'bottom':
        return 0;
      default:
        return 0;
    }
  }

  private playMultiphonicCluster(intensity: number, pointerX: number, pointerY: number): void {
    if (!this.context || !this.masterGain || !this.noiseBuffer) return;

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.06 + Math.random() * 0.14;
    const base = this.pointerToFluteFrequency(pointerX, pointerY);
    const ratios = [1, 1.43, 2.19, 3.07, 4.11];

    const bus = context.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.exponentialRampToValueAtTime(0.08 + intensity * 0.14, now + 0.003);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const panner = context.createStereoPanner();
    panner.pan.value = this.sideToPan('left');
    bus.connect(panner);
    panner.connect(this.masterGain);

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

    const panner = context.createStereoPanner();
    panner.pan.value = this.sideToPan('right');

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

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

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pointerX * 0.4, -0.35, 0.35);

    source.connect(highPass);
    highPass.connect(bandPass);
    bandPass.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

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
    bus.connect(this.masterGain);

    thump.connect(thumpGain);
    thumpGain.connect(bus);
    crack.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(bus);

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

  private playKeyClick(pointerX: number, force = false): void {
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

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pointerX * 0.6, -1, 1);

    clickOsc.connect(clickGain);
    clickGain.connect(panner);
    noise.connect(highPass);
    highPass.connect(noiseGain);
    noiseGain.connect(panner);
    panner.connect(this.masterGain);

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

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pointerX * 0.8, -1, 1);

    source.connect(highPass);
    highPass.connect(bandPass);
    bandPass.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

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

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pointerX * 0.85 + (Math.random() - 0.5) * 0.2, -1, 1);

    source.connect(filter);
    filter.connect(gain);
    partial.connect(partialGain);
    partialGain.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

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

    const panner = context.createStereoPanner();
    panner.pan.value = clamp(pointerX * 0.7 + (Math.random() - 0.5) * 0.5, -1, 1);

    source.connect(highPass);
    highPass.connect(bandPass);
    bandPass.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

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
