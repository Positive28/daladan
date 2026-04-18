import type { RefObject } from 'react'
import type { FieldErrors, UseFormRegister, UseFormRegisterReturn } from 'react-hook-form'
import { formatPriceInput, parsePriceInput } from '../../../utils/price'
import { ERROR_TEXT_CLASS, getFieldBorderClass } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { CreateAdUnitCombobox } from './CreateAdUnitCombobox'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  priceValue: string
  hasPriceValue: boolean
  unitValue: string
  deliveryAvailable: boolean
  unitRegister: UseFormRegisterReturn<'unit'>
  unitSuggestions: string[]
  isUnitDropdownOpen: boolean
  setIsUnitDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  unitHighlightedIndex: number
  setUnitHighlightedIndex: (index: number | ((prev: number) => number)) => void
  unitFieldWrapperRef: RefObject<HTMLDivElement | null>
  unitInputRef: RefObject<HTMLInputElement | null>
  selectUnitSuggestion: (unit: string) => void
}

export function CreateAdPriceDeliverySection({
  register,
  errors,
  priceValue,
  hasPriceValue,
  unitValue,
  deliveryAvailable,
  unitRegister,
  unitSuggestions,
  isUnitDropdownOpen,
  setIsUnitDropdownOpen,
  unitHighlightedIndex,
  setUnitHighlightedIndex,
  unitFieldWrapperRef,
  unitInputRef,
  selectUnitSuggestion,
}: Props) {
  return (
    <section className="space-y-3">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Narx va yetkazib berish</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid">
          <input
            {...register('price', {
              required: 'Narx kiriting',
              onChange: (event) => {
                const target = event.target as HTMLInputElement
                target.value = formatPriceInput(target.value)
              },
              validate: (value) => {
                const parsed = parsePriceInput(value)
                return (parsed !== undefined && parsed > 0) || "Narx maydoni noto'g'ri"
              },
            })}
            aria-invalid={Boolean(errors.price)}
            placeholder="Narx"
            className={`col-start-1 row-start-1 w-full rounded-ui border px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100 ${getFieldBorderClass(
              Boolean(errors.price),
            )}`}
          />
          {hasPriceValue ? (
            <span
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 self-center pl-3 text-sm text-slate-500 select-none dark:text-slate-400"
            >
              <span className="invisible whitespace-pre">{priceValue}</span>
              <span className="whitespace-pre"> so&apos;m</span>
            </span>
          ) : null}
        </div>
        <CreateAdUnitCombobox
          unitRegister={unitRegister}
          unitValue={unitValue}
          unitSuggestions={unitSuggestions}
          hasUnitError={Boolean(errors.unit)}
          isUnitDropdownOpen={isUnitDropdownOpen}
          setIsUnitDropdownOpen={setIsUnitDropdownOpen}
          unitHighlightedIndex={unitHighlightedIndex}
          setUnitHighlightedIndex={setUnitHighlightedIndex}
          unitFieldWrapperRef={unitFieldWrapperRef}
          unitInputRef={unitInputRef}
          selectUnitSuggestion={selectUnitSuggestion}
        />
      </div>
      {errors.price || errors.unit ? (
        <p className={ERROR_TEXT_CLASS}>{errors.price?.message || errors.unit?.message}</p>
      ) : null}

      <div className="rounded-ui border border-slate-200 px-3 py-3 dark:border-slate-600 dark:bg-slate-800">
        <label className="flex cursor-pointer items-center justify-between gap-4 select-none">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {deliveryAvailable ? 'Yetkazib berish mavjud' : "Yetkazib berish yo'q"}
          </span>
          <span className="relative inline-flex shrink-0 items-center">
            <input type="checkbox" {...register('deliveryAvailable')} className="peer sr-only" />
            <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-daladan-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-daladan-primary dark:bg-slate-600" />
            <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </div>
    </section>
  )
}
