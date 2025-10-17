'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type ResponsiveOverrides = {
  mobileHeight?: string
  tabletHeight?: string
  desktopHeight?: string
  mobileWidth?: string
  tabletWidth?: string
  desktopWidth?: string
}

type GradualBlurPreset =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'subtle'
  | 'intense'
  | 'smooth'
  | 'sharp'
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'page-header'
  | 'page-footer'

const CURVE_FUNCTIONS = {
  linear: (p: number) => p,
  bezier: (p: number) => p * p * (3 - 2 * p),
  'ease-in': (p: number) => p * p,
  'ease-out': (p: number) => 1 - Math.pow(1 - p, 2),
  'ease-in-out': (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
} as const

export interface GradualBlurProps extends ResponsiveOverrides {
  preset?: GradualBlurPreset
  position?: 'top' | 'bottom' | 'left' | 'right'
  strength?: number
  height?: string
  width?: string
  divCount?: number
  exponential?: boolean
  zIndex?: number
  animated?: boolean | 'scroll'
  duration?: string
  easing?: string
  opacity?: number
  curve?: keyof typeof CURVE_FUNCTIONS
  responsive?: boolean
  target?: 'parent' | 'page'
  className?: string
  style?: React.CSSProperties
  hoverIntensity?: number
  onAnimationComplete?: () => void
}

type GradualBlurConfig = GradualBlurProps & {
  position: NonNullable<GradualBlurProps['position']>
  strength: number
  height: string
  width?: string
  divCount: number
  exponential: boolean
  zIndex: number
  animated: NonNullable<GradualBlurProps['animated']>
  duration: string
  easing: string
  opacity: number
  curve: keyof typeof CURVE_FUNCTIONS
  responsive: boolean
  target: NonNullable<GradualBlurProps['target']>
  className: string
  style: React.CSSProperties
}

const DEFAULT_CONFIG: GradualBlurConfig = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  width: undefined,
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {},
  hoverIntensity: undefined,
  onAnimationComplete: undefined,
  preset: undefined,
  mobileHeight: undefined,
  tabletHeight: undefined,
  desktopHeight: undefined,
  mobileWidth: undefined,
  tabletWidth: undefined,
  desktopWidth: undefined,
}

const PRESETS: Record<GradualBlurPreset, Partial<GradualBlurConfig>> = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 },
}

const mergeConfigs = (
  base: GradualBlurConfig,
  ...overrides: Array<Partial<GradualBlurConfig> | undefined>
): GradualBlurConfig => {
  return overrides
    .filter((override): override is Partial<GradualBlurConfig> => override !== undefined)
    .reduce(
      (acc, override) => ({
        ...acc,
        ...override,
      }),
      { ...base }
    ) as GradualBlurConfig
}

const getGradientDirection = (position: GradualBlurConfig['position']) => {
  const directions: Record<GradualBlurConfig['position'], string> = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  }
  return directions[position]
}

const debounce = <Fn extends (...args: unknown[]) => void>(fn: Fn, wait: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<Fn>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), wait)
  }
}

interface ResponsiveDimensionOverrides {
  mobile?: string
  tablet?: string
  desktop?: string
}

const useResponsiveDimension = (
  responsive: boolean,
  baseValue: string | undefined,
  overrides: ResponsiveDimensionOverrides
) => {
  const [value, setValue] = useState<string | undefined>(baseValue)

  useEffect(() => {
    if (!responsive) return

    const calculate = () => {
      const width = window.innerWidth
      let nextValue = baseValue
      if (width <= 480 && overrides.mobile) {
        nextValue = overrides.mobile
      } else if (width <= 768 && overrides.tablet) {
        nextValue = overrides.tablet
      } else if (width >= 1024 && overrides.desktop) {
        nextValue = overrides.desktop
      }
      setValue(nextValue)
    }

    const debounced = debounce(calculate, 100)
    calculate()
    window.addEventListener('resize', debounced)
    return () => window.removeEventListener('resize', debounced)
  }, [responsive, baseValue, overrides.mobile, overrides.tablet, overrides.desktop])

  return responsive ? value : baseValue
}

const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement | null>,
  shouldObserve = false
) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve)

  useEffect(() => {
    if (!shouldObserve || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, shouldObserve])

  return isVisible
}

