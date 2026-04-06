import { useEffect, useState } from 'react'
import {
  CreditCard,
  Eye,
  Heart,
  LogOut,
  MessageSquare,
  Pencil,
  RefreshCw,
  Trash2,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { marketplaceService, profileService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'
import { formatUzPhoneInput } from '../utils/phone'
import { formatPrice } from '../utils/price'

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
  const [isPasswordEditorOpen, setIsPasswordEditorOpen] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [adsError, setAdsError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [passwordFields, setPasswordFields] = useState({
    current: '',
    next: '',
    confirmation: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    aboutMe: '',
    phone: '',
    region: '',
  })
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const loadProfileAds = async () => {
    try {
      setAdsError('')
      const ads = await marketplaceService.getProfileAds(15)
      setMyListings(ads)
    } catch (error) {
      setAdsError(error instanceof Error ? error.message : "E'lonlarni yuklab bo'lmadi")
    }
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const data = await profileService.getProfile()
        if (!isMounted) return
        const sourceFullName = data.fullName || user?.fullName || ''
        const [firstName, ...rest] = sourceFullName.trim().split(' ').filter(Boolean)
        setEditableProfile({
          firstName: firstName || '',
          lastName: rest.join(' '),
          avatarUrl: data.avatarUrl ?? '',
          aboutMe: data.bio || '',
          phone: formatUzPhoneInput(data.phone || user?.phone || ''),
          region: data.region || user?.region || '',
        })
      } catch (error) {
        if (!isMounted) return
        setProfileError(error instanceof Error ? error.message : "Profilni yuklab bo'lmadi")
      }

      await loadProfileAds()
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [user])

  const fullName = `${editableProfile.firstName} ${editableProfile.lastName}`.trim()

  const handleLogout = async () => {
    const confirmed = window.confirm('Hisobdan chiqmoqchimisiz?')
    if (!confirmed) return
    setIsLoggingOut(true)
    try {
      navigate('/', { replace: true })
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const onProfileFieldChange = (field: keyof EditableProfile, value: string) => {
    setEditableProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    setProfileError('')
    setProfileMessage('')
    setIsSavingProfile(true)
    try {
      let updatedProfile = await profileService.updateProfile({
        fname: editableProfile.firstName.trim() || undefined,
        lname: editableProfile.lastName.trim() || undefined,
      })

      if (avatarFile) {
        updatedProfile = await profileService.updateAvatar(avatarFile)
        setAvatarFile(null)
      }

      const sourceFullName = updatedProfile.fullName || fullName
      const [firstName, ...rest] = sourceFullName.trim().split(' ').filter(Boolean)
      setEditableProfile((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: rest.join(' ') || prev.lastName,
        avatarUrl: updatedProfile.avatarUrl || prev.avatarUrl,
        aboutMe: updatedProfile.bio || prev.aboutMe,
        phone: formatUzPhoneInput(updatedProfile.phone || prev.phone),
        region: updatedProfile.region || prev.region,
      }))
      setIsEditingProfile(false)
      setProfileMessage("Profil muvaffaqiyatli yangilandi")
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Profilni yangilab bo'lmadi")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleDeleteAd = async (listing: Listing) => {
    const adId = Number(listing.id)
    if (!adId || Number.isNaN(adId)) {
      setAdsError("E'lon ID noto'g'ri, o'chirib bo'lmadi")
      return
    }
    if (!window.confirm("Ushbu e'lonni o'chirmoqchimisiz?")) return
    try {
      setAdsError('')
      await marketplaceService.deleteProfileAd(adId)
      await loadProfileAds()
    } catch (error) {
      setAdsError(error instanceof Error ? error.message : "E'lonni o'chirib bo'lmadi")
    }
  }

  const handleRefreshAd = async (listing: Listing) => {
    const adId = Number(listing.id)
    if (!adId || Number.isNaN(adId)) {
      setAdsError("E'lon ID noto'g'ri, yangilab bo'lmadi")
      return
    }
    try {
      setAdsError('')
      await marketplaceService.updateProfileAd(adId, {
        title: listing.title,
        description: listing.description,
      })
      await loadProfileAds()
    } catch (error) {
      setAdsError(error instanceof Error ? error.message : "E'lonni yangilab bo'lmadi")
    }
  }

  const handlePasswordUpdate = async () => {
    setPasswordError('')
    setPasswordMessage('')
    if (!passwordFields.current.trim() || !passwordFields.next.trim() || !passwordFields.confirmation.trim()) {
      setPasswordError("Parol maydonlarini to'liq kiriting")
      return
    }
    if (passwordFields.next !== passwordFields.confirmation) {
      setPasswordError('Yangi parollar bir xil emas')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await profileService.updatePassword({
        current_password: passwordFields.current.trim(),
        new_password: passwordFields.next.trim(),
        new_password_confirmation: passwordFields.confirmation.trim(),
      })
      setPasswordFields({ current: '', next: '', confirmation: '' })
      setIsPasswordEditorOpen(false)
      setPasswordMessage("Parol muvaffaqiyatli yangilandi")
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Parolni yangilab bo'lmadi")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const renderAdsSection = () => (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">E&apos;lonlarimni boshqarish</p>
          <div className="flex items-center gap-2">
            <Link
              to="/profile/ads/new"
              className="rounded-lg bg-daladan-primary px-3 py-1.5 text-sm font-semibold text-white"
            >
              Yangi e&apos;lon
            </Link>
            <button type="button" className="text-sm font-semibold text-daladan-primary">
              Barchasini ko&apos;rish
            </button>
          </div>
        </div>
        {adsError ? <p className="mb-3 text-sm text-daladan-accentDark">{adsError}</p> : null}
        <div className="space-y-3">
          {myListings.map((listing, index) => (
            <div
              key={listing.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-4"
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
                      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{listing.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Narxi: {formatPrice(listing.price)} {listing.unit} • Joylashuv:{' '}
                        {listing.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        index === 0
                          ? 'bg-daladan-primary/10 text-daladan-primary'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {index === 0 ? 'FAOL' : "MUDDATI O'TGAN"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                    <Link
                      to={`/item/${listing.id}`}
                      className="rounded-xl bg-daladan-primary px-4 py-2 text-center text-sm font-semibold text-white"
                    >
                      E&apos;lonni ko&apos;tarish
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void handleRefreshAd(listing)
                      }}
                      className={`rounded-xl px-4 py-2 text-center text-sm font-semibold ${
                        index === 0
                          ? 'bg-daladan-accentMuted text-daladan-accentDark'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {index === 0 ? 'Top Sotuv' : 'Yangilash'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleRefreshAd(listing)
                      }}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteAd(listing)
                      }}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-daladan-accentDark dark:bg-slate-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Eye size={16} />
            Ko&apos;rishlar soni
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">1,240</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Heart size={16} />
            Saqlanganlar
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">45</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CreditCard size={16} />
            Hisob balansi
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(85000)} so&apos;m</p>
        </div>
      </div>
    </>
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'profile'
                ? 'bg-daladan-primary/10 text-daladan-primary'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye size={16} />
            Profil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'ads' ? 'bg-daladan-primary/10 text-daladan-primary' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CreditCard size={16} />
            E&apos;lonlarim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'messages'
                ? 'bg-daladan-primary/10 text-daladan-primary'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare size={16} />
            Xabarlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'payments'
                ? 'bg-daladan-primary/10 text-daladan-primary'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Wallet size={16} />
            To&apos;lovlar
          </button>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut size={16} />
            {isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
          </button>
        </div>
      </aside>

      <section className="space-y-5">
        {activeTab === 'profile' && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-daladan-accent text-2xl font-bold text-daladan-accentDark">
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
                  <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">Mening profilim</h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Shaxsiy ma&apos;lumotlarni tahrirlash va boshqarish
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl bg-daladan-primary px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Pencil size={14} />
                      {isEditingProfile ? 'Yopish' : 'Tahrirlash'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPasswordEditorOpen((prev) => !prev)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Parolni o&apos;zgartirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {profileMessage ? <p className="text-sm text-daladan-primary">{profileMessage}</p> : null}
            {profileError ? <p className="text-sm text-daladan-accentDark">{profileError}</p> : null}
            {passwordMessage ? <p className="text-sm text-daladan-primary">{passwordMessage}</p> : null}
            {isPasswordEditorOpen ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Parolni o&apos;zgartirish</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    type="password"
                    value={passwordFields.current}
                    onChange={(event) => setPasswordFields((prev) => ({ ...prev, current: event.target.value }))}
                    placeholder="Joriy parol"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="password"
                    value={passwordFields.next}
                    onChange={(event) => setPasswordFields((prev) => ({ ...prev, next: event.target.value }))}
                    placeholder="Yangi parol"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="password"
                    value={passwordFields.confirmation}
                    onChange={(event) => setPasswordFields((prev) => ({ ...prev, confirmation: event.target.value }))}
                    placeholder="Yangi parol tasdig&apos;i"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                {passwordError ? <p className="mt-3 text-sm text-daladan-accentDark">{passwordError}</p> : null}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      void handlePasswordUpdate()
                    }}
                    disabled={isUpdatingPassword}
                    className="rounded-xl bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                  >
                    {isUpdatingPassword ? 'Yangilanmoqda...' : 'Parolni saqlash'}
                  </button>
                </div>
              </div>
            ) : null}
            {isEditingProfile ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Profil ma&apos;lumotlari</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={editableProfile.firstName}
                    onChange={(event) => onProfileFieldChange('firstName', event.target.value)}
                    placeholder="Ism"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    value={editableProfile.lastName}
                    onChange={(event) => onProfileFieldChange('lastName', event.target.value)}
                    placeholder="Familiya"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    value={editableProfile.phone}
                    placeholder="Telefon"
                    readOnly
                    disabled
                    className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  />
                  <input
                    value={editableProfile.region}
                    onChange={(event) => onProfileFieldChange('region', event.target.value)}
                    placeholder="Hudud"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    value={editableProfile.avatarUrl}
                    onChange={(event) => onProfileFieldChange('avatarUrl', event.target.value)}
                    placeholder="Avatar URL"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                  />
                  <textarea
                    value={editableProfile.aboutMe}
                    onChange={(event) => onProfileFieldChange('aboutMe', event.target.value)}
                    placeholder="O'zim haqimda"
                    className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveProfile()
                    }}
                    disabled={isSavingProfile}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {isSavingProfile ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Ism Familiya</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{fullName || '-'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Telefon</p>
                <p className="text-slate-900 dark:text-slate-100">{editableProfile.phone || '-'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hudud</p>
                <p className="text-slate-900 dark:text-slate-100">{editableProfile.region || '-'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">O&apos;zim haqimda</p>
                <p className="text-slate-700 dark:text-slate-300">{editableProfile.aboutMe || '-'}</p>
              </div>
            )}
            {renderAdsSection()}
          </>
        )}

        {activeTab === 'ads' && renderAdsSection()}

        {activeTab === 'messages' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Xabarlar</h2>
              <span className="rounded-full bg-daladan-primary/10 px-3 py-1 text-xs font-semibold text-daladan-primary">
                3 yangi
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Jasur', text: "Olmalar hali bormi?", time: '10:21' },
                { name: 'Aziza', text: "Narxni kelishsak bo'ladimi?", time: 'Kecha' },
                { name: 'Dilshod', text: 'Yetkazib berish mavjudmi?', time: 'Dush' },
              ].map((message) => (
                <div key={message.name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{message.name}</p>
                    <p className="text-xs text-slate-400">{message.time}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{message.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">To&apos;lovlar</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                E&apos;lonlarni ko&apos;tarish va reklama to&apos;lovlari tarixi.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-100 py-3 text-sm">
                <p className="font-medium text-slate-900 dark:text-slate-100">Top Sotuv - Sarhil qizil olmalar</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(45000)} so&apos;m</p>
                <span className="rounded-full bg-daladan-primary/10 px-2 py-1 text-xs font-semibold text-daladan-primary">
                  To&apos;langan
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 text-sm">
                <p className="font-medium text-slate-900 dark:text-slate-100">Boosted - Issiqxona pomidorlari</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(25000)} so&apos;m</p>
                <span className="rounded-full bg-daladan-accent px-2 py-1 text-xs font-semibold text-daladan-accentDark">
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
