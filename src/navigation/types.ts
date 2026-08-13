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
  Home: undefined;
  Explore: undefined;
  Saved: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  OfferDetail: { offerId: number };
  ShopDetail: { shopId: number | string };
  CategoryOffers: { categoryId: number; categoryName: string };
  Search: { query?: string } | undefined;
  ClaimConfirmation: { offerId: number };
  ClaimQr: { claim: import('../types').Claim };
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationPreferences: undefined;
  SelectLocation: undefined;
  FollowedShops: undefined;
  FollowedCategories: undefined;
  ThemeSettings: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
