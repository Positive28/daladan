import { Bike, ChevronLeft, ChevronRight, MapPin, MessageCircle, Phone, Send, Star, Truck } from 'lucide-react'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'
import { formatPrice } from '../utils/price'
import { ImageLightbox } from '../components/ui/ImageLightbox'

const getListingSlides = (listing: Listing) =>
  listing.images && listing.images.length > 0 ? listing.images : [listing.image]

export const ItemDetailsPage = () => {
  const { id } = useParams()
  const [listing, setListing] = useState<Listing>()
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [imagePreview, setImagePreview] = useState<{ urls: string[]; index: number } | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.dataset.fallbackApplied === '1') return
    target.dataset.fallbackApplied = '1'
    target.src = '/daladan-logo-full-transparent.png'
  }

  useEffect(() => {
    if (!id) return
    marketplaceService.getPublicAdById(id).then(setListing)
    marketplaceService
      .getPublicAds({ perPage: 100 })
      .then((items) => setRelatedListings(items.filter((item) => item.id !== id).slice(0, 3)))
  }, [id])

  useEffect(() => {
    setGalleryIndex(0)
  }, [id])

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
  const slides = getListingSlides(listing)
  const safeIdx = slides.length ? galleryIndex % slides.length : 0

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="relative overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-80 w-full bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setImagePreview({ urls: slides, index: safeIdx })}
            className="relative block h-full w-full"
            aria-label="Rasmni kattalashtirish"
          >
            <img
              src={slides[safeIdx]}
              alt={listing.title}
              onError={onImageError}
              className="h-full w-full object-cover"
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

      <section className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          {listing.isTopSale && (
            <span className="rounded-md bg-daladan-accent px-2 py-1 text-daladan-accentDark">TOP SOTUV</span>
          )}
          {listing.isFresh && (
            <span className="rounded-md bg-daladan-primary/10 px-2 py-1 text-daladan-primary">Yangi hosil</span>
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-semibold leading-tight text-slate-900 dark:text-slate-100">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-daladan-primary">
              <MapPin size={15} />
              {listing.location}
            </p>
          </div>
          <p className="text-right text-5xl font-bold text-daladan-primary">
            {formatPrice(listing.price)}
            <span className="block text-2xl font-semibold text-slate-700 dark:text-slate-300">{listing.unit}</span>
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Mahsulot haqida ma&apos;lumot</h2>
        <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">{listing.description}</p>
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

      <section className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sotuvchi</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{sellerName}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {canSeePhone ? listing.phone : 'Telefon raqami uchun kirish talab qilinadi'}
            </p>
          </div>
          <p className="inline-flex items-center gap-1 text-lg font-semibold text-daladan-accentDark">
            <Star size={18} fill="currentColor" />
            4.9
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            if (!canSeePhone) {
              navigate('/login', { state: { from: `/item/${id}` } })
              return
            }
            window.location.href = `tel:${listing.phone}`
          }}
          className="rounded-ui bg-daladan-primary px-4 py-3 text-base font-semibold text-white"
        >
          <Phone size={16} className="mr-2 inline" />
          Sotuvchi bilan bog&apos;lanish
        </button>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate('/login', { state: { from: `/item/${id}` } })
              return
            }
            navigate('/profile')
          }}
          className="rounded-ui bg-daladan-primary px-4 py-3 text-base font-semibold text-white"
        >
          <MessageCircle size={16} className="mr-2 inline" />
          Xabar yuborish
        </button>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate('/login', { state: { from: `/item/${id}` } })
              return
            }
            if (!canTelegramMessage) {
              return
            }
            window.open(telegramUrl, '_blank', 'noopener,noreferrer')
          }}
          className={`rounded-ui px-4 py-3 text-base font-semibold ${
            canTelegramMessage ? 'bg-daladan-primary text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <Send size={16} className="mr-2 inline" />
          Telegram orqali yozish
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">O&apos;xshash mahsulotlar</h3>
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
      </section>
    </div>
  )
}
