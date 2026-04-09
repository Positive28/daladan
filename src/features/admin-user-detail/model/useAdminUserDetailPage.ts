import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApiService, authService } from '../../../services'
import type { AdminUserListItem, AdminUserNestedAd } from '../../../types/admin'
import type { CityOption, RegionOption } from '../../../services/contracts'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import {
  emptyUserForm,
  toUpdatePayload,
  userToForm,
  type AdminUserFormValues,
} from '../../admin-users/model/userForm'

export const useAdminUserDetailPage = () => {
  const { userId: userIdParam } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const userId = userIdParam ? Number(userIdParam) : NaN

  const [user, setUser] = useState<AdminUserListItem | null>(null)
  const [adsPage, setAdsPage] = useState(1)
  const [adsPerPage, setAdsPerPage] = useState(15)

  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<AdminUserFormValues>({
    defaultValues: emptyUserForm,
  })
  const regionWatch = watch('region_id')
  const regionIdRegister = register('region_id')

  useEffect(() => {
    void (async () => {
      try {
        const r = await authService.getRegions()
        setRegions(r)
      } catch {
        setRegions([])
      }
    })()
  }, [])

  useEffect(() => {
    const rid = regionWatch ? Number(regionWatch) : undefined
    if (!rid) {
      setCities([])
      return
    }
    void (async () => {
      try {
        const c = await authService.getCities(rid)
        setCities(c)
      } catch {
        setCities([])
      }
    })()
  }, [regionWatch])

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
      reset(userToForm(u))
      if (u.region_id) {
        try {
          const c = await authService.getCities(u.region_id)
          setCities(c)
        } catch {
          setCities([])
        }
      } else {
        setCities([])
      }
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Foydalanuvchini yuklashda xatolik'))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [userId, reset])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const allAds = useMemo(() => user?.adsRaw ?? [], [user])
  const adsTotal = allAds.length
  const adsLastPage = Math.max(1, Math.ceil(adsTotal / adsPerPage) || 1)

  useEffect(() => {
    if (adsPage > adsLastPage) setAdsPage(adsLastPage)
  }, [adsPage, adsLastPage])

  const ads: AdminUserNestedAd[] = useMemo(
    () => allAds.slice((adsPage - 1) * adsPerPage, adsPage * adsPerPage),
    [allAds, adsPage, adsPerPage],
  )

  const onSubmit = async (values: AdminUserFormValues) => {
    if (!Number.isFinite(userId)) return
    setSaving(true)
    setError('')
    try {
      await adminApiService.updateUser(userId, toUpdatePayload(values))
      await loadUser()
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Saqlashda xatolik'))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = () => {
    if (!Number.isFinite(userId)) return
    if (!window.confirm('Bu foydalanuvchini o‘chirishni tasdiqlaysizmi?')) return
    void (async () => {
      setError('')
      try {
        await adminApiService.deleteUser(userId)
        navigate('/users')
      } catch (e) {
        if (isAdminForbidden(e)) setForbidden(true)
        setError(getAdminErrorMessage(e, 'O‘chirishda xatolik'))
      }
    })()
  }

  const onAdsPerPageChange = (n: number) => {
    setAdsPerPage(n)
    setAdsPage(1)
  }

  const invalidId = !Number.isFinite(userId) || userId < 1

  return {
    invalidId,
    userId,
    user,
    ads,
    adsPage,
    setAdsPage,
    adsPerPage,
    adsLastPage,
    adsTotal,
    regions,
    cities,
    loading,
    error,
    forbidden,
    saving,
    register,
    handleSubmit,
    regionWatch,
    regionIdRegister,
    setValue,
    onSubmit,
    onDelete,
    onAdsPerPageChange,
  }
}
