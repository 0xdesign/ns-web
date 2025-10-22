'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurIn } from '@/components/ui/blur-in'
import Prism from '@/components/ui/prism'
import { GlassCard } from '@/components/ui/glass-card'
import type { MembersResponse } from '@/lib/supabase'
import type { DiscordSessionUser } from '@/lib/current-user'
import { APPLY_FORM_DRAFT_STORAGE_KEY } from '@/lib/storage-keys'

interface SuccessClientProps {
  membersData: MembersResponse | null | undefined
  discordUser: DiscordSessionUser | null
  discordAuthUrl: string
  navigationAuthUrls?: {
    disconnect?: string
    switchAccount?: string
  }
}

export function SuccessClient({
  membersData,
  discordUser,
  discordAuthUrl,
  navigationAuthUrls,
}: SuccessClientProps) {
  const memberCount = membersData?.total ?? 0
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.sessionStorage.removeItem(APPLY_FORM_DRAFT_STORAGE_KEY)
  }, [])
  const nextSteps = [
    {
      number: 1,
      title: 'Application Review',
      description: 'Our team will carefully review your application. We evaluate based on your demonstrated expertise with AI tools, track record of building, and alignment with our community values.'
    },
    {
      number: 2,
      title: 'Decision (2-3 Days)',
      description: 'You\'ll receive an email with our decision typically within 2-3 business days. If approved, the email will include a secure payment link.'
    },
    {
      number: 3,
      title: 'Payment & Access',
      description: 'Complete payment ($299/month) through the secure link. Your Discord role will be assigned automatically within minutes, granting you instant access to all channels.'
    }
  ]

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Fixed background with prism */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0">
          <Prism
            height={3.5}
            baseWidth={5.5}
            animationType="scroll"
            glow={1.5}
            noise={0.1}
            transparent={true}
            scale={2.5}
            mobileScale={1.8}
            colorFrequency={1.2}
            bloom={1.2}
            scrollSensitivity={1.5}
          />
        </div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        {/* Darkening overlays for better legibility */}
        <div className="absolute inset-0 pointer-events-none bg-black/20" />
        <div className="absolute inset-0 pointer-events-none bg-black/10" />
      </div>

      {/* Navigation */}
      <Navigation
        memberCount={memberCount}
        discordUser={discordUser}
        discordAuthUrl={discordAuthUrl}
        authUrls={navigationAuthUrls}
      />

      {/* Main content */}
      <main className="relative z-10">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
          <div className="content-container">
            {/* Success Icon & Heading */}
            <div className="mb-16 md:mb-20 text-center">
              <BlurIn delay={0} duration={800} amount={15}>
                <div className="mx-auto flex h-20 w-20 md:h-24 md:w-24 items-center justify-center mb-8">
                  <svg
                    className="h-full w-full text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </BlurIn>

              <BlurIn delay={30} duration={800} amount={12}>
                <h1 className="display text-white mb-6">Application Submitted!</h1>
              </BlurIn>

              <BlurIn delay={60} duration={800} amount={10}>
                <p className="body text-white">
                  Thank you for applying to join our community
                </p>
              </BlurIn>
            </div>

            {/* Next Steps */}
            <div className="mb-12 md:mb-16">
              <BlurIn delay={90} duration={800} amount={10}>
                <h2 className="heading text-white mb-8 md:mb-12">What Happens Next?</h2>
              </BlurIn>

              <div className="space-y-4">
                {nextSteps.map((step, index) => (
                  <BlurIn key={step.number} delay={120 + index * 30} duration={800} amount={8}>
                    <GlassCard className="rounded-xl" contentClassName="flex gap-4 px-6 py-4">
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
                    </GlassCard>
                  </BlurIn>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <BlurIn delay={210} duration={800} amount={8}>
              <GlassCard
                className="mb-12 rounded-xl md:mb-16"
                contentClassName="px-6 py-4 border-l-4 border-blue-400"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="h-6 w-6 text-blue-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-2">Check Your Email</h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Make sure to check your spam folder if you don&apos;t see our email. Add our email address to your contacts to ensure future communications reach your inbox.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </BlurIn>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <BlurIn delay={240} duration={800} amount={10}>
                <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
              </BlurIn>
              <BlurIn delay={270} duration={800} amount={10}>
                <LiquidButton asChild size="lg" className="text-white font-medium tracking-tight">
                  <Link href="/members">Browse Members</Link>
                </LiquidButton>
              </BlurIn>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
