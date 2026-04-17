import { useParams } from 'react-router-dom'
import { ProfileAdStatsView } from '../features/ad-stats'

/** Route: `/profile/ads/:ad/stats` — composition only (FSD: page → feature view). */
export const AdStatsPage = () => {
  const { ad } = useParams()
  const adId = ad ? Number(ad) : NaN
  return <ProfileAdStatsView adId={adId} />
}
