import React from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../../theme';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const { colors, fontWeights } = useTheme();
  const initial = (name ?? '?').trim().charAt(0).toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceAlt }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.brandLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.brandStrong, fontWeight: fontWeights.bold, fontSize: size * 0.4 }}>{initial}</Text>
    </View>
  );
}
