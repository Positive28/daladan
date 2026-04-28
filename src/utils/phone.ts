const UZ_COUNTRY_CODE = '998'

const getLocalDigits = (input: string) => {
  const digits = input.replace(/\D/g, '')
  const withoutCountry = digits.startsWith(UZ_COUNTRY_CODE) ? digits.slice(3) : digits
  return withoutCountry.slice(0, 9)
}

export const formatUzPhoneInput = (input: string) => {
  const local = getLocalDigits(input)
  if (!local) return ''
  const p1 = local.slice(0, 2)
  const p2 = local.slice(2, 5)
  const p3 = local.slice(5, 7)
  const p4 = local.slice(7, 9)

  const parts = [p1, p2, p3, p4].filter(Boolean)
  return `+998 ${parts.join(' ')}`.trimEnd()
}

export const normalizeUzPhone = (input: string) => `+998${getLocalDigits(input)}`

export const isUzPhoneComplete = (input: string) => getLocalDigits(input).length === 9
