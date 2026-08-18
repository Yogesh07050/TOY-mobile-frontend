import React, { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, LoadingView, EmptyState } from '../../components/ui';
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '../../hooks/useSubscription';
import { getApiErrorMessage } from '../../api/client';
import type { GoBackScreenProps } from '../../navigation/types';
import type { DeviceSession } from '../../types';

/**
 * Logged-in devices (§28).
 *
 * Each row is one refresh-token family on the server, so revoking one ends
 * exactly that device's session and leaves the others signed in (§27).
 */
const ICON_FOR: Record<DeviceSession['deviceType'], keyof typeof Ionicons.glyphMap> = {
  mobile: 'phone-portrait-outline',
  tablet: 'tablet-portrait-outline',
  desktop: 'laptop-outline',
  web: 'globe-outline',
  unknown: 'help-circle-outline',
};

/** "Active now", "2 hours ago", "yesterday" - how §28 words the list. */
function lastActive(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes < 5) return 'Active now';
  if (minutes < 60) return `Active ${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last active ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Last active yesterday';
  return `Last active ${days} days ago`;
}

export function DevicesScreen({ navigation }: GoBackScreenProps) {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const [error, setError] = useState<string | null>(null);

  const rows = sessions.data ?? [];
  const others = rows.filter((row) => !row.current);

  const confirmRevoke = (session: DeviceSession) =>
    Alert.alert(
      'Sign out this device?',
      `${session.deviceName ?? 'This device'} will have to sign in again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () =>
            revoke.mutate(session.id, {
              onError: (err) => setError(getApiErrorMessage(err, 'Could not sign that device out.')),
            }),
        },
      ],
    );

  const confirmRevokeOthers = () =>
    Alert.alert(
      'Log out other devices?',
      `${others.length} other session${others.length === 1 ? '' : 's'} will be ended. This device stays signed in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out others',
          style: 'destructive',
          onPress: () =>
            revokeOthers.mutate(undefined, {
              onError: (err) => setError(getApiErrorMessage(err, 'Could not sign the other devices out.')),
            }),
        },
      ],
    );

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          Logged-in devices
        </Text>
      </View>

      {sessions.isLoading ? (
        <LoadingView />
      ) : rows.length === 0 ? (
        <EmptyState icon="phone-portrait-outline" title="No active sessions" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl }}
          refreshControl={<RefreshControl refreshing={sessions.isRefetching} onRefresh={() => sessions.refetch()} />}
        >
          {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

          {rows.map((session) => (
            <View
              key={session.id}
              style={[
                shadows.sm,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: session.current ? colors.brand : colors.border,
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                },
              ]}
            >
              <Ionicons name={ICON_FOR[session.deviceType]} size={22} color={colors.textMuted} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
                  {session.deviceName ?? 'Unknown device'}
                  {session.current ? '  ·  This device' : ''}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                  {[session.platform, lastActive(session.lastUsedAt)].filter(Boolean).join(' · ')}
                </Text>
              </View>
              {session.current ? null : (
                <Pressable onPress={() => confirmRevoke(session)} hitSlop={8}>
                  <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                </Pressable>
              )}
            </View>
          ))}

          {others.length ? (
            <Button
              label="Log out other devices"
              variant="danger"
              onPress={confirmRevokeOthers}
              loading={revokeOthers.isPending}
              style={{ marginTop: spacing.xs }}
            />
          ) : null}

          <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs, marginTop: spacing.xs }}>
            You stay signed in on each device until you sign out there, or end its session from this list.
          </Text>
        </ScrollView>
      )}
    </Screen>
  );
}
