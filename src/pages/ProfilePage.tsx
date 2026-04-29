import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Heart,
  LogOut,
  MessageSquare,
  Moon,
  Pencil,
  Sun,
  Wallet,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { marketplaceService, profileService } from '../services'
import { useAuth } from '../state/AuthContext'
import { useTheme } from '../state/ThemeContext'
import type { Listing } from '../types/marketplace'
import { formatUzPhoneInput } from '../utils/phone'
import { formatPrice } from '../utils/price'
import { formatUzbekDateTime } from '../utils/uzbekDateFormat'
import { ImageLightbox } from '../components/ui/ImageLightbox'

type ProfileTab = 'profile' | 'ads' | 'messages' | 'payments'

/** Blurred preview + “Ish jarayonida” for profile tabs not shipped yet (e.g. Xabarlar, To‘lovlar). */
function ProfileComingSoonOverlay({ preview }: { preview: ReactNode }) {
  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-lg">
      <div className="pointer-events-none select-none blur-md" aria-hidden>
        {preview}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center bg-white/55 p-4 backdrop-blur-[2px] dark:bg-slate-900/55"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-md rounded-ui border border-daladan-primary/35 bg-white/95 px-6 py-5 text-center shadow-md dark:border-daladan-primary/40 dark:bg-slate-900/95">
          <p className="text-lg font-bold tracking-tight text-daladan-heading dark:text-slate-100">
            Ish jarayonida
          </p>
          <p className="mt-1.5 text-sm text-daladan-muted dark:text-slate-400">
            Bu bo&apos;lim tez orada ishga tushadi.
          </p>
        </div>
      </div>
    </div>
  )
}

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
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isTabSwitching, setIsTabSwitching] = useState(false)
  const [adGalleryIndex, setAdGalleryIndex] = useState<Record<string, number>>({})
  const [imagePreview, setImagePreview] = useState<{ urls: string[]; index: number } | null>(null)

  useEffect(() => {
    const nextTab = (location.state as { tab?: ProfileTab } | null)?.tab
    if (nextTab && ['profile', 'ads', 'messages', 'payments'].includes(nextTab)) {
      setActiveTab(nextTab)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const loadProfileAds = async () => {
    try {
      setAdsError('')
      const perPage = 100
      const maxPages = 50
      const aggregated: Listing[] = []
      const seenIds = new Set<string>()
      for (let page = 1; page <= maxPages; page += 1) {
        const batch = await marketplaceService.getProfileAds(perPage, page)
        const fresh = batch.filter((listing) => !seenIds.has(listing.id))
        if (fresh.length === 0) break
        for (const listing of fresh) {
          seenIds.add(listing.id)
        }
        aggregated.push(...fresh)
        if (batch.length < perPage) break
      }
      setMyListings(aggregated)
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

  const totalAdViews = useMemo(
    () => myListings.reduce((sum, listing) => sum + (listing.viewsCount ?? 0), 0),
    [myListings],
  )

  const getAdSlides = (listing: Listing) =>
    listing.images && listing.images.length > 0 ? listing.images : [listing.image]

  const adStatusPresentation = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'active') {
      return { label: 'FAOL', className: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400' }
    }
    if (s === 'expired') {
      return { label: "MUDDATI O'TGAN", className: 'bg-sky-500/15 text-sky-800 dark:text-sky-300' }
    }
    if (s === 'draft') {
      return { label: 'QORALAMA', className: 'bg-amber-500/15 text-amber-900 dark:text-amber-300' }
    }
    if (s === 'pending') {
      return { label: 'MODERATSIYADA', className: 'bg-amber-500/20 text-amber-950 dark:text-amber-200' }
    }
    if (s === 'paused' || s === 'inactive') {
      return { label: "TO'XTATILGAN", className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
    }
    if (status?.trim()) {
      return {
        label: status.toUpperCase(),
        className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      }
    }
    return { label: '—', className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
  }

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

  const handleTabChange = (nextTab: ProfileTab) => {
    if (nextTab === activeTab || isTabSwitching) return
    setIsTabSwitching(true)
    window.setTimeout(() => {
      setActiveTab(nextTab)
      setIsTabSwitching(false)
    }, 140)
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
          {myListings.map((listing) => {
            const slides = getAdSlides(listing)
            const slideIdx = adGalleryIndex[listing.id] ?? 0
            const safeIdx = slides.length ? slideIdx % slides.length : 0
            const status = adStatusPresentation(listing.status)
            return (
              <div
                key={listing.id}
                className="relative overflow-hidden rounded-ui border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-4"
              >
                <Link
                  to={`/item/${listing.id}`}
                  className="absolute inset-0 z-0 rounded-ui"
                  aria-label={`${listing.title} — batafsil`}
                />
                <div className="relative z-10 flex flex-col gap-3 md:flex-row pointer-events-none">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-ui md:h-auto md:w-48 md:min-h-[7rem] pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setImagePreview({ urls: slides, index: safeIdx })}
                      className="relative block h-full w-full min-h-[7rem]"
                    >
                      <img
                        src={slides[safeIdx]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {slides.length > 1 ? (
                      <>
                        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                          {slides.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              aria-label={`Rasm ${i + 1}`}
                              className={`h-1.5 rounded-full transition-all ${
                                i === safeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/55'
                              }`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setAdGalleryIndex((prev) => ({ ...prev, [listing.id]: i }))
                              }}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          aria-label="Oldingi rasm"
                          className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/65"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setAdGalleryIndex((prev) => ({
                              ...prev,
                              [listing.id]: ((prev[listing.id] ?? 0) - 1 + slides.length) % slides.length,
                            }))
                          }}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label="Keyingi rasm"
                          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/65"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setAdGalleryIndex((prev) => ({
                              ...prev,
                              [listing.id]: ((prev[listing.id] ?? 0) + 1) % slides.length,
                            }))
                          }}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3 pointer-events-none">
                      <div className="min-w-0">
                        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{listing.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Narxi: {formatPrice(listing.price)} {listing.unit} • Joylashuv: {listing.location}
                        </p>
                        {listing.isBoosted ? (
                          <p className="mt-1 text-sm font-medium text-amber-800 dark:text-amber-200/90">
                            Boost aktiv
                            {listing.boostExpiresAt
                              ? ` · tugash: ${formatUzbekDateTime(listing.boostExpiresAt)}`
                              : null}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        {listing.isBoosted ? (
                          <span
                            className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-950 dark:text-amber-100"
                            title="E'lon ko'tarilgan (boost)"
                          >
                            Boost
                          </span>
                        ) : null}
                        {listing.isTopSale ? (
                          <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
                            Top
                          </span>
                        ) : null}
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-20 mt-4 flex flex-wrap gap-2 pointer-events-auto">
                      <Link
                        to={`/profile/ads/${listing.id}/stats`}
                        className="rounded-ui border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Statistika
                      </Link>
                      <Link
                        to={`/ad-boost/${listing.id}?plan=boosted`}
                        className={
                          listing.isBoosted
                            ? 'rounded-ui border border-daladan-primary bg-white px-4 py-2 text-center text-sm font-semibold text-daladan-primary hover:bg-daladan-primary/5 dark:border-daladan-primary dark:bg-slate-900 dark:hover:bg-daladan-primary/10'
                            : 'rounded-ui bg-daladan-primary px-4 py-2 text-center text-sm font-semibold text-white'
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        {listing.isBoosted ? 'Reklama / yangilash' : "E'lonni ko'tarish"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <ImageLightbox
          open={imagePreview !== null}
          urls={imagePreview?.urls ?? []}
          index={imagePreview?.index ?? 0}
          onClose={() => setImagePreview(null)}
          onNavigate={(nextIndex) =>
            setImagePreview((prev) => (prev ? { ...prev, index: nextIndex } : null))
          }
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Eye size={16} />
            Ko&apos;rishlar soni
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {formatPrice(totalAdViews)}
          </p>
        </div>
        <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Heart size={16} />
            Saqlanganlar
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">45</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-ui border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:hidden">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Mavzu</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          aria-label={theme === 'dark' ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => handleTabChange('profile')}
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
            onClick={() => handleTabChange('ads')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium ${
              activeTab === 'ads' ? 'bg-daladan-primary/10 text-daladan-primary' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CreditCard size={16} />
            E&apos;lonlarim
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('messages')}
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
            onClick={() => handleTabChange('payments')}
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
            <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
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
                      className="inline-flex items-center gap-2 rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Pencil size={14} />
                      {isEditingProfile ? 'Yopish' : 'Tahrirlash'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPasswordEditorOpen((prev) => !prev)}
                      className="rounded-ui bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
              <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Parolni o&apos;zgartirish</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    type="password"
                    value={passwordFields.current}
                    onChange={(event) => setPasswordFields((prev) => ({ ...prev, current: event.target.value }))}
                    placeholder="Joriy parol"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="password"
                    value={passwordFields.next}
                    onChange={(event) => setPasswordFields((prev) => ({ ...prev, next: event.target.value }))}
                    placeholder="Yangi parol"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="password"
                    value={passwordFields.confirmation}
                    onChange={(event) => setPasswordFields((prev) => ({ ...prev, confirmation: event.target.value }))}
                    placeholder="Yangi parol tasdig&apos;i"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
                    className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                  >
                    {isUpdatingPassword ? 'Yangilanmoqda...' : 'Parolni saqlash'}
                  </button>
                </div>
              </div>
            ) : null}
            {isEditingProfile ? (
              <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Profil ma&apos;lumotlari</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={editableProfile.firstName}
                    onChange={(event) => onProfileFieldChange('firstName', event.target.value)}
                    placeholder="Ism"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    value={editableProfile.lastName}
                    onChange={(event) => onProfileFieldChange('lastName', event.target.value)}
                    placeholder="Familiya"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    value={editableProfile.phone}
                    placeholder="Telefon"
                    readOnly
                    disabled
                    className="rounded-ui border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  />
                  <input
                    value={editableProfile.region}
                    onChange={(event) => onProfileFieldChange('region', event.target.value)}
                    placeholder="Hudud"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    value={editableProfile.avatarUrl}
                    onChange={(event) => onProfileFieldChange('avatarUrl', event.target.value)}
                    placeholder="Avatar URL"
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                    className="rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                  />
                  <textarea
                    value={editableProfile.aboutMe}
                    onChange={(event) => onProfileFieldChange('aboutMe', event.target.value)}
                    placeholder="O'zim haqimda"
                    className="min-h-24 rounded-ui border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveProfile()
                    }}
                    disabled={isSavingProfile}
                    className="rounded-ui bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {isSavingProfile ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
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
          <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Xabarlar</h2>
              <span className="rounded-full bg-daladan-primary/10 px-3 py-1 text-xs font-semibold text-daladan-primary">
                3 yangi
              </span>
            </div>
            <ProfileComingSoonOverlay
              preview={
                <div className="space-y-3">
                  {[
                    { name: 'Jasur', text: "Olmalar hali bormi?", time: '10:21' },
                    { name: 'Aziza', text: "Narxni kelishsak bo'ladimi?", time: 'Kecha' },
                    { name: 'Dilshod', text: 'Yetkazib berish mavjudmi?', time: 'Dush' },
                  ].map((message) => (
                    <div key={message.name} className="rounded-ui border border-slate-200 p-3 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{message.name}</p>
                        <p className="text-xs text-slate-400">{message.time}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{message.text}</p>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">To&apos;lovlar</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                E&apos;lonlarni ko&apos;tarish va reklama to&apos;lovlari tarixi.
              </p>
            </div>
            <ProfileComingSoonOverlay
              preview={
                <div className="space-y-0 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-100 py-3 pl-3 pr-3 text-sm dark:border-slate-700">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Top Sotuv - Sarhil qizil olmalar</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(45000)} so&apos;m</p>
                    <span className="rounded-full bg-daladan-primary/10 px-2 py-1 text-xs font-semibold text-daladan-primary">
                      To&apos;langan
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 pl-3 pr-3 text-sm">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Boosted - Issiqxona pomidorlari</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(25000)} so&apos;m</p>
                    <span className="rounded-full bg-daladan-accent px-2 py-1 text-xs font-semibold text-daladan-accentDark">
                      Jarayonda
                    </span>
                  </div>
                </div>
              }
            />
          </div>
        )}
      </section>
    </div>
    </>
  )
}
