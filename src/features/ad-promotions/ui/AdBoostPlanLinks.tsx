import { Link } from 'react-router-dom'
import { boostPlans as fallbackBoostPlans } from '../../../data/boostPlans'
import type { BoostPlan } from '../../../types/marketplace'

type AdBoostPlanLinksProps = {
  adIdStr: string
  highlightedPlan: string | null
  plans: BoostPlan[]
}

const ringPrimary = 'ring-2 ring-daladan-primary ring-offset-2 dark:ring-offset-slate-900'
const ringAccent = 'ring-2 ring-daladan-accent ring-offset-2 dark:ring-offset-slate-900'

export function AdBoostPlanLinks({ adIdStr, highlightedPlan, plans }: AdBoostPlanLinksProps) {
  const items = plans.length > 0 ? plans : fallbackBoostPlans

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((plan, index) => {
        const isEven = index % 2 === 0
        const ringClass = isEven ? ringPrimary : ringAccent
        const highlighted = highlightedPlan === plan.id
        const baseBtn = isEven
          ? 'bg-daladan-primary text-white'
          : 'bg-daladan-accentMuted text-daladan-accentDark'

        return (
          <Link
            key={plan.id}
            to={`/ad-boost/${adIdStr}?plan=${encodeURIComponent(plan.id)}`}
            className={`rounded-ui px-4 py-2 text-center text-sm font-semibold ${baseBtn} ${
              highlighted ? ringClass : ''
            }`}
          >
            {plan.name} — sotib olish
          </Link>
        )
      })}
    </div>
  )
}
