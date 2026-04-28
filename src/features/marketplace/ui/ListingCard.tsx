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
  /** When true, shows relative posted time (home / favorites). Search uses list layout without date. */
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
  omitTitle = false,
}: {
  listing: Listing
  variant: ListingCardVariant
  showPostedDate: boolean
  omitTitle?: boolean
}) {
  const createdLabel = showPostedDate ? formatListingCreatedAt(listing.createdAt) : null
  const dateRow =
    createdLabel ? (
      <p className="flex items-center gap-1 text-xs text-daladan-muted/90 dark:text-slate-500">
        <Clock size={12} className="shrink-0" aria-hidden />
        <span>{createdLabel}</span>
      </p>
    ) : null

  const title = omitTitle ? null : (
    <h3 className="line-clamp-2 font-semibold text-daladan-heading dark:text-slate-100">
      {variant === 'grid' ? (
        <span className="text-lg">{listing.title}</span>
      ) : (
        <span className="text-base sm:text-lg">{listing.title}</span>
      )}
    </h3>
  )

  const price = (
    <p className="text-xl font-bold text-daladan-price dark:text-daladan-primary">
      {formatPrice(listing.price)} <span className="text-sm">so&apos;m</span>
    </p>
  )

  const location = (
    <p className="flex items-center gap-1 text-sm text-daladan-muted dark:text-slate-400">
      <MapPin size={14} className="shrink-0" />
      <span className="min-w-0 truncate">{listing.location}</span>
    </p>
  )

  const description = (
    <p className="line-clamp-2 text-sm text-daladan-muted dark:text-slate-400">{listing.description}</p>
  )

  /* Grid (home, favorites grid): title → price → location → description → date */
  if (variant === 'grid') {
    return (
      <>
        {title}
        {price}
        {location}
        {description}
        {dateRow}
      </>
    )
  }

  /* List (search): title → description → location → price → date */
  return (
    <>
      {title}
      {description}
      {location}
      {price}
      {dateRow}
    </>
  )
}

function FavoriteIconButton({
  favorite,
  onClick,
  className = '',
}: {
  favorite: boolean
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  /** e.g. absolute placement straddling image / text */
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={favorite ? 'Sevimlidan olib tashlash' : "Sevimlilariga qo'shish"}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-md ${favorite
        ? 'bg-daladan-accent text-daladan-accentDark'
        : 'bg-white text-daladan-muted ring-1 ring-daladan-border/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
        } ${className}`.trim()}
    >
      <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
    </button>
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

  const titleHeadingClass =
    'line-clamp-2 font-semibold text-daladan-heading dark:text-slate-100'

  return (
    <div className={variant === 'grid' ? 'relative w-full' : 'relative h-full'}>
      {variant === 'grid' ? (
        <div className={`flex min-h-0 w-full flex-col ${CARD_SHELL}`}>
          <div className="relative shrink-0">
            <Link
              to={itemPath}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-daladan-primary/40 focus-visible:ring-offset-2 ring-offset-daladan-surfaceElevated dark:ring-offset-slate-900"
            >
              <ListingMedia listing={listing} variant="grid" onImageError={onImageError} />
            </Link>
            <FavoriteIconButton
              favorite={favorite}
              onClick={onFavoriteClick}
              className="absolute bottom-0 right-3 z-20 -translate-y-1/2 translate-y-1.5"
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col space-y-2.5 px-4 pb-4 pt-5">
            <Link
              to={itemPath}
              className="block min-w-0 rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-daladan-primary/50"
            >
              <h3 className={`text-lg ${titleHeadingClass}`}>{listing.title}</h3>
            </Link>
            <Link
              to={itemPath}
              className="flex min-h-0 flex-col gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-daladan-primary/40 focus-visible:ring-offset-2 ring-offset-daladan-surfaceElevated dark:ring-offset-slate-900 rounded-sm"
            >
              <ListingMeta
                listing={listing}
                variant="grid"
                showPostedDate={showPostedDate}
                omitTitle
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className={`relative grid min-h-0 grid-cols-[11rem_1fr] items-stretch sm:grid-cols-[14rem_1fr] ${CARD_SHELL}`}>
          <div className="relative min-h-0 min-w-0">
            <Link
              to={itemPath}
              className="relative block h-full min-h-[9rem] min-w-0 overflow-hidden rounded-l-ui outline-none focus-visible:ring-2 focus-visible:ring-daladan-primary/40 focus-visible:ring-inset"
            >
              <ListingMedia listing={listing} variant="list" onImageError={onImageError} />
            </Link>
          </div>
          <FavoriteIconButton
            favorite={favorite}
            onClick={onFavoriteClick}
            className="absolute right-3 top-3 z-20"
          />
          <div className="flex min-h-0 min-w-0 flex-col gap-1.5 pl-5 pr-3 pt-3 sm:gap-2 sm:pl-6 sm:pr-4 sm:pt-4">
            <Link
              to={itemPath}
              className="block min-w-0 rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-daladan-primary/50"
            >
              <h3 className={`text-base sm:text-lg ${titleHeadingClass}`}>{listing.title}</h3>
            </Link>
            <Link
              to={itemPath}
              className="block min-h-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-daladan-primary/40 rounded-sm"
            >
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <ListingMeta
                  listing={listing}
                  variant="list"
                  showPostedDate={showPostedDate}
                  omitTitle
                />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
