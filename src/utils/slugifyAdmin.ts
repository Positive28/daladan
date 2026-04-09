/** Client-side slug suggestion; backend validates the final value. */
export const slugifyFromName = (name: string): string => {
  const t = name.trim().toLowerCase()
  if (!t) return ''
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
