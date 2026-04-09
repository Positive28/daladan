import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../services/apiClient'
import { adminApiService, authService } from '../../services'
import type { AdminUserCreatePayload, AdminUserListItem, AdminUserUpdatePayload } from '../../types/admin'
import type { CityOption, RegionOption } from '../../services/contracts'
import { AdminModal } from '../../components/admin/AdminModal'
import { AdminPagination } from '../../components/admin/AdminPagination'

type FormValues = {
  phone: string
  password: string
  fname: string
  lname: string
  email: string
  telegram: string
  telegram_id: string
  region_id: string
  city_id: string
  role: 'user' | 'admin'
}

const emptyForm: FormValues = {
  phone: '',
  password: '',
  fname: '',
  lname: '',
  email: '',
  telegram: '',
  telegram_id: '',
  region_id: '',
  city_id: '',
  role: 'user',
}

const toCreatePayload = (v: FormValues): AdminUserCreatePayload => ({
  phone: v.phone.trim(),
  password: v.password,
  fname: v.fname.trim() || undefined,
  lname: v.lname.trim() || undefined,
  email: v.email.trim() || undefined,
  telegram: v.telegram.trim() || undefined,
  telegram_id: v.telegram_id.trim() ? Number(v.telegram_id) : undefined,
  region_id: v.region_id ? Number(v.region_id) : undefined,
  city_id: v.city_id ? Number(v.city_id) : undefined,
  role: v.role,
})

const toUpdatePayload = (v: FormValues): AdminUserUpdatePayload => {
  const payload: AdminUserUpdatePayload = {
    phone: v.phone.trim() || undefined,
    fname: v.fname.trim() || undefined,
    lname: v.lname.trim() || undefined,
    email: v.email.trim() || undefined,
    telegram: v.telegram.trim() || undefined,
    telegram_id: v.telegram_id.trim() ? Number(v.telegram_id) : undefined,
    region_id: v.region_id ? Number(v.region_id) : undefined,
    city_id: v.city_id ? Number(v.city_id) : undefined,
    role: v.role,
  }
  if (v.password.trim()) payload.password = v.password.trim()
  return payload
}

const userToForm = (u: AdminUserListItem): FormValues => ({
  phone: u.phone,
  password: '',
  fname: u.fname ?? '',
  lname: u.lname ?? '',
  email: '',
  telegram: '',
  telegram_id: '',
  region_id: u.region_id ? String(u.region_id) : '',
  city_id: u.city_id ? String(u.city_id) : '',
  role: u.role === 'admin' ? 'admin' : 'user',
})

export const AdminUsersPage = () => {
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({ defaultValues: emptyForm })
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
      if (e instanceof ApiError && e.status === 403) setForbidden(true)
      setError(e instanceof Error ? e.message : 'Yuklashda xatolik')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    reset(emptyForm)
    setCities([])
    setModalOpen(true)
  }

  const openEdit = async (id: number) => {
    setEditingId(id)
    setError('')
    try {
      const u = await adminApiService.getUser(id)
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
    if (editingId === null && !values.password.trim()) {
      setError('Parol kiriting')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingId === null) {
        await adminApiService.createUser(toCreatePayload(values))
      } else {
        await adminApiService.updateUser(editingId, toUpdatePayload(values))
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
    if (!window.confirm('Bu foydalanuvchini o‘chirishni tasdiqlaysizmi?')) return
    void (async () => {
      setError('')
      try {
        await adminApiService.deleteUser(id)
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
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Foydalanuvchilar</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ro‘yxatdan o‘tgan foydalanuvchilar</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-daladan-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Yangi foydalanuvchi
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

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Ism</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Telefon</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Rol</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Ma&apos;lumot yo‘q
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {[row.fname, row.lname].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.phone}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.role}</td>
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
          title={editingId === null ? 'Yangi foydalanuvchi' : 'Foydalanuvchini tahrirlash'}
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
                form="user-form"
                disabled={saving}
                className="rounded-xl bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          }
        >
          {error && modalOpen ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <form id="user-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
              <input
                {...register('phone', { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Parol {editingId !== null ? '(yangilash ixtiyoriy)' : ''}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ism</label>
                <input
                  {...register('fname')}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Familiya</label>
                <input
                  {...register('lname')}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telegram</label>
                <input {...register('telegram')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telegram ID</label>
                <input
                  {...register('telegram_id')}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Viloyat</label>
                <select
                  {...regionIdRegister}
                  onChange={(e) => {
                    regionIdRegister.onChange(e)
                    setValue('city_id', '')
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Tanlang</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tuman / shahar</label>
                <select
                  {...register('city_id')}
                  disabled={!regionWatch}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Tanlang</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
              <select
                {...register('role')}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </>
  )
}
