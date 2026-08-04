export const PHI = (1 + Math.sqrt(5)) / 2;

export const goldenPower = (exponent: number): number => PHI ** exponent;

export const goldenDelay = (index: number, baseExponent = -2): number => goldenPower(baseExponent + index);
