import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { marketplaceService } from '../services'
import type { BoostPlan, Listing } from '../types/marketplace'

export const AdBoostPage = () => {
  const { id } = useParams()
  const [listing, setListing] = useState<Listing>()
  const [plans, setPlans] = useState<BoostPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>()

  useEffect(() => {
    if (!id) return
    marketplaceService.getListingById(id).then(setListing)
    marketplaceService.getBoostPlans().then((items) => {
      setPlans(items)
      setSelectedPlanId(items[0]?.id)
    })
  }, [id])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId],
  )

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">E&apos;lonni reklama qilish</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sotuvni oshirish uchun tarif tanlang: <span className="font-medium">{listing?.title}</span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => {
          const isActive = selectedPlanId === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={`rounded-2xl border p-4 text-left ${
                isActive ? 'border-daladan-primary bg-daladan-primary/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900">{plan.name}</p>
                {plan.badge && (
                  <span className="rounded-full bg-daladan-accent px-2 py-1 text-xs text-daladan-accentDark">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xl font-bold text-daladan-primary">
                {plan.price.toLocaleString('en-US')} so&apos;m
              </p>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl bg-daladan-primary p-4 text-white">
        <p className="text-sm text-slate-300">To&apos;lov tafsilotlari</p>
        <p className="mt-2 text-lg font-semibold">{selectedPlan?.name ?? '-'}</p>
        <p className="text-2xl font-bold">
          {selectedPlan ? `${selectedPlan.price.toLocaleString('en-US')} so'm` : '0 so‘m'}
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-daladan-primary px-4 py-2 text-sm font-medium text-white"
        >
          <CheckCircle2 size={16} />
          To&apos;lovni tasdiqlash
        </button>
      </div>
    </section>
  )
}
