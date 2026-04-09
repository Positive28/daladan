import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { adminApiService } from '../../../services'
import type { AdminUserListItem, AdminUserNestedAd } from '../../../types/admin'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'

export const useAdminUserAdDetailPage = () => {
  const { userId: userIdParam, adId: adIdParam } = useParams<{ userId: string; adId: string }>()
  const userId = userIdParam ? Number(userIdParam) : NaN
  const adId = adIdParam ? Number(adIdParam) : NaN

  const [user, setUser] = useState<AdminUserListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)

  const loadUser = useCallback(async () => {
    if (!Number.isFinite(userId)) {
      setLoading(false)
      return
    }
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const u = await adminApiService.getUser(userId)
      setUser(u)
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Ma\'lumotni yuklashda xatolik'))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const ad: AdminUserNestedAd | undefined = useMemo(
    () => user?.adsRaw?.find((a) => a.id === adId),
    [user, adId],
  )

  const invalidParams =
    !Number.isFinite(userId) || userId < 1 || !Number.isFinite(adId) || adId < 1
  const notFound = !loading && !error && user !== null && ad === undefined

  return {
    userId,
    adId,
    user,
    ad,
    loading,
    error,
    forbidden,
    invalidParams,
    notFound,
    reload: loadUser,
  }
}
