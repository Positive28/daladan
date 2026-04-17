import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { DEFAULT_CATEGORY_TILE_IMAGE, getCategoryTileImage } from '../constants/categoryTileImages'
import { ListingCard, ListingGridSkeletons } from '../features/marketplace'
import { fallbackCategoryTree, loadCategoryTree, type CategoryNode } from '../features/marketplace/model/categoryTree'
import { searchUrlForCategoryLabel } from '../features/marketplace/model/searchUrls'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'

const FEATURED_LIMIT = 8
const POPULAR_CATEGORY_LIMIT = 8

const categoryTileKey = (cat: CategoryNode) => (cat.id != null ? `id-${cat.id}` : `lbl-${cat.label}`)

function CategoryTileLink({ cat }: { cat: CategoryNode }) {
  const [imgSrc, setImgSrc] = useState(() => getCategoryTileImage(cat))

  return (
    <Link
      to={searchUrlForCategoryLabel(cat.label)}
      aria-label={cat.label}
      className="group overflow-hidden rounded-ui border border-daladan-border bg-daladan-surfaceElevated shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-daladan-soft dark:bg-slate-800">
        <img
          src={imgSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(DEFAULT_CATEGORY_TILE_IMAGE)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="border-t border-daladan-border bg-daladan-surface px-1.5 py-1.5 text-center text-xs font-medium leading-tight text-daladan-heading dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 sm:px-2 sm:py-2">
        {cat.label}
      </div>
    </Link>
  )
}

export const HomePage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
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
    let mounted = true
    setIsLoadingListings(true)
    marketplaceService
      .getPublicAds({ perPage: 100 })
      .then((data) => {
        if (mounted) setListings(data)
      })
      .finally(() => {
        if (mounted) setIsLoadingListings(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
      ; (async () => {
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
  const popularCategories = categoryTree.slice(0, POPULAR_CATEGORY_LIMIT)

  if (searchParams.get('q')?.trim()) {
    return <Navigate to={{ pathname: '/search', search: `?${searchParams.toString()}` }} replace />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-daladan-heading dark:text-slate-100 sm:text-2xl">Mashhur kategoriyalar</h2>
        {loadingTree ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-ui border border-daladan-border bg-daladan-surfaceElevated shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="aspect-[4/3] animate-pulse bg-daladan-border dark:bg-slate-800" />
                <div className="h-9 animate-pulse bg-daladan-soft dark:bg-slate-800/80" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {popularCategories.map((cat) => (
              <CategoryTileLink key={categoryTileKey(cat)} cat={cat} />
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
        {isLoadingListings ? (
          <ListingGridSkeletons count={FEATURED_LIMIT} />
        ) : featured.length === 0 ? (
          <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-6 py-10 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Hozircha e&apos;lonlar yo&apos;q. Qidiruv sahifasiga o&apos;ting.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((listing) => (
              <div key={listing.id} className="min-h-0">
                <ListingCard
                  listing={listing}
                  variant="grid"
                  canFavorite={Boolean(user)}
                  onFavoriteBlocked={redirectToLogin}
                  showPostedDate
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
