import { Link } from 'react-router-dom'
import { adStatsCopy } from '../model/adStatsCopy'

type ProfileAdStatsActionLinksProps = {
  adIdStr: string
}

export function ProfileAdStatsActionLinks({ adIdStr }: ProfileAdStatsActionLinksProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/item/${adIdStr}`}
        className="rounded-ui border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {adStatsCopy.viewListing}
      </Link>
      <Link
        to={`/profile/ads/${adIdStr}/promotions`}
        className="rounded-ui bg-daladan-primary px-4 py-2 text-center text-sm font-semibold text-white"
      >
        {adStatsCopy.promotionsCta}
      </Link>
    </div>
  )
}
