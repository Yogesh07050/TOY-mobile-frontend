import { apiClient } from './client';
import type { ApiSuccess } from '../types';
import type {
  CheckoutSession,
  PaymentConfig,
  PaymentTransaction,
  PlanCatalogueResponse,
  PlanKey,
  ShopEntitlements,
  SubscriptionInvoice,
} from '../types/admin';

export async function getPlanCatalogue(): Promise<PlanCatalogueResponse> {
  const res = await apiClient.get<ApiSuccess<PlanCatalogueResponse>>('/subscriptions/plans');
  return res.data.data;
}

export async function getMyEntitlements(): Promise<ShopEntitlements[]> {
  const res = await apiClient.get<ApiSuccess<ShopEntitlements[]>>('/subscriptions/me');
  return res.data.data;
}

export async function getShopEntitlements(shopId: number): Promise<ShopEntitlements> {
  const res = await apiClient.get<ApiSuccess<ShopEntitlements>>(`/subscriptions/shops/${shopId}`);
  return res.data.data;
}

/** Whether checkout can be opened at all on this deployment. */
export async function getPaymentConfig(): Promise<PaymentConfig> {
  const res = await apiClient.get<ApiSuccess<PaymentConfig>>('/payments/config');
  return res.data.data;
}

/**
 * Starts a paid-plan purchase (§3).
 *
 * Returns the Razorpay subscription and its hosted checkout URL. Nothing is
 * unlocked by this call - the plan activates only when Razorpay's webhook
 * reaches the backend (§7).
 */
export async function startCheckout(
  shopId: number,
  payload: { plan: PlanKey; billingCycle?: 'monthly' | 'yearly'; note?: string },
): Promise<CheckoutSession> {
  const res = await apiClient.post<ApiSuccess<CheckoutSession>>(
    `/subscriptions/shops/${shopId}/checkout`,
    payload,
  );
  return res.data.data;
}

/**
 * Reports a completed checkout back to the backend, which verifies the
 * signature. Still not an activation - it only lets the UI stop waiting (§7).
 */
export async function verifyCheckout(
  shopId: number,
  payload: { paymentId: string; subscriptionId?: string; orderId?: string; signature: string },
): Promise<{ verified: boolean; subscriptionStatus: string; message: string }> {
  const res = await apiClient.post<ApiSuccess<{ verified: boolean; subscriptionStatus: string; message: string }>>(
    `/subscriptions/shops/${shopId}/checkout/verify`,
    payload,
  );
  return res.data.data;
}

/** Moves to a cheaper plan; takes effect when the paid period ends (§12). */
export async function downgrade(
  shopId: number,
  payload: { plan: PlanKey; note?: string },
): Promise<ShopEntitlements> {
  const res = await apiClient.post<ApiSuccess<ShopEntitlements>>(
    `/subscriptions/shops/${shopId}/downgrade`,
    payload,
  );
  return res.data.data;
}

/** Stops future billing; benefits run to the end of the paid period (§13). */
export async function cancelSubscription(shopId: number, note?: string): Promise<ShopEntitlements> {
  const res = await apiClient.post<ApiSuccess<ShopEntitlements>>(
    `/subscriptions/shops/${shopId}/cancel`,
    { note },
  );
  return res.data.data;
}

export async function getBillingHistory(shopId: number): Promise<PaymentTransaction[]> {
  const res = await apiClient.get<ApiSuccess<PaymentTransaction[]>>(
    `/subscriptions/shops/${shopId}/billing-history`,
  );
  return res.data.data;
}

export async function getInvoices(shopId: number): Promise<SubscriptionInvoice[]> {
  const res = await apiClient.get<ApiSuccess<SubscriptionInvoice[]>>(
    `/subscriptions/shops/${shopId}/invoices`,
  );
  return res.data.data;
}

export async function getInvoice(shopId: number, invoiceId: number): Promise<SubscriptionInvoice> {
  const res = await apiClient.get<ApiSuccess<SubscriptionInvoice>>(
    `/subscriptions/shops/${shopId}/invoices/${invoiceId}`,
  );
  return res.data.data;
}
