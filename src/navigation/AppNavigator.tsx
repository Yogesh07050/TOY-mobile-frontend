import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { OfferDetailScreen } from '../screens/offers/OfferDetailScreen';
import { ServiceDetailScreen } from '../screens/services/ServiceDetailScreen';
import { ShopDetailScreen } from '../screens/shops/ShopDetailScreen';
import { CategoryOffersScreen } from '../screens/explore/CategoryOffersScreen';
import { SearchScreen } from '../screens/explore/SearchScreen';
import { ClaimConfirmationScreen } from '../screens/claims/ClaimConfirmationScreen';
import { ServiceClaimConfirmationScreen } from '../screens/services/ServiceClaimConfirmationScreen';
import { ClaimQrScreen } from '../screens/claims/ClaimQrScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { NotificationPreferencesScreen } from '../screens/notifications/NotificationPreferencesScreen';
import { SelectLocationScreen } from '../screens/profile/SelectLocationScreen';
import { EditPreferencesScreen } from '../screens/profile/EditPreferencesScreen';
import { ThemeSettingsScreen } from '../screens/profile/ThemeSettingsScreen';
import { DevicesScreen } from '../screens/profile/DevicesScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="CategoryOffers" component={CategoryOffersScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ClaimConfirmation" component={ClaimConfirmationScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ServiceClaimConfirmation" component={ServiceClaimConfirmationScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ClaimQr" component={ClaimQrScreen} options={{ presentation: 'modal', gestureEnabled: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <Stack.Screen name="SelectLocation" component={SelectLocationScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditPreferences" component={EditPreferencesScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="Devices" component={DevicesScreen} />
    </Stack.Navigator>
  );
}
