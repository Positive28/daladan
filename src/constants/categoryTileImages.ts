/**
 * Home “Mashhur kategoriyalar” tiles.
 * Primary: Unsplash CDN (free to use per Unsplash License) keyed by API `slug` and `id`.
 * Fallback: local `/categories/default.svg`. Optional overrides in `_BY_LABEL_KEY` for dev fallback tree.
 */

export const DEFAULT_CATEGORY_TILE_IMAGE = '/categories/default.svg'

/** Licensed stock photos — fruit, poultry/poultry farming, cattle/livestock */
const UNSPLASH_FRUIT =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
const UNSPLASH_POULTRY =
  'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80'
const UNSPLASH_ANIMAL =
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80'

/** API category id → image URL (matches common backend ids) */
export const CATEGORY_TILE_IMAGE_BY_ID: Partial<Record<number, string>> = {
  1: UNSPLASH_FRUIT,
  2: UNSPLASH_ANIMAL,
  3: UNSPLASH_POULTRY,
}

/** API slug → image URL */
export const CATEGORY_TILE_IMAGE_BY_SLUG: Record<string, string> = {
  fruit: UNSPLASH_FRUIT,
  poultry: UNSPLASH_POULTRY,
  animal: UNSPLASH_ANIMAL,
}

/** Normalized label → URL (fallback tree without id/slug) */
export const CATEGORY_TILE_IMAGE_BY_LABEL_KEY: Record<string, string> = {
  meva: UNSPLASH_FRUIT,
  hayvonlar: UNSPLASH_ANIMAL,
  parranda: UNSPLASH_POULTRY,
}

export const normalizeCategoryLabel = (label: string) => label.trim().toLowerCase().replace(/\s+/g, ' ')

export function getCategoryTileImage(category: { id?: number; label: string; slug?: string }): string {
  if (category.id != null) {
    const byId = CATEGORY_TILE_IMAGE_BY_ID[category.id]
    if (byId) return byId
  }

  if (category.slug) {
    const key = category.slug.trim().toLowerCase()
    const bySlug = CATEGORY_TILE_IMAGE_BY_SLUG[key]
    if (bySlug) return bySlug
  }

  const labelKey = normalizeCategoryLabel(category.label)
  const byLabel = CATEGORY_TILE_IMAGE_BY_LABEL_KEY[labelKey]
  if (byLabel) return byLabel

  return DEFAULT_CATEGORY_TILE_IMAGE
}
