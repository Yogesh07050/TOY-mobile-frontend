import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, TextField } from '../../components/ui';
import { getApiErrorMessage } from '../../api/client';
import { supportApi } from '../../api';
import { useAuth } from '../../store/AuthContext';
import { ScreenHeader } from './ScreenHeader';
import { useSupportContact } from './useSupportContact';
import { SUPPORT_CATEGORIES, SUPPORT_FAQS } from '../../content/support';
import type { ReportableEntity, SupportTicket, SupportUserType } from '../../types';
import type { SupportScreenProps } from '../../navigation/types';

/** The entity kinds a report can name, and how to say each one to a person. */
const REPORT_LABELS: Record<ReportableEntity, string> = {
  offer: 'offer',
  service: 'service',
  shop: 'shop',
  service_offer: 'service offer',
};

/**
 * Help & Support.
 *
 * More useful than a phone number, which is the point: the form produces a
 * ticket with a reference the customer can quote, and the FAQ below it exists
 * to make the form unnecessary for the questions people actually ask.
 *
 * Three things shape it, the same three as on the website.
 *
 * It works signed out. Someone who cannot log in is precisely the person who
 * needs support and cannot prove who they are while asking, so the form is
 * open and the API takes it without a session.
 *
 * It does not ask for what we already know. A signed-in customer's name, email
 * and phone are filled in, and their account id goes with the ticket
 * automatically — but the fields stay editable, because the address a reply
 * should go to is theirs to choose.
 *
 * And it can arrive pre-aimed. Navigating here with `{ report: 'offer', id }`
 * opens on the report category with the listing already attached, which is
 * what the "Report this offer" row on a listing needs to be one tap.
 */
