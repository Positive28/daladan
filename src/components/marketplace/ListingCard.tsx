import { Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../../state/FavoritesContext'
import type { Listing } from '../../types/marketplace'

interface ListingCardProps {
  listing: Listing
  canFavorite: boolean
  onFavoriteBlocked: () => void
}

export const ListingCard = ({
  listing,
  canFavorite,
  onFavoriteBlocked,
}: ListingCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(listing.id)

  const onFavoriteClick = () => {
    if (!canFavorite) {
      onFavoriteBlocked()
      return
    }
    toggleFavorite(listing.id)
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="relative">
        <img src={listing.image} alt={listing.title} className="h-44 w-full object-cover" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-[10px] font-semibold">
          {listing.isTopSale && (
            <span className="rounded-md bg-daladan-accent px-2 py-1 text-daladan-accentDark">
              TOP SOTUV
            </span>
          )}
          {listing.isBoosted && (
            <span className="rounded-md bg-daladan-primary px-2 py-1 text-white">
              BOOST
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onFavoriteClick}
          className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full ${
            favorite
              ? 'bg-daladan-accent text-daladan-accentDark'
              : 'bg-white/95 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="space-y-2.5 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{listing.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{listing.description}</p>
        <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          <MapPin size={14} />
          {listing.location}
        </p>
        <p className="text-xl font-bold text-daladan-primary">
          {listing.price.toLocaleString('en-US')} <span className="text-sm">{listing.unit}</span>
        </p>
        <div className="flex gap-2">
          <Link
            to={`/item/${listing.id}`}
            className="flex-1 rounded-xl bg-daladan-primary px-3 py-2 text-center text-sm font-semibold text-white"
          >
            Bog&apos;lanish
          </Link>
        </div>
      </div>
    </article>
  )
}
