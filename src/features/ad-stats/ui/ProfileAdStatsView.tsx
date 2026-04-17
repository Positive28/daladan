import { BarChart3 } from 'lucide-react'
import {
  InlineAlert,
  ProfileAdListingSubtitle,
  ProfileAdSectionShell,
  profileAdCopy,
} from '../../profile-ad'
import { useProfileAdStatsPage } from '../model/useProfileAdStatsPage'
import { adStatsCopy } from '../model/adStatsCopy'
import { AdStatsMetricCards } from './AdStatsMetricCards'
import { ProfileAdStatsActionLinks } from './ProfileAdStatsActionLinks'

type ProfileAdStatsViewProps = {
  adId: number
}

export function ProfileAdStatsView({ adId }: ProfileAdStatsViewProps) {
  const { listing, stats, loading, error } = useProfileAdStatsPage(adId)
  const adIdStr = String(adId)

  return (
    <ProfileAdSectionShell
      title={
        <span className="flex items-center gap-2">
          <BarChart3 className="h-7 w-7 shrink-0 text-daladan-primary" aria-hidden />
          {adStatsCopy.pageTitle}
        </span>
      }
      subtitle={<ProfileAdListingSubtitle listing={listing} loading={loading} adIdStr={adIdStr} />}
      trailing={<ProfileAdStatsActionLinks adIdStr={adIdStr} />}
    >
      {error ? <InlineAlert variant="error">{error}</InlineAlert> : null}

      {loading ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">{profileAdCopy.loading}</p>
      ) : stats && !error ? (
        <AdStatsMetricCards stats={stats} />
      ) : null}
    </ProfileAdSectionShell>
  )
}
