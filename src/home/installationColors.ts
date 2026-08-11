export const PEARL = {
  wire: { r: 58, g: 48, b: 40 },
  node: { r: 74, g: 62, b: 52 },
  line: { r: 92, g: 78, b: 66 },
  ring: { r: 68, g: 56, b: 48 },
  highlight: { r: 176, g: 252, b: 89 },
  glow: { r: 176, g: 252, b: 89 },
} as const;

export const pearlRgba = (channel: keyof typeof PEARL, alpha: number): string => {
  const { r, g, b } = PEARL[channel];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
