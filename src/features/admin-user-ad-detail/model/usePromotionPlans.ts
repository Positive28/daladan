import { useEffect, useState } from 'react'
import { marketplaceService } from '../../../services'
import type { PromotionPlanResource } from '../../../types/marketplace'
import { buildPromotionPlanFallbacks } from '../../../utils/promotionPlanFallbacks'

export function usePromotionPlans() {
  const [plans, setPlans] = useState<PromotionPlanResource[]>(buildPromotionPlanFallbacks)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void marketplaceService.getPromotionPlans().then((p) => {
      if (!cancelled) {
        setPlans(p)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { plans, loading }
}
