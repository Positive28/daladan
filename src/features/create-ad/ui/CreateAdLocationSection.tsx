import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form'
import type { CategoryOption, SubcategoryOption } from '../../../types/marketplace'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { CategoryPickerModal } from './CategoryPickerModal'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  setValue: UseFormSetValue<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  categories: CategoryOption[]
  subcategories: SubcategoryOption[]
  selectedCategoryId: string
  selectedSubcategoryId: string
  isLoadingCategories: boolean
  isLoadingSubcategories: boolean
}

export function CreateAdLocationSection({
  register,
  setValue,
  errors,
  categories,
  subcategories,
  selectedCategoryId,
  selectedSubcategoryId,
  isLoadingCategories,
  isLoadingSubcategories,
}: Props) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false)

  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId)
  const selectedSubcategory = subcategories.find((s) => String(s.id) === selectedSubcategoryId)

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
                : selectedCategory?.name ?? "Bo'limni tanlang"}
            </span>
            <ChevronDown size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* Subcategory picker button */}
        <div className="relative">
          <input
            type="hidden"
            {...register('subcategoryId', { required: 'Subkategoriya tanlang' })}
          />
          <button
            type="button"
            disabled={!selectedCategoryId || isLoadingSubcategories}
            onClick={() => setIsSubcategoryModalOpen(true)}
            aria-invalid={Boolean(errors.subcategoryId)}
            className={`flex w-full appearance-none items-center justify-between rounded-ui border px-3 py-2 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-daladan-primary/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:text-slate-100 ${
              errors.subcategoryId
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className={selectedSubcategory ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
              {isLoadingSubcategories
                ? 'Yuklanmoqda...'
                : selectedSubcategory?.name ?? "Mahsulot turini tanlang"}
            </span>
            <ChevronDown size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

      </div>

      {errors.categoryId || errors.subcategoryId ? (
        <p className={ERROR_TEXT_CLASS}>
          {errors.categoryId?.message ||
            errors.subcategoryId?.message}
        </p>
      ) : null}

      <CategoryPickerModal
        open={isCategoryModalOpen}
        categories={categories}
        selectedId={selectedCategoryId}
        title="Bo'limni tanlang"
        onSelect={(category) => {
          setValue('categoryId', String(category.id), { shouldValidate: true, shouldDirty: true })
          setValue('subcategoryId', '', { shouldValidate: false })
        }}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <CategoryPickerModal
        open={isSubcategoryModalOpen}
        categories={subcategories}
        selectedId={selectedSubcategoryId}
        title="Mahsulot turini tanlang"
        emptyStateText="Mahsulot turi topilmadi"
        onSelect={(subcategory) => {
          setValue('subcategoryId', String(subcategory.id), { shouldValidate: true, shouldDirty: true })
        }}
        onClose={() => setIsSubcategoryModalOpen(false)}
      />
    </section>
  )
}
