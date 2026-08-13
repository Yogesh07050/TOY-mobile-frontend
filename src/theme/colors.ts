// Mirrors TOY-frontend/src/styles.scss design tokens 1:1 (light + dark).

export interface ThemeColors {
  brand: string;
  brandStrong: string;
  brandDark: string;
  brandLight: string;
  brandTint: string;
  brandInk: string;
  accent: string;
  accentSoft: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;

  surface: string;
  surfaceAlt: string;
  page: string;

  text: string;
  textMuted: string;
  textSubtle: string;
  textOnBrand: string;

  border: string;
  borderStrong: string;

  gradientBrand: [string, string];
  gradientBrandDeep: [string, string];
  gradientAccent: [string, string];

  shadowTint: string;
}

export const lightColors: ThemeColors = {
  brand: '#b45309',
  brandStrong: '#92400e',
  brandDark: '#78350f',
  brandLight: '#fef3c7',
  brandTint: '#fffbeb',
  brandInk: '#3b2600',
  accent: '#c2410c',
  accentSoft: '#ffedd5',

  success: '#047857',
  successBg: '#e7f8f1',
  warning: '#a16207',
  warningBg: '#fef8e7',
  danger: '#c81e1e',
  dangerBg: '#fdf0f0',
  info: '#0369a1',
  infoBg: '#eff8ff',

  surface: '#ffffff',
  surfaceAlt: '#fbf9f4',
  page: '#f6f3ec',

  text: '#1a1611',
  textMuted: '#6b6355',
  textSubtle: '#a19684',
  textOnBrand: '#3b2600',

  border: '#ece6d9',
  borderStrong: '#d9d1be',

  gradientBrand: ['#fbbf24', '#f59e0b'],
  gradientBrandDeep: ['#b45309', '#78350f'],
  gradientAccent: ['#ea580c', '#c2410c'],

  shadowTint: '60,43,12',
};

export const darkColors: ThemeColors = {
  brand: '#fbbf24',
  brandStrong: '#fcd34d',
  brandDark: '#f59e0b',
  brandLight: '#3a2c10',
  brandTint: '#241c0d',
  brandInk: '#2a1c00',
  accent: '#fb923c',
  accentSoft: '#3a2214',

  success: '#34d399',
  successBg: '#10291f',
  warning: '#fbbf24',
  warningBg: '#302512',
  danger: '#f87171',
  dangerBg: '#331717',
  info: '#60a5fa',
  infoBg: '#14243a',

  surface: '#1c1813',
  surfaceAlt: '#241f19',
  page: '#14110d',

  text: '#f5f1e8',
  textMuted: '#a9a293',
  textSubtle: '#7b7466',
  textOnBrand: '#2a1c00',

  border: '#322b22',
  borderStrong: '#453c30',

  gradientBrand: ['#fbbf24', '#f59e0b'],
  gradientBrandDeep: ['#fcd34d', '#f59e0b'],
  gradientAccent: ['#fb923c', '#ea580c'],

  shadowTint: '0,0,0',
};
