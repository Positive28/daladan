import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form'
import type { CityOption, RegionOption } from '../../../services/contracts'
import type { CategoryOption, SubcategoryOption } from '../../../types/marketplace'
import { ERROR_TEXT_CLASS, SELECT_ICON_CLASS, getSelectClass } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { CategoryPickerModal } from './CategoryPickerModal'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  setValue: UseFormSetValue<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  categories: CategoryOption[]
  subcategories: SubcategoryOption[]
  regions: RegionOption[]
  cities: CityOption[]
  selectedCategoryId: string
  selectedRegionId: string
  selectedCityId: string
  isLoadingCategories: boolean
  isLoadingSubcategories: boolean
  isLoadingRegions: boolean
  isLoadingCities: boolean
}

export function CreateAdLocationSection({
  register,
  setValue,
  errors,
  categories,
  subcategories,
  regions,
  cities,
  selectedCategoryId,
  selectedRegionId,
  selectedCityId,
  isLoadingCategories,
  isLoadingSubcategories,
  isLoadingRegions,
  isLoadingCities,
}: Props) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId)

  return (
    <section className="space-y-3">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Joylashuv va toifa</p>
      <div className="grid gap-3 md:grid-cols-2">

        {/* Category picker button */}
        <div className="relative">
          <input
            type="hidden"
            {...register('categoryId', { required: 'Kategoriya tanlang' })}
          />
          <button
            type="button"
            disabled={isLoadingCategories}
            onClick={() => setIsCategoryModalOpen(true)}
            aria-invalid={Boolean(errors.categoryId)}
            className={`flex w-full appearance-none items-center justify-between rounded-ui border px-3 py-2 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-daladan-primary/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-100 ${
              errors.categoryId
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className={selectedCategory ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
              {isLoadingCategories
                ? 'Yuklanmoqda...'
                : selectedCategory?.name ?? 'Kategoriya tanlang'}
            </span>
            <ChevronDown size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* Subcategory select */}
        <div className="relative">
          <select
            {...register('subcategoryId', { required: 'Subkategoriya tanlang' })}
            aria-invalid={Boolean(errors.subcategoryId)}
            disabled={!selectedCategoryId || isLoadingSubcategories}
            className={getSelectClass(Boolean(errors.subcategoryId))}
          >
            <option value="">{isLoadingSubcategories ? 'Yuklanmoqda...' : 'Subkategoriya tanlang'}</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={SELECT_ICON_CLASS} />
        </div>

        {/* Region select */}
        <div className="relative">
          <select
            {...register('regionId', { required: 'Viloyat tanlang' })}
            value={selectedRegionId ?? ''}
            aria-invalid={Boolean(errors.regionId)}
            disabled={isLoadingRegions}
            className={getSelectClass(Boolean(errors.regionId))}
          >
            <option value="">{isLoadingRegions ? 'Yuklanmoqda...' : 'Viloyat tanlang'}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={SELECT_ICON_CLASS} />
        </div>

        {/* City select */}
        <div className="relative">
          <select
            {...register('cityId', { required: 'Tuman tanlang' })}
            value={selectedCityId ?? ''}
            aria-invalid={Boolean(errors.cityId)}
            disabled={!selectedRegionId || isLoadingCities}
            className={getSelectClass(Boolean(errors.cityId))}
          >
            <option value="">{isLoadingCities ? 'Yuklanmoqda...' : 'Tuman tanlang'}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={SELECT_ICON_CLASS} />
        </div>
      </div>

      {errors.categoryId || errors.subcategoryId || errors.regionId || errors.cityId ? (
        <p className={ERROR_TEXT_CLASS}>
          {errors.categoryId?.message ||
            errors.subcategoryId?.message ||
            errors.regionId?.message ||
            errors.cityId?.message}
        </p>
      ) : null}

      <CategoryPickerModal
        open={isCategoryModalOpen}
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={(category) => {
          setValue('categoryId', String(category.id), { shouldValidate: true, shouldDirty: true })
          setValue('subcategoryId', '', { shouldValidate: false })
        }}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </section>
  )
}
