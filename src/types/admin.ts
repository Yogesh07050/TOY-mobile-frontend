import type {
  AvailableDay,
  BookingType,
  Offer,
  OfferDetail,
  OfferType,
  PricingType,
  ServiceDetail,
  ServiceOfferType,
  ShopBranch,
} from './models';

// ---- Offers (management) ---------------------------------------------------

export interface OfferFormValues {
  shopId: number;
  categoryId?: number | null;
  subcategoryId?: number | null;
  title: string;
  productName?: string;
  description?: string;
  offerText?: string;
  offerType: OfferType;
  discountType: 'percentage' | 'flat' | 'none';
  discountValue?: number | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  minPurchase?: number | null;
  termsConditions?: string;
  eligibility?: string;
  usageRestrictions?: string;
  applicableProducts?: string;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | null;
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'active';
  applicabilityType: 'shop_wide' | 'selected_branches' | 'online';
  branchIds: number[];
  images: Array<{ url: string; thumbnailUrl?: string }>;
}

export type ManagedOffer = OfferDetail;
export type { Offer };

// ---- Shops / branches / members --------------------------------------------

export interface BranchFormValues {
  branchName: string;
  address?: string;
  city: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  isPrimary?: boolean;
  status?: 'active' | 'inactive';
}

export interface ShopMember {
  id: number;
  shopId: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  userStatus: string;
  branchId: number | null;
  branchName: string | null;
  roleId: number | null;
  roleName: string | null;
  designation: string | null;
  status: string;
  createdAt: string;
}

export type { ShopBranch };

// ---- Banners (management) --------------------------------------------------

export type BannerStatus = 'draft' | 'scheduled' | 'published' | 'expired' | 'deactivated';

export interface BannerFormValues {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  desktopImageUrl?: string;
  offerId: number;
  buttonText?: string;
  startDate: string;
  endDate: string;
  status: BannerStatus;
  displayOrder?: number;
}

export interface AdminBanner {
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
  shop: { id: number; name: string; slug: string; logoUrl: string | null };
  startDate: string;
  endDate: string;
  status: BannerStatus;
  displayOrder: number;
  isLive: boolean;
  impressionCount: number;
  clickCount: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Subscriptions / entitlements ------------------------------------------

export type PlanKey = 'FREE' | 'BUSINESS' | 'PREMIUM';

export interface PlanLimits {
  offersPerMonth: number | null;
  branches: number | null;
  categories: number | null;
  banners: number | null;
  exportsPerMonth: number | null;
}

export interface PlanCatalogueEntry {
  key: PlanKey;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  rank: number;
  limits: PlanLimits;
  features: string[];
  profile: string;
  visibility: string;
}

export interface PlanCatalogueResponse {
  plans: PlanCatalogueEntry[];
  featureLabels: Record<string, string>;
  comparison: Array<{ label: string; values: [string | number, string | number, string | number] }>;
}

export interface ShopEntitlements {
  shopId: number;
  plan: PlanKey;
  planName: string;
  tagline: string;
  price: number;
  currency: string;
  status: string;
  billingCycle: 'monthly' | 'yearly';
  paymentStatus: string;
  startedAt: string | null;
  renewsAt: string | null;
  cancelledAt: string | null;
  limits: PlanLimits;
  features: string[];
  profile: string;
  visibility: string;
  usage: {
    period: string;
    offersThisMonth: number;
    branches: number;
    categories: number;
    banners: number;
    exportsThisMonth: number;
  };
  remaining: {
    offersThisMonth: number | null;
    branches: number | null;
    categories: number | null;
    banners: number | null;
  };
}

export interface PlanUpgradeRequiredDetails {
  requiredPlan: PlanKey;
  requiredPlanName: string;
  requiredPlanPrice: number;
  feature?: string;
  limitKey?: string;
  used?: number;
  limit?: number;
  currentPlan: PlanKey;
}

// ---- Analytics ---------------------------------------------------------

export interface AnalyticsQuery {
  preset?: 'today' | 'yesterday' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth';
  shopId?: number;
  branchId?: number;
  categoryId?: number;
  limit?: number;
}

export interface OverviewAnalytics {
  offers: { total: number; active: number; scheduled: number; expired: number; draft: number; deactivated: number; expiringSoon: number };
  engagement: { views: number; clicks: number; favorites: number; claims: number; redemptions: number };
  shop?: { branches: number; members: number };
}

export interface AnalyticsRange {
  from: string;
  to: string;
  previousFrom?: string;
  previousTo?: string;
}

export interface KpiItem {
  key: string;
  label: string;
  value: number;
  previous: number | null;
  change: number | null;
  trend: 'up' | 'down' | 'flat';
  format: string;
  hint: string | null;
}

export interface AlertItem {
  key: string;
  icon: string;
  tone: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  entityId?: number;
}

export interface TimelinePoint {
  day: string;
  views: number;
  impressions: number;
  claims: number;
  redemptions: number;
  newCustomers: number;
}

export interface PremiumOverview {
  range: AnalyticsRange;
  kpis: KpiItem[];
  totals: Record<string, number>;
  previousTotals: Record<string, number>;
  timeline: TimelinePoint[];
  alerts: AlertItem[];
}

export interface OfferPerformanceRow {
  id: number;
  title: string;
  status: string;
  offerType: string;
  discountType: string;
  discountValue: number | null;
  category: string | null;
  shopName: string;
  startDate: string;
  endDate: string;
  impressions: number;
  views: number;
  clicks: number;
  shares: number;
  saves: number;
  claims: number;
  redemptions: number;
  rates: {
    impressionToView: number;
    viewToSave: number;
    viewToClaim: number;
    claimToRedemption: number;
    viewToRedemption: number;
    engagement: number;
  };
}

export interface OfferPerformanceAnalytics {
  range: AnalyticsRange;
  offers: OfferPerformanceRow[];
  totals: Record<string, number>;
}

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
  from: string | null;
  conversion: number | null;
  dropOff: number | null;
  shareOfTop: number;
}