export function HelpSupportScreen({ navigation, route }: SupportScreenProps<'HelpSupport'>) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const contact = useSupportContact();

  const reported = useMemo(() => {
    const kind = route.params?.report;
    const id = route.params?.entityId;
    if (!kind || !REPORT_LABELS[kind] || !id) return null;
    return { kind, id, label: REPORT_LABELS[kind] };
  }, [route.params?.report, route.params?.entityId]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<SupportUserType>('customer');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<SupportTicket | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Pre-fill from the account. Runs when the user arrives rather than only on
  // mount, because the profile can land after the first render on a cold
  // start. Only fills blanks, so it never overwrites typing.
  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name);
    setEmail((current) => current || user.email);
    setPhone((current) => current || user.phone || '');
    if (user.shops?.length || user.isSuperAdmin) {
      setUserType((current) => (current === 'customer' ? 'merchant' : current));
    }
  }, [user]);

  // Arriving from "Report this offer" should land on the report category with
  // the subject started, not on an empty form that happens to know an id.
  useEffect(() => {
    if (!reported) return;
    setCategory((current) => current || 'report_content');
    setSubject((current) => current || `Report: ${reported.label} #${reported.id}`);
  }, [reported]);

  const onSubmit = async () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Please tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (phone.trim() && !/^[+\d][\d\s-]{5,20}$/.test(phone.trim())) {
      next.phone = 'Enter a valid phone number.';
    }
    if (!category) next.category = 'Choose what you need help with.';
    if (subject.trim().length < 4) next.subject = 'Give the request a short subject.';
    if (description.trim().length < 20) {
      next.description = 'Please describe the problem in a little more detail.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    setLoading(true);
    try {
      const ticket = await supportApi.createSupportTicket({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        userType,
        category,
        subject: subject.trim(),
        description: description.trim(),
        // Only sent when the category really is a content report; a stale
        // route param must not attach an offer to a billing question.
        entityType: category === 'report_content' ? (reported?.kind ?? null) : null,
        entityId: category === 'report_content' ? (reported?.id ?? null) : null,
      });
      setSubmitted(ticket);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /** Back to a blank form, keeping the details we already knew. */
  const raiseAnother = () => {
    setSubmitted(null);
    setCategory('');
    setSubject('');
    setDescription('');
    setErrors({});
  };

  const card = {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  } as const;

  if (submitted) {
    return (
      <Screen>
        <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, alignItems: 'center' }}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
          <Text
            style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, textAlign: 'center' }}
          >
            Your request has been received.
          </Text>
          <Text style={{ color: colors.text, fontSize: fontSizes.md }}>
            Ticket ID:{' '}
            <Text selectable style={{ fontWeight: fontWeights.bold }}>
              {submitted.reference}
            </Text>
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fontSizes.sm,
              textAlign: 'center',
              lineHeight: fontSizes.sm * 1.5,
            }}
          >
            We’ve sent a copy to {submitted.email}. Quote the reference above if you contact us about
            it again.
          </Text>

          <View style={{ width: '100%', gap: spacing.xs, marginTop: spacing.sm }}>
            {isAuthenticated ? (
              <Button
                label="Track this request"
                onPress={() => navigation.replace('MySupportRequests')}
                fullWidth
              />
            ) : null}
            <Button label="Raise another request" variant="secondary" onPress={raiseAnother} fullWidth />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.md, lineHeight: fontSizes.md * 1.5 }}>
          Tell us what went wrong and we’ll come back to you. You’ll get a reference straight away.
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <ChannelButton
            icon="mail-outline"
            label="Email us"
            detail={contact.email}
            onPress={() => Linking.openURL(`mailto:${contact.email}`)}
          />
          <ChannelButton
            icon="call-outline"
            label="Call us"
            detail={contact.phones[0]}
            onPress={() => Linking.openURL(`tel:${contact.phones[0].replace(/\s+/g, '')}`)}
          />
        </View>

        {isAuthenticated ? (
          <Pressable onPress={() => navigation.navigate('MySupportRequests')}>
            <Text style={{ color: colors.brand, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
              See my past requests and replies →
            </Text>
          </Pressable>
        ) : null}

        {reported ? (
          <Text
            style={{
              color: colors.text,
              fontSize: fontSizes.sm,
              lineHeight: fontSizes.sm * 1.45,
              backgroundColor: colors.warningBg,
              borderRadius: radii.sm,
              padding: spacing.sm,
            }}
          >
            You’re reporting {reported.label} #{reported.id}. We’ll look at the listing itself — you
            don’t need to describe which one.
          </Text>
        ) : category === 'report_content' ? (
          // Reporting without a target is allowed, so this is guidance rather
          // than a blocker: the report is more useful if we can see the
          // listing, and the fastest way to attach it is the row on the
          // listing itself.
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fontSizes.sm,
              lineHeight: fontSizes.sm * 1.45,
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              padding: spacing.sm,
            }}
          >
            If it’s a specific listing, the quickest way is Report on that offer, service or shop
            page — it attaches the listing for us. Otherwise, name the shop and the offer below and
            we’ll find it.
          </Text>
        ) : null}

        <View style={{ gap: spacing.xxs }}>
          <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
            What do you need help with?
          </Text>
          <View style={[card, { overflow: 'hidden' }]}>
            {SUPPORT_CATEGORIES.map((option, index) => {
              const selected = category === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setCategory(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label}. ${option.hint}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: spacing.sm,
                    padding: spacing.sm,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                    backgroundColor: selected ? colors.brandLight : 'transparent',
                  }}
                >
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selected ? colors.brand : colors.textSubtle}
                    style={{ marginTop: 1 }}
                  />
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text
                      style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.medium }}
                    >
                      {option.label}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{option.hint}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {errors.category ? (
            <Text style={{ color: colors.danger, fontSize: fontSizes.xs }}>{errors.category}</Text>
          ) : null}
        </View>

        <TextField
          label="Your name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          leftIcon="person-outline"
          error={errors.name}
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          leftIcon="mail-outline"
          error={errors.email}
        />
        <TextField
          label="Phone (optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          leftIcon="call-outline"
          error={errors.phone}
        />

        <View style={{ gap: spacing.xxs }}>
          <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
            You are
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {(
              [
                ['customer', 'A customer'],
                ['merchant', 'A shop'],
                ['guest', 'Just browsing'],
              ] as [SupportUserType, string][]
            ).map(([value, label]) => (
              <Pressable
                key={value}
                onPress={() => setUserType(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: userType === value }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.xs,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: userType === value ? colors.brand : colors.border,
                  backgroundColor: userType === value ? colors.brandLight : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: userType === value ? colors.brand : colors.textMuted,
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.medium,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <TextField label="Subject" value={subject} onChangeText={setSubject} maxLength={200} error={errors.subject} />
        <TextField
          label="What happened?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          maxLength={5000}
          style={{ minHeight: 120, textAlignVertical: 'top' }}
          error={errors.description}
        />
        {!errors.description ? (
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, marginTop: -spacing.xs }}>
            What you were doing, what you expected, and what happened instead. Dates, codes and shop
            names all help.
          </Text>
        ) : null}

        {/* No attachment field. Uploads are authenticated everywhere in this
            API, and a public upload endpoint is a different decision from a
            public support form — so rather than show a control that would
            reject a guest, the screen says where to send a screenshot. */}
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, lineHeight: fontSizes.xs * 1.5 }}>
          Got a screenshot? Email it to {contact.email} once you have your ticket reference and we’ll
          attach it to the same request.
        </Text>

        {submitError ? (
          <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{submitError}</Text>
        ) : null}

        <Button label="Send request" onPress={onSubmit} loading={loading} fullWidth />

        <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs, textAlign: 'center' }}>
          We’ll use these details to answer you.{' '}
          <Text
            style={{ color: colors.brand }}
            onPress={() => navigation.navigate('Legal', { document: 'privacy' })}
          >
            Privacy Policy
          </Text>
        </Text>

        <View style={{ gap: spacing.xxs, marginTop: spacing.md }}>
          <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
            Common questions
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, marginBottom: spacing.xxs }}>
            Worth a look first — most requests we get are one of these.
          </Text>

          <View style={[card, { overflow: 'hidden' }]}>
            {SUPPORT_FAQS.map((faq, index) => {
              const open = openFaq === faq.question;
              return (
                <View
                  key={faq.question}
                  style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.border }}
                >
                  <Pressable
                    onPress={() => setOpenFaq(open ? null : faq.question)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: colors.text,
                        fontSize: fontSizes.md,
                        fontWeight: fontWeights.medium,
                      }}
                    >
                      {faq.question}
                    </Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSubtle}
                    />
                  </Pressable>
                  {open ? (
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: fontSizes.sm,
                        lineHeight: fontSizes.sm * 1.55,
                        paddingHorizontal: spacing.sm,
                        paddingBottom: spacing.sm,
                      }}
                    >
                      {faq.answer}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function ChannelButton({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${detail}`}
      style={{
        flex: 1,
        gap: 2,
        padding: spacing.sm,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.brand} />
      <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
        {label}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }} numberOfLines={1}>
        {detail}
      </Text>
    </Pressable>
  );
}
