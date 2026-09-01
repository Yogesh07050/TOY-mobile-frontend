import type { ThemeColors } from '../../theme/colors';
import type { SupportStatus } from '../../types';
import { SUPPORT_CATEGORIES } from '../../content/support';

/**
 * How a ticket's state is spoken about, in one place — and worded from the
 * customer's side, since this app only ever shows them their own. Support sees
 * a queue on the web dashboard; the customer sees a question they have not
 * answered yet.
 */
export const STATUS_LABELS: Record<SupportStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_customer: 'Awaiting your reply',
  resolved: 'Resolved',
  closed: 'Closed',
};

/** Tone for the status line. Never the only signal — the label carries it. */
export function statusColor(status: SupportStatus, colors: ThemeColors): string {
  if (status === 'resolved') return colors.success;
  if (status === 'waiting_on_customer') return colors.warning;
  if (status === 'closed') return colors.textSubtle;
  return colors.info;
}

const CATEGORY_LABELS = new Map(SUPPORT_CATEGORIES.map((item) => [item.value, item.label]));

/**
 * A category's display name.
 *
 * Falls back to the stored value rather than to "Other": a ticket filed under
 * a category that has since been renamed must still read back as what it was.
 */
export const categoryLabel = (value: string): string => CATEGORY_LABELS.get(value) ?? value;
