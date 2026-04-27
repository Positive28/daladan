import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { CategoryOption } from '../../../types/marketplace'

const CATEGORY_COLORS: string[] = [
  'bg-orange-50 text-orange-600',
  'bg-blue-50 text-blue-600',
  'bg-green-50 text-green-600',
  'bg-purple-50 text-purple-600',
  'bg-pink-50 text-pink-600',
  'bg-yellow-50 text-yellow-600',
  'bg-teal-50 text-teal-600',
  'bg-red-50 text-red-600',
  'bg-indigo-50 text-indigo-600',
]

const CATEGORY_EMOJIS: Record<string, string> = {
  meva: '🍎',
  sabzavot: '🥦',
  hayvon: '🐄',
  parranda: '🐔',
  don: '🌾',
  bug: '🌾',
  go: '🐑',
  qo: '🐑',
  baliq: '🐟',
  o: '🌿',
  chorva: '🐄',
  dehqon: '🌱',
  uy: '🏠',
  texnika: '⚙️',
  transport: '🚛',
  elektronika: '📱',
  kiyim: '👔',
  oziq: '🥗',
  qishloq: '🌾',
  bog: '🌳',
}

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return '🌿'
}

function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? CATEGORY_COLORS[0]!
}

interface CategoryPickerModalProps {
  open: boolean
  categories: CategoryOption[]
  selectedId: string
  onSelect: (category: CategoryOption) => void
  onClose: () => void
}

export function CategoryPickerModal({ open, categories, selectedId, onSelect, onClose }: CategoryPickerModalProps) {
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const filtered = search.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Kategoriya tanlang</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-daladan-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Topilmadi</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map((category, index) => {
                const colorClass = getCategoryColor(index)
                const emoji = getCategoryEmoji(category.name)
                const isSelected = String(category.id) === selectedId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      onSelect(category)
                      onClose()
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-all hover:shadow-sm ${
                      isSelected
                        ? 'border-daladan-primary bg-daladan-primary/10 text-daladan-primary'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl ${colorClass}`}>
                      {emoji}
                    </span>
                    <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">{category.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
