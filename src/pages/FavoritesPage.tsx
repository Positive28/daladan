import { useEffect, useState } from 'react'
import { ListingCard, ListingViewToggle, useListingViewMode } from '../features/marketplace'
import { marketplaceService } from '../services'
import { useFavorites } from '../state/FavoritesContext'
import type { Listing } from '../types/marketplace'

export const FavoritesPage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [listingView, setListingView] = useListingViewMode()
  const { favoriteIds } = useFavorites()

  useEffect(() => {
    marketplaceService.getPublicAds({ perPage: 100 }).then(setListings)
  }, [])

  const favoriteListings = listings.filter((listing) => favoriteIds.includes(listing.id))

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-daladan-heading dark:text-slate-100">Sevimli e&apos;lonlar</h1>
            <p className="mt-1 text-sm text-daladan-muted dark:text-slate-400">
              Jami: {favoriteListings.length} ta saqlangan e&apos;lon
            </p>
          </div>
          {favoriteListings.length > 0 ? (
            <ListingViewToggle value={listingView} onChange={setListingView} />
          ) : null}
        </div>
      </div>

      {favoriteListings.length === 0 ? (
        <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated p-8 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Hozircha sevimli e&apos;lonlar yo&apos;q.
        </div>
      ) : (
        <div
          className={
            listingView === 'grid'
              ? 'grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
          }
        >
          {favoriteListings.map((listing) => (
            <div key={listing.id} className={listingView === 'grid' ? 'min-h-0' : ''}>
              <ListingCard
                listing={listing}
                variant={listingView}
                canFavorite
                onFavoriteBlocked={() => undefined}
                showPostedDate
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
