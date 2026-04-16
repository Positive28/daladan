import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ListingCard } from '../features/marketplace'
import { fallbackCategoryTree, loadCategoryTree, type CategoryNode } from '../features/marketplace/model/categoryTree'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'

const FEATURED_LIMIT = 8

const TILE_GRADIENTS = [
  'from-daladan-primary/85 to-emerald-800/75',
  'from-slate-600/90 to-daladan-primary/70',
  'from-green-800/80 to-lime-700/75',
  'from-teal-800/85 to-daladan-primary/65',
  'from-emerald-900/80 to-green-700/70',
  'from-neutral-700/85 to-daladan-primary/75',
  'from-lime-900/75 to-daladan-primary/80',
  'from-stone-700/85 to-emerald-900/75',
]

export const HomePage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>(fallbackCategoryTree)
  const [loadingTree, setLoadingTree] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const redirectToLogin = () => {
    navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
  }

  useEffect(() => {
    marketplaceService.getPublicAds({ perPage: 100 }).then(setListings)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingTree(true)
      try {
        const tree = await loadCategoryTree()
        if (mounted) setCategoryTree(tree.length > 0 ? tree : fallbackCategoryTree)
      } catch {
        if (mounted) setCategoryTree(fallbackCategoryTree)
      } finally {
        if (mounted) setLoadingTree(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const featured = listings.slice(0, FEATURED_LIMIT)

  if (searchParams.get('q')?.trim()) {
    return <Navigate to={{ pathname: '/search', search: `?${searchParams.toString()}` }} replace />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-daladan-heading dark:text-slate-100 sm:text-2xl">Mashhur kategoriyalar</h2>
        {loadingTree ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-ui border border-daladan-border bg-daladan-surfaceElevated shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="aspect-square animate-pulse bg-daladan-border dark:bg-slate-800" />
                <div className="h-11 animate-pulse bg-daladan-soft dark:bg-slate-800/80" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryTree.map((cat, index) => (
              <Link
                key={cat.label}
                to={`/search?cat=${encodeURIComponent(cat.label)}`}
                className="group overflow-hidden rounded-ui border border-daladan-border bg-daladan-surfaceElevated shadow-sm transition hover:border-daladan-primary/35 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-daladan-primary/40"
              >
                <div
                  className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${TILE_GRADIENTS[index % TILE_GRADIENTS.length]}`}
                >
                  <span className="text-4xl font-bold text-white/95 drop-shadow-sm transition group-hover:scale-105 sm:text-5xl">
                    {cat.label.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="border-t border-daladan-border bg-daladan-surface px-2 py-2.5 text-center text-sm font-medium text-daladan-heading dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100">
                  {cat.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-daladan-heading dark:text-slate-100 sm:text-2xl">Yaxshi topilanmalar</h2>
          <Link
            to="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-daladan-primary hover:underline dark:text-emerald-400"
          >
            Barchasini ko&apos;rish
            <ChevronRight size={16} />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-6 py-10 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Hozircha e&apos;lonlar yo&apos;q. Qidiruv sahifasiga o&apos;ting.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((listing) => (
              <div key={listing.id} className="min-h-0">
                <ListingCard
                  listing={listing}
                  variant="grid"
                  canFavorite={Boolean(user)}
                  onFavoriteBlocked={redirectToLogin}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
