import type { AdminUserNestedAd } from '../../../types/admin'

export type AdminPromoKindUi = 'none' | 'top' | 'boost'

/** Boost wins if both flags are set (rare). */
export function derivePromoKindFromAd(ad: AdminUserNestedAd): AdminPromoKindUi {
  if (ad.is_boosted) return 'boost'
  if (ad.is_top_sale) return 'top'
  return 'none'
}
