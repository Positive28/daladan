import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AdminAdDetailContent, useAdminUserAdDetailPage } from '../../features/admin-user-ad-detail'

export const AdminUserAdDetailPage = () => {
  const { userId, adId, user, ad, loading, error, forbidden, invalidParams, notFound } =
    useAdminUserAdDetailPage()

  if (invalidParams) {
    return (
      <div className="mx-auto max-w-6xl">
        <p className="text-slate-600 dark:text-slate-400">Noto‘g‘ri foydalanuvchi yoki e‘lon identifikatori</p>
        <Link to="/users" className="mt-4 inline-flex text-sm font-medium text-daladan-primary hover:underline">
          Ro‘yxatga qaytish
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to={userId ? `/users/${userId}` : '/users'}
          className="inline-flex items-center gap-2 text-sm font-medium text-daladan-primary hover:underline"
        >
          <ArrowLeft size={18} aria-hidden />
          Foydalanuvchiga qaytish
        </Link>
        <Link to="/users" className="text-sm text-slate-600 hover:underline dark:text-slate-400">
          Barcha foydalanuvchilar
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
      ) : notFound ? (
        <p className="text-slate-600 dark:text-slate-400">
          E‘lon topilmadi (ID {adId}).{' '}
          {userId ? (
            <Link to={`/users/${userId}`} className="font-medium text-daladan-primary hover:underline">
              Foydalanuvchi sahifasiga
            </Link>
          ) : null}
        </p>
      ) : ad && user ? (
        <AdminAdDetailContent ad={ad} user={user} />
      ) : null}
    </div>
  )
}
