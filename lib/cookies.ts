const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
}

export function removeCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`
}

export function getJsonCookie<T>(name: string, fallback: T): T {
  const raw = getCookie(name)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setJsonCookie<T>(name: string, value: T) {
  setCookie(name, JSON.stringify(value))
}
