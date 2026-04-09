import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AdminUserListItem, AdminUserNestedAd } from '../../../types/admin'

const fmtBool = (v: boolean) => (v ? 'Ha' : 'Yo‘q')

const fmtPrice = (ad: AdminUserNestedAd) => {
  if (ad.price === null) return '—'
  const u = ad.unit?.trim()
  return u ? `${ad.price.toLocaleString('uz-UZ')} so'm / ${u}` : ad.price.toLocaleString('uz-UZ')
}

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[minmax(0,240px)_1fr] dark:border-slate-800">
    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="break-words text-sm text-slate-900 dark:text-slate-100">{children ?? '—'}</dd>
  </div>
)

export type AdminAdDetailContentProps = {
  ad: AdminUserNestedAd
  user: AdminUserListItem
}

export const AdminAdDetailContent = ({ ad, user }: AdminAdDetailContentProps) => (
  <div className="space-y-8">
    <header>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{ad.title}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        E‘lon ID {ad.id} · Sotuvchi:{' '}
        <Link to={`/users/${user.id}`} className="font-medium text-daladan-primary hover:underline">
          {[user.fname, user.lname].filter(Boolean).join(' ') || user.phone}
        </Link>
      </p>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Asosiy</h2>
      <dl className="mt-2">
        <DetailRow label="ID">{ad.id}</DetailRow>
        <DetailRow label="seller_id">{ad.seller_id}</DetailRow>
        <DetailRow label="status">{ad.status || '—'}</DetailRow>
        <DetailRow label="views_count">{ad.views_count}</DetailRow>
        <DetailRow label="is_top_sale">{fmtBool(ad.is_top_sale)}</DetailRow>
        <DetailRow label="is_boosted">{fmtBool(ad.is_boosted)}</DetailRow>
        <DetailRow label="boost_expires_at">{ad.boost_expires_at ?? '—'}</DetailRow>
        <DetailRow label="expires_at">{ad.expires_at ?? '—'}</DetailRow>
        <DetailRow label="created_at">{ad.created_at}</DetailRow>
        <DetailRow label="updated_at">{ad.updated_at}</DetailRow>
      </dl>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Narx va miqdor</h2>
      <dl className="mt-2">
        <DetailRow label="price">{fmtPrice(ad)}</DetailRow>
        <DetailRow label="quantity">{ad.quantity ?? '—'}</DetailRow>
        <DetailRow label="unit">{ad.unit ?? '—'}</DetailRow>
      </dl>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Joylashuv</h2>
      <dl className="mt-2">
        <DetailRow label="region_id">{ad.region_id}</DetailRow>
        <DetailRow label="city_id">{ad.city_id}</DetailRow>
        <DetailRow label="district">{ad.district || '—'}</DetailRow>
      </dl>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Kategoriya</h2>
      <dl className="mt-2">
        <DetailRow label="category_id">{ad.category_id}</DetailRow>
        <DetailRow label="category">
          {ad.category ? `${ad.category.name} (id ${ad.category.id})` : '—'}
        </DetailRow>
        <DetailRow label="subcategory_id">{ad.subcategory_id}</DetailRow>
        <DetailRow label="subcategory">
          {ad.subcategory ? `${ad.subcategory.name} (id ${ad.subcategory.id})` : '—'}
        </DetailRow>
      </dl>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tavsif</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{ad.description || '—'}</p>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">media_list</h2>
      {ad.media_list.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Bo‘sh</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ad.media_list.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              {m.url ? (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={m.url} alt="" className="h-48 w-full object-cover" />
                </a>
              ) : (
                <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-800">
                  URL yo‘q
                </div>
              )}
              <div className="p-2 text-xs text-slate-600 dark:text-slate-400">
                id {m.id}
                {m.type ? ` · ${m.type}` : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">media (to‘liq JSON)</h2>
      <pre className="mt-3 max-h-[480px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(ad.media, null, 2)}
      </pre>
    </section>
  </div>
)
