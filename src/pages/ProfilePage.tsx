import { useEffect, useState } from 'react'
import {
  CreditCard,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { marketplaceService, profileService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'
import { formatUzPhoneInput } from '../utils/phone'

type ProfileTab = 'profile' | 'ads' | 'messages' | 'payments'

interface EditableProfile {
  firstName: string
  lastName: string
  avatarUrl: string
  aboutMe: string
  phone: string
  region: string
}

export const ProfilePage = () => {
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    aboutMe: '',
    phone: '',
    region: '',
  })
  const { user } = useAuth()

  useEffect(() => {
    profileService.getProfile().then((data) => {
      const sourceFullName = user?.fullName ?? data.fullName ?? ''
      const [firstName, ...rest] = sourceFullName.trim().split(' ').filter(Boolean)
      setEditableProfile({
        firstName: firstName || '',
        lastName: rest.join(' '),
        avatarUrl: '',
        aboutMe: data.bio || '',
        phone: formatUzPhoneInput(user?.phone || data.phone || ''),
        region: user?.region || data.region || '',
      })
    })
    marketplaceService.getListings().then((items) => setMyListings(items.slice(0, 2)))
  }, [user])

  const fullName = `${editableProfile.firstName} ${editableProfile.lastName}`.trim()

  const onProfileFieldChange = (field: keyof EditableProfile, value: string) => {
    setEditableProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const renderAdsSection = () => (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-2xl font-semibold text-slate-900">E&apos;lonlarimni boshqarish</p>
          <button type="button" className="text-sm font-semibold text-blue-500">
            Barchasini ko&apos;rish
          </button>
        </div>
        <div className="space-y-3">
          {myListings.map((listing, index) => (
            <div
              key={listing.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="h-28 w-full rounded-xl object-cover md:w-48"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">{listing.title}</p>
                      <p className="text-sm text-slate-500">
                        Narxi: {listing.price.toLocaleString('en-US')} {listing.unit} • Joylashuv:{' '}
                        {listing.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        index === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {index === 0 ? 'FAOL' : "MUDDATI O'TGAN"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <Link
                      to={`/item/${listing.id}`}
                      className="rounded-xl bg-blue-500 px-4 py-2 text-center text-sm font-semibold text-white"
                    >
                      E&apos;lonni ko&apos;tarish
                    </Link>
                    <Link
                      to={`/ad-boost/${listing.id}`}
                      className={`rounded-xl px-4 py-2 text-center text-sm font-semibold ${
                        index === 0 ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {index === 0 ? 'Top Sotuv' : 'Yangilash'}
                    </Link>
                    <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 text-slate-500">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Eye size={16} />
            Ko&apos;rishlar soni
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">1,240</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Heart size={16} />
            Saqlanganlar
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">45</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard size={16} />
            Hisob balansi
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">85,000 so&apos;m</p>
        </div>
      </div>
    </>
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
            }`}
          >
            <Eye size={16} />
            Profil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'ads' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
            }`}
          >
            <CreditCard size={16} />
            E&apos;lonlarim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'messages' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
            }`}
          >
            <MessageSquare size={16} />
            Xabarlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'payments' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
            }`}
          >
            <Wallet size={16} />
            To&apos;lovlar
          </button>
        </div>
      </aside>

      <section className="space-y-5">
        {activeTab === 'profile' && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-200 text-2xl font-bold text-amber-900">
                  {editableProfile.avatarUrl ? (
                    <img
                      src={editableProfile.avatarUrl}
                      alt="Avatar"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    `${(fullName || 'D').charAt(0).toUpperCase()}`
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-semibold text-slate-900">Mening profilim</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Shaxsiy ma&apos;lumotlarni tahrirlash va boshqarish
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Pencil size={14} />
                      {isEditingProfile ? 'Yopish' : 'Tahrirlash'}
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Parolni o&apos;zgartirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {isEditingProfile ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900">Profil ma&apos;lumotlari</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={editableProfile.firstName}
                    onChange={(event) => onProfileFieldChange('firstName', event.target.value)}
                    placeholder="Ism"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={editableProfile.lastName}
                    onChange={(event) => onProfileFieldChange('lastName', event.target.value)}
                    placeholder="Familiya"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={editableProfile.phone}
                    onChange={(event) =>
                      onProfileFieldChange('phone', formatUzPhoneInput(event.target.value))
                    }
                    placeholder="Telefon"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={editableProfile.region}
                    onChange={(event) => onProfileFieldChange('region', event.target.value)}
                    placeholder="Hudud"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={editableProfile.avatarUrl}
                    onChange={(event) => onProfileFieldChange('avatarUrl', event.target.value)}
                    placeholder="Avatar URL"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none md:col-span-2"
                  />
                  <textarea
                    value={editableProfile.aboutMe}
                    onChange={(event) => onProfileFieldChange('aboutMe', event.target.value)}
                    placeholder="O'zim haqimda"
                    className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none md:col-span-2"
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <p className="text-sm text-slate-500">Ism Familiya</p>
                <p className="text-lg font-semibold text-slate-900">{fullName || '-'}</p>
                <p className="mt-2 text-sm text-slate-500">Telefon</p>
                <p className="text-slate-900">{editableProfile.phone || '-'}</p>
                <p className="mt-2 text-sm text-slate-500">Hudud</p>
                <p className="text-slate-900">{editableProfile.region || '-'}</p>
                <p className="mt-2 text-sm text-slate-500">O&apos;zim haqimda</p>
                <p className="text-slate-700">{editableProfile.aboutMe || '-'}</p>
              </div>
            )}
            {renderAdsSection()}
          </>
        )}

        {activeTab === 'ads' && renderAdsSection()}

        {activeTab === 'messages' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Xabarlar</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                3 yangi
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Jasur', text: "Olmalar hali bormi?", time: '10:21' },
                { name: 'Aziza', text: "Narxni kelishsak bo'ladimi?", time: 'Kecha' },
                { name: 'Dilshod', text: 'Yetkazib berish mavjudmi?', time: 'Dush' },
              ].map((message) => (
                <div key={message.name} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{message.name}</p>
                    <p className="text-xs text-slate-400">{message.time}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{message.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <h2 className="text-2xl font-semibold text-slate-900">To&apos;lovlar</h2>
              <p className="mt-1 text-sm text-slate-500">
                E&apos;lonlarni ko&apos;tarish va reklama to&apos;lovlari tarixi.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-100 py-3 text-sm">
                <p className="font-medium text-slate-900">Top Sotuv - Sarhil qizil olmalar</p>
                <p className="font-semibold text-slate-700">45,000 so&apos;m</p>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  To&apos;langan
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 text-sm">
                <p className="font-medium text-slate-900">Boosted - Issiqxona pomidorlari</p>
                <p className="font-semibold text-slate-700">25,000 so&apos;m</p>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  Jarayonda
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
