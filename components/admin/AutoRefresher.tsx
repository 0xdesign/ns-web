'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type AutoRefresherProps = {
  intervalMs?: number
}

export function AutoRefresher({ intervalMs = 30_000 }: AutoRefresherProps) {
  const router = useRouter()

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => {
      window.clearInterval(id)
    }
  }, [router, intervalMs])

  return null
}
