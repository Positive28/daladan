import { Bike, MapPin, MessageCircle, Phone, Send, Star, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'

export const ItemDetailsPage = () => {
  const { id } = useParams()
  const [listing, setListing] = useState<Listing>()
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    marketplaceService.getListingById(id).then(setListing)
    marketplaceService
      .getListings()
      .then((items) => setRelatedListings(items.filter((item) => item.id !== id).slice(0, 3)))
  }, [id])

  if (!listing) {
    return <p className="rounded-xl bg-white p-6 dark:bg-slate-900 dark:text-slate-200">Mahsulot topilmadi.</p>
  }

  const canSeePhone = Boolean(user)
  const canTelegramMessage = user?.authMethod === 'otp'

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <img src={listing.image} alt={listing.title} className="h-80 w-full object-cover" />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
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
            {listing.price.toLocaleString('en-US')}
            <span className="block text-2xl font-semibold text-slate-700 dark:text-slate-300">{listing.unit}</span>
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Mahsulot haqida ma&apos;lumot</h2>
        <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">{listing.description}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Mavjud miqdor
            </p>
            <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Bike size={18} className="text-daladan-primary" />
              500 kg dan ortiq
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Yetkazib berish
            </p>
            <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Truck size={18} className="text-daladan-primary" />
              Viloyat bo&apos;ylab mavjud
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sotuvchi</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Azizbek Dehqon</p>
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
          className="rounded-xl bg-daladan-primary px-4 py-3 text-base font-semibold text-white"
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
          className="rounded-xl bg-daladan-primary px-4 py-3 text-base font-semibold text-white"
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
            window.open('https://t.me/', '_blank', 'noopener,noreferrer')
          }}
          className={`rounded-xl px-4 py-3 text-base font-semibold ${
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
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <img src={item.image} alt={item.title} className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-sm font-semibold text-daladan-primary">{item.price.toLocaleString('en-US')} so&apos;m</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
