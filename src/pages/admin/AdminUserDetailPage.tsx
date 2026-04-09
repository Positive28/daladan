import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminUserFormFields } from '../../features/admin-users'
import { useAdminUserDetailPage } from '../../features/admin-user-detail'

export const AdminUserDetailPage = () => {
  const navigate = useNavigate()
  const {
    invalidId,
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
    handleSubmit,
    regionWatch,
    regionIdRegister,
    register,
    setValue,
    onSubmit,
    onDelete,
    onAdsPerPageChange,
  } = useAdminUserDetailPage()

  if (invalidId) {
    return (
      <div className="mx-auto max-w-6xl">
        <p className="text-slate-600 dark:text-slate-400">Noto‘g‘ri foydalanuvchi identifikatori</p>
        <Link to="/users" className="mt-4 inline-flex text-sm font-medium text-daladan-primary hover:underline">
          Ro‘yxatga qaytish
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-daladan-primary hover:underline"
        >
          <ArrowLeft size={18} aria-hidden />
          Foydalanuvchilar ro‘yxati
        </Link>
      </div>

      {forbidden ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          Sizda admin huquqi yo‘q yoki sessiya tugagan.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">Yuklanmoqda...</p>
      ) : user ? (
        <>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {[user.fname, user.lname].filter(Boolean).join(' ') || 'Foydalanuvchi'}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                ID {user.id} · {user.phone} · {user.role}
                {user.ads_count != null ? ` · ${user.ads_count} ta e‘lon` : null}
              </p>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="shrink-0 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Foydalanuvchini o‘chirish
            </button>
          </div>

          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profilni tahrirlash</h2>
            <form id="admin-user-detail-form" className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <AdminUserFormFields
                register={register}
                regionIdRegister={regionIdRegister}
                regionWatch={regionWatch}
                setValue={setValue}
                regions={regions}
                cities={cities}
                passwordOptional
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-daladan-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}
                </button>
              </div>
            </form>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">E‘lonlar</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Sarlavha</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Narx</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                        E‘lonlar yo‘q
                      </td>
                    </tr>
                  ) : (
                    ads.map((ad) => (
                      <tr
                        key={ad.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/users/${user.id}/ads/${ad.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(`/users/${user.id}/ads/${ad.id}`)
                          }
                        }}
                        className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{ad.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ad.title}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {ad.price != null && ad.price > 0
                            ? `${ad.price.toLocaleString('uz-UZ')}${ad.unit ? ` so'm / ${ad.unit}` : ''}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{ad.status || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <AdminPagination
                page={adsPage}
                lastPage={adsLastPage}
                total={adsTotal}
                perPage={adsPerPage}
                disabled={false}
                onPageChange={setAdsPage}
                onPerPageChange={onAdsPerPageChange}
              />
            </div>
          </section>
        </>
      ) : (
        <p className="text-slate-600 dark:text-slate-400">Foydalanuvchi topilmadi.</p>
      )}
    </div>
  )
}
