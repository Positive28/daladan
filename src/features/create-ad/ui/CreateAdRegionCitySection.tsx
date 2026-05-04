import { ChevronDown } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { CityOption, RegionOption } from '../../../services/contracts'
import { ERROR_TEXT_CLASS, SELECT_ICON_CLASS, getSelectClass } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  regions: RegionOption[]
  cities: CityOption[]
  selectedRegionId: string
  selectedCityId: string
  isLoadingRegions: boolean
  isLoadingCities: boolean
}

export function CreateAdRegionCitySection({
  register,
  errors,
  regions,
  cities,
  selectedRegionId,
  selectedCityId,
  isLoadingRegions,
  isLoadingCities,
}: Props) {
  return (
    <section className="space-y-3">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Joylashuv</p>
      <div className="grid gap-3 md:grid-cols-2">
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

      {errors.regionId || errors.cityId ? (
        <p className={ERROR_TEXT_CLASS}>{errors.regionId?.message || errors.cityId?.message}</p>
      ) : null}
    </section>
  )
}
