/** Strip @ and outer whitespace for t.me username segment. */
export function normalizeTelegramUsername(input: string): string {
  return input.trim().replace(/^@+/, '')
}

export function buildTelegramChatUrl(username: string, text: string): string {
  const u = normalizeTelegramUsername(username)
  return `https://t.me/${u}?text=${encodeURIComponent(text)}`
}
