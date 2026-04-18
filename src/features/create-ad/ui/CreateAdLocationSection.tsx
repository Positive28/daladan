import { ChevronDown } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { CityOption, RegionOption } from '../../../services/contracts'
import type { CategoryOption, SubcategoryOption } from '../../../types/marketplace'
import { ERROR_TEXT_CLASS, SELECT_ICON_CLASS, getSelectClass } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
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
  return (
    <section className="space-y-3">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Joylashuv va toifa</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <select
            {...register('categoryId', { required: 'Kategoriya tanlang' })}
            aria-invalid={Boolean(errors.categoryId)}
            disabled={isLoadingCategories}
            className={getSelectClass(Boolean(errors.categoryId))}
          >
            <option value="">{isLoadingCategories ? 'Yuklanmoqda...' : 'Kategoriya tanlang'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={SELECT_ICON_CLASS} />
        </div>

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
    </section>
  )
}
