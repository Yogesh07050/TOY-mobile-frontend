import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Button, Badge, TextField, LoadingView, EmptyState } from '../../components/ui';
import { ServiceRail } from '../../components';
import { useService, useBookService, useTrackService, useServicesList } from '../../hooks/useServices';
import { useToggleSavedService } from '../../hooks/useSavedServices';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { useLocationContext } from '../../services/location/LocationContext';
import { formatDistance } from '../../utils/format';
import { formatServiceDays, formatServiceOfferChip, formatServiceOfferValidity, formatServicePriceLabel, formatServiceTime } from '../../utils/serviceFormat';
import { getApiErrorMessage } from '../../api/client';
import { openDirections } from '../../utils/links';
import type { RootStackScreenProps } from '../../navigation/types';
import type { Service } from '../../types';

type Props = RootStackScreenProps<'ServiceDetail'>;

const IMAGE_HEIGHT = 320;

export function ServiceDetailScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { coords } = useLocationContext();
  const queryClient = useQueryClient();
  const prompt = useAuthPrompt();

  const { data: service, isLoading, isError } = useService(serviceId, coords ?? undefined);
  const toggleSavedService = useToggleSavedService();
  const trackService = useTrackService();
  const bookService = useBookService();

  const [showBookingForm, setShowBookingForm] = useState<'book' | 'enquire' | null>(null);
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingDone, setBookingDone] = useState(false);

  const shopId = service?.shop.id;
  const moreFromShop = useServicesList({ shopId, limit: 10 });

  useEffect(() => {
    trackService.mutate({ id: serviceId, event: 'view' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const primaryBranch = useMemo(() => {
    if (!service?.branches?.length) return null;
    return service.branches.find((b) => b.isPrimary) ?? service.branches[0];
  }, [service]);

  if (isLoading) return <LoadingView />;
  if (isError || !service) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Service not found" message="This service may have been removed." />
      </Screen>
    );
  }

  const images = service.images.length > 0 ? service.images : service.imageUrl ? [{ id: 0, url: service.imageUrl, thumbnailUrl: null, displayOrder: 0 }] : [];
  const distanceLabel = formatDistance(service.distanceKm);
  const screenWidth = Dimensions.get('window').width;
  const offerChip = formatServiceOfferChip(service);
  const offerValidity = formatServiceOfferValidity(service);

  const onShare = async () => {
    trackService.mutate({ id: service.id, event: 'share' });
    await Share.share({ message: `${service.name} at ${service.shop.name}` });
  };

  // §14: every detail on this page is public; the save is not.
  const onToggleSave = () => {
    if (!prompt.require('save-service', onToggleSave)) return;
    toggleSavedService.mutate({ serviceId: service.id, isSaved: service.isSaved }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedServices'] }),
    });
  };

  /** §31: saving a service offer is what triggers its expiry reminder later. */
  const onClaimServiceOffer = () => {
    if (!prompt.require('claim-offer', onClaimServiceOffer)) return;
    navigation.navigate('ServiceClaimConfirmation', {
      serviceOfferId: service.activeOffer!.id,
      serviceId: service.id,
    });
  };

  const onToggleSaveOther = (other: Service) => {
    if (!prompt.require('save-service', () => onToggleSaveOther(other))) return;
    toggleSavedService.mutate({ serviceId: other.id, isSaved: other.isSaved });
  };

  /**
   * §14: "Guest -> [Book Now] -> Login / Sign Up". The form opens by itself on
   * the far side of the login, so the tap is not spent asking for a login.
   */
  const openBookingForm = (mode: 'book' | 'enquire') => {
    const intent = mode === 'book' ? 'book-service' : 'enquire-service';
    if (!prompt.require(intent, () => setShowBookingForm(mode))) return;
    setShowBookingForm(mode);
  };

  const onDirections = () => {
    if (primaryBranch?.latitude && primaryBranch?.longitude) {
      openDirections(primaryBranch.latitude, primaryBranch.longitude, service.shop.name);
    }
  };

  const onSubmitBooking = () => {
    setBookingError(null);
    if (showBookingForm === 'enquire') {
      trackService.mutate({ id: service.id, event: 'enquire' });
    }
    bookService.mutate(
      { id: service.id, payload: { branchId: primaryBranch?.id ?? null, notes: notes || undefined } },
      {
        onSuccess: () => setBookingDone(true),
        onError: (err) => setBookingError(getApiErrorMessage(err, 'Could not submit this request.')),
      },
    );
  };

  const canBook = service.bookingType === 'both' || service.bookingType === 'appointment';
  const canEnquire = service.bookingType === 'both' || service.bookingType === 'enquiry_only';
  const walkInOnly = service.bookingType === 'walk_in';

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: IMAGE_HEIGHT }}>
          {images.length > 0 ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={{ width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: colors.surfaceAlt }} contentFit="cover" />
              )}
            />
          ) : (
            <View style={{ width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: colors.surfaceAlt }} />
          )}

          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={[styles.backBtn, { top: spacing.sm, left: spacing.md, backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Pressable
            onPress={onToggleSave}
            hitSlop={8}
            style={[styles.backBtn, { top: spacing.sm, right: spacing.md, backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <Ionicons name={service.isSaved ? 'heart' : 'heart-outline'} size={20} color={service.isSaved ? colors.accent : '#fff'} />
          </Pressable>
        </View>

        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs }}>
            {offerChip ? <Badge label={offerChip} tone="brand" /> : null}
            {service.category ? <Badge label={service.category.name} /> : null}
          </View>

          <Text style={{ color: colors.text, fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, lineHeight: fontSizes.xxl * 1.25 }}>
            {service.name}
          </Text>

          <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>{formatServicePriceLabel(service)}</Text>
          {offerValidity ? <Text style={{ color: colors.accent, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>{offerValidity}</Text> : null}

          <Pressable
            onPress={() => navigation.navigate('ShopDetail', { shopId: service.shop.id })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
          >
            <Ionicons name="storefront-outline" size={22} color={colors.textMuted} />
            <Text style={{ color: colors.brand, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}>{service.shop.name}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand} />
          </Pressable>

          {(distanceLabel || primaryBranch?.address) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, flex: 1 }}>
                {[primaryBranch?.address, distanceLabel].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ) : null}

          <Section title="Availability">
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{formatServiceDays(service.availableDays)}</Text>
            {service.availableTimeStart && service.availableTimeEnd ? (
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
                {formatServiceTime(service.availableTimeStart)} – {formatServiceTime(service.availableTimeEnd)}
              </Text>
            ) : null}
          </Section>

          {walkInOnly ? (
            <View style={{ backgroundColor: colors.infoBg, borderRadius: radii.md, padding: spacing.sm }}>
              <Text style={{ color: colors.info, fontSize: fontSizes.sm }}>This service is walk-in only — no booking required.</Text>
            </View>
          ) : bookingDone ? (
            <View style={{ backgroundColor: colors.successBg, borderRadius: radii.md, padding: spacing.sm }}>
              <Text style={{ color: colors.success, fontSize: fontSizes.sm }}>
                {showBookingForm === 'enquire' ? 'Your enquiry has been sent.' : 'Your booking request has been sent.'}
              </Text>
            </View>
          ) : showBookingForm ? (
            <View style={{ gap: spacing.sm }}>
              <TextField
                label="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any preferences or details"
                multiline
              />
              {bookingError ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{bookingError}</Text> : null}
              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                <Button
                  label={showBookingForm === 'enquire' ? 'Send Enquiry' : 'Request Booking'}
                  onPress={onSubmitBooking}
                  loading={bookService.isPending}
                  style={{ flex: 1 }}
                />
                <Button label="Cancel" variant="secondary" onPress={() => setShowBookingForm(null)} />
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
              {canBook ? <Button label="Book" onPress={() => openBookingForm('book')} style={{ flex: 1 }} /> : null}
              {canEnquire ? (
                <Button label="Enquire" variant={canBook ? 'secondary' : 'primary'} onPress={() => openBookingForm('enquire')} style={{ flex: 1 }} />
              ) : null}
              <Button label="Share" variant="secondary" icon={<Ionicons name="share-social-outline" size={16} color={colors.text} />} onPress={onShare} />
            </View>
          )}

          {service.activeOffer ? (
            <Button
              label="Claim Offer"
              variant="secondary"
              fullWidth
              onPress={onClaimServiceOffer}
            />
          ) : null}

          {primaryBranch ? (
            <Button label="Get Directions" variant="secondary" fullWidth icon={<Ionicons name="navigate-outline" size={16} color={colors.text} />} onPress={onDirections} />
          ) : null}

          <Divider color={colors.border} />

          {service.description ? (
            <Section title="Description">
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.md, lineHeight: fontSizes.md * 1.5 }}>{service.description}</Text>
            </Section>
          ) : null}

          {service.termsConditions ? (
            <Section title="Terms & Conditions">
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.5 }}>{service.termsConditions}</Text>
            </Section>
          ) : null}

          <Button label="View Shop" variant="ghost" onPress={() => navigation.navigate('ShopDetail', { shopId: service.shop.id })} />
        </View>

        <ServiceRail
          title={`More from ${service.shop.name}`}
          services={(moreFromShop.data?.pages[0]?.services ?? []).filter((s: Service) => s.id !== service.id)}
          loading={moreFromShop.isLoading}
          onServicePress={(s) => navigation.push('ServiceDetail', { serviceId: s.id })}
          onToggleSave={onToggleSaveOther}
        />
      </ScrollView>
    </Screen>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={{ height: 1, backgroundColor: color }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, fontSizes, fontWeights } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
