'use client'

const VISIT_KEY = 'ct_visited'

export function hasVisited(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(VISIT_KEY) === 'true'
}

export function markVisited(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VISIT_KEY, 'true')
}
