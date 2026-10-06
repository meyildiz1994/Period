// Design tokens ported from Figma "Period Final" (gDwelAeecf9MfEk6wpAYDI), page 1 · Temeller.
// Screens use only `color` (Period · Semantic), `space` and `radius` (Period · Dimensions).
// `palette` mirrors Period · Primitives and is not meant to be used directly in UI code.

export const palette = {
  'plum/900': '#4A1530',
  'plum/800': '#6B1D42',
  'plum/700': '#80244E',
  'plum/600': '#9B3D68',
  'plum/500': '#8E4E70',
  'pink/400': '#F3B6CD',
  'pink/300': '#FAD7E4',
  'pink/200': '#FDE9F0',
  'pink/100': '#FFF5F8',
  'neutral/0': '#FFFFFF',
  'neutral/50': '#FCF5F6',
  'neutral/100': '#F5E4EA',
  'neutral/300': '#CCA4B3',
  'neutral/500': '#8A7680',
  'neutral/700': '#4D3943',
  'neutral/900': '#2A1520',
  'red/700': '#93141A',
  'red/600': '#B8191C',
  'red/50': '#FDE1E1',
  'green/600': '#2E7D5B',
  'green/50': '#E4F3EB',
  'amber/700': '#8A5A00',
  'amber/50': '#FFF3DC',
} as const;

const p = palette;

export const color = {
  'bg/canvas': p['neutral/50'],
  'surface/default': p['neutral/0'],
  'surface/subtle': p['pink/100'],
  'surface/muted': p['pink/200'],
  'surface/strong': p['pink/300'],
  'surface/accent': p['pink/400'],
  'surface/brand': p['plum/700'],
  'surface/brand-pressed': p['plum/800'],
  'surface/brand-soft': p['plum/600'],
  'surface/inverse': p['neutral/900'],
  'surface/disabled': p['neutral/300'],
  'surface/neutral': p['neutral/500'],
  'surface/divider': p['neutral/100'],
  'surface/deep': p['plum/900'],
  'surface/accent-soft': p['plum/500'],
  'text/primary': p['neutral/900'],
  'text/secondary': p['neutral/700'],
  'text/tertiary': p['neutral/500'],
  'text/disabled': p['neutral/300'],
  'text/brand': p['plum/700'],
  'text/brand-strong': p['plum/800'],
  'text/brand-soft': p['plum/600'],
  'text/accent': p['plum/500'],
  'text/on-brand': p['neutral/0'],
  'text/decor': p['pink/400'],
  'text/soft': p['pink/300'],
  'text/softest': p['pink/200'],
  'text/deep': p['plum/900'],
  'border/subtle': p['neutral/100'],
  'border/default': p['pink/400'],
  'border/soft': p['pink/300'],
  'border/focus': p['plum/700'],
  'border/inverse': p['neutral/0'],
  'border/disabled': p['neutral/300'],
  'feedback/danger': p['red/600'],
  'feedback/danger-strong': p['red/700'],
  'feedback/danger-subtle': p['red/50'],
  'feedback/success': p['green/600'],
  'feedback/success-subtle': p['green/50'],
  'feedback/warning': p['amber/700'],
  'feedback/warning-subtle': p['amber/50'],
  // Scrim behind sheets and dialogs (text/primary at 45%).
  scrim: 'rgba(42, 21, 32, 0.45)',
} as const;

export type ColorToken = keyof typeof color;

// 4 pt grid. Screen side margin is space[20]; gap between cards 12–16.
export const space = {
  0: 0, 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16,
  20: 20, 24: 24, 28: 28, 32: 32, 40: 40, 48: 48, 56: 56, 64: 64,
} as const;

export const radius = {
  none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, full: 999,
} as const;

export const layout = {
  screenWidth: 390,
  screenHeight: 844,
  gutter: space[20],
  minTouch: 44,
  icon: 24,
} as const;

// Elevation styles (Elevation/1 Hairline, 2 Card, 3 Overlay, Brand). Shadow colour is text/primary.
const shadow = (opacity: number, y: number, blur: number) => ({
  shadowColor: p['neutral/900'],
  shadowOpacity: opacity,
  shadowOffset: { width: 0, height: y },
  shadowRadius: blur / 2,
  elevation: Math.max(1, Math.round(y / 2)),
});

export const elevation = {
  hairline: shadow(0.05, 1, 3),
  card: shadow(0.06, 4, 16),
  overlay: shadow(0.12, 12, 32),
  brand: { ...shadow(0.18, 6, 16), shadowColor: p['plum/700'] },
} as const;
