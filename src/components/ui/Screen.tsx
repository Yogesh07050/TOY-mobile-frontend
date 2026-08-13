import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({ children, edges = ['top', 'left', 'right'], style, padded = false }: ScreenProps) {
  const { colors, spacing } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: colors.page, padding: padded ? spacing.md : 0 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
