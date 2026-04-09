import type { AdminSubcategory, AdminSubcategoryPayload } from '../../../types/admin'

export type AdminSubcategoryFormValues = {
  category_id: string
  name: string
  slug: string
  sort_order: string
  is_active: boolean
}

export const emptySubcategoryForm: AdminSubcategoryFormValues = {
  category_id: '',
  name: '',
  slug: '',
  sort_order: '',
  is_active: true,
}

export const subcategoryToPayload = (values: AdminSubcategoryFormValues): AdminSubcategoryPayload => {
  const sortRaw = values.sort_order.trim()
  const sortNum = sortRaw === '' ? null : Number(sortRaw)
  return {
    category_id: Number(values.category_id),
    name: values.name.trim(),
    slug: values.slug.trim(),
    sort_order: sortNum === null || Number.isNaN(sortNum) ? null : sortNum,
    is_active: values.is_active,
  }
}

export const subcategoryToForm = (s: AdminSubcategory): AdminSubcategoryFormValues => ({
  category_id: String(s.category_id),
  name: s.name,
  slug: s.slug,
  sort_order: s.sort_order === null ? '' : String(s.sort_order),
  is_active: s.is_active,
})
