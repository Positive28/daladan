import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAdminAdPromotionsPage } from '../model/useAdminAdPromotionsPage'
import { InlineAlert } from '../../profile-ad'
import { AdPromotionsTable } from './AdPromotionsTable'
import { PromotionsEmptyState } from './PromotionsEmptyState'
import { adPromotionMessages } from '../model/adPromotionMessages'

type AdminAdPromotionsViewProps = {
  adId: number
  userId: number
  hasUserInPath: boolean
}

export function AdminAdPromotionsView({
  adId,
  userId,
  hasUserInPath,
}: AdminAdPromotionsViewProps) {
  const { ad, rows, loading, error, forbidden } = useAdminAdPromotionsPage({
    adId,
    userId,
    hasUserInPath,
  })

  const backToAd = hasUserInPath ? `/users/${userId}/ads/${adId}` : `/moderation/ads/${adId}`
  const backToUser = ad ? `/users/${ad.seller_id}` : hasUserInPath ? `/users/${userId}` : '/users'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to={backToAd}
          className="inline-flex items-center gap-2 text-sm font-medium text-daladan-primary hover:underline"
        >
          <ArrowLeft size={18} aria-hidden />
          E‘longa qaytish
        </Link>
        <Link to={backToUser} className="text-sm text-slate-600 hover:underline dark:text-slate-400">
          Foydalanuvchi
        </Link>
        <Link to="/moderation" className="text-sm text-slate-600 hover:underline dark:text-slate-400">
          Moderatsiya
        </Link>
      </div>

      {forbidden ? (
        <InlineAlert variant="warning" className="mb-4">
          Sizda admin huquqi yo‘q yoki sessiya tugagan.
        </InlineAlert>
      ) : null}

      <div className="rounded-ui border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Reklama tarixi</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {ad ? (
            <>
              E‘lon: <span className="font-medium text-slate-800 dark:text-slate-200">{ad.title}</span>
              <span className="text-slate-500"> (ID {ad.id})</span>
            </>
          ) : loading ? (
            adPromotionMessages.loading
          ) : (
            `E‘lon ID: ${adId}`
          )}
        </p>

        {error ? (
          <InlineAlert variant="error" className="mt-4">
            {error}
          </InlineAlert>
        ) : null}

        {loading ? (
          <p className="mt-4 text-slate-600 dark:text-slate-400">{adPromotionMessages.loading}</p>
        ) : !error && ad ? (
          <>
            {rows.length === 0 ? (
              <PromotionsEmptyState className="mt-6" message="Reklama yozuvlari yo‘q." />
            ) : (
              <div className="mt-6">
                <AdPromotionsTable rows={rows} variant="admin" />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
