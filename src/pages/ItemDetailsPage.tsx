import {
  Bike,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Truck,
} from 'lucide-react'
import { Fragment, useEffect, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ImageLightbox } from '../components/ui/ImageLightbox'
import { ItemDetailsPageSkeleton, RelatedListingCardsSkeleton } from '../features/marketplace'
import { formatListingCreatedAt } from '../features/marketplace/model/listingHelpers'
import { searchUrlForCategoryLabel } from '../features/marketplace/model/searchUrls'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import { useFavorites } from '../state/FavoritesContext'
import type { Listing } from '../types/marketplace'
import { formatPrice } from '../utils/price'

const getListingSlides = (listing: Listing) =>
  listing.images && listing.images.length > 0 ? listing.images : [listing.image]

const TITLE_MAX_LEN = 56

/** Flip to `true` when seller DMs / in-app chat is shipped. */
const IN_APP_MESSAGING_AVAILABLE = false

function TelegramShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.95 1.24-5.5 3.66-.52.35-.99.52-1.41.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.37-.48 1.02-.73 4.02-1.75 6.7-2.9 8.03-3.45 1.9-.76 2.3-.89 2.56-.89.06 0 .21.01.30.11.10.10.12.23.11.29-.01.06-.01.12-.02.18z" />
    </svg>
  )
}

function InstagramShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8A3.6 3.6 0 007.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6A3.6 3.6 0 0016.4 4H7.6m8.4 1.8a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
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

