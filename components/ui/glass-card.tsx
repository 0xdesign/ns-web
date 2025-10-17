'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blurAmount?: string
  contentClassName?: string
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, contentClassName, blurAmount = '2px', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('group relative overflow-hidden', className)}
        {...props}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: `blur(${blurAmount})`,
            filter: 'url(#glass-distortion)',
            borderRadius: 'inherit',
            zIndex: 0,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
            borderRadius: 'inherit',
            zIndex: 1,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
          style={{
            background: 'rgba(255, 255, 255, 1)',
            borderRadius: 'inherit',
            zIndex: 2,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
          style={{
            borderRadius: 'inherit',
            zIndex: 3,
          }}
        />
        <div className={cn('relative z-20', contentClassName)}>{children}</div>
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
