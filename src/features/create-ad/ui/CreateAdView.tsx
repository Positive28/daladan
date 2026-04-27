import { Link } from 'react-router-dom'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import { useCreateAdPage } from '../model/useCreateAdPage'
import { CreateAdLocationSection } from './CreateAdLocationSection'
import { CreateAdPhotosSection } from './CreateAdPhotosSection'
import { CreateAdPriceDeliverySection } from './CreateAdPriceDeliverySection'
import { CreateAdTitleDescriptionSection } from './CreateAdTitleDescriptionSection'

/** Route: `/profile/ads/new` */
export function CreateAdView() {
  const model = useCreateAdPage()
  const {
    register,
    setValue,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    categories,
    subcategories,
    regions,
    cities,
    isLoadingCategories,
    isLoadingSubcategories,
    isLoadingRegions,
    isLoadingCities,
    selectedCategoryId,
    selectedRegionId,
    selectedCityId,
    files,
    photoSlots,
    setPhotoSlots,
    error,
    onSubmit,
  } = model

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Yangi e&apos;lon yaratish</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">E&apos;lon ma&apos;lumotlarini kiriting</p>
        </div>
        <Link
          to="/profile"
          className="rounded-ui border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          Orqaga
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6"
      >
        <CreateAdLocationSection
          register={register}
          setValue={setValue}
          errors={errors}
          categories={categories}
          subcategories={subcategories}
          regions={regions}
          cities={cities}
          selectedCategoryId={selectedCategoryId}
          selectedRegionId={selectedRegionId}
          selectedCityId={selectedCityId}
          isLoadingCategories={isLoadingCategories}
          isLoadingSubcategories={isLoadingSubcategories}
          isLoadingRegions={isLoadingRegions}
          isLoadingCities={isLoadingCities}
        />

        <CreateAdPriceDeliverySection {...model} />

        <CreateAdTitleDescriptionSection
          register={register}
          errors={errors}
          handleGenerateDescription={model.handleGenerateDescription}
          isGenerateDescriptionDisabled={model.isGenerateDescriptionDisabled}
          isGeneratingDescription={model.isGeneratingDescription}
        />

        <CreateAdPhotosSection photoSlots={photoSlots} setPhotoSlots={setPhotoSlots} fileCount={files.length} />

        {error ? <p className={ERROR_TEXT_CLASS}>{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || !isValid || isLoadingCategories || isLoadingRegions}
          className="w-full rounded-ui bg-daladan-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Yuborilmoqda...' : "E'lonni joylash"}
        </button>
      </form>
    </div>
  )
}
