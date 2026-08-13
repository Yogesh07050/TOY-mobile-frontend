import type { ViewStyle } from 'react-native';
import type { ThemeColors } from './colors';

function rgba(tint: string, alpha: number) {
  return `rgba(${tint},${alpha})`;
}

export function makeShadows(colors: ThemeColors): Record<'sm' | 'md' | 'lg' | 'brand', ViewStyle> {
  const t = colors.shadowTint;
  return {
    sm: {
      shadowColor: rgba(t, 1),
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: rgba(t, 1),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    lg: {
      shadowColor: rgba(t, 1),
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 6,
    },
    brand: {
      shadowColor: '#f59e0b',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 5,
    },
  };
}
