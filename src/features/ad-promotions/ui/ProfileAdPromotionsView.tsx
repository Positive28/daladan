import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InlineAlert, ProfileAdListingSubtitle, ProfileAdSectionShell } from '../../profile-ad'
import { useProfileAdPromotionsPage } from '../model/useProfileAdPromotionsPage'
import { getHighlightedPlanFromQuery } from '../model/planHighlight'
import { AdBoostPlanLinks } from './AdBoostPlanLinks'
import { AdPromotionsTable } from './AdPromotionsTable'
import { PromotionsEmptyState } from './PromotionsEmptyState'
import { adPromotionMessages } from '../model/adPromotionMessages'

type ProfileAdPromotionsViewProps = {
  adId: number
}

export function ProfileAdPromotionsView({ adId }: ProfileAdPromotionsViewProps) {
  const [searchParams] = useSearchParams()
  const { listing, rows, loading, error } = useProfileAdPromotionsPage(adId)
  const planFromUrl = searchParams.get('plan')

  const highlightedPlan = useMemo(
    () => getHighlightedPlanFromQuery(planFromUrl),
    [planFromUrl],
  )

  const adIdStr = String(adId)

  return (
    <ProfileAdSectionShell
      title="Reklama va tariflar"
      subtitle={<ProfileAdListingSubtitle listing={listing} loading={loading} adIdStr={adIdStr} />}
      trailing={<AdBoostPlanLinks adIdStr={adIdStr} highlightedPlan={highlightedPlan} />}
    >
      {error ? <InlineAlert variant="error">{error}</InlineAlert> : null}

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">{adPromotionMessages.loading}</p>
      ) : listing && !error ? (
        <>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Reklama tarixi</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Aktiv va o&apos;tgan reklama yozuvlari (serverdan kelgan ro&apos;yxat).
            </p>
          </div>

          {rows.length === 0 ? (
            <PromotionsEmptyState message="Hozircha reklama yozuvlari yo‘q. Yuqoridagi tugmalar orqali tarif tanlang." />
          ) : (
            <AdPromotionsTable rows={rows} variant="profile" />
          )}
        </>
      ) : null}
    </ProfileAdSectionShell>
  )
}
