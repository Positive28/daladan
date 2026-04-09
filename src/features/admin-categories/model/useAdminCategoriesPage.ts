import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { adminApiService } from '../../../services'
import type { AdminCategory } from '../../../types/admin'
import { slugifyFromName } from '../../../utils/slugifyAdmin'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import {
  categoryToForm,
  categoryToPayload,
  emptyCategoryForm,
  type AdminCategoryFormValues,
} from './categoryForm'

export const useAdminCategoriesPage = () => {
  const [rows, setRows] = useState<AdminCategory[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterActive, setFilterActive] = useState<'all' | 'true' | 'false'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<AdminCategoryFormValues>({
    defaultValues: emptyCategoryForm,
  })
  const nameWatch = watch('name')
  const slugRegister = register('slug', { required: true })

  const load = useCallback(async () => {
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const res = await adminApiService.listCategories({
        per_page: perPage,
        page,
        is_active: filterActive === 'all' ? undefined : filterActive === 'true',
      })
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
  }, [page, perPage, filterActive])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!modalOpen || slugManual || editingId !== null) return
    setValue('slug', slugifyFromName(nameWatch), { shouldValidate: false })
  }, [nameWatch, modalOpen, slugManual, editingId, setValue])

  const openCreate = () => {
    setEditingId(null)
    setSlugManual(false)
    reset(emptyCategoryForm)
    setModalOpen(true)
  }

  const openEdit = async (id: number) => {
    setSlugManual(true)
    setEditingId(id)
    setError('')
    try {
      const c = await adminApiService.getCategory(id)
      reset(categoryToForm(c))
      setModalOpen(true)
    } catch (e) {
      setError(getAdminErrorMessage(e, 'Yuklashda xatolik'))
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const onSubmit = async (values: AdminCategoryFormValues) => {
    setSaving(true)
    setError('')
    try {
      const payload = categoryToPayload(values)
      if (editingId === null) {
        await adminApiService.createCategory(payload)
      } else {
        await adminApiService.updateCategory(editingId, payload)
      }
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
    if (!window.confirm('Bu kategoriyani o‘chirishni tasdiqlaysizmi?')) return
    void (async () => {
      setError('')
      try {
        await adminApiService.deleteCategory(id)
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
    filterActive,
    setFilterActive,
    loading,
    error,
    forbidden,
    modalOpen,
    editingId,
    setSlugManual,
    saving,
    register,
    handleSubmit,
    reset,
    slugRegister,
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    onDelete,
    onPerPageChange,
  }
}