const GradualBlur = (props: GradualBlurProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const config = useMemo<GradualBlurConfig>(() => {
    const presetConfig = props.preset ? PRESETS[props.preset] : undefined
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props)
  }, [props])

  const responsiveHeight = useResponsiveDimension(config.responsive, config.height, {
    mobile: config.mobileHeight,
    tablet: config.tabletHeight,
    desktop: config.desktopHeight,
  })
  const responsiveWidth = useResponsiveDimension(config.responsive, config.width, {
    mobile: config.mobileWidth,
    tablet: config.tabletWidth,
    desktop: config.desktopWidth,
  })
  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll')

  const blurDivs = useMemo(() => {
    const divs: React.ReactElement[] = []
    const count = Math.max(1, Math.min(config.divCount, 24))
    const increment = 100 / count
    const hoverIsConfigured = config.hoverIntensity !== undefined
    const currentStrength =
      isHovered && hoverIsConfigured
        ? config.strength * (config.hoverIntensity ?? 0)
        : config.strength

    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear

    for (let i = 1; i <= count; i += 1) {
      let progress = i / count
      progress = curveFunc(progress)

      let blurValue: number
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength
      } else {
        blurValue = 0.0625 * (progress * count + 1) * currentStrength
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10
      const p2 = Math.round(increment * i * 10) / 10
      const p3 = Math.round((increment * i + increment) * 10) / 10
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10
      let gradient = `transparent ${p1}%, black ${p2}%`
      if (p3 <= 100) gradient += `, black ${p3}%`
      if (p4 <= 100) gradient += `, transparent ${p4}%`

      const direction = getGradientDirection(config.position)

      const divStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition:
          config.animated && config.animated !== 'scroll'
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined,
      }

      divs.push(<div key={i} style={divStyle} />)
    }

    return divs
  }, [
    config.animated,
    config.curve,
    config.divCount,
    config.duration,
    config.easing,
    config.exponential,
    config.hoverIntensity,
    config.opacity,
    config.position,
    config.strength,
    isHovered,
  ])

  const containerStyle = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(config.position)
    const isHorizontal = ['left', 'right'].includes(config.position)
    const isPageTarget = config.target === 'page'

    const baseStyle: React.CSSProperties = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity !== undefined ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style,
    }

    if (isVertical) {
      baseStyle.height = responsiveHeight
      baseStyle.width = responsiveWidth || '100%'
      baseStyle[config.position] = 0
      baseStyle.left = 0
      baseStyle.right = 0
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight
      baseStyle.height = '100%'
      baseStyle[config.position] = 0
      baseStyle.top = 0
      baseStyle.bottom = 0
    }

    return baseStyle
  }, [
    config.animated,
    config.duration,
    config.easing,
    config.hoverIntensity,
    config.position,
    config.style,
    config.target,
    config.zIndex,
    isVisible,
    responsiveHeight,
    responsiveWidth,
  ])

  const { hoverIntensity, animated, onAnimationComplete, duration } = config

  const parseCssDuration = (value: string): number => {
    const trimmed = value.trim().toLowerCase()
    if (trimmed.endsWith('ms')) {
      const numeric = Number(trimmed.slice(0, -2))
      return Number.isFinite(numeric) ? numeric : 0
    }
    if (trimmed.endsWith('s')) {
      const numeric = Number(trimmed.slice(0, -1))
      return Number.isFinite(numeric) ? numeric * 1000 : 0
    }
    const numeric = Number(trimmed)
    if (Number.isFinite(numeric)) {
      return numeric
    }
    return 0
  }

  const animationDurationMs = parseCssDuration(duration)

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const timeoutId = setTimeout(() => onAnimationComplete(), animationDurationMs)
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [animationDurationMs, animated, isVisible, onAnimationComplete])

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className}`}
      style={containerStyle}
      aria-hidden="true"
      role="presentation"
      onMouseEnter={hoverIntensity !== undefined ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity !== undefined ? () => setIsHovered(false) : undefined}
    >
      <div className="gradual-blur-inner relative w-full h-full">{blurDivs}</div>
    </div>
  )
}

const GradualBlurMemo = React.memo(GradualBlur) as React.MemoExoticComponent<typeof GradualBlur> & {
  PRESETS: typeof PRESETS
  CURVE_FUNCTIONS: typeof CURVE_FUNCTIONS
}
GradualBlurMemo.displayName = 'GradualBlur'
GradualBlurMemo.PRESETS = PRESETS
GradualBlurMemo.CURVE_FUNCTIONS = CURVE_FUNCTIONS

export default GradualBlurMemo
