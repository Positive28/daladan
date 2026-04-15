import { LayoutGrid, List } from 'lucide-react'

import type { ListingCardVariant } from '../model/types'

interface ListingViewToggleProps {
  value: ListingCardVariant
  onChange: (next: ListingCardVariant) => void
}

export const ListingViewToggle = ({ value, onChange }: ListingViewToggleProps) => (
  <div
    className="inline-flex rounded-ui border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800"
    role="group"
    aria-label="Ko'rinish"
  >
    <button
      type="button"
      onClick={() => onChange('grid')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        value === 'grid'
          ? 'bg-white text-daladan-primary shadow-sm dark:bg-slate-900 dark:text-daladan-primary'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
      aria-pressed={value === 'grid'}
      aria-label="Tarmoq ko'rinishi"
    >
      <LayoutGrid size={18} />
    </button>
    <button
      type="button"
      onClick={() => onChange('list')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        value === 'list'
          ? 'bg-white text-daladan-primary shadow-sm dark:bg-slate-900 dark:text-daladan-primary'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
      aria-pressed={value === 'list'}
      aria-label="Ro'yxat ko'rinishi"
    >
      <List size={18} />
    </button>
  </div>
)
