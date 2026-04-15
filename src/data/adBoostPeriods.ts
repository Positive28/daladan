export interface AdBoostPeriodOption {
  id: string
  label: string
  /** To'lov uchun hafta soni (1 oy ≈ 4 hafta) */
  weeks: number
  /** Uzaytirilgan davr uchun qo'shimcha chegirma (0–1) */
  bundleDiscount: number
}

export const adBoostPeriodOptions: readonly AdBoostPeriodOption[] = [
  { id: '1w', label: '1 hafta', weeks: 1, bundleDiscount: 0 },
  { id: '1m', label: '1 oy', weeks: 4, bundleDiscount: 0.05 },
  { id: '2m', label: '2 oy', weeks: 8, bundleDiscount: 0.08 },
  { id: '3m', label: '3 oy', weeks: 12, bundleDiscount: 0.1 },
] as const
