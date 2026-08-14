import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import type { AdminTabScreenProps } from '../../../navigation/types';

type Props = AdminTabScreenProps<'Create'>;

export function AdminCreateScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const { hasPermission, hasAnyBannerPermission } = useShopAdmin();

  const options = [
    {
      key: 'offer',
      icon: 'pricetag' as const,
      label: 'Create Offer',
      description: 'Publish a new offer for your shop',
      visible: hasPermission('CREATE_OFFER'),
      onPress: () => navigation.navigate('OfferForm', undefined),
    },
    {
      key: 'banner',
      icon: 'image' as const,
      label: 'Create Banner',
      description: 'Feature an offer on the customer home screen',
      visible: hasAnyBannerPermission && hasPermission('CREATE_BANNER'),
      onPress: () => navigation.navigate('BannerForm', undefined),
    },
  ].filter((o) => o.visible);

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, padding: spacing.md }}>
        Create
      </Text>
      <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        {options.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>You don&rsquo;t have permission to create anything yet.</Text>
        ) : (
          options.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={opt.onPress}
              style={[
                shadows.sm,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: spacing.md,
                  borderRadius: radii.md,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={{ width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={opt.icon} size={20} color={colors.brandStrong} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{opt.label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{opt.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
