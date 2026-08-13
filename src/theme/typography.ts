import type { TextStyle } from 'react-native';

export const fontSizes = {
  xxs: 10,
  xs: 11,
  sm: 12,
  base: 13,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 19,
  display: 25,
} as const;

export const fontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
  black: '900',
};

export const lineHeights = {
  tight: 1.22,
  body: 1.55,
  card: 1.3,
};

export const letterSpacing = {
  heading: -0.3,
  tight: -0.5,
};
