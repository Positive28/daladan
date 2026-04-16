import { Camera, Clock, Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MouseEvent, SyntheticEvent } from 'react'

import { useFavorites } from '../../../state/FavoritesContext'
import type { Listing } from '../../../types/marketplace'
import { formatPrice } from '../../../utils/price'
import { formatListingCreatedAt, getListingPhotoCount } from '../model/listingHelpers'
import type { ListingCardVariant } from '../model/types'

const CARD_SHADOW =
  'shadow-md shadow-slate-900/10 dark:shadow-none dark:ring-1 dark:ring-slate-700/80'

const CARD_SHELL = `overflow-hidden rounded-ui border border-daladan-border bg-daladan-surfaceElevated ${CARD_SHADOW} transition-colors hover:border-daladan-primary/40 dark:border-slate-700 dark:bg-slate-900`

interface ListingCardProps {
  listing: Listing
  canFavorite: boolean
  onFavoriteBlocked: () => void
  variant?: ListingCardVariant
  /** When true, shows relative posted time (e.g. on favorites). Home and search omit dates. */
  showPostedDate?: boolean
}

function PromoBadges({ listing }: { listing: Listing }) {
  if (!listing.isTopSale && !listing.isBoosted) return null
  return (
    <div className="absolute left-3 top-3 z-[1] flex flex-wrap gap-2 text-[10px] font-semibold">
      {listing.isTopSale && (
        <span className="rounded-md bg-daladan-accent px-2 py-1 text-daladan-accentDark">TOP SOTUV</span>
      )}
      {listing.isBoosted && (
        <span className="rounded-md bg-daladan-primary px-2 py-1 text-white">BOOST</span>
      )}
    </div>
  )
}

function PhotoCountBadge({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-[1] flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-[1px]">
      <Camera size={12} className="shrink-0 opacity-95" aria-hidden />
      <span>{count}</span>
    </div>
  )
}

function ListingMedia({
  listing,
  variant,
  onImageError,
}: {
  listing: Listing
  variant: ListingCardVariant
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void
}) {
  const photoCount = getListingPhotoCount(listing)

  if (variant === 'grid') {
    return (
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-daladan-soft leading-none dark:bg-slate-800">
        <img
          src={listing.image}
          alt={listing.title}
          onError={onImageError}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <PromoBadges listing={listing} />
        <PhotoCountBadge count={photoCount} />
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-0 min-w-0 w-full overflow-hidden rounded-l-ui bg-daladan-soft dark:bg-slate-800">
      <img
        src={listing.image}
        alt={listing.title}
        onError={onImageError}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <PromoBadges listing={listing} />
      <PhotoCountBadge count={photoCount} />
    </div>
  )
}

function ListingMeta({
  listing,
  variant,
  showPostedDate,
}: {
  listing: Listing
  variant: ListingCardVariant
  showPostedDate: boolean
}) {
  const createdLabel = showPostedDate ? formatListingCreatedAt(listing.createdAt) : null
  return (
    <>
      <h3 className="line-clamp-2 font-semibold text-daladan-heading dark:text-slate-100">
        {variant === 'grid' ? (
          <span className="text-lg">{listing.title}</span>
        ) : (
          <span className="text-base sm:text-lg">{listing.title}</span>
        )}
      </h3>
      <p className="line-clamp-2 text-sm text-daladan-muted dark:text-slate-400">{listing.description}</p>
      <p className="flex items-center gap-1 text-sm text-daladan-muted dark:text-slate-400">
        <MapPin size={14} className="shrink-0" />
        <span className="min-w-0 truncate">{listing.location}</span>
      </p>
      <p className="text-xl font-bold text-daladan-price dark:text-daladan-primary">
        {formatPrice(listing.price)} <span className="text-sm">so&apos;m</span>
      </p>
      {createdLabel ? (
        <p className="flex items-center gap-1 text-xs text-daladan-muted/90 dark:text-slate-500">
          <Clock size={12} className="shrink-0" aria-hidden />
          <span>{createdLabel}</span>
        </p>
      ) : null}
    </>
  )
}

export const ListingCard = ({
  listing,
  canFavorite,
  onFavoriteBlocked,
  variant = 'grid',
  showPostedDate = false,
}: ListingCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(listing.id)
  const itemPath = `/item/${listing.id}`

  const onFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!canFavorite) {
      onFavoriteBlocked()
      return
    }
    toggleFavorite(listing.id)
  }

  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.dataset.fallbackApplied === '1') return
    target.dataset.fallbackApplied = '1'
    target.src = '/daladan-logo-full-transparent.png'
  }

  const linkClassName =
    variant === 'grid'
      ? `flex w-full min-h-0 flex-col ${CARD_SHELL}`
      : `grid min-h-0 grid-cols-[11rem_1fr] items-stretch sm:grid-cols-[14rem_1fr] ${CARD_SHELL}`

  return (
    <div className={variant === 'grid' ? 'relative w-full' : 'relative h-full'}>
      <Link to={itemPath} className={linkClassName}>
        {variant === 'grid' ? (
          <>
            <ListingMedia listing={listing} variant="grid" onImageError={onImageError} />
            <div className="flex flex-col space-y-2.5 p-4">
              <ListingMeta listing={listing} variant="grid" showPostedDate={showPostedDate} />
            </div>
          </>
        ) : (
          <>
            <ListingMedia listing={listing} variant="list" onImageError={onImageError} />
            <div className="flex min-h-0 min-w-0 flex-col justify-start space-y-1.5 p-3 pr-11 sm:space-y-2 sm:p-4 sm:pr-12">
              <ListingMeta listing={listing} variant="list" showPostedDate={showPostedDate} />
            </div>
          </>
        )}
      </Link>
      <button
        type="button"
        aria-label={favorite ? 'Sevimlidan olib tashlash' : "Sevimlilariga qo'shish"}
        onClick={onFavoriteClick}
        className={`absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${
          favorite
            ? 'bg-daladan-accent text-daladan-accentDark'
            : 'bg-daladan-surfaceElevated/95 text-daladan-muted dark:bg-slate-800 dark:text-slate-300'
        }`}
      >
        <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
