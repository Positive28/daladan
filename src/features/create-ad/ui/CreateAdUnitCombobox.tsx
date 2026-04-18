import type { RefObject } from 'react'
import { ChevronDown } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { getFieldBorderClass } from '../model/createAdFieldStyles'
type Props = {
  unitRegister: UseFormRegisterReturn<'unit'>
  unitValue: string
  unitSuggestions: string[]
  hasUnitError: boolean
  isUnitDropdownOpen: boolean
  setIsUnitDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  unitHighlightedIndex: number
  setUnitHighlightedIndex: (index: number | ((prev: number) => number)) => void
  unitFieldWrapperRef: RefObject<HTMLDivElement | null>
  unitInputRef: RefObject<HTMLInputElement | null>
  selectUnitSuggestion: (unit: string) => void
}

export function CreateAdUnitCombobox({
  unitRegister,
  unitValue,
  unitSuggestions,
  hasUnitError,
  isUnitDropdownOpen,
  setIsUnitDropdownOpen,
  unitHighlightedIndex,
  setUnitHighlightedIndex,
  unitFieldWrapperRef,
  unitInputRef,
  selectUnitSuggestion,
}: Props) {
  return (
    <div ref={unitFieldWrapperRef} className="relative">
      <input
        name={unitRegister.name}
        ref={(element) => {
          unitRegister.ref(element)
          unitInputRef.current = element
        }}
        value={unitValue}
        onChange={(event) => {
          unitRegister.onChange(event)
          setIsUnitDropdownOpen(true)
          setUnitHighlightedIndex(unitSuggestions.length > 0 ? 0 : -1)
        }}
        onFocus={() => {
          setIsUnitDropdownOpen(true)
          setUnitHighlightedIndex(unitSuggestions.length > 0 ? 0 : -1)
        }}
        onBlur={(event) => {
          unitRegister.onBlur(event)
          const nextFocused = event.relatedTarget
          if (!(nextFocused instanceof HTMLElement) || !unitFieldWrapperRef.current?.contains(nextFocused)) {
            setIsUnitDropdownOpen(false)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsUnitDropdownOpen(false)
            return
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setIsUnitDropdownOpen(true)
            setUnitHighlightedIndex((prev) => {
              if (unitSuggestions.length === 0) return -1
              if (prev < 0) return 0
              return Math.min(prev + 1, unitSuggestions.length - 1)
            })
            return
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setIsUnitDropdownOpen(true)
            setUnitHighlightedIndex((prev) => {
              if (unitSuggestions.length === 0) return -1
              if (prev < 0) return unitSuggestions.length - 1
              return Math.max(prev - 1, 0)
            })
            return
          }

          if (event.key === 'Enter' && isUnitDropdownOpen && unitHighlightedIndex >= 0) {
            event.preventDefault()
            const highlightedUnit = unitSuggestions[unitHighlightedIndex]
            if (highlightedUnit) {
              selectUnitSuggestion(highlightedUnit)
            }
          }
        }}
        aria-invalid={hasUnitError}
        placeholder="Birlik tanlang yoki kiriting"
        className={`w-full rounded-ui border px-3 py-2 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-daladan-primary/40 dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
          hasUnitError,
        )}`}
      />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setIsUnitDropdownOpen((prev) => !prev)
          unitInputRef.current?.focus()
        }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        aria-label="Birlik ro'yxatini ochish"
      >
        <ChevronDown size={16} className={`transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isUnitDropdownOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-ui border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {unitSuggestions.length > 0 ? (
            <ul className="max-h-56 overflow-y-auto py-1">
              {unitSuggestions.map((unit, index) => (
                <li key={unit}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectUnitSuggestion(unit)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      index === unitHighlightedIndex
                        ? 'bg-daladan-primary/10 text-daladan-primary'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {unit}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              Mos birlik topilmadi, o&apos;zingiz kiriting
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
