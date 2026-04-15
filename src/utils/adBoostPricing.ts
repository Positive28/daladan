import type { BoostPlan } from '../types/marketplace'
import type { AdBoostPeriodOption } from '../data/adBoostPeriods'

/** 1 hafta (Boosted tarif) uchun bazaviy narx */
export const BASE_WEEKLY_PRICE_UZS = 5000

/** `boostPlans` dagi Boosted narxi — boshqa tariflarni nisbatan shkalalash uchun */
export const REFERENCE_BOOSTED_PLAN_PRICE_UZS = 25000

export function getWeeklyPriceForPlan(plan: BoostPlan): number {
  return Math.round(BASE_WEEKLY_PRICE_UZS * (plan.price / REFERENCE_BOOSTED_PLAN_PRICE_UZS))
}

export function getBoostTotalForSelection(plan: BoostPlan, period: AdBoostPeriodOption): number {
  const weekly = getWeeklyPriceForPlan(plan)
  return Math.round(weekly * period.weeks * (1 - period.bundleDiscount))
}
