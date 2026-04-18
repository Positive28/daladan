/** Admin promo stub: duration from tomorrow (local midnight), until API exists. */

export const ADMIN_PROMO_PERIOD_OPTIONS = [
  { id: '1w', label: '1 hafta' },
  { id: '1m', label: '1 oy' },
  { id: '2m', label: '2 oy' },
  { id: '3m', label: '3 oy' },
] as const

export type AdminPromoPeriodId = (typeof ADMIN_PROMO_PERIOD_OPTIONS)[number]['id']

/** Next calendar day 00:00:00 local. */
export function getTomorrowLocalStart(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

/** End of promo window: from tomorrow’s start, add week or calendar months. */
export function getPromoEndDateFromTomorrow(periodId: AdminPromoPeriodId): Date {
  const start = getTomorrowLocalStart()
  return getPromoEndFromStartAndDays(start, durationDaysForAdminPeriodId(periodId))
}

/** Calendar length between tomorrow 00:00 and the end date for a static period id. */
export function durationDaysForAdminPeriodId(periodId: AdminPromoPeriodId): number {
  const start = getTomorrowLocalStart()
  const end = new Date(start)
  switch (periodId) {
    case '1w':
      end.setDate(end.getDate() + 7)
      break
    case '1m':
      end.setMonth(end.getMonth() + 1)
      break
    case '2m':
      end.setMonth(end.getMonth() + 2)
      break
    case '3m':
      end.setMonth(end.getMonth() + 3)
      break
  }
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
}

/** Add whole days to `start` (local). */
export function getPromoEndFromStartAndDays(start: Date, durationDays: number): Date {
  const end = new Date(start)
  end.setDate(end.getDate() + durationDays)
  return end
}
