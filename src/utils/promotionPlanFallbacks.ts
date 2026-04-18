import type { PromotionPlanResource } from '../types/marketplace'
import {
  ADMIN_PROMO_PERIOD_OPTIONS,
  durationDaysForAdminPeriodId,
  type AdminPromoPeriodId,
} from './adminPromoPeriod'

/** Static catalog when `/resources/promotion-plans` is empty or unreachable. */
export function buildPromotionPlanFallbacks(): PromotionPlanResource[] {
  return ADMIN_PROMO_PERIOD_OPTIONS.map((opt) => ({
    id: opt.id,
    label: opt.label,
    durationDays: durationDaysForAdminPeriodId(opt.id as AdminPromoPeriodId),
    price: null,
  }))
}
