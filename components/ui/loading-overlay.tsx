"use client"

import { useState, useEffect } from "react"

interface LoadingOverlayProps {
  onComplete?: () => void
}

export function LoadingOverlay({ onComplete }: LoadingOverlayProps) {
  const [percentage, setPercentage] = useState(0)
  const [isClipping, setIsClipping] = useState(false)

  useEffect(() => {
    let frame = 0
    const timeouts: number[] = []

    // Animate percentage from 0 to 100 over 2 seconds
    const duration = 2000
    const startTime = performance.now()

    const animatePercentage = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentPercentage = Math.round(progress * 100)

      setPercentage(currentPercentage)

      if (progress < 1) {
        frame = requestAnimationFrame(animatePercentage)
      } else {
        // Start clipping animation after percentage reaches 100%
        const clipTimeout = window.setTimeout(() => {
          setIsClipping(true)

          // Call onComplete after clip animation
          const completeTimeout = window.setTimeout(() => {
            onComplete?.()
          }, 400)
          timeouts.push(completeTimeout)
        }, 100)
        timeouts.push(clipTimeout)
      }
    }

    frame = requestAnimationFrame(animatePercentage)

    return () => {
      if (frame) {
        cancelAnimationFrame(frame)
      }
      timeouts.forEach(clearTimeout)
    }
  }, [onComplete])

  return (
    <div
      className="bg-neutral-950 text-white"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        clipPath: isClipping ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
        pointerEvents: isClipping ? "none" : "auto",
        transition: "clip-path 0.4s ease-in-out",
      }}
    >
      {/* Percentage Counter */}
      <div
        className="font-bold tracking-tight"
        style={{
          position: "absolute",
          right: "clamp(1rem, 2vw, 3rem)",
          bottom: "clamp(1rem, 2vw, 3rem)",
          fontSize: "clamp(3rem, 8vw, 12rem)",
        }}
      >
        {percentage}%
      </div>
    </div>
  )
}
