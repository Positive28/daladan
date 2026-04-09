export type UnknownRecord = Record<string, unknown>

export const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {}

export const isNonEmptyRecord = (value: UnknownRecord) => Object.keys(value).length > 0

export const asArray = (value: unknown): UnknownRecord[] =>
  Array.isArray(value)
    ? value.filter((item): item is UnknownRecord => !!item && typeof item === 'object')
    : []

export const extractCollection = (value: unknown): UnknownRecord[] => {
  const direct = asArray(value)
  if (direct.length > 0) return direct

  const root = asRecord(value)
  const topLevelCandidates = [
    root.data,
    root.items,
    root.results,
    root.rows,
    root.categories,
    root.subcategories,
  ]
  for (const candidate of topLevelCandidates) {
    const list = asArray(candidate)
    if (list.length > 0) return list
  }

  const nested = asRecord(root.data)
  const nestedCandidates = [
    nested.data,
    nested.items,
    nested.results,
    nested.rows,
    nested.categories,
    nested.subcategories,
  ]
  for (const candidate of nestedCandidates) {
    const list = asArray(candidate)
    if (list.length > 0) return list
  }

  return []
}

export const getString = (obj: UnknownRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string') return value
  }
  return ''
}

export const getNumber = (obj: UnknownRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

export const getBoolean = (obj: UnknownRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (!normalized) continue
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true
      if (['false', '0', 'no', 'off'].includes(normalized)) return false
    }
  }
  return false
}

export const pickFirstRecord = (...candidates: unknown[]): UnknownRecord =>
  candidates.map(asRecord).find((candidate) => isNonEmptyRecord(candidate)) ?? {}

