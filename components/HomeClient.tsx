"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { Navigation } from '@/components/Navigation'
import { MemberSidebar } from '@/components/MemberSidebar'
import { MemberDock } from '@/components/MemberDock'
import Prism from '@/components/ui/prism'
import { ShapeBlur } from '@/components/ui/ShapeBlur'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurIn } from '@/components/ui/blur-in'
import type { MembersResponse, DailyDigest } from '@/lib/supabase'
import { DailyDigestCard } from '@/components/DailyDigestCard'
import { hasVisited, markVisited } from '@/lib/visit-cache'
import type { DiscordSessionUser } from '@/lib/current-user'

interface HomeClientProps {
  membersData: MembersResponse
  latestDigest: DailyDigest | null
  discordUser: DiscordSessionUser | null
  discordAuthUrl: string
}

export function HomeClient({ membersData, latestDigest, discordUser, discordAuthUrl }: HomeClientProps) {
  // Initialize state with localStorage check (prevents flash on return visits)
  const [loadingComplete, setLoadingComplete] = useState(() => hasVisited())
  const [showLoader, setShowLoader] = useState(() => !hasVisited())
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const handleLoadingComplete = () => {
    setLoadingComplete(true)
    setShowLoader(false)
    markVisited()
  }

  const topMembers = membersData.members?.slice(0, 3) ?? []

  const faqItems = [
    {
      question: 'Who is a strong fit for the community?',
      answer:
        'People actively building with AI. Designers, writers, founders, engineers, researchers, artists—anyone using AI to create.',
      delay: 30,
    },
    {
      question: 'Do I need to be technical or know how to code?',
      answer:
        'No. The only skill that matters is a willingness to make useful things with AI and grow that skillset.',
      delay: 60,
    },
    {
      question: 'What kinds of backgrounds do members have?',
      answer:
        'Product designers, indie founders, content creators, writers, researchers, engineers, artists. The common thread: they\'re all using AI daily to build real projects. Some code, some don\'t.',
      delay: 90,
    },
    {
      question: 'What do members get access to?',
      answer:
        'A private Discord with people who create with AI and will share what actually works. You can ask the group for help or advice, share new insights and workflows, or simply discuss trends.',
      delay: 120,
    },
    {
      question: 'How active do I need to be?',
      answer:
        'As much as you can. You\'ll get out what you put in.',
      delay: 150,
    },
    {
      question: 'What does membership cost?',
      answer:
        '$199/month, billed monthly through Stripe. You can cancel anytime. If you run into billing issues or need help, 0xdesigner will sort it out on Discord. Access continues through your current billing period even if you cancel.',
      delay: 180,
    },
    {
      question: 'What if I want to cancel or get a refund?',
      answer:
        'If after 7 days you\'re not having a great experience, you\'ll get a full refund. No questions asked.',
      delay: 210,
    },
  ] as const

  // Memoize Prism to prevent WebGL context recreation
  const prismComponent = useMemo(
    () => (
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
    ),
    []
  )

  return (
    <>
      {showLoader && <LoadingOverlay onComplete={handleLoadingComplete} />}

      <div
        className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden"
        style={{
          opacity: loadingComplete ? 1 : 0,
          transition: "opacity 0.6s ease-out",
        }}
      >
        {/* Fixed background with prism */}
        <div className="fixed inset-0 z-0 isolate">
          {/* Prism background */}
          <div className="absolute inset-0 z-0">
            {prismComponent}
          </div>
          {/* Subtle noise texture */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.1] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
          {/* Darkening overlays for better legibility (cheap composite) */}
          {/* transform-gpu forces compositing layer for Safari WebGL stacking */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-black/40 transform-gpu" />
        </div>

        {/* Navigation */}
        <Navigation
          memberCount={membersData.total}
          showMemberCount
          discordUser={discordUser}
          discordAuthUrl={discordAuthUrl}
          showAuthActions
          loginLabel="Log in"
          dashboardHref="/dashboard"
          dashboardLabel="Dashboard"
          logoutUrl="/api/auth/discord/logout?redirect=/"
        />

        {/* Member Sidebar (desktop right side, mobile bottom sheet) */}
        <MemberSidebar
          members={membersData.members}
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
        />

        {/* Member Dock (mobile only) */}
        <MemberDock
          memberCount={membersData.total}
          topMembers={topMembers}
          isBottomSheetOpen={isBottomSheetOpen}
          onFacepileClick={() => setIsBottomSheetOpen(true)}
        />

        {/* Main content area */}
        <main className="relative z-10">
          {/* Content container with right margin for sidebar on desktop */}
          <div className="md:mr-[280px]">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                <h1 className="display text-white mb-6">
                  A home for next-gen creators
                </h1>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <LiquidButton asChild size="xxl" className="text-white font-medium tracking-tight">
                    <Link href="/apply">Apply to join</Link>
                  </LiquidButton>
                </div>
              </div>
            </section>

            {/* Editorial Section */}
            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                <div className="h-16 md:h-24" /> {/* Spacer */}
                <div className="body text-white space-y-5 md:space-y-6">
                  <BlurIn delay={0} duration={800} amount={10}>
                    <p>AI generates the block. You wield the rasp.</p>
                  </BlurIn>

                  <BlurIn delay={30} duration={800} amount={10}>
                    <p>Prompts produce abundant material—text, images, videos and code. But output is generic, unfocused, overly smooth. Your craft is finding form through deliberate shaping.</p>
                  </BlurIn>

                  <BlurIn delay={60} duration={800} amount={10}>
                    <p>Anyone can prompt AI. Shaping it into something useful requires judgment, taste and technique. There is no right or wrong way, and method is always changing.</p>
                  </BlurIn>

                  <BlurIn delay={90} duration={800} amount={10}>
                    <p>This is a commons for creators discovering the ultimate ways of creating and expressing with AI.</p>
                  </BlurIn>
                </div>

                {/* Daily Digest Card - Integrated within Editorial */}
                <div className="mt-12 md:mt-16">
                  <DailyDigestCard digest={latestDigest} />
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                {/* Heading */}
                <BlurIn delay={0} duration={800} amount={15}>
                  <div className="mb-12 md:mb-16">
                    <h2 className="heading text-white">
                      Frequently asked questions
                    </h2>
                  </div>
                </BlurIn>

                {/* FAQ list */}
                <div className="space-y-0">
                  {faqItems.map((item) => (
                    <BlurIn key={item.question} delay={item.delay} duration={800} amount={8}>
                      <div className="border-b border-dashed border-white/30 py-3">
                        <div className="mb-3">
                          <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                            {item.question}
                          </h3>
                        </div>
                        <p className="body text-white">
                          {item.answer}
                        </p>
                      </div>
                    </BlurIn>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom CTA - hidden on mobile where dock is visible */}
            <section className="hidden md:block px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                <BlurIn delay={0} duration={800} amount={12}>
                  <div className="relative w-full overflow-hidden rounded-[20px] cursor-pointer">
                    {/* Text Layer (with padding to match original button size) */}
                    <div className="relative z-10 py-16 md:py-20 lg:py-24 flex justify-center items-center pointer-events-none">
                      <h2 className="heading text-center select-none text-white">
                        Apply to join
                      </h2>
                    </div>

                    {/* ShapeBlur Layer */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <ShapeBlur
                        variation={0}
                        pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                        shapeSize={2.0}
                        roundness={0.5}
                        borderSize={0.01}
                        circleEdge={3.0}
                      />
                    </div>

                    {/* Clickable Overlay */}
                    <Link href="/apply" className="absolute inset-0 z-20" aria-label="Apply to join" />
                  </div>
                </BlurIn>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}
