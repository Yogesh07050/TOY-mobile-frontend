import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useLocationContext } from '../services/location/LocationContext';

interface LocationSelectorProps {
  onPress: () => void;
}

export function LocationSelector({ onPress }: LocationSelectorProps) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  const { locationLabel, permissionStatus } = useLocationContext();

  const label = locationLabel ?? (permissionStatus === 'denied' ? 'Select Location' : 'Detecting location…');

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: colors.brandLight,
        borderRadius: radii.pill,
        paddingVertical: 5,
        paddingHorizontal: spacing.sm,
      }}
    >
      <Ionicons name="location" size={14} color={colors.brandStrong} />
      <Text numberOfLines={1} style={{ color: colors.brandStrong, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={colors.brandStrong} />
    </Pressable>
  );
}
