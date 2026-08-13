import type { OfferTypePreference } from '../types';

// Mirrors backend/src/modules/preferences/preferences.constants.js exactly.
export const MIN_CATEGORY_PREFERENCES = 5;

export const OFFER_TYPE_OPTIONS: Array<{ value: OfferTypePreference; label: string }> = [
  { value: 'PERCENTAGE_DISCOUNT', label: 'Percentage Discount' },
  { value: 'BUY_ONE_GET_ONE', label: 'Buy 1 Get 1' },
  { value: 'BUY_TWO_GET_ONE', label: 'Buy 2 Get 1' },
  { value: 'FLAT_DISCOUNT', label: 'Flat Discount' },
  { value: 'CASHBACK', label: 'Cashback' },
  { value: 'FREE_ITEM', label: 'Free Item' },
  { value: 'COMBO_OFFER', label: 'Combo Offer' },
  { value: 'CLEARANCE_SALE', label: 'Clearance Sale' },
  { value: 'APP_EXCLUSIVE', label: 'App Exclusive' },
];

export const DISCOUNT_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: 'Any discount' },
  { value: 10, label: '10%+' },
  { value: 20, label: '20%+' },
  { value: 30, label: '30%+' },
  { value: 40, label: '40%+' },
  { value: 50, label: '50%+' },
];
