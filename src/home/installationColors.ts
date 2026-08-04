export const PEARL = {
  wire: { r: 184, g: 176, b: 166 },
  node: { r: 196, g: 188, b: 178 },
  line: { r: 212, g: 204, b: 194 },
  ring: { r: 200, g: 192, b: 182 },
  highlight: { r: 252, g: 248, b: 242 },
  glow: { r: 216, g: 208, b: 198 },
} as const;

export const pearlRgba = (channel: keyof typeof PEARL, alpha: number): string => {
  const { r, g, b } = PEARL[channel];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
