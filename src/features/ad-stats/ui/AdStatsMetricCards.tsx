import { Eye, Heart, MessageSquare, Phone } from 'lucide-react'
import type { AdStats } from '../../../types/marketplace'
import { formatPrice } from '../../../utils/price'

const rows = (stats: AdStats) =>
  [
    { label: "Ko'rishlar", value: stats.viewsCount, icon: Eye },
    { label: 'Saqlanganlar', value: stats.favoritesCount, icon: Heart },
    { label: 'Xabarlar', value: stats.messagesCount, icon: MessageSquare },
    { label: 'Telefon raqami ochilgan', value: stats.phoneRevealsCount, icon: Phone },
  ] as const

type AdStatsMetricCardsProps = {
  stats: AdStats
}

export function AdStatsMetricCards({ stats }: AdStatsMetricCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows(stats).map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-ui border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
        >
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Icon size={16} aria-hidden />
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatPrice(value)}
          </p>
        </div>
      ))}
    </div>
  )
}
