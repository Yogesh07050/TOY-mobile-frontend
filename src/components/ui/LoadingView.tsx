import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';

export function LoadingView({ fullScreen = true }: { fullScreen?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: fullScreen ? 1 : undefined,
        padding: fullScreen ? 0 : 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fullScreen ? colors.page : 'transparent',
      }}
    >
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}
