/** Shared route param validation for profile ad sub-routes (stats, promotions, …). */
export function isValidAdId(adId: number): boolean {
  return Number.isFinite(adId) && adId >= 1
}
