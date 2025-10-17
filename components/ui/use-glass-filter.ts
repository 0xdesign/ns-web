'use client'

import { useEffect, useState } from 'react'

const FILTER_URL = 'url(#glass-distortion)'

export function useGlassFilter(): string | undefined {
  const [filterUrl, setFilterUrl] = useState<string | undefined>(FILTER_URL)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const exists = document.getElementById('glass-distortion')
    setFilterUrl(exists ? FILTER_URL : undefined)
  }, [])

  return filterUrl
}
