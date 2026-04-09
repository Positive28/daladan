import type { AdminCategory, AdminCategoryPayload } from '../../../types/admin'

export type AdminCategoryFormValues = {
  name: string
  slug: string
  sort_order: string
  is_active: boolean
}

export const emptyCategoryForm: AdminCategoryFormValues = {
  name: '',
  slug: '',
  sort_order: '',
  is_active: true,
}

export const categoryToPayload = (values: AdminCategoryFormValues): AdminCategoryPayload => {
  const sortRaw = values.sort_order.trim()
  const sortNum = sortRaw === '' ? null : Number(sortRaw)
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    sort_order: sortNum === null || Number.isNaN(sortNum) ? null : sortNum,
    is_active: values.is_active,
  }
}

export const categoryToForm = (c: AdminCategory): AdminCategoryFormValues => ({
  name: c.name,
  slug: c.slug,
  sort_order: c.sort_order === null ? '' : String(c.sort_order),
  is_active: c.is_active,
})