export interface FunnelAnalytics {
  range: AnalyticsRange;
  stages: FunnelStage[];
  totals: Record<string, number>;
  rates: Record<string, number>;
  biggestDropOff: { stage: string; label: string; conversion: number } | null;
}

export interface LocationRow {
  city: string;
  views: number;
  claims: number;
  redemptions: number;
  customers: number;
  conversion: number;
}

export interface LocationAnalytics {
  range: AnalyticsRange;
  locations: LocationRow[];
  branches: Array<{ id: number; branchName: string; city: string; latitude: number; longitude: number }>;
  highlights: { mostActive: LocationRow | null; highestConverting: LocationRow | null };
}

export interface BranchPerformanceRow {
  id: number;
  branchName: string;
  city: string;
  isPrimary: boolean;
  activeOffers: number;
  views: number;
  customers: number;
  claims: number;
  redemptions: number;
  conversion: number;
  topOffer: { id: number; title: string; views: number } | null;
}

export interface BranchPerformanceAnalytics {
  range: AnalyticsRange;
  branches: BranchPerformanceRow[];
  winners: { bestPerforming: BranchPerformanceRow | null; highestConversion: BranchPerformanceRow | null };
}

// ---- V4 — Services (management) --------------------------------------------

export interface ServiceFormValues {
  shopId: number;
  categoryId?: number | null;
  subcategoryId?: number | null;
  name: string;
  description?: string;
  pricingType: PricingType;
  price?: number | null;
  durationMinutes?: number | null;
  durationLabel?: string;
  availableDays: AvailableDay[];
  availableTimeStart?: string;
  availableTimeEnd?: string;
  homeService: boolean;
  walkInAvailable: boolean;
  appointmentRequired: boolean;
  bookingType: BookingType;
  serviceArea?: string;
  termsConditions?: string;
  applicabilityType: 'shop_wide' | 'selected_branches' | 'online';
  status: 'draft' | 'active';
  startDate?: string | null;
  endDate?: string | null;
  branchIds: number[];
  images: Array<{ url: string; thumbnailUrl?: string }>;
}

export type ManagedService = ServiceDetail;

export interface ServiceOfferFormValues {
  offerText?: string;
  offerType: ServiceOfferType;
  discountType: 'percentage' | 'flat' | 'none';
  discountValue?: number | null;
  originalPrice?: number | null;
  offerPrice?: number | null;
  termsConditions?: string;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | null;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active';
}

export type ServiceAnalyticsQuery = AnalyticsQuery & { serviceId?: number };

export interface ServiceAnalyticsOverview {
  range: AnalyticsRange;
  kpis: KpiItem[];
  totalServices: number;
  activeServices: number;
}

export interface ServiceTopPerformer {
  id: number;
  name: string;
  views: number;
  saves: number;
  bookings: number;
  claims: number;
  conversion: number | null;
}

export interface ServicePerformance {
  bestService: ServiceTopPerformer | null;
  mostViewedService: ServiceTopPerformer | null;
  mostSavedService: ServiceTopPerformer | null;
  mostBookedService: ServiceTopPerformer | null;
  mostClaimedService: ServiceTopPerformer | null;
  bestConvertingService: ServiceTopPerformer | null;
}

export interface ServiceFunnelStage {
  key: string;
  label: string;
  value: number;
  conversionFromPrevious: number | null;
}

export interface ServiceOfferPerformanceSplit {
  promotional: { views: number };
  normal: { views: number };
}

export interface ServiceBranchRow {
  id: number;
  branchName: string;
  city: string | null;
  views: number;
  bookings: number;
  claims: number;
}

export interface ServiceLocationRow {
  city: string;
  views: number;
  bookings: number;
}

export interface ServiceCustomerInsights {
  newCustomers: number;
  customerGrowth: number | null;
  repeatBookings: number;
  repeatClaims: number;
}

export interface ServiceCategoryInsightRow {
  id: number;
  name: string;
  serviceCount: number;
  views: number;
  saves: number;
}
