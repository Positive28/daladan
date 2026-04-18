import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminAdPromotionsListPath } from '../../ad-promotions'
import { AdminModal } from '../../../components/admin/AdminModal'
import { adminApiService } from '../../../services'
import type { AdminUserListItem, AdminUserNestedAd } from '../../../types/admin'
import { getAdminErrorMessage } from '../../../utils/adminApiError'
import {
  getPromoEndFromStartAndDays,
  getTomorrowLocalStart,
} from '../../../utils/adminPromoPeriod'
import { isPendingModerationStatus } from '../../../utils/adminModeration'
import {
  formatUzbekDateTime,
  formatUzbekDateTimeFromDate,
} from '../../../utils/uzbekDateFormat'
import { AdminAdEditSection } from './AdminAdEditSection'
import { derivePromoKindFromAd } from '../model/promoKindFromAd'
import { buildPromoKindOptionsFromPlans, selectPlansForPromoKind } from '../model/promotionPlanKinds'
import { usePromotionPlans } from '../model/usePromotionPlans'

const fmtBool = (v: boolean) => (v ? 'Ha' : 'Yo‘q')

const fmtPrice = (ad: AdminUserNestedAd) => {
  if (ad.price === null) return '—'
  const u = ad.unit?.trim()
  return u ? `${ad.price.toLocaleString('uz-UZ')} so'm / ${u}` : ad.price.toLocaleString('uz-UZ')
}

/** Strip common admin suffixes for shorter labels (e.g. "Buxoro viloyati" → "Buxoro"). */
const simplifyUzbekPlaceName = (raw: string) => {
  let s = raw.trim()
  s = s.replace(/\s+viloyati\s*$/i, '')
  s = s.replace(/\s+tumani\s*$/i, '')
  s = s.replace(/\s+shahri\s*$/i, '')
  return s.trim()
}

const fmtPlaceWithId = (name: string | undefined, id: number) => {
  const n = name?.trim()
  if (!n) return `id ${id}`
  const short = simplifyUzbekPlaceName(n)
  return short ? `${short} (id ${id})` : `id ${id}`
}

const isPlaceholderRefName = (name: string | undefined, refId: number) => {
  const t = name?.trim() ?? ''
  return !t || t === `ID ${refId}`
}

/** Prefer ad nested name; else seller profile viloyat/shahar when IDs match. */
const resolveLocationName = (
  ref: { name: string; id: number } | undefined,
  sellerMatches: boolean,
  sellerNameUz: string | null | undefined,
) => {
  if (ref && !isPlaceholderRefName(ref.name, ref.id)) return ref.name.trim()
  if (sellerMatches && sellerNameUz?.trim()) return sellerNameUz.trim()
  return undefined
}

const statusBadgeClass = (status: string) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
  if (s === 'pending') return 'bg-amber-500/15 text-amber-900 dark:text-amber-200'
  if (s === 'rejected') return 'bg-red-500/15 text-red-800 dark:text-red-300'
  return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
}

const cardClass =
  'rounded-ui border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-b border-slate-100 py-2 last:border-b-0 last:pb-0 dark:border-slate-800">
    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </dt>
    <dd className="mt-0.5 break-words text-sm leading-snug text-slate-900 dark:text-slate-100">
      {children ?? '—'}
    </dd>
  </div>
)

/** Compact label/value for grid layouts (no row dividers). */
const DetailGridCell = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </dt>
    <dd className="mt-0.5 break-words text-sm leading-snug text-slate-900 dark:text-slate-100">
      {children ?? '—'}
    </dd>
  </div>
)

export type AdminAdDetailContentProps = {
  ad: AdminUserNestedAd
  user: AdminUserListItem
  onModerationComplete?: () => void | Promise<void>
}

