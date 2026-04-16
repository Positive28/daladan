import type { Listing } from '../../../types/marketplace'
import { formatUzbekDateFromDate } from '../../../utils/uzbekDateFormat'

export function getListingPhotoCount(listing: Listing): number {
  return listing.images && listing.images.length > 0 ? listing.images.length : 1
}

/** e.g. "4 Aprel 2026" — same pattern as `formatUzbekDate` / admin date helpers. */
export function formatListingCreatedAt(createdAt: string | undefined): string | null {
  if (!createdAt?.trim()) return null
  const parsed = new Date(createdAt.trim())
  if (Number.isNaN(parsed.getTime())) return null
  return formatUzbekDateFromDate(parsed)
}
