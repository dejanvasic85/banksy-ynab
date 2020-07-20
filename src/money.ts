const AUD_BASE = 1000;

export const toBaseValue = (value: number): number => {
  return Math.floor(value * AUD_BASE);
};

export const fromBaseValue = (value: number): number => {
  return value / AUD_BASE;
};