function ItemDetailSidebar({
  listing,
  sellerName,
  canSeePhone,
  canTelegramMessage,
  isFavorite,
  onFavoriteClick,
  onCall,
  onMessage,
  onTelegram,
  onCopyLink,
  linkCopied,
  onShareListingTelegram,
  onShareListingInstagram,
  instagramShareCopied,
  inAppMessagingAvailable,
  className = '',
}: {
  listing: Listing
  sellerName: string
  canSeePhone: boolean
  canTelegramMessage: boolean
  isFavorite: boolean
  onFavoriteClick: (e: MouseEvent<HTMLButtonElement>) => void
  onCall: () => void
  onMessage: () => void
  onTelegram: () => void
  onCopyLink: () => void
  linkCopied: boolean
  onShareListingTelegram: () => void
  onShareListingInstagram: () => void
  instagramShareCopied: boolean
  inAppMessagingAvailable: boolean
  className?: string
}) {
  return (
    <div
      className={`space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5 ${className}`}
    >
      <div>
        <p className="text-3xl font-bold leading-tight text-daladan-primary md:text-4xl">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-0.5 text-lg font-semibold text-slate-700 dark:text-slate-300">{listing.unit}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-label={isFavorite ? 'Sevimlidan olib tashlash' : "Sevimlilariga qo'shish"}
          onClick={onFavoriteClick}
          className={`inline-flex h-10 min-w-[2.5rem] flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors sm:flex-initial ${
            isFavorite
              ? 'border-daladan-accent bg-daladan-accent/15 text-daladan-accentDark'
              : 'border-slate-200 bg-daladan-soft text-daladan-heading hover:border-daladan-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Heart size={18} className="shrink-0" fill={isFavorite ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">{isFavorite ? 'Sevimlida' : 'Sevimli'}</span>
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex h-10 min-w-[2.5rem] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-daladan-soft px-3 text-sm font-semibold text-daladan-heading hover:border-daladan-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 sm:flex-initial"
        >
          <Link2 size={18} className="shrink-0" aria-hidden />
          <span className="hidden sm:inline">{linkCopied ? 'Nusxa olindi' : 'Havolani nusxalash'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onShareListingTelegram}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#229ED9]/40 bg-[#229ED9]/10 px-3 text-sm font-semibold text-[#1682b6] hover:bg-[#229ED9]/15 dark:border-[#229ED9]/35 dark:text-[#5ab4e6]"
          aria-label="Telegramda ulashish"
        >
          <TelegramShareIcon className="h-5 w-5 shrink-0" />
          <span>Telegramda ulashish</span>
        </button>
        <button
          type="button"
          onClick={onShareListingInstagram}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 text-sm font-semibold text-pink-700 hover:bg-pink-500/15 dark:text-pink-400"
          aria-label="Instagramda ulashish"
        >
          <InstagramShareIcon className="h-5 w-5 shrink-0" />
          <span>{instagramShareCopied ? 'Havola nusxalandi' : 'Instagramda ulashish'}</span>
        </button>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sotuvchi</p>
        <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{sellerName}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {canSeePhone ? listing.phone : 'Telefon raqami uchun kirish talab qilinadi'}
        </p>
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          onClick={onCall}
          className="flex w-full items-center justify-center gap-2 rounded-ui bg-daladan-primary px-4 py-3 text-base font-semibold text-white"
        >
          <Phone size={18} />
          Sotuvchi bilan bog&apos;lanish
        </button>
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
        <button
          type="button"
          onClick={onTelegram}
          disabled={!canTelegramMessage}
          className={`flex w-full items-center justify-center gap-2 rounded-ui px-4 py-3 text-base font-semibold ${
            canTelegramMessage
              ? 'bg-daladan-primary text-white'
              : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <Send size={18} />
          Telegram orqali yozish
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
  const [linkCopied, setLinkCopied] = useState(false)
  const [instagramShareCopied, setInstagramShareCopied] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  const loginFrom = `${location.pathname}${location.search}`

  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.dataset.fallbackApplied === '1') return
    target.dataset.fallbackApplied = '1'
    target.src = '/daladan-logo-full-transparent.png'
  }

  useEffect(() => {
    setGalleryIndex(0)
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
    marketplaceService
      .getPublicAds({ perPage: 100 })
      .then((items) => setRelatedListings(items.filter((item) => item.id !== id).slice(0, 3)))
      .finally(() => setIsLoadingRelated(false))
  }, [id])

  useEffect(() => {
    if (!linkCopied) return
    const t = window.setTimeout(() => setLinkCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [linkCopied])

  useEffect(() => {
    if (!instagramShareCopied) return
    const t = window.setTimeout(() => setInstagramShareCopied(false), 2500)
    return () => window.clearTimeout(t)
  }, [instagramShareCopied])

  if (!id) {
    return <p className="rounded-ui bg-white p-6 dark:bg-slate-900 dark:text-slate-200">Mahsulot topilmadi.</p>
  }

  if (isLoadingDetail) {
    return <ItemDetailsPageSkeleton />
  }

  if (!listing) {
    return <p className="rounded-ui bg-white p-6 dark:bg-slate-900 dark:text-slate-200">Mahsulot topilmadi.</p>
  }

  const canSeePhone = Boolean(user)
  const hasTelegram = Boolean(listing.sellerTelegram)
  const canTelegramMessage = user?.authMethod === 'otp' && hasTelegram
  const telegramUsername = listing.sellerTelegram?.replace(/^@/, '')
  const telegramUrl = telegramUsername ? `https://t.me/${telegramUsername}` : 'https://t.me/'
  const quantityText = listing.quantity || "Miqdor ko'rsatilmagan"
  const deliveryInfoText = listing.deliveryInfo || "Ma'lumot berilmagan"
  const sellerName = listing.sellerName || 'Sotuvchi'
  const createdLabel = formatListingCreatedAt(listing.createdAt)
  const slides = getListingSlides(listing)
  const safeIdx = slides.length ? galleryIndex % slides.length : 0
  const favorite = isFavorite(listing.id)

  const redirectToLogin = () => {
    navigate('/login', { state: { from: loginFrom } })
  }

  const onFavoriteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!user) {
      redirectToLogin()
      return
    }
    toggleFavorite(listing.id)
  }

  const onCopyLink = () => {
    const url = window.location.href
    void navigator.clipboard.writeText(url).then(() => setLinkCopied(true))
  }

  const onShareListingTelegram = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`${listing.title} — Daladan`)
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const onShareListingInstagram = async () => {
    const url = window.location.href
    const payload = { title: listing.title, text: `${listing.title} — Daladan`, url }
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(payload)
        return
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setInstagramShareCopied(true)
    } catch {
      window.prompt('Havolani nusxalang:', url)
    }
  }

  const onCall = () => {
    if (!canSeePhone) {
      redirectToLogin()
      return
    }
    window.location.href = `tel:${listing.phone}`
  }

  const onMessage = () => {
    if (!user) {
      redirectToLogin()
      return
    }
    navigate('/profile')
  }

  const onTelegram = () => {
    if (!user) {
      redirectToLogin()
      return
    }
    if (!canTelegramMessage) return
    window.open(telegramUrl, '_blank', 'noopener,noreferrer')
  }

  const sidebarProps = {
    listing,
    sellerName,
    canSeePhone,
    canTelegramMessage,
    isFavorite: favorite,
    onFavoriteClick,
    onCall,
    onMessage,
    onTelegram,
    onCopyLink,
    linkCopied,
    onShareListingTelegram,
    onShareListingInstagram,
    instagramShareCopied,
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
          <div className="space-y-3">
            <ListingBreadcrumbs listing={listing} />
            <section className="relative overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setImagePreview({ urls: slides, index: safeIdx })}
                  className="absolute inset-0 block h-full w-full"
                  aria-label="Rasmni kattalashtirish"
                >
                  <img
                    src={slides[safeIdx]}
                    alt={listing.title}
                    onError={onImageError}
                    className="h-full w-full object-contain object-center"
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
                      <img src={url} alt="" onError={onImageError} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          <section className="space-y-3 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              {listing.isTopSale && (
                <span className="rounded-md bg-daladan-accent px-2 py-1 text-daladan-accentDark">TOP SOTUV</span>
              )}
              {listing.isFresh && (
                <span className="rounded-md bg-daladan-primary/10 px-2 py-1 text-daladan-primary">Yangi hosil</span>
              )}
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {listing.title}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-daladan-primary">
              <span className="inline-flex items-center gap-1">
                <MapPin size={15} className="shrink-0" aria-hidden />
                {listing.location}
              </span>
              {createdLabel ? (
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Calendar size={15} className="shrink-0" aria-hidden />
                  {createdLabel}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              E&apos;lon ID: <span className="font-mono text-slate-600 dark:text-slate-400">{id}</span>
            </p>
          </section>

          <div className="lg:hidden">
            <ItemDetailSidebar {...sidebarProps} />
          </div>

          <section className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
              Mahsulot haqida ma&apos;lumot
            </h2>
            <p className="text-base leading-7 text-slate-700 dark:text-slate-300 sm:text-lg sm:leading-8">
              {listing.description}
            </p>
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
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
              O&apos;xshash mahsulotlar
            </h3>
            {isLoadingRelated ? (
              <RelatedListingCardsSkeleton count={3} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedListings.map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <img src={item.image} alt={item.title} onError={onImageError} className="h-32 w-full object-cover" />
                    <div className="p-3">
                      <p className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="text-sm font-semibold text-daladan-primary">{formatPrice(item.price)} so&apos;m</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="sticky top-24 hidden min-w-0 space-y-4 self-start lg:block">
          <ItemDetailSidebar {...sidebarProps} />
        </aside>
      </div>
    </div>
  )
}
