import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type MainTabParamList = {
  Offers: undefined;
  Services: undefined;
  NearMe: undefined;
  Saved: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  OfferDetail: { offerId: number };
  ServiceDetail: { serviceId: number };
  ShopDetail: { shopId: number | string };
  CategoryOffers: { categoryId: number; categoryName: string };
  Search: { query?: string } | undefined;
  ClaimConfirmation: { offerId: number };
  ServiceClaimConfirmation: { serviceOfferId: number; serviceId: number };
  ClaimQr: { claim: import('../types').Claim } | { serviceClaim: import('../types').ServiceOfferClaim };
  Notifications: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationPreferences: undefined;
  SelectLocation: undefined;
  EditPreferences: undefined;
  ThemeSettings: undefined;
  Devices: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

/** Structural nav prop for screens (EditProfile, ChangePassword, ThemeSettings) reused across
 * both the customer RootStack and the AdminStack — they only ever call goBack(). */
export interface GoBackScreenProps {
  navigation: { goBack: () => void };
}

// ---- Shop Admin (V3) --------------------------------------------------------

export type AdminTabParamList = {
  Dashboard: undefined;
  Offers: undefined;
  Create: undefined;
  Analytics: undefined;
  AdminProfile: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  OfferForm: { offerId?: number; duplicateFrom?: import('../types/admin').OfferFormValues } | undefined;
  BranchList: undefined;
  BranchForm: { branchId?: number } | undefined;
  BannerList: undefined;
  BannerForm: { bannerId?: number } | undefined;
  Subscription: undefined;
  BillingHistory: undefined;
  AnalyticsDetail: { dashboard: 'overview' | 'offerPerformance' | 'funnel' | 'locations' | 'branches' };
  AdminServices: undefined;
  ServiceForm: { serviceId?: number } | undefined;
  ServiceOffers: { serviceId: number };
  ServiceOfferForm: { serviceId: number; offerId?: number };
  ServiceAnalytics: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ThemeSettings: undefined;
  Devices: undefined;
};

export type AdminTabScreenProps<T extends keyof AdminTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, T>,
  NativeStackScreenProps<AdminStackParamList>
>;

export type AdminStackScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<AdminStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
