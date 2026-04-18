import { useCallback, useEffect, useState } from 'react'
import { isValidAdId } from '../../profile-ad/model/adId'
import { marketplaceService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { AdPromotion, BoostPlan, Listing } from '../../../types/marketplace'
import { adPromotionMessages } from './adPromotionMessages'

/** Backend currently responds with 405 for GET; omit the request unless this is set when the API supports listing. */
const shouldFetchProfilePromotionHistory =
  import.meta.env.VITE_ENABLE_PROFILE_AD_PROMOTIONS_HISTORY === 'true'

type ProfileAdPromotionsState = {
  listing: Listing | undefined
  rows: AdPromotion[]
  plans: BoostPlan[]
  promoHistoryNote: string
  loading: boolean
  error: string
}

export function useProfileAdPromotionsPage(adId: number) {
  const [state, setState] = useState<ProfileAdPromotionsState>({
    listing: undefined,
    rows: [],
    plans: [],
    promoHistoryNote: '',
    loading: true,
    error: '',
  })

  const load = useCallback(async () => {
    if (!isValidAdId(adId)) {
      setState({
        listing: undefined,
        rows: [],
        plans: [],
        promoHistoryNote: '',
        loading: false,
        error: adPromotionMessages.invalidAdId,
      })
      return
    }

    setState((prev) => ({ ...prev, error: '', promoHistoryNote: '', loading: true }))

    try {
      const [adRow, plans] = await Promise.all([
        marketplaceService.getProfileAdById(adId),
        marketplaceService.getBoostPlans(),
      ])
      if (!adRow) {
        setState({
          listing: undefined,
          rows: [],
          plans: [],
          promoHistoryNote: '',
          loading: false,
          error: adPromotionMessages.profileNotOwner,
        })
        return
      }

      let rows: AdPromotion[] = []
      let promoHistoryNote = ''
      if (shouldFetchProfilePromotionHistory) {
        try {
          rows = await marketplaceService.getProfileAdPromotions(adId)
        } catch {
          rows = []
          promoHistoryNote = adPromotionMessages.promoHistoryUnavailable
        }
      }

      setState({
        listing: adRow,
        rows,
        plans,
        promoHistoryNote,
        loading: false,
        error: '',
      })
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 404
          ? adPromotionMessages.notFoundShort
          : adPromotionMessages.profileLoadFailed
      setState({
        listing: undefined,
        rows: [],
        plans: [],
        promoHistoryNote: '',
        loading: false,
        error: message,
      })
    }
  }, [adId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}
