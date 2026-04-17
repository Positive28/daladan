import { useCallback, useEffect, useState } from 'react'
import { isValidAdId, profileAdCopy } from '../../profile-ad'
import { marketplaceService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { AdStats, Listing } from '../../../types/marketplace'

type ProfileAdStatsState = {
  listing: Listing | undefined
  stats: AdStats | null
  loading: boolean
  error: string
}

export function useProfileAdStatsPage(adId: number) {
  const [state, setState] = useState<ProfileAdStatsState>({
    listing: undefined,
    stats: null,
    loading: true,
    error: '',
  })

  const load = useCallback(async () => {
    if (!isValidAdId(adId)) {
      setState({
        listing: undefined,
        stats: null,
        loading: false,
        error: profileAdCopy.invalidAdId,
      })
      return
    }

    setState((prev) => ({ ...prev, error: '', loading: true }))

    try {
      const [adRow, statsRow] = await Promise.all([
        marketplaceService.getProfileAdById(adId),
        marketplaceService.getProfileAdStats(adId),
      ])
      if (!adRow) {
        setState({
          listing: undefined,
          stats: null,
          loading: false,
          error: profileAdCopy.profileNotOwner,
        })
        return
      }
      setState({
        listing: adRow,
        stats: statsRow,
        loading: false,
        error: '',
      })
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 404
          ? profileAdCopy.statsNotFound
          : profileAdCopy.profileLoadFailed
      setState({
        listing: undefined,
        stats: null,
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
