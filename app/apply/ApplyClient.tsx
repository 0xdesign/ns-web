'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { ShapeBlur } from '@/components/ui/shapeblur'
import { BlurIn } from '@/components/ui/blur-in'
import type { MembersResponse } from '@/lib/supabase'

interface ApplyClientProps {
  membersData: MembersResponse
  error?: string
  discordAuthUrl: string
}

export function ApplyClient({ membersData, error, discordAuthUrl }: ApplyClientProps) {
  const [isHovered, setIsHovered] = useState(false)

  const processSteps = [
    {
      number: 1,
      title: 'Connect with Discord',
      description: 'Sign in with your Discord account to verify your identity'
    },
    {
      number: 2,
      title: 'Complete Application',
      description: 'Tell us about yourself, what you\'re building, and why you want to join'
    },
    {
      number: 3,
      title: 'Review & Approval',
      description: 'Our team will review your application (typically within 2-3 days)'
    },
    {
      number: 4,
      title: 'Payment & Access',
      description: 'If approved, complete payment ($299/month) and gain instant Discord access'
    }
  ]

  const criteria = [
    'Mastery of AI tools and vibe coding workflows',
    'Track record of shipping products and building in public',
    'Creative vision that transcends traditional coding boundaries',
    'Active engagement in technical communities',
    'Commitment to collaborative learning and knowledge sharing'
  ]

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <Navigation
        memberCount={membersData.total}
        topMembers={membersData.members.slice(0, 3)}
      />

      {/* Main content - Split layout */}
      <main className="relative">
        {/* Left side - Content */}
        <div className="lg:w-1/2 px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            {/* Error Message */}
            {error && (
              <BlurIn delay={0} duration={800} amount={8}>
                <div className="rounded-xl overflow-hidden mb-12 border-l-4 border-red-400 bg-red-500/10 backdrop-blur-sm">
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
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <BlurIn key={step.number} delay={(error ? 30 : 0) + (index * 30)} duration={800} amount={8}>
                  <div className="rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                    <div className="flex gap-4 px-6 py-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/30 text-white text-sm font-medium">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white mb-1 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-sm text-white/70 leading-relaxed">
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

        {/* Mobile CTA - shown only on mobile */}
        <div className="lg:hidden px-4 sm:px-6 md:px-8 pb-20">
          <a
            href={discordAuthUrl}
            className="block w-full py-6 text-center text-xl font-normal whitespace-nowrap text-white hover:text-[#8B93C7] bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
            style={{ fontFamily: 'var(--font-instrument-serif)', letterSpacing: '-0.04em' }}
          >
            Continue with Discord
          </a>
        </div>
      </main>
    </div>
  )
}
