import React from 'react';
import { Badge } from '../ui';
import type { BadgeTone } from '../ui/Badge';
import type { PlanKey } from '../../types/admin';

const PLAN_TONE: Record<PlanKey, BadgeTone> = { FREE: 'default', BUSINESS: 'info', PREMIUM: 'brand' };
const PLAN_LABEL: Record<PlanKey, string> = { FREE: 'Free', BUSINESS: 'Business', PREMIUM: 'Premium' };

export function PlanBadge({ plan }: { plan: PlanKey }) {
  return <Badge label={PLAN_LABEL[plan]} tone={PLAN_TONE[plan]} />;
}
