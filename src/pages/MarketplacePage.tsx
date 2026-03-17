import { ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ListingCard } from '../components/marketplace/ListingCard'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'

interface CategoryNode {
  label: string
  children?: CategoryNode[]
}

const categoryTree: CategoryNode[] = [
  {
    label: "Qishloq xo'jaligi",
    children: [
      { label: 'Mevalar' },
      { label: 'Sabzavotlar' },
      { label: 'Donli mahsulotlar' },
      { label: 'Asal va mahsulotlar' },
    ],
  },
  {
    label: 'Xizmatlar',
    children: [{ label: 'Texnika xizmati' }, { label: 'Transport xizmati' }],
  },
]

const gatherDescendants = (target: string, tree: CategoryNode[]): Set<string> => {
  const result = new Set<string>()

  const collectAll = (node: CategoryNode) => {
    result.add(node.label)
    node.children?.forEach(collectAll)
  }

  const walk = (nodes: CategoryNode[]): boolean => {
    for (const node of nodes) {
      if (node.label === target) {
        collectAll(node)
        return true
      }
      if (node.children && walk(node.children)) {
        return true
      }
    }
    return false
  }

  walk(tree)
  return result
}

export const MarketplacePage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categoryTree.map((category) => category.label)),
  )
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase()

  useEffect(() => {
    marketplaceService.getListings().then(setListings)
  }, [])

  const matchedCategories =
    selectedCategory === 'Barchasi' ? null : gatherDescendants(selectedCategory, categoryTree)

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

  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  const redirectToLogin = () => {
    navigate('/login', { state: { from: '/' } })
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
    setSelectedCategory(label)
    setCurrentPage(1)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <SlidersHorizontal size={16} />
            Filtrlar
          </p>
          <button
            type="button"
            onClick={() => selectCategory('Barchasi')}
            className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm ${
              selectedCategory === 'Barchasi' ? 'bg-daladan-primary/10 text-daladan-primary' : 'bg-slate-100'
            }`}
          >
            Barchasi
          </button>
          <div className="space-y-3">
            {categoryTree.map((category) => (
              <div key={category.label}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.label)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={`${category.label} ni ochish yopish`}
                  >
                    {expandedCategories.has(category.label) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCategory(category.label)}
                    className={`w-full rounded-lg px-2 py-2 text-left text-sm font-medium ${
                      selectedCategory === category.label
                        ? 'bg-daladan-primary/10 text-daladan-primary'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {category.label}
                  </button>
                </div>
                {category.children?.length && expandedCategories.has(category.label) ? (
                  <div className="mt-1 border-l border-slate-200 pl-3">
                    {category.children.map((sub) => (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => selectCategory(sub.label)}
                        className={`mt-1 block w-full rounded-lg px-2 py-1.5 text-left text-sm ${
                          selectedCategory === sub.label
                            ? 'bg-daladan-primary/10 font-medium text-daladan-primary'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-semibold text-slate-800">Narx (so&apos;m)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value.replace(/\D/g, ''))
                  setCurrentPage(1)
                }}
                placeholder="dan"
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none"
              />
              <input
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value.replace(/\D/g, ''))
                  setCurrentPage(1)
                }}
                placeholder="gacha"
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Asosiy</span>
            <ChevronRight size={14} />
            <span>{selectedCategory}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-semibold text-slate-900">Siz uchun saralangan mahsulotlar</h1>
            <p className="text-sm text-slate-500">Jami: {filtered.length} ta e&apos;lon topildi</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              canFavorite={Boolean(user)}
              onFavoriteBlocked={redirectToLogin}
            />
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Filter bo&apos;yicha e&apos;lon topilmadi.
          </div>
        ) : null}
        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 rounded-lg border text-sm font-semibold ${
                  page === safePage
                    ? 'border-daladan-primary bg-daladan-primary text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
