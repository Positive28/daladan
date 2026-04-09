import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../services/apiClient'
import { adminApiService } from '../../services'
import type { AdminCategory, AdminSubcategory, AdminSubcategoryPayload } from '../../types/admin'
import { slugifyFromName } from '../../utils/slugifyAdmin'
import { AdminModal } from '../../components/admin/AdminModal'
import { AdminPagination } from '../../components/admin/AdminPagination'

type FormValues = {
  category_id: string
  name: string
  slug: string
  sort_order: string
  is_active: boolean
}

const emptyForm: FormValues = {
  category_id: '',
  name: '',
  slug: '',
  sort_order: '',
  is_active: true,
}

const toPayload = (values: FormValues): AdminSubcategoryPayload => {
  const sortRaw = values.sort_order.trim()
  const sortNum = sortRaw === '' ? null : Number(sortRaw)
  return {
    category_id: Number(values.category_id),
    name: values.name.trim(),
    slug: values.slug.trim(),
    sort_order: sortNum === null || Number.isNaN(sortNum) ? null : sortNum,
    is_active: values.is_active,
  }
}

const rowToForm = (s: AdminSubcategory): FormValues => ({
  category_id: String(s.category_id),
  name: s.name,
  slug: s.slug,
  sort_order: s.sort_order === null ? '' : String(s.sort_order),
  is_active: s.is_active,
})

export const AdminSubcategoriesPage = () => {
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

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({ defaultValues: emptyForm })
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
      if (e instanceof ApiError && e.status === 403) setForbidden(true)
      setError(e instanceof Error ? e.message : 'Yuklashda xatolik')
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
    reset(emptyForm)
    setModalOpen(true)
  }

  const openEdit = async (id: number) => {
    setSlugManual(true)
    setEditingId(id)
    setError('')
    try {
      const s = await adminApiService.getSubcategory(id)
      reset(rowToForm(s))
      setModalOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yuklashda xatolik')
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const onSubmit = async (values: FormValues) => {
    if (!values.category_id) {
      setError('Kategoriya tanlang')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = toPayload(values)
      if (editingId === null) {
        await adminApiService.createSubcategory(payload)
      } else {
        await adminApiService.updateSubcategory(editingId, payload)
      }
      closeModal()
      await load()
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) setForbidden(true)
      setError(e instanceof Error ? e.message : 'Saqlashda xatolik')
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
        if (e instanceof ApiError && e.status === 403) setForbidden(true)
        setError(e instanceof Error ? e.message : 'O‘chirishda xatolik')
      }
    })()
  }

  const onPerPageChange = (n: number) => {
    setPerPage(n)
    setPage(1)
  }

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Subkategoriyalar</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Kategoriyaga bog‘langan subkategoriyalar</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-daladan-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Yangi subkategoriya
          </button>
        </div>

        {forbidden ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Sizda admin huquqi yo‘q yoki sessiya tugagan.
          </div>
        ) : null}
        {error && !modalOpen ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-slate-400">
            Kategoriya:
            <select
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value)
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">Barchasi</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-400">
            Holat:
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value as 'all' | 'true' | 'false')
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">Barchasi</option>
              <option value="true">Faol</option>
              <option value="false">Nofaol</option>
            </select>
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Kategoriya</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Nomi</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Slug</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Faol</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Ma&apos;lumot yo‘q
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.id}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.category?.name ?? `ID ${row.category_id}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.slug}</td>
                    <td className="px-4 py-3">{row.is_active ? 'Ha' : 'Yo‘q'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void openEdit(row.id)}
                        className="mr-2 text-sm font-medium text-daladan-primary hover:underline"
                      >
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        O‘chirish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <AdminPagination
            page={page}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            disabled={loading}
            onPageChange={setPage}
            onPerPageChange={onPerPageChange}
          />
        </div>
      </div>

      {modalOpen ? (
        <AdminModal
          title={editingId === null ? 'Yangi subkategoriya' : 'Subkategoriyani tahrirlash'}
          onClose={closeModal}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="subcategory-form"
                disabled={saving}
                className="rounded-xl bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          }
        >
          {error && modalOpen ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <form id="subcategory-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kategoriya</label>
              <select
                {...register('category_id', { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Tanlang</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nomi</label>
              <input
                {...register('name', { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Slug</label>
              <input
                {...slugRegister}
                onChange={(e) => {
                  setSlugManual(true)
                  slugRegister.onChange(e)
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tartib (ixtiyoriy)</label>
              <input
                {...register('sort_order')}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300" />
              Faol
            </label>
          </form>
        </AdminModal>
      ) : null}
    </>
  )
}
