export const ADMIN_EMAIL_PREF_KEY = 'ct-admin-send-email-default'

export function readSendEmailPreference(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(ADMIN_EMAIL_PREF_KEY)
  if (stored === null) return true
  return stored !== 'false'
}

export function persistSendEmailPreference(value: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ADMIN_EMAIL_PREF_KEY, value ? 'true' : 'false')
}
