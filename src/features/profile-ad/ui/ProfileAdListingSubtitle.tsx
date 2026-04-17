import type { Listing } from '../../../types/marketplace'
import { profileAdCopy } from '../model/copy'

type ProfileAdListingSubtitleProps = {
  listing: Listing | undefined
  loading: boolean
  adIdStr: string
}

export function ProfileAdListingSubtitle({ listing, loading, adIdStr }: ProfileAdListingSubtitleProps) {
  if (listing) {
    return (
      <>
        E&apos;lon:{' '}
        <span className="font-medium text-slate-800 dark:text-slate-200">{listing.title}</span>
      </>
    )
  }
  if (loading) return profileAdCopy.loading
  return `E'lon ID: ${adIdStr}`
}
