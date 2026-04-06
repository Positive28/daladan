import { useEffect, useState } from 'react'
import { ListingCard } from '../components/marketplace/ListingCard'
import { marketplaceService } from '../services'
import { useFavorites } from '../state/FavoritesContext'
import type { Listing } from '../types/marketplace'

export const FavoritesPage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const { favoriteIds } = useFavorites()

  useEffect(() => {
    marketplaceService.getPublicAds({ perPage: 100 }).then(setListings)
  }, [])

  const favoriteListings = listings.filter((listing) => favoriteIds.includes(listing.id))

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Sevimli e&apos;lonlar</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Jami: {favoriteListings.length} ta saqlangan e&apos;lon
        </p>
      </div>

      {favoriteListings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Hozircha sevimli e&apos;lonlar yo&apos;q.
        </div>
      ) : (
        <div className="columns-1 [column-gap:1rem] sm:columns-2 xl:columns-3">
          {favoriteListings.map((listing) => (
            <div key={listing.id} className="mb-4 break-inside-avoid">
              <ListingCard
                listing={listing}
                canFavorite
                onFavoriteBlocked={() => undefined}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
