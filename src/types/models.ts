export interface PreferredLocation {
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface UserShopMembership {
  shopId: number;
  shopName: string;
  shopSlug: string;
  shopLogoUrl: string | null;
  branchId: number | null;
  designation: string | null;
  roleName: string | null;
  permissions: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive';
  emailVerified: boolean;
  avatarUrl: string | null;
  preferredLocation: PreferredLocation | null;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  canAccessAdmin: boolean;
  unassignedShopRoles: unknown[];
  shops: UserShopMembership[];
  unreadNotifications?: number;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type OfferType = 'percentage' | 'flat' | 'buy_x_get_y' | 'price_drop' | 'up_to' | 'other';
export type OfferStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'deactivated';

export interface OfferShopSummary {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface OfferCategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface Offer {
  id: number;
  title: string;
  productName: string | null;
  description: string | null;
  offerText: string | null;
  offerType: OfferType;
  discountType: 'percentage' | 'flat' | 'none';
  discountValue: number | null;
  originalPrice: number | null;
  discountedPrice: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  minPurchase: number | null;
  termsConditions: string | null;
  eligibility: string | null;
  usageRestrictions: string | null;
  applicableProducts: string | null;
  isRecurring: boolean;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | null;
  startDate: string;
  endDate: string;
  status: OfferStatus;
  applicabilityType: 'shop_wide' | 'selected_branches' | 'online';
  imageUrl: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  distanceKm: number | null;
  locationLabel: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  shop: OfferShopSummary;
  category: OfferCategorySummary | null;
  // Discovery-endpoint extras
  endingBucket?: { key: 'urgent' | 'today' | 'tomorrow' | 'three-days' | 'soon'; label: string };
  score?: number;
  reason?: string;
}

export interface OfferImage {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  displayOrder: number;
}

export interface OfferBranch {
  id: number;
  branchName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  contactNumber: string | null;
  isPrimary: boolean;
  distanceKm: number | null;
}

export interface OfferDetail extends Offer {
  subcategory: { id: number; name: string } | null;
  images: OfferImage[];
  branches: OfferBranch[];
  branchIds: number[];
  shop: OfferShopSummary & { description: string | null; contactNumber: string | null };
  rating: { count: number; average: number | null };
}

export interface Shop {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  contactNumber: string | null;
  email: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  status: 'active' | 'inactive';
  branchCount?: number;
  activeOfferCount?: number;
  followerCount?: number;
  isFollowing?: boolean;
  distanceKm: number | null;
  city: string | null;
  categories: OfferCategorySummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopBranch {
  id: number;
  shopId: number;
  branchName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  contactNumber: string | null;
  isPrimary: boolean;
  status: 'active' | 'inactive';
  offerCount?: number;
  distanceKm: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShopDetail extends Shop {
  branches: ShopBranch[];
  rating: { count: number; average: number | null };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  parentId: number | null;
  status: 'active' | 'inactive';
  offerCount?: number;
  shopCount?: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  desktopImageUrl: string | null;
  buttonText: string;
  offerId: number;
  offerTitle: string;
  offerText: string | null;
  offerStatus: string;
  offerEndDate: string;
  offerImageUrl: string | null;
  shop: OfferShopSummary;
  startDate: string;
  endDate: string;
  status: string;
  displayOrder: number;
  isLive: boolean;
  impressionCount: number;
  clickCount: number;
}

export type ClaimStatus = 'claimed' | 'redeemed' | 'expired' | 'cancelled';

export interface Claim {
  id: number;
  code: string;
  status: ClaimStatus;
  claimedAt: string;
  redeemedAt: string | null;
  offer: { id: number; title: string; offerText: string | null; endDate: string; imageUrl: string | null };
  shop: { id: number; name: string };
  branch: { id: number; name: string } | null;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  followedShopOffers: boolean;
  followedCategoryOffers: boolean;
  nearbyOffers: boolean;
  favoriteExpiring: boolean;
  offerUpdates: boolean;
  adminAnnouncements: boolean;
}

export interface Review {
  id: number;
  offerId: number | null;
  shopId: number | null;
  rating: number;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user: { id: number; name: string; avatarUrl: string | null };
  offerTitle?: string;
  shopName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  url: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  bytes: number;
}

export type ClientAnalyticsEvent =
  | 'OFFER_IMPRESSION'
  | 'SEARCH'
  | 'CATEGORY_VIEW'
  | 'SHOP_VIEW'
  | 'LOCATION_SEARCH'
  | 'NEARBY_OFFER_VIEW'
  | 'BANNER_IMPRESSION';

export interface FollowedShop {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  activeOfferCount: number;
  followedAt: string;
}

export interface FollowedCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  activeOfferCount: number;
  followedAt: string;
}
