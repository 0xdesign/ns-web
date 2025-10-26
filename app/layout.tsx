import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'Rasp',
  description: 'A home for next-gen creators.',
  applicationName: 'Rasp',
  openGraph: {
    title: 'Rasp',
    description: 'A home for next-gen creators.',
    type: 'website',
    siteName: 'Rasp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rasp',
    description: 'A home for next-gen creators.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const GlassFilters = () => (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute h-0 w-0"
    >
      <defs>
        <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="12" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.75 0" in="blur" result="glassColor" />
          <feBlend in="SourceGraphic" in2="glassColor" mode="screen" />
        </filter>

        <filter id="glass-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <GlassFilters />
        {children}

        {/* SVG Filters for Liquid Glass Effect */}
        <svg
          aria-hidden="true"
          focusable="false"
          width="0"
          height="0"
          style={{ position: 'absolute', left: 0, top: 0, opacity: 0, pointerEvents: 'none' }}
        >
          <defs>
            <filter
              id="glass-distortion"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              filterUnits="objectBoundingBox"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01 0.01"
                numOctaves="1"
                seed="5"
                result="turbulence"
              />
              <feGaussianBlur
                in="turbulence"
                stdDeviation="3"
                result="softMap"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softMap"
                scale="150"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  )
}
