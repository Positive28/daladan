import { marketplaceService } from '../../../services'
import type { SubcategoryOption } from '../../../types/marketplace'

export interface CategoryNode {
  label: string
  /** Present on root nodes loaded from API — used for static tile assets */
  id?: number
  /** API slug (e.g. fruit, poultry, animal) — tile images */
  slug?: string
  /** When API provides subcategory `image_url` or first gallery URL */
  imageUrl?: string
  children?: CategoryNode[]
}

export const fallbackCategoryTree: CategoryNode[] = [
  {
    label: "Qishloq xo'jaligi",
    children: [
      { label: 'Mevalar' },
      { label: 'Sabzavotlar' },
      { label: 'Donli mahsulotlar' },
      { label: 'Asal va mahsulotlar' },
    ],
  },
  {
    label: 'Xizmatlar',
    children: [{ label: 'Texnika xizmati' }, { label: 'Transport xizmati' }],
  },
]

let categoryTreePromise: Promise<CategoryNode[]> | null = null

export const gatherDescendants = (target: string, tree: CategoryNode[]): Set<string> => {
  const result = new Set<string>()

  const collectAll = (node: CategoryNode) => {
    result.add(node.label)
    node.children?.forEach(collectAll)
  }

  const walk = (nodes: CategoryNode[]): boolean => {
    for (const node of nodes) {
      if (node.label === target) {
        collectAll(node)
        return true
      }
      if (node.children && walk(node.children)) {
        return true
      }
    }
    return false
  }

  walk(tree)
  return result
}

export const collectLabelsInTree = (tree: CategoryNode[]): Set<string> => {
  const labels = new Set<string>()
  const walk = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      labels.add(node.label)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tree)
  return labels
}

/** True when the filter row should show subcategories: parent or a child is selected, or the user opened it with the chevron. */
export const isCategoryExpandedForFilter = (
  category: CategoryNode,
  selectedCategory: string,
  manuallyExpanded: ReadonlySet<string>,
): boolean => {
  if (!category.children?.length) return false
  if (selectedCategory === category.label) return true
  if (category.children.some((s) => s.label === selectedCategory)) return true
  return manuallyExpanded.has(category.label)
}

export const loadCategoryTree = (): Promise<CategoryNode[]> => {
  if (categoryTreePromise) return categoryTreePromise

  categoryTreePromise = (async () => {
    const categories = await marketplaceService.getCategories()
    if (categories.length === 0) return []

    const subcategoryPairs: Array<[number, SubcategoryOption[]]> = await Promise.all(
      categories.map(async (category): Promise<[number, SubcategoryOption[]]> => {
        try {
          const subcategories = await marketplaceService.getSubcategories(category.id)
          return [category.id, subcategories]
        } catch {
          return [category.id, []]
        }
      }),
    )

    const subcategoriesByCategoryId = new Map<number, SubcategoryOption[]>(subcategoryPairs)

    return categories
      .filter((category) => Boolean(category.name))
      .map((category) => ({
        id: category.id,
        label: category.name,
        ...(category.slug ? { slug: category.slug } : {}),
        children: (subcategoriesByCategoryId.get(category.id) ?? [])
          .filter((subcategory) => Boolean(subcategory.name))
          .map((subcategory) => {
            const imageUrl =
              (subcategory.image_url && subcategory.image_url.trim()) || subcategory.media?.[0]
            return {
              label: subcategory.name,
              ...(subcategory.id ? { id: subcategory.id } : {}),
              ...(subcategory.slug ? { slug: subcategory.slug } : {}),
              ...(imageUrl ? { imageUrl } : {}),
            }
          }),
      }))
  })().catch((error) => {
    categoryTreePromise = null
    throw error
  })

  return categoryTreePromise
}
