import { ChevronDown, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ListingCard, ListingListSkeletons } from '../features/marketplace'
import {
  collectLabelsInTree,
  fallbackCategoryTree,
  gatherDescendants,
  loadCategoryTree,
  type CategoryNode,
} from '../features/marketplace/model/categoryTree'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'
import { LOGIN_PATH, loginReturnState } from '../utils/appPaths'

const CATEGORY_SKELETON_ROWS = 6
const SEARCH_LIST_PAGE_SIZE = 6

type SearchFiltersCardProps = {
  isLoadingCategoryTree: boolean
  selectedCategory: string
  categoryTree: CategoryNode[]
  expandedCategories: Set<string>
  minPrice: string
  maxPrice: string
  selectCategory: (label: string) => void
  toggleCategory: (label: string) => void
  setMinPrice: (value: string) => void
  setMaxPrice: (value: string) => void
  setCurrentPage: (page: number) => void
  /** Hide the card heading (e.g. mobile sheet already has a title row). */
  showTitle?: boolean
}

function SearchFiltersCard({
  isLoadingCategoryTree,
  selectedCategory,
  categoryTree,
  expandedCategories,
  minPrice,
  maxPrice,
  selectCategory,
  toggleCategory,
  setMinPrice,
  setMaxPrice,
  setCurrentPage,
  showTitle = true,
}: SearchFiltersCardProps) {
  return (
    <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {showTitle ? (
        <p className="mb-4 flex items-center gap-2 text-base font-semibold text-daladan-heading dark:text-slate-100">
          <SlidersHorizontal size={16} aria-hidden />
          Filtrlar
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => selectCategory('Barchasi')}
        disabled={isLoadingCategoryTree}
        className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm ${
          selectedCategory === 'Barchasi'
            ? 'bg-daladan-primary/10 text-daladan-primary'
            : 'bg-daladan-soft dark:bg-slate-800 dark:text-slate-300'
        }`}
      >
        Barchasi
      </button>
      <div className="space-y-3">
        {isLoadingCategoryTree ? (
          <div className="space-y-3" aria-label="Kategoriyalar yuklanmoqda">
            {Array.from({ length: CATEGORY_SKELETON_ROWS }, (_, index) => (
              <div key={index} className="flex items-center gap-2 animate-pulse">
                <div className="h-7 w-7 rounded bg-daladan-border dark:bg-slate-700" />
                <div className="h-9 flex-1 rounded-lg bg-daladan-border dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : (
          categoryTree.map((category) => {
            const rowExpanded = expandedCategories.has(category.label)
            return (
              <div key={category.label}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.label)}
                    disabled={isLoadingCategoryTree}
                    className="rounded p-1 text-daladan-muted hover:bg-daladan-soft dark:text-slate-400 dark:hover:bg-slate-800"
                    aria-label={`${category.label} ni ochish yopish`}
                  >
                    {rowExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCategory(category.label)}
                    disabled={isLoadingCategoryTree}
                    className={`w-full rounded-lg px-2 py-2 text-left text-sm font-medium ${
                      selectedCategory === category.label
                        ? 'bg-daladan-primary/10 text-daladan-primary'
                        : 'text-daladan-heading hover:bg-daladan-soft dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {category.label}
                  </button>
                </div>
                {category.children?.length && rowExpanded ? (
                  <div className="mt-1 pl-3">
                    {category.children.map((sub) => (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => selectCategory(sub.label)}
                        disabled={isLoadingCategoryTree}
                        className={`mt-1 block w-full rounded-lg px-2 py-1.5 text-left text-sm ${
                          selectedCategory === sub.label
                            ? 'bg-daladan-primary/10 font-medium text-daladan-primary'
                            : 'text-daladan-muted hover:bg-daladan-soft dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
      <div className="mt-5 border-t border-daladan-border pt-4 dark:border-slate-700">
        <p className="mb-2 text-sm font-semibold text-daladan-heading dark:text-slate-200">Narx (so&apos;m)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value.replace(/\D/g, ''))
              setCurrentPage(1)
            }}
            placeholder="dan"
            className="rounded-lg border border-daladan-border bg-daladan-surfaceElevated px-2 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value.replace(/\D/g, ''))
              setCurrentPage(1)
            }}
            placeholder="gacha"
            className="rounded-lg border border-daladan-border bg-daladan-surfaceElevated px-2 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  )
}

export const SearchPage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi')
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>(fallbackCategoryTree)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoadingCategoryTree, setIsLoadingCategoryTree] = useState(true)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase()
  const catParam = searchParams.get('cat')

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
    let isMounted = true

    const fetchTree = async () => {
      setIsLoadingCategoryTree(true)
      try {
        const tree = await loadCategoryTree()
        if (!isMounted) return
        setCategoryTree(tree.length > 0 ? tree : fallbackCategoryTree)
        setExpandedCategories(new Set())
      } catch {
        if (!isMounted) return
        setCategoryTree(fallbackCategoryTree)
        setExpandedCategories(new Set())
      } finally {
        if (isMounted) setIsLoadingCategoryTree(false)
      }
    }

    void fetchTree()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (selectedCategory === 'Barchasi') return
    const matches = gatherDescendants(selectedCategory, categoryTree)
    if (matches.size === 0) {
      setSelectedCategory('Barchasi')
    }
  }, [categoryTree, selectedCategory])

  useEffect(() => {
    if (selectedCategory === 'Barchasi') {
      setExpandedCategories(new Set())
    }
  }, [selectedCategory])

  useEffect(() => {
    if (isLoadingCategoryTree) return
    const raw = catParam?.trim()
    if (!raw) return
    try {
      const decoded = decodeURIComponent(raw)
      const labels = collectLabelsInTree(categoryTree)
      if (labels.has(decoded)) {
        setSelectedCategory(decoded)
        setCurrentPage(1)
      }
    } catch {
      /* ignore malformed cat param */
    }
  }, [catParam, categoryTree, isLoadingCategoryTree])

  const matchedCategories =
    selectedCategory === 'Barchasi'
      ? null
      : (() => {
        const matches = gatherDescendants(selectedCategory, categoryTree)
        return matches.size > 0 ? matches : null
      })()

  const filtered = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null
    const max = maxPrice ? Number(maxPrice) : null

    return listings.filter((listing) => {
      const source = listing.categoryPath?.length ? listing.categoryPath : [listing.category]
      const categoryPass = matchedCategories ? source.some((part) => matchedCategories.has(part)) : true
      const minPass = min === null || Number.isNaN(min) ? true : listing.price >= min
      const maxPass = max === null || Number.isNaN(max) ? true : listing.price <= max
      const searchPass =
        !searchQuery ||
        [
          listing.title,
          listing.description,
          listing.location,
          listing.category,
          ...(listing.categoryPath ?? []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery)
      return categoryPass && minPass && maxPass && searchPass
    })
  }, [listings, matchedCategories, minPrice, maxPrice, searchQuery])

  const pageSize = SEARCH_LIST_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  const redirectToLogin = () => {
    const returnState = loginReturnState(location)
    navigate(LOGIN_PATH, {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: location,
      },
    })
  }

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const selectCategory = (label: string) => {
    setSelectedCategory((prev) => {
      if (label !== 'Barchasi' && prev === label) {
        return 'Barchasi'
      }
      return label
    })
    setCurrentPage(1)
  }

  useEffect(() => {
    if (!mobileFiltersOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileFiltersOpen])

  const filtersCardProps: SearchFiltersCardProps = {
    isLoadingCategoryTree,
    selectedCategory,
    categoryTree,
    expandedCategories,
    minPrice,
    maxPrice,
    selectCategory,
    toggleCategory,
    setMinPrice,
    setMaxPrice,
    setCurrentPage,
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full flex-col gap-6 xl:max-w-[calc(42rem+280px+2rem)] xl:flex-row xl:items-start xl:gap-8">
        {mobileFiltersOpen ? (
          <div
            className="fixed inset-0 z-[45] flex xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-mobile-filters-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/55 dark:bg-black/60"
              aria-label="Filtrlarni yopish"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-daladan-border bg-daladan-soft shadow-2xl dark:border-slate-700 dark:bg-slate-950">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-daladan-border px-4 py-3 dark:border-slate-700">
                <p
                  id="search-mobile-filters-title"
                  className="flex items-center gap-2 text-base font-semibold text-daladan-heading dark:text-slate-100"
                >
                  <SlidersHorizontal size={18} aria-hidden />
                  Filtrlar
                </p>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-daladan-muted hover:bg-daladan-border/40 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Yopish"
                >
                  <X size={22} aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <SearchFiltersCard {...filtersCardProps} showTitle={false} />
              </div>
            </div>
          </div>
        ) : null}

        <aside className="hidden shrink-0 space-y-4 xl:block xl:w-[280px]">
          <SearchFiltersCard {...filtersCardProps} />
        </aside>

        <div className="relative mx-auto w-full min-w-0 max-w-[42rem]">
          <section className="relative min-w-0 space-y-4">
          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-4 py-3 text-sm font-semibold text-daladan-heading shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <SlidersHorizontal size={18} aria-hidden />
              Filtrlar
              {selectedCategory !== 'Barchasi' ? (
                <span className="max-w-[10rem] truncate rounded-full bg-daladan-primary/15 px-2 py-0.5 text-xs font-medium text-daladan-primary">
                  {selectedCategory}
                </span>
              ) : null}
            </button>
          </div>
          <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-sm text-daladan-muted dark:text-slate-400">
              <span>Asosiy</span>
              <ChevronRight size={14} />
              <span>{selectedCategory}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold text-daladan-heading dark:text-slate-100 sm:text-3xl lg:text-4xl">
                Siz uchun saralangan mahsulotlar
              </h1>
              <p className="text-sm text-daladan-muted dark:text-slate-400">
                {isLoadingListings ? (
                  <span className="inline-block h-4 w-40 animate-pulse rounded bg-daladan-border dark:bg-slate-700" aria-hidden />
                ) : (
                  <>Jami: {filtered.length} ta e&apos;lon topildi</>
                )}
              </p>
            </div>
          </div>
          {isLoadingListings ? (
            <ListingListSkeletons count={SEARCH_LIST_PAGE_SIZE} />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {pageItems.map((listing) => (
                  <div key={listing.id} className="min-h-0">
                    <ListingCard
                      listing={listing}
                      variant="list"
                      canFavorite={Boolean(user)}
                      onFavoriteBlocked={redirectToLogin}
                    />
                  </div>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated p-8 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  Filter bo&apos;yicha e&apos;lon topilmadi.
                </div>
              ) : null}
            </>
          )}
          {!isLoadingListings && totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="h-9 w-9 rounded-lg border border-daladan-border bg-daladan-surfaceElevated text-sm font-semibold text-daladan-heading disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg border text-sm font-semibold ${page === safePage
                      ? 'border-daladan-primary bg-daladan-primary text-white'
                      : 'border-daladan-border bg-daladan-surfaceElevated text-daladan-heading dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="h-9 w-9 rounded-lg border border-daladan-border bg-daladan-surfaceElevated text-sm font-semibold text-daladan-heading disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                ›
              </button>
            </div>
          ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
