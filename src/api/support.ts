import { apiClient } from './client';
import { idempotencyHeaders, keyFor, settle } from './idempotency';
import type {
  ApiListSuccess,
  ApiSuccess,
  PaginationMeta,
  SupportContact,
  SupportTicket,
  SupportTicketPayload,
} from '../types';

/**
 * Support requests.
 *
 * `createSupportTicket` is the one call here that works without a session: the
 * API takes it from a guest on purpose, because somebody who cannot sign in is
 * exactly the person who needs to reach support. Everything else needs a token,
 * and the API refuses a ticket that is not the caller's own.
 */

export async function getSupportContact(): Promise<SupportContact> {
  const res = await apiClient.get<ApiSuccess<SupportContact>>('/support/contact');
  return res.data.data;
}

/**
 * Raises a ticket.
 *
 * Idempotent on the subject, so a retry after a timeout returns the original
 * ticket and its original reference rather than filing a second one saying the
 * same thing. Keyed on the subject rather than a constant because raising a
 * genuinely different request minutes later has to still work.
 *
 * The key only takes effect for a signed-in caller - the server scopes keys by
 * user, and a guest has no id to scope by. A guest's protection is the form,
 * which disables its button while sending.
 */
export async function createSupportTicket(payload: SupportTicketPayload): Promise<SupportTicket> {
  const key = keyFor('support-ticket', payload.subject);
  const res = await apiClient.post<ApiSuccess<SupportTicket>>(
    '/support/tickets',
    payload,
    idempotencyHeaders(key),
  );
  settle('support-ticket', payload.subject);
  return res.data.data;
}

export async function listMySupportTickets(
  params: { page?: number; limit?: number } = {},
): Promise<{ tickets: SupportTicket[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<SupportTicket>>('/support/tickets/mine', { params });
  return { tickets: res.data.data, meta: res.data.meta };
}

/** One ticket with its thread. The API answers 404 unless it is the caller's. */
export async function getSupportTicket(id: number): Promise<SupportTicket> {
  const res = await apiClient.get<ApiSuccess<SupportTicket>>(`/support/tickets/${id}`);
  return res.data.data;
}

/** Returns the whole ticket, thread included, so the screen needs no refetch. */
export async function replyToSupportTicket(id: number, body: string): Promise<SupportTicket> {
  const res = await apiClient.post<ApiSuccess<SupportTicket>>(`/support/tickets/${id}/messages`, {
    body,
  });
  return res.data.data;
}
