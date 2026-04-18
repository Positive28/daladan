import type { PromotionPlanResource } from '../../../types/marketplace'
import type { AdminPromoKindUi } from './promoKindFromAd'

/** Map API `kind` / `type` values to UI buckets. */
export function normalizePromotionPlanKind(raw: string | undefined): 'top' | 'boost' | null {
  if (!raw?.trim()) return null
  const k = raw.trim().toLowerCase()
  if (k.includes('boost')) return 'boost'
  if (k.includes('top') || k === 'top_sale' || k === 'topsale' || k === 'top-sale') return 'top'
  return null
}

const TOP_LABEL = 'Top sotuv'
const BOOST_LABEL = 'Boosted'
const NONE_LABEL = 'Oddiy (promo yo‘q)'

export type PromoKindOption = { id: AdminPromoKindUi; label: string }

/** When plans include `kind`, only those types appear; otherwise classic none/top/boost. */
export function buildPromoKindOptionsFromPlans(plans: PromotionPlanResource[]): PromoKindOption[] {
  const kinds = new Set<'top' | 'boost'>()
  for (const p of plans) {
    const k = normalizePromotionPlanKind(p.kind)
    if (k) kinds.add(k)
  }

  if (kinds.size === 0) {
    return [
      { id: 'none', label: NONE_LABEL },
      { id: 'top', label: TOP_LABEL },
      { id: 'boost', label: BOOST_LABEL },
    ]
  }

  const out: PromoKindOption[] = [{ id: 'none', label: NONE_LABEL }]
  if (kinds.has('top')) out.push({ id: 'top', label: TOP_LABEL })
  if (kinds.has('boost')) out.push({ id: 'boost', label: BOOST_LABEL })
  return out
}

/** Plans shown for duration picker: shared catalog if no `kind` on rows; else filter by selected promo type. */
export function selectPlansForPromoKind(
  plans: PromotionPlanResource[],
  promoKind: AdminPromoKindUi,
): PromotionPlanResource[] {
  if (promoKind === 'none') return []
  const hasTypedRow = plans.some((p) => normalizePromotionPlanKind(p.kind) !== null)
  if (!hasTypedRow) return plans
  return plans.filter((p) => normalizePromotionPlanKind(p.kind) === promoKind)
}
