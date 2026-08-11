export interface QuadPoint {
  x: number;
  y: number;
}

export interface QuadWeights {
  fl: number;
  fr: number;
  rl: number;
  rr: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sharpenAxis = (value: number, power = 0.55): number => {
  const sign = Math.sign(value);
  return sign * Math.pow(Math.abs(value), power);
};

export const spreadQuadPoint = (x: number, y: number, spread = 1.55): QuadPoint => ({
  x: clamp(x * spread, -1, 1),
  y: clamp(y * spread, -1, 1),
});

export const quadWeightsFromPoint = (x: number, y: number, sharpenPower = 0.55): QuadWeights => {
  const xN = clamp(sharpenAxis(x, sharpenPower), -1, 1);
  const yN = clamp(sharpenAxis(y, sharpenPower), -1, 1);
  const front = (1 - yN) * 0.5;
  const rear = (1 + yN) * 0.5;
  const left = (1 - xN) * 0.5;
  const right = (1 + xN) * 0.5;

  return {
    fl: front * left,
    fr: front * right,
    rl: rear * left,
    rr: rear * right,
  };
};

const normalizeQuadWeights = (weights: QuadWeights): QuadWeights => {
  const sum = weights.fl + weights.fr + weights.rl + weights.rr;
  if (sum <= 0.0001) {
    return { fl: 0.25, fr: 0.25, rl: 0.25, rr: 0.25 };
  }

  return {
    fl: weights.fl / sum,
    fr: weights.fr / sum,
    rl: weights.rl / sum,
    rr: weights.rr / sum,
  };
};

export interface QuadStereoOptions {
  rlDelaySec?: number;
  rrDelaySec?: number;
  rearMix?: number;
  frontBoost?: number;
  rearCutoffHz?: number;
  sharpenPower?: number;
}

export class QuadStereoRouter {
  readonly input: GainNode;

  private readonly context: AudioContext;

  private readonly flGain: GainNode;

  private readonly frGain: GainNode;

  private readonly rlGain: GainNode;

  private readonly rrGain: GainNode;

  private readonly frontBoost: number;

  private readonly rearMix: number;

  private readonly sharpenPower: number;

  constructor(context: AudioContext, destination: AudioNode, options: QuadStereoOptions = {}) {
    const {
      rlDelaySec = 0.018,
      rrDelaySec = 0.023,
      rearMix = 0.68,
      frontBoost = 1.06,
      rearCutoffHz = 1900,
      sharpenPower = 0.55,
    } = options;

    this.context = context;
    this.frontBoost = frontBoost;
    this.rearMix = rearMix;
    this.sharpenPower = sharpenPower;
    this.input = context.createGain();

    this.flGain = context.createGain();
    this.frGain = context.createGain();
    this.rlGain = context.createGain();
    this.rrGain = context.createGain();

    const rlDelay = context.createDelay(0.08);
    rlDelay.delayTime.value = rlDelaySec;
    const rrDelay = context.createDelay(0.08);
    rrDelay.delayTime.value = rrDelaySec;

    const rlFilter = context.createBiquadFilter();
    rlFilter.type = 'lowpass';
    rlFilter.frequency.value = rearCutoffHz;

    const rrFilter = context.createBiquadFilter();
    rrFilter.type = 'lowpass';
    rrFilter.frequency.value = rearCutoffHz;

    const leftBus = context.createGain();
    const rightBus = context.createGain();
    const merger = context.createChannelMerger(2);

    this.input.connect(this.flGain);
    this.input.connect(this.frGain);
    this.input.connect(this.rlGain);
    this.input.connect(this.rrGain);

    this.flGain.connect(leftBus);
    this.frGain.connect(rightBus);

    this.rlGain.connect(rlDelay);
    rlDelay.connect(rlFilter);
    rlFilter.connect(leftBus);

    this.rrGain.connect(rrDelay);
    rrDelay.connect(rrFilter);
    rrFilter.connect(rightBus);

    leftBus.connect(merger, 0, 0);
    rightBus.connect(merger, 0, 1);
    merger.connect(destination);

    this.setPosition(0, 0);
  }

  setPosition(x: number, y: number, time?: number, spread = 1.55, sharpenPower = this.sharpenPower): void {
    const point = spreadQuadPoint(x, y, spread);
    const weights = normalizeQuadWeights(quadWeightsFromPoint(point.x, point.y, sharpenPower));
    const t = time ?? this.context.currentTime;

    this.flGain.gain.setTargetAtTime(weights.fl * this.frontBoost, t, 0.028);
    this.frGain.gain.setTargetAtTime(weights.fr * this.frontBoost, t, 0.028);
    this.rlGain.gain.setTargetAtTime(weights.rl * this.rearMix, t, 0.028);
    this.rrGain.gain.setTargetAtTime(weights.rr * this.rearMix, t, 0.028);
  }
}

export const attachQuadStereoPanner = (
  context: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  point: QuadPoint,
  spread = 1.55
): void => {
  const router = new QuadStereoRouter(context, destination);
  source.connect(router.input);
  router.setPosition(point.x, point.y, undefined, spread);
};

export const quadPointFromSide = (side: 'left' | 'right' | 'top' | 'bottom'): QuadPoint => {
  switch (side) {
    case 'left':
      return { x: -0.92, y: 0 };
    case 'right':
      return { x: 0.92, y: 0 };
    case 'top':
      return { x: 0, y: -0.92 };
    case 'bottom':
      return { x: 0, y: 0.92 };
    default:
      return { x: 0, y: 0 };
  }
};
