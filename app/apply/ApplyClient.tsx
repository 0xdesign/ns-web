'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { ShapeBlur } from '@/components/ui/ShapeBlur'
import { BlurIn } from '@/components/ui/blur-in'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import Prism from '@/components/ui/prism'
import type { MembersResponse } from '@/lib/supabase'
import type { DiscordSessionUser } from '@/lib/current-user'

interface ApplyClientProps {
  membersData: MembersResponse
  error?: string
  discordAuthUrl: string
  discordUser: DiscordSessionUser | null
}

export function ApplyClient({ membersData, error, discordAuthUrl, discordUser }: ApplyClientProps) {
  const [isHovered, setIsHovered] = useState(false)

  const processSteps = [
    {
      number: 1,
      title: 'Connect with Discord',
      description: 'Sign in with your Discord account'
    },
    {
      number: 2,
      title: 'Complete Application',
      description: 'Tell us about yourself and why you want to join'
    },
    {
      number: 3,
      title: 'Review & Approval',
      description: 'Your application will be reviewed in a few days.'
    },
    {
      number: 4,
      title: 'Access',
      description: 'If approved, complete payment and gain instant Discord access'
    }
  ]

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Fixed background with prism */}
      <div className="fixed inset-0 z-0">
        {/* Prism background */}
        <div className="absolute inset-0">
          <Prism
            height={3.5}
            baseWidth={5.5}
            animationType="rotate"
            glow={1.5}
            noise={0.1}
            transparent={true}
            scale={2.5}
            mobileScale={1.8}
            colorFrequency={1.2}
            bloom={1.2}
          />
        </div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        {/* Darkening overlay for better legibility - 80% opacity */}
        <div className="absolute inset-0 pointer-events-none bg-black/80" />
      </div>

      {/* Navigation */}
      <Navigation
        memberCount={membersData.total}
        discordUser={discordUser}
        discordAuthUrl={discordAuthUrl}
        showAuthActions={false}
      />

      {/* Main content - Split layout */}
      <main className="relative z-10">
        {/* Left side - Content */}
        <div className="lg:w-1/2 min-h-screen lg:flex lg:items-center px-4 sm:px-6 md:px-8 lg:px-12 py-16 pb-32 md:py-24 lg:py-40">
          <div className="max-w-2xl w-full space-y-6">
            {/* Heading */}
            <BlurIn delay={0} duration={800} amount={10}>
              <h1 className="heading text-white">
                How to apply
              </h1>
            </BlurIn>

            {/* Error Message */}
            {error && (
              <BlurIn delay={0} duration={800} amount={8}>
                <div className="rounded-xl overflow-hidden border-l-4 border-red-400 bg-red-500/10 backdrop-blur-sm">
                  <div className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-400 font-medium">
                        {error === 'oauth_failed' && 'Discord authentication failed'}
                        {error === 'missing_code' && 'Invalid authentication response'}
                        {error === 'access_denied' && 'You denied the authentication request'}
                        {!['oauth_failed', 'missing_code', 'access_denied'].includes(error) && 'An error occurred. Please try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              </BlurIn>
            )}

            {/* Process Steps */}
            <div className="space-y-2.5">
              {processSteps.map((step, index) => (
                <BlurIn key={step.number} delay={(error ? 30 : 0) + (index * 30) + 30} duration={800} amount={8}>
                  <div className="rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/30 text-white text-sm font-medium">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </BlurIn>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - ShapeBlur with CTA - Fixed to viewport */}
        <div className="fixed right-0 top-0 w-full lg:w-1/2 h-screen hidden lg:flex items-center justify-center p-12">
          <div
            className="relative w-full max-w-md aspect-square flex justify-center items-center cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Text Layer */}
            <div className="absolute inset-0 flex justify-center items-center z-0">
              <a
                href={discordAuthUrl}
                className="text-center select-none"
              >
                <h1
                  className={`
                    text-3xl sm:text-4xl md:text-5xl font-normal whitespace-nowrap
                    transition-colors duration-200 ease-in-out
                    ${isHovered ? 'text-[#8B93C7]' : 'text-white'}
                  `}
                  style={{ fontFamily: 'var(--font-instrument-serif)', letterSpacing: '-0.04em' }}
                >
                  Continue with Discord
                </h1>
              </a>
            </div>

            {/* ShapeBlur Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <ShapeBlur
                variation={0}
                pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                shapeSize={1.0}
                roundness={0.50}
                borderSize={0.0050}
                circleEdge={1.0}
              />
            </div>
          </div>
        </div>

        {/* Mobile CTA - fixed to bottom on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 px-4 sm:px-6 md:px-8 pb-6 pt-4 bg-gradient-to-t from-black via-black to-transparent">
          <LiquidButton asChild size="xxl" className="w-full text-white font-medium tracking-tight">
            <a href={discordAuthUrl}>
              Continue with Discord
            </a>
          </LiquidButton>
        </div>
      </main>
    </div>
  )
}
