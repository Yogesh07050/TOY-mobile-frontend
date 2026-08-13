import { Linking, Platform } from 'react-native';

export function offerDeepLink(offerId: number): string {
  return `offersapp://offer/${offerId}`;
}

export function shopDeepLink(shopId: number): string {
  return `offersapp://shop/${shopId}`;
}

export async function openDirections(latitude: number, longitude: number, label?: string) {
  const query = label ? encodeURIComponent(label) : `${latitude},${longitude}`;
  const url = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}&q=${query}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${query})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  });
  const canOpen = url ? await Linking.canOpenURL(url) : false;
  if (url && canOpen) {
    await Linking.openURL(url);
  } else {
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
  }
}
