import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { adminApiService, authService } from '../../../services'
import type { AdminUserListItem } from '../../../types/admin'
import type { CityOption, RegionOption } from '../../../services/contracts'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import { emptyUserForm, toCreatePayload, type AdminUserFormValues } from './userForm'

export const useAdminUsersPage = () => {
  const [rows, setRows] = useState<AdminUserListItem[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<AdminUserFormValues>({
    defaultValues: emptyUserForm,
  })
  const regionWatch = watch('region_id')

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

  const regionIdRegister = register('region_id')

  const load = useCallback(async () => {
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const res = await adminApiService.listUsers({ per_page: perPage, page })
      setRows(res.items)
      setLastPage(res.lastPage)
      setTotal(res.total)
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Yuklashda xatolik'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    reset(emptyUserForm)
    setCities([])
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const onSubmit = async (values: AdminUserFormValues) => {
    if (!values.password.trim()) {
      setError('Parol kiriting')
      return
    }
    setSaving(true)
    setError('')
    try {
      await adminApiService.createUser(toCreatePayload(values))
      closeModal()
      await load()
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Saqlashda xatolik'))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = (id: number) => {
    if (!window.confirm('Bu foydalanuvchini o‘chirishni tasdiqlaysizmi?')) return
    void (async () => {
      setError('')
      try {
        await adminApiService.deleteUser(id)
        await load()
      } catch (e) {
        if (isAdminForbidden(e)) setForbidden(true)
        setError(getAdminErrorMessage(e, 'O‘chirishda xatolik'))
      }
    })()
  }

  const onPerPageChange = (n: number) => {
    setPerPage(n)
    setPage(1)
  }

  return {
    rows,
    page,
    setPage,
    perPage,
    lastPage,
    total,
    regions,
    cities,
    loading,
    error,
    forbidden,
    modalOpen,
    saving,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    regionWatch,
    regionIdRegister,
    openCreate,
    closeModal,
    onSubmit,
    onDelete,
    onPerPageChange,
  }
}