export const AdminAdDetailContent = ({ ad, user, onModerationComplete }: AdminAdDetailContentProps) => {
  const routeParams = useParams<{ userId?: string; adId?: string }>()
  const promotionsHref = getAdminAdPromotionsListPath(ad.id, routeParams.userId, routeParams.adId)

  const [moderationBusy, setModerationBusy] = useState<'approve' | 'reject' | null>(null)
  const [moderationError, setModerationError] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const { plans: promotionPlans, loading: promotionPlansLoading } = usePromotionPlans()
  const [promoKind, setPromoKind] = useState<'none' | 'top' | 'boost'>(() => derivePromoKindFromAd(ad))
  const [promoPlanId, setPromoPlanId] = useState('1w')
  const [sellerAvatarBroken, setSellerAvatarBroken] = useState(false)

  const pending = isPendingModerationStatus(ad.status)

  const sellerName =
    [user.fname, user.lname].filter(Boolean).join(' ') || user.phone || `Sotuvchi (ID ${user.id})`
  const sellerInitials = (() => {
    const f = user.fname?.trim()?.[0]
    const l = user.lname?.trim()?.[0]
    if (f && l) return `${f}${l}`.toUpperCase()
    if (f) return f.toUpperCase()
    const digits = user.phone?.replace(/\D/g, '') ?? ''
    if (digits.length >= 2) return digits.slice(-2)
    return '?'
  })()

  useEffect(() => {
    setSellerAvatarBroken(false)
  }, [user.id, user.avatar_url])

  const promoKindOptions = useMemo(
    () => buildPromoKindOptionsFromPlans(promotionPlans),
    [promotionPlans],
  )

  const plansForDuration = useMemo(
    () => selectPlansForPromoKind(promotionPlans, promoKind),
    [promotionPlans, promoKind],
  )

  useEffect(() => {
    const derived = derivePromoKindFromAd(ad)
    const allowed = new Set(promoKindOptions.map((o) => o.id))
    if (allowed.has(derived)) {
      setPromoKind(derived)
      return
    }
    setPromoKind(promoKindOptions.find((o) => o.id !== 'none')?.id ?? 'none')
  }, [ad.id, ad.is_boosted, ad.is_top_sale, promoKindOptions])

  useEffect(() => {
    const allowed = new Set(promoKindOptions.map((o) => o.id))
    if (!allowed.has(promoKind)) {
      setPromoKind(promoKindOptions.find((o) => o.id !== 'none')?.id ?? 'none')
    }
  }, [promoKindOptions, promoKind])

  useEffect(() => {
    if (plansForDuration.length === 0) return
    setPromoPlanId((prev) =>
      plansForDuration.some((p) => p.id === prev) ? prev : plansForDuration[0].id,
    )
  }, [plansForDuration])

  const selectedPromotionPlan = useMemo(() => {
    if (plansForDuration.length === 0) return undefined
    return plansForDuration.find((p) => p.id === promoPlanId) ?? plansForDuration[0]
  }, [plansForDuration, promoPlanId])

  const estimatedNewPromoEnd = useMemo(() => {
    const start = getTomorrowLocalStart()
    if (!selectedPromotionPlan) return getPromoEndFromStartAndDays(start, 7)
    return getPromoEndFromStartAndDays(start, selectedPromotionPlan.durationDays)
  }, [selectedPromotionPlan])

  const runAfterModeration = useCallback(async () => {
    await onModerationComplete?.()
  }, [onModerationComplete])

  const handleApprove = useCallback(async () => {
    setModerationError('')
    setModerationBusy('approve')
    try {
      await adminApiService.approveAd(ad.id)
      await runAfterModeration()
    } catch (e) {
      setModerationError(getAdminErrorMessage(e, 'Tasdiqlashda xatolik'))
    } finally {
      setModerationBusy(null)
    }
  }, [ad.id, runAfterModeration])

  const handleRejectSubmit = useCallback(async () => {
    const reason = rejectReason.trim()
    if (!reason) {
      setModerationError('Rad etish sababini kiriting.')
      return
    }
    setModerationError('')
    setModerationBusy('reject')
    try {
      await adminApiService.rejectAd(ad.id, { reason })
      setRejectOpen(false)
      setRejectReason('')
      await runAfterModeration()
    } catch (e) {
      setModerationError(getAdminErrorMessage(e, 'Rad etishda xatolik'))
    } finally {
      setModerationBusy(null)
    }
  }, [ad.id, rejectReason, runAfterModeration])

  const slides = ad.media_list.length > 0 ? ad.media_list : []
  const cover = slides[0]

  return (
    <div className="space-y-6">
      {moderationError ? (
        <div className="rounded-ui border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {moderationError}
        </div>
      ) : null}

      {pending ? (
        <div className="flex flex-col gap-3 rounded-ui border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/25">
          <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
            Bu e‘lon moderatsiyada. Tasdiqlang yoki rad eting.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={moderationBusy !== null}
              onClick={() => void handleApprove()}
              className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {moderationBusy === 'approve' ? 'Jo‘natilmoqda...' : 'Tasdiqlash'}
            </button>
            <button
              type="button"
              disabled={moderationBusy !== null}
              onClick={() => {
                setModerationError('')
                setRejectOpen(true)
              }}
              className="rounded-ui border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Rad etish
            </button>
            <Link
              to="/moderation"
              className="inline-flex items-center rounded-ui px-4 py-2 text-sm font-medium text-daladan-primary hover:underline"
            >
              Moderatsiya ro‘yxati
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-ui border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
          <span className="font-medium">Holat:</span>{' '}
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(ad.status)}`}>
            {ad.status || '—'}
          </span>
          {ad.status?.toLowerCase() === 'active' ? (
            <span className="ml-2 text-slate-600 dark:text-slate-400">E‘lon tasdiqlangan va ko‘rinadi.</span>
          ) : null}
        </div>
      )}

      {rejectOpen ? (
        <AdminModal
          title="E‘lonni rad etish"
          onClose={() => {
            if (moderationBusy) return
            setRejectOpen(false)
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={moderationBusy !== null}
                onClick={() => setRejectOpen(false)}
                className="rounded-ui border border-slate-200 px-4 py-2 text-sm dark:border-slate-600"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={moderationBusy !== null}
                onClick={() => void handleRejectSubmit()}
                className="rounded-ui bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {moderationBusy === 'reject' ? 'Jo‘natilmoqda...' : 'Rad etish'}
              </button>
            </div>
          }
        >
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sabab (majburiy)
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-ui border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              placeholder="Nima uchun rad etilmoqda?"
            />
          </label>
        </AdminModal>
      ) : null}

      <AdminAdEditSection ad={ad} onSaved={runAfterModeration} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3">
          {cover?.url ? (
            <a
              href={cover.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-ui border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <img src={cover.url} alt="" className="max-h-[min(420px,70vh)] w-full object-contain" />
            </a>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-ui border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              Rasm yo‘q
            </div>
          )}
          {slides.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {slides.map((m) =>
                m.url ? (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </a>
                ) : null,
              )}
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{ad.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            E‘lon ID <span className="font-mono text-slate-800 dark:text-slate-200">{ad.id}</span>
            {' · '}
            Ko‘rishlar: <span className="font-medium">{ad.views_count}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sotuvchi:{' '}
            <Link to={`/users/${user.id}`} className="font-medium text-daladan-primary hover:underline">
              {[user.fname, user.lname].filter(Boolean).join(' ') || user.phone}
            </Link>
            <span className="text-slate-500"> (ID {user.id})</span>
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Yaratilgan: {formatUzbekDateTime(ad.created_at)} · Yangilangan:{' '}
            {formatUzbekDateTime(ad.updated_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-10">
        <section className={`${cardClass} col-span-1 md:col-span-4`}>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Asosiy</h2>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Sotuvchi
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Link
                  to={`/users/${user.id}`}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600"
                >
                  {user.avatar_url && !sellerAvatarBroken ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setSellerAvatarBroken(true)}
                    />
                  ) : (
                    sellerInitials
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/users/${user.id}`}
                    className="block truncate text-sm font-medium text-daladan-primary hover:underline"
                  >
                    {sellerName}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ID {user.id}</p>
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
              <DetailGridCell label="Holat">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(ad.status)}`}
                >
                  {ad.status || '—'}
                </span>
              </DetailGridCell>
              <DetailGridCell label="Ko‘rishlar soni">{ad.views_count}</DetailGridCell>
              <DetailGridCell label="Top sotuv">{fmtBool(ad.is_top_sale)}</DetailGridCell>
              <DetailGridCell label="Boosted">{fmtBool(ad.is_boosted)}</DetailGridCell>
              <DetailGridCell label="Boost tugashi">
                {ad.boost_expires_at ? formatUzbekDateTime(ad.boost_expires_at) : '—'}
              </DetailGridCell>
              <DetailGridCell label="Reklama">
                <Link
                  to={promotionsHref}
                  className="font-medium text-daladan-primary hover:underline"
                >
                  Tarixni ko‘rish
                </Link>
              </DetailGridCell>
              <DetailGridCell label="E‘lon muddati tugashi">
                {ad.expires_at ? formatUzbekDateTime(ad.expires_at) : '—'}
              </DetailGridCell>
            </dl>
          </div>
        </section>

        <section className={`${cardClass} col-span-1 md:col-span-2`}>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Narx va miqdor</h2>
          <dl className="mt-3 space-y-0">
            <DetailRow label="Narx">{fmtPrice(ad)}</DetailRow>
            <DetailRow label="Miqdor">{ad.quantity ?? '—'}</DetailRow>
            <DetailRow label="O‘lchov birligi">{ad.unit ?? '—'}</DetailRow>
          </dl>
        </section>

        <section className={`${cardClass} col-span-1 md:col-span-2`}>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Joylashuv</h2>
          <dl className="mt-3 space-y-0">
            <DetailRow label="Viloyat">
              {fmtPlaceWithId(
                resolveLocationName(
                  ad.region,
                  user.region_id != null && user.region_id === ad.region_id,
                  user.region?.name_uz,
                ),
                ad.region_id,
              )}
            </DetailRow>
            <DetailRow label="Shahar">
              {fmtPlaceWithId(
                resolveLocationName(
                  ad.city,
                  user.city_id != null && user.city_id === ad.city_id,
                  user.city?.name_uz,
                ),
                ad.city_id,
              )}
            </DetailRow>
          </dl>
        </section>

        <section className={`${cardClass} col-span-1 md:col-span-2`}>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Kategoriya</h2>
          <dl className="mt-3 space-y-0">
            <DetailRow label="Kategoriya">{fmtPlaceWithId(ad.category?.name, ad.category_id)}</DetailRow>
            <DetailRow label="Subkategoriya">{fmtPlaceWithId(ad.subcategory?.name, ad.subcategory_id)}</DetailRow>
          </dl>
        </section>

        <section className={`${cardClass} col-span-1 md:col-span-10`}>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tavsif</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {ad.description || '—'}
          </p>
        </section>

        <section className="col-span-1 rounded-ui border border-slate-200 bg-slate-100/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 md:col-span-10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Reklama (admin)</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Muddatlar serverdagi tariflar katalogidan yuklanadi. E‘londagi joriy holat yuqoridagi “Top sotuv”
            va “Boosted” qatoridan keladi. O‘zgarishlarni saqlash keyinroq qo‘shiladi.
          </p>
          {promotionPlansLoading ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tariflar yuklanmoqda…</p>
          ) : null}
          <div className="mt-3 space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Promo turi</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Tur va muddatlar serverdagi tariflar ro‘yxatidan: har bir qatorda tur (masalan, top sotuv yoki
              boost) va muddat ko‘rsatiladi.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {promoKindOptions.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPromoKind(id)}
                  className={`rounded-ui border px-3 py-2 text-sm font-medium ${
                    promoKind === id
                      ? 'border-daladan-primary bg-daladan-primary/10 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Muddat (ertadan boshlab)</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Yangi reklama ertaga (mahalliy vaqt bo‘yicha) boshlanadi; tugash tanlangan tarif qatorining
                davomiyligiga qarab hisoblanadi.
              </p>
              {promoKind === 'none' ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Muddatni ko‘rish uchun promo turini tanlang.
                </p>
              ) : plansForDuration.length === 0 ? (
                <p className="mt-2 text-sm text-amber-800 dark:text-amber-200/90">
                  Bu tur uchun katalogda tarif topilmadi. Backend javobida tur maydoni (kind / type) va muddat
                  mos kelishini tekshiring.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {plansForDuration.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPromoPlanId(opt.id)}
                      className={`rounded-ui border px-3 py-2 text-sm font-medium ${
                        promoPlanId === opt.id
                          ? 'border-daladan-primary bg-daladan-primary/10 text-slate-900 dark:text-slate-100'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt.label}
                      {opt.price != null
                        ? ` · ${opt.price.toLocaleString('uz-UZ')} so'm`
                        : ''}
                    </button>
                  ))}
                </div>
              )}
              {promoKind === 'boost' && ad.boost_expires_at ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Joriy boost tugashi:</span>{' '}
                  {formatUzbekDateTime(ad.boost_expires_at)}
                </p>
              ) : null}
              {promoKind !== 'none' && plansForDuration.length > 0 ? (
                <>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200">Boshlanish (yangi reklama):</span>{' '}
                    {formatUzbekDateTimeFromDate(getTomorrowLocalStart())}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200">Tugash (taxminiy):</span>{' '}
                    {formatUzbekDateTimeFromDate(estimatedNewPromoEnd)}
                  </p>
                </>
              ) : null}
            </div>
            <button
              type="button"
              disabled
              className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white opacity-50"
            >
              Saqlash (admin yozuvi keyinroq)
            </button>
          </div>
        </section>
      </div>

      <details className={cardClass}>
        <summary className="cursor-pointer text-base font-semibold text-slate-900 dark:text-slate-100">
          Texnik ma’lumot (media JSON)
        </summary>
        <pre className="mt-3 max-h-[320px] overflow-auto rounded-ui bg-slate-950 p-4 text-xs text-slate-100">
          {JSON.stringify(ad.media, null, 2)}
        </pre>
      </details>
    </div>
  )
}
