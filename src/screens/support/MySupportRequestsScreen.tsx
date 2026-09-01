import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Button, EmptyState, ErrorState, LoadingView } from '../../components/ui';
import { supportApi } from '../../api';
import { queryKeys } from '../../api/queryKeys';
import { getApiErrorMessage, isNetworkError } from '../../api/client';
import { formatDate } from '../../utils/format';
import { ScreenHeader } from './ScreenHeader';
import { STATUS_LABELS, categoryLabel, statusColor } from './status';
import type { PaginationMeta, SupportTicket } from '../../types';
import type { SupportScreenProps } from '../../navigation/types';

/**
 * The customer's own support requests.
 *
 * The support flow ends with "response sent" and "ticket resolved", and both
 * have to be visible to the person who filed it — otherwise the reference on
 * the confirmation screen is a number that leads nowhere.
 *
 * Guest tickets are not listed here and cannot be: they have no owner, so
 * there is nobody to show them to. That is the cost of letting people file
 * without an account, and it is the right trade — the reply reaches them by
 * email either way.
 */
export function MySupportRequestsScreen({ navigation }: SupportScreenProps<'MySupportRequests'>) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const [expanded, setExpanded] = useState<number | null>(null);

  const query = useQuery({
    queryKey: queryKeys.mySupportTickets({ limit: 50 }),
    queryFn: () => supportApi.listMySupportTickets({ limit: 50 }),
  });

  const tickets = query.data?.tickets ?? [];

  return (
    <Screen>
      <ScreenHeader title="My support requests" onBack={() => navigation.goBack()} />

      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          offline={isNetworkError(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No requests yet"
          message="If something goes wrong, tell us and we’ll look into it."
          actionLabel="Raise a request"
          onAction={() => navigation.navigate('HelpSupport', undefined)}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xs }}>
          {tickets.map((ticket) => (
            <View
              key={ticket.id}
              style={{
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                overflow: 'hidden',
              }}
            >
              <Pressable
                onPress={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: expanded === ticket.id }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm }}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{ticket.reference}</Text>
                    <Text
                      style={{
                        color: statusColor(ticket.status, colors),
                        fontSize: fontSizes.xs,
                        fontWeight: fontWeights.semibold,
                      }}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </Text>
                  </View>
                  <Text
                    style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}
                    numberOfLines={2}
                  >
                    {ticket.subject}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                    {categoryLabel(ticket.category)} · raised {formatDate(ticket.createdAt)}
                  </Text>
                </View>
                <Ionicons
                  name={expanded === ticket.id ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textSubtle}
                />
              </Pressable>

              {expanded === ticket.id ? <Thread ticketId={ticket.id} /> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

/**
 * One ticket's conversation, and the box to add to it.
 *
 * Fetched when the row opens rather than with the list: a customer with twenty
 * requests would otherwise load twenty conversations to read one.
 */
function Thread({ ticketId }: { ticketId: number }) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.supportTicket(ticketId),
    queryFn: () => supportApi.getSupportTicket(ticketId),
  });

  const ticket = query.data;

  /**
   * Keep the collapsed row in step with what the thread says.
   *
   * The list is fetched once and the detail is fetched per row, so a reply
   * that arrived after the list loaded left the header reading "Open" above a
   * conversation that plainly was not. The detail is the fresher of the two,
   * so it wins - and writing it into the list cache rather than refetching
   * keeps this to no extra request.
   */
  useEffect(() => {
    if (!ticket) return;
    queryClient.setQueryData<{ tickets: SupportTicket[]; meta: PaginationMeta }>(
      queryKeys.mySupportTickets({ limit: 50 }),
      (current) =>
        current
          ? {
              ...current,
              tickets: current.tickets.map((item) => (item.id === ticket.id ? ticket : item)),
            }
          : current,
    );
  }, [ticket, queryClient]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setReplyError(null);
    try {
      const updated = await supportApi.replyToSupportTicket(ticketId, body);
      // The API answers with the whole ticket, so one response fills the detail
      // cache - and the effect above carries it into the list row from there,
      // which is the same path a reply that arrived while we were away takes.
      queryClient.setQueryData(queryKeys.supportTicket(ticketId), updated);
      setDraft('');
    } catch (err) {
      // The draft is deliberately left in the box: losing what they typed on
      // top of the send failing would be the second thing to go wrong.
      setReplyError(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (query.isLoading) {
    return (
      <View style={{ padding: spacing.md }}>
        <LoadingView />
      </View>
    );
  }

  if (query.isError || !ticket) {
    return (
      <View style={{ padding: spacing.sm }}>
        <ErrorState
          message={getApiErrorMessage(query.error)}
          offline={isNetworkError(query.error)}
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        gap: spacing.xs,
        padding: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {(ticket.messages ?? []).map((message) => (
        <View
          key={message.id}
          style={{
            gap: 3,
            padding: spacing.sm,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: message.authorRole === 'support' ? colors.surface : colors.brandLight,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Text style={{ color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>
              {message.authorRole === 'support' ? (message.authorName ?? 'Support') : 'You'}
            </Text>
            <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>
              {formatDate(message.createdAt)}
            </Text>
          </View>
          <Text style={{ color: colors.text, fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.5 }}>
            {message.body}
          </Text>
        </View>
      ))}

      {ticket.status === 'closed' ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
          This request is closed. If it is still a problem, please raise a new one.
        </Text>
      ) : (
        <>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={5000}
            editable={!sending}
            placeholder="Anything else that would help us — a code, a shop name, when it happened."
            placeholderTextColor={colors.textSubtle}
            style={{
              minHeight: 72,
              textAlignVertical: 'top',
              color: colors.text,
              fontSize: fontSizes.sm,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.sm,
              padding: spacing.sm,
            }}
          />
          {replyError ? (
            <Text style={{ color: colors.danger, fontSize: fontSizes.xs }}>{replyError}</Text>
          ) : null}
          <Button label="Send" onPress={send} loading={sending} disabled={!draft.trim()} />
        </>
      )}
    </View>
  );
}
