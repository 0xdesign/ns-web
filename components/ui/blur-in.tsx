"use client"

import React, { useEffect, useRef, useState } from 'react'

interface BlurInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  amount?: number
  threshold?: number
}

export function BlurIn({
  children,
  className = "",
  delay = 0,
  duration = 1000,
  amount = 20,
  threshold = 0.1,
}: BlurInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin: '0px 0px -10% 0px' // Trigger blur-out slightly before element leaves viewport
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        filter: isVisible ? 'blur(0px)' : `blur(${amount}px)`,
        opacity: isVisible ? 1 : 0.3,
        transform: isVisible ? 'translateY(0)' : 'translateY(0)',
        transition: `filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? delay : 0}ms, opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? delay : 0}ms`,
        willChange: 'filter, opacity',
      }}
    >
      {children}
    </div>
  )
}
