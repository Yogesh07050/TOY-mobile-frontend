import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabNavigator } from './AdminTabNavigator';
import { OfferFormScreen } from '../screens/admin/offers/OfferFormScreen';
import { BranchListScreen } from '../screens/admin/branches/BranchListScreen';
import { BranchFormScreen } from '../screens/admin/branches/BranchFormScreen';
import { BannerListScreen } from '../screens/admin/banners/BannerListScreen';
import { BannerFormScreen } from '../screens/admin/banners/BannerFormScreen';
import { SubscriptionScreen } from '../screens/admin/subscription/SubscriptionScreen';
import { AnalyticsDetailScreen } from '../screens/admin/analytics/AnalyticsDetailScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { ThemeSettingsScreen } from '../screens/profile/ThemeSettingsScreen';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="OfferForm" component={OfferFormScreen} />
      <Stack.Screen name="BranchList" component={BranchListScreen} />
      <Stack.Screen name="BranchForm" component={BranchFormScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="BannerList" component={BannerListScreen} />
      <Stack.Screen name="BannerForm" component={BannerFormScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="AnalyticsDetail" component={AnalyticsDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
    </Stack.Navigator>
  );
}
