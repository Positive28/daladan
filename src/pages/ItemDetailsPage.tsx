import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Truck,
} from 'lucide-react'
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ImageLightbox } from '../components/ui/ImageLightbox'
import { ItemDetailsPageSkeleton, RelatedListingCardsSkeleton } from '../features/marketplace'
import { formatListingCreatedAt, shuffleInPlace } from '../features/marketplace/model/listingHelpers'
import { searchUrlForCategoryLabel } from '../features/marketplace/model/searchUrls'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import { useFavorites } from '../state/FavoritesContext'
import type { Listing } from '../types/marketplace'
import { LOGIN_PATH, loginReturnState } from '../utils/appPaths'
import { formatPrice } from '../utils/price'

const getListingSlides = (listing: Listing) =>
  listing.images && listing.images.length > 0 ? listing.images : [listing.image]

const TITLE_MAX_LEN = 56

const RELATED_SUGGESTIONS_COUNT = 6

/** Flip to `true` when seller DMs / in-app chat is shipped. */
const IN_APP_MESSAGING_AVAILABLE = false

const scrollbarHide =
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'

function RelatedSuggestionsCarousel({
  listings,
  onImageError,
}: {
  listings: Listing[]
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const syncScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    const epsilon = 3
    setHasOverflow(maxScroll > epsilon)
    setCanScrollLeft(scrollLeft > epsilon)
    setCanScrollRight(scrollLeft < maxScroll - epsilon)
  }, [])

  useLayoutEffect(() => {
    syncScroll()
  }, [listings, syncScroll])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    syncScroll()
    el.addEventListener('scroll', syncScroll, { passive: true })
    const ro = new ResizeObserver(() => syncScroll())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', syncScroll)
      ro.disconnect()
    }
  }, [listings, syncScroll])

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    const step = Math.max(200, el.clientWidth * 0.85) * dir
    el.scrollBy({ left: step, behavior: 'smooth' })
  }

  if (listings.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
          Sizga ham yoqishi mumkin
        </h3>
        {hasOverflow ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Oldingi takliflar"
              disabled={!canScrollLeft}
              onClick={() => scrollByDir(-1)}
              className={`rounded-full border p-2 transition-colors ${
                canScrollLeft
                  ? 'border-slate-300 bg-white text-daladan-primary shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700'
                  : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
              }`}
            >
              <ChevronLeft size={22} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Keyingi takliflar"
              disabled={!canScrollRight}
              onClick={() => scrollByDir(1)}
              className={`rounded-full border p-2 transition-colors ${
                canScrollRight
                  ? 'border-slate-300 bg-white text-daladan-accent shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-daladan-primary dark:hover:bg-slate-700'
                  : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
              }`}
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className={`flex touch-pan-x gap-3 overflow-x-auto scroll-smooth pb-1 ${scrollbarHide} snap-x snap-mandatory`}
      >
        {listings.map((item) => {
          const posted = formatListingCreatedAt(item.createdAt)
          return (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="flex w-[min(100%,14rem)] min-w-[11rem] shrink-0 snap-start flex-col overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm transition-colors hover:border-daladan-primary/40 dark:border-slate-700 dark:bg-slate-900 sm:min-w-[12.5rem]"
            >
              <div className="relative shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  onError={onImageError}
                  className="h-32 w-full object-cover"
                />
                <div className="pointer-events-none absolute bottom-2 right-2 max-w-[calc(100%-0.75rem)] truncate rounded-md bg-daladan-primary px-2 py-0.5 text-left text-xs font-bold text-white shadow-sm">
                  {formatPrice(item.price)} so&apos;m
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="mt-2 flex min-w-0 items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={12} className="mt-0.5 shrink-0" aria-hidden />
                  <span className="min-w-0 break-words leading-snug">{item.location}</span>
                </p>
                {posted ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} className="shrink-0" aria-hidden />
                    <span>{posted}</span>
                  </p>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}


function ListingBreadcrumbs({ listing }: { listing: Listing }) {
  const path = listing.categoryPath?.filter(Boolean) ?? []
  const titleShort =
    listing.title.length > TITLE_MAX_LEN ? `${listing.title.slice(0, TITLE_MAX_LEN - 1)}…` : listing.title

  return (
    <nav
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-0.5 text-base font-medium leading-snug sm:text-lg"
      aria-label="Navigatsiya"
    >
      <Link
        to="/"
        className="shrink-0 font-semibold text-daladan-primary decoration-daladan-primary/35 underline-offset-2 hover:underline dark:text-daladan-primary"
      >
        Asosiy
      </Link>
      <span aria-hidden className="font-light text-slate-400 dark:text-slate-500">
        /
      </span>
      {path.length > 0
        ? path.map((segment, i) => (
            <Fragment key={`${segment}-${i}`}>
              <Link
                to={searchUrlForCategoryLabel(segment)}
                className="shrink-0 font-semibold text-daladan-primary decoration-daladan-primary/35 underline-offset-2 hover:underline dark:text-daladan-primary"
              >
                {segment}
              </Link>
              <span aria-hidden className="font-light text-slate-400 dark:text-slate-500">
                /
              </span>
            </Fragment>
          ))
        : listing.category
          ? (
              <>
                <span className="shrink-0 font-semibold text-daladan-primary dark:text-daladan-primary">
                  {listing.category}
                </span>
                <span aria-hidden className="font-light text-slate-400 dark:text-slate-500">
                  /
                </span>
              </>
            )
          : null}
      <span
        className="min-w-0 font-bold text-daladan-heading dark:text-slate-100"
        title={listing.title}
        aria-current="page"
      >
        {titleShort}
      </span>
    </nav>
  )
}

function ListingDetailHeader({ listing }: { listing: Listing }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
        {listing.isTopSale && (
          <span className="rounded-md bg-daladan-accent px-2 py-1 text-daladan-accentDark">TOP SOTUV</span>
        )}
        {listing.isFresh && (
          <span className="rounded-md bg-daladan-primary/10 px-2 py-1 text-daladan-primary">Yangi hosil</span>
        )}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {listing.title}
          </h1>
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-daladan-primary">
            <MapPin size={15} className="shrink-0" aria-hidden />
            <span className="min-w-0">{listing.location}</span>
          </p>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <p className="text-3xl font-bold leading-tight text-daladan-primary md:text-4xl">
            {formatPrice(listing.price)}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-slate-700 dark:text-slate-300">{listing.unit}</p>
        </div>
      </div>
    </div>
  )
}

function ItemDetailSidebar({
  listing,
  sellerName,
  phoneRevealed,
  isFavorite,
  onFavoriteClick,
  onRevealPhone,
  onMessage,
  inAppMessagingAvailable,
  className = '',
}: {
  listing: Listing
  sellerName: string
  phoneRevealed: boolean
  isFavorite: boolean
  onFavoriteClick: (e: MouseEvent<HTMLButtonElement>) => void
  onRevealPhone: () => void
  onMessage: () => void
  inAppMessagingAvailable: boolean
  className?: string
}) {
  return (
    <div
      className={`space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-daladan-primary text-lg font-bold text-white">
          {sellerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sotuvchi</p>
          <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{sellerName}</p>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      <button
        type="button"
        aria-label={isFavorite ? 'Sevimlidan olib tashlash' : "Sevimlilariga qo'shish"}
        onClick={onFavoriteClick}
        className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${
          isFavorite
            ? 'border-daladan-accent bg-daladan-accent/15 text-daladan-accentDark'
            : 'border-slate-200 bg-daladan-soft text-daladan-heading hover:border-daladan-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
        }`}
      >
        <Heart size={18} className="shrink-0" fill={isFavorite ? 'currentColor' : 'none'} />
        <span>{isFavorite ? 'Sevimlida' : 'Sevimli'}</span>
      </button>

      <div className="grid gap-2">
        {phoneRevealed ? (
          <a
            href={`tel:${listing.phone}`}
            className="flex w-full items-center justify-center gap-2 rounded-ui border border-slate-200 bg-daladan-soft px-4 py-3 text-base font-semibold text-daladan-heading hover:border-daladan-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <Phone size={18} className="shrink-0 text-daladan-primary" />
            {listing.phone}
          </a>
        ) : (
          <button
            type="button"
            onClick={onRevealPhone}
            className="flex w-full items-center justify-center gap-2 rounded-ui bg-daladan-primary px-4 py-3 text-base font-semibold text-white"
          >
            <Phone size={18} />
            Telefon nomer ko&apos;rish
          </button>
        )}
        <button
          type="button"
          onClick={inAppMessagingAvailable ? onMessage : undefined}
          disabled={!inAppMessagingAvailable}
          title={!inAppMessagingAvailable ? "Tez orada" : undefined}
          className={`flex w-full gap-2 rounded-ui px-4 py-3 text-base font-semibold ${
            inAppMessagingAvailable
              ? 'items-center justify-center bg-daladan-primary text-white'
              : 'cursor-not-allowed items-start justify-start bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <MessageCircle size={18} className={`shrink-0 ${inAppMessagingAvailable ? '' : 'mt-0.5'}`} />
          {inAppMessagingAvailable ? (
            'Xabar yuborish'
          ) : (
            <span className="flex flex-col items-start text-left leading-snug">
              <span>Xabar yuborish</span>
              <span className="text-xs font-normal opacity-90">Tez orada</span>
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export const ItemDetailsPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const [listing, setListing] = useState<Listing | undefined>(undefined)
  const [isLoadingDetail, setIsLoadingDetail] = useState(() => Boolean(id))
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(() => Boolean(id))
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [imagePreview, setImagePreview] = useState<{ urls: string[]; index: number } | null>(null)
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.dataset.fallbackApplied === '1') return
    target.dataset.fallbackApplied = '1'
    target.src = '/daladan-logo-full-transparent.png'
  }

  useEffect(() => {
    setGalleryIndex(0)
    setPhoneRevealed(false)
    setListing(undefined)
    setRelatedListings([])
    if (!id) {
      setIsLoadingDetail(false)
      setIsLoadingRelated(false)
      return
    }
    setIsLoadingDetail(true)
    setIsLoadingRelated(true)
    marketplaceService
      .getPublicAdById(id)
      .then(setListing)
      .finally(() => setIsLoadingDetail(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    if (isLoadingDetail) return
    if (!listing) {
      setIsLoadingRelated(false)
      return
    }

    let cancelled = false
    setIsLoadingRelated(true)

    const loadRelated = async () => {
      try {
        const filters =
          listing.subcategoryId !== undefined
            ? { subcategoryId: listing.subcategoryId, perPage: 80 }
            : { perPage: 100 }
        const items = await marketplaceService.getPublicAds(filters)
        let others = items.filter((item) => item.id !== id)
        if (others.length < RELATED_SUGGESTIONS_COUNT && listing.subcategoryId !== undefined) {
          const fallback = await marketplaceService.getPublicAds({ perPage: 100 })
          others = fallback.filter((item) => item.id !== id)
        }
        if (cancelled) return
        shuffleInPlace(others)
        setRelatedListings(others.slice(0, RELATED_SUGGESTIONS_COUNT))
      } finally {
        if (!cancelled) setIsLoadingRelated(false)
      }
    }

    void loadRelated()
    return () => {
      cancelled = true
    }
  }, [id, listing, isLoadingDetail])


  if (!id) {
    return <p className="rounded-ui bg-white p-6 dark:bg-slate-900 dark:text-slate-200">Mahsulot topilmadi.</p>
  }

  if (isLoadingDetail) {
    return <ItemDetailsPageSkeleton />
  }

  if (!listing) {
    return <p className="rounded-ui bg-white p-6 dark:bg-slate-900 dark:text-slate-200">Mahsulot topilmadi.</p>
  }

  const quantityText = listing.quantity || "Miqdor ko'rsatilmagan"
  const deliveryInfoText = listing.deliveryInfo || "Ma'lumot berilmagan"
  const sellerName = listing.sellerName || 'Sotuvchi'
  const createdLabel = formatListingCreatedAt(listing.createdAt)
  const slides = getListingSlides(listing)
  const safeIdx = slides.length ? galleryIndex % slides.length : 0
  const favorite = isFavorite(listing.id)

  const redirectToLogin = () => {
    const returnState = loginReturnState(location)
    navigate(LOGIN_PATH, {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: location,
      },
    })
  }

  const onFavoriteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!user) {
      redirectToLogin()
      return
    }
    toggleFavorite(listing.id)
  }

  const onRevealPhone = () => {
    setPhoneRevealed(true)
  }

  const onMessage = () => {
    if (!user) {
      redirectToLogin()
      return
    }
    navigate('/profile')
  }

  const sidebarProps = {
    listing,
    sellerName,
    phoneRevealed,
    isFavorite: favorite,
    onFavoriteClick,
    onRevealPhone,
    onMessage,
    inAppMessagingAvailable: IN_APP_MESSAGING_AVAILABLE,
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <ImageLightbox
        open={imagePreview !== null}
        urls={imagePreview?.urls ?? []}
        index={imagePreview?.index ?? 0}
        onClose={() => setImagePreview(null)}
        onNavigate={(nextIndex) =>
          setImagePreview((prev) => (prev ? { ...prev, index: nextIndex } : null))
        }
        alt={listing.title}
        onImageError={onImageError}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(272px,360px)] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-6">
          <div className="space-y-4">
            <ListingBreadcrumbs listing={listing} />
            <ListingDetailHeader listing={listing} />
            <section className="relative overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="relative aspect-[880/559] w-full bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setImagePreview({ urls: slides, index: safeIdx })}
                  className="absolute inset-0 flex h-full w-full items-center justify-center"
                  aria-label="Rasmni kattalashtirish"
                >
                  <img
                    src={slides[safeIdx]}
                    alt={listing.title}
                    onError={onImageError}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="h-auto w-auto max-h-full max-w-full object-contain object-center"
                  />
                </button>
                {slides.length > 1 ? (
                  <>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Rasm ${i + 1}`}
                          aria-current={i === safeIdx}
                          className={`h-2 rounded-full transition-all ${
                            i === safeIdx ? 'w-6 bg-white' : 'w-2 bg-white/55'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setGalleryIndex(i)
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="Oldingi rasm"
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/60 md:left-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        setGalleryIndex((i) => (i - 1 + slides.length) % slides.length)
                      }}
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      aria-label="Keyingi rasm"
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/60 md:right-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        setGalleryIndex((i) => (i + 1) % slides.length)
                      }}
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                ) : null}
              </div>
              {slides.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-200 p-2 dark:border-slate-700">
                  {slides.map((url, i) => (
                    <button
                      key={`${i}-${url}`}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === safeIdx ? 'border-daladan-primary' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        onError={onImageError}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          <div className="lg:hidden">
            <ItemDetailSidebar {...sidebarProps} />
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
              Tavsif
            </h2>
            <p className="whitespace-pre-line text-base leading-6 text-slate-700 dark:text-slate-300">
              {listing.description.replace(/\n{2,}/g, '\n')}
            </p>
            <div className="pt-2 text-sm text-slate-500 dark:text-slate-400">
              {createdLabel ? (
                <p>
                  Joylashtirilgan:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{createdLabel}</span>
                </p>
              ) : null}
              <p className={createdLabel ? 'mt-1' : undefined}>
                E&apos;lon ID:{' '}
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">{listing.id}</span>
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-ui bg-slate-50 p-4 dark:bg-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Mavjud miqdor
                </p>
                <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <Bike size={18} className="text-daladan-primary" />
                  {quantityText}
                </p>
              </div>
              <div className="rounded-ui bg-slate-50 p-4 dark:bg-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Yetkazib berish
                </p>
                <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <Truck size={18} className="text-daladan-primary" />
                  {deliveryInfoText}
                </p>
              </div>
            </div>
            {listing.viewsCount !== undefined ? (
              <div className="flex justify-end border-t border-slate-200 pt-3 dark:border-slate-700">
                <div
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
                  title="Ko'rishlar soni"
                  aria-label={`Ko'rishlar soni: ${listing.viewsCount}`}
                >
                  <Eye size={16} className="shrink-0 text-daladan-primary" aria-hidden />
                  <span aria-hidden>{listing.viewsCount}</span>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="sticky top-24 hidden min-w-0 space-y-4 self-start lg:block">
          <ItemDetailSidebar {...sidebarProps} />
        </aside>
      </div>

      {isLoadingRelated || relatedListings.length > 0 ? (
        <section className="mt-10 w-full border-t border-slate-200 pt-8 dark:border-slate-700">
          {isLoadingRelated ? (
            <RelatedListingCardsSkeleton count={RELATED_SUGGESTIONS_COUNT} variant="carousel" />
          ) : (
            <RelatedSuggestionsCarousel listings={relatedListings} onImageError={onImageError} />
          )}
        </section>
      ) : null}
    </div>
  )
}
