import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { adminApiService } from '../../../services'
import type { AdminCategory, AdminSubcategory } from '../../../types/admin'
import { slugifyFromName } from '../../../utils/slugifyAdmin'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import {
  emptySubcategoryForm,
  subcategoryToForm,
  subcategoryToPayload,
  type AdminSubcategoryFormValues,
} from './subcategoryForm'

export const useAdminSubcategoriesPage = () => {
  const [rows, setRows] = useState<AdminSubcategory[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'true' | 'false'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<AdminSubcategoryFormValues>({
    defaultValues: emptySubcategoryForm,
  })
  const nameWatch = watch('name')
  const slugRegister = register('slug', { required: true })

  const loadCategories = useCallback(async () => {
    try {
      const res = await adminApiService.listCategories({ per_page: 100, page: 1 })
      setCategories(res.items)
    } catch {
      setCategories([])
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const load = useCallback(async () => {
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const res = await adminApiService.listSubcategories({
        per_page: perPage,
        page,
        category_id: filterCategoryId === 'all' ? undefined : Number(filterCategoryId),
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
  }, [page, perPage, filterCategoryId, filterActive])

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
    reset(emptySubcategoryForm)
    setModalOpen(true)
  }

  const openEdit = async (id: number) => {
    setSlugManual(true)
    setEditingId(id)
    setError('')
    try {
      const s = await adminApiService.getSubcategory(id)
      reset(subcategoryToForm(s))
      setModalOpen(true)
    } catch (e) {
      setError(getAdminErrorMessage(e, 'Yuklashda xatolik'))
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const onSubmit = async (values: AdminSubcategoryFormValues) => {
    if (!values.category_id) {
      setError('Kategoriya tanlang')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = subcategoryToPayload(values)
      if (editingId === null) {
        await adminApiService.createSubcategory(payload)
      } else {
        await adminApiService.updateSubcategory(editingId, payload)
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
    if (!window.confirm('Bu subkategoriyani o‘chirishni tasdiqlaysizmi?')) return
    void (async () => {
      setError('')
      try {
        await adminApiService.deleteSubcategory(id)
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
    categories,
    page,
    setPage,
    perPage,
    lastPage,
    total,
    filterCategoryId,
    setFilterCategoryId,
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
    slugRegister,
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    onDelete,
    onPerPageChange,
  }
}
