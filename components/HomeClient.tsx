"use client"

import { useState } from 'react'
import Link from 'next/link'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { Navigation } from '@/components/Navigation'
import { MemberSidebar } from '@/components/MemberSidebar'
import Prism from '@/components/ui/prism'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurIn } from '@/components/ui/blur-in'
import type { MembersResponse } from '@/lib/supabase'

interface HomeClientProps {
  membersData: MembersResponse
}

export function HomeClient({ membersData }: HomeClientProps) {
  const [loadingComplete, setLoadingComplete] = useState(false)

  return (
    <>
      <LoadingOverlay onComplete={() => setLoadingComplete(true)} />

      <div
        className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden"
        style={{
          opacity: loadingComplete ? 1 : 0,
          transition: "opacity 0.6s ease-out",
        }}
      >
        {/* Fixed background with prism */}
        <div className="fixed inset-0 z-0">
          {/* Prism background */}
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
          <div className="absolute inset-0 opacity-[0.1] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
          {/* Darkening overlays for better legibility (cheap composite) */}
          <div className="absolute inset-0 pointer-events-none bg-black/40" />
        </div>

        {/* Navigation */}
        <Navigation
          memberCount={membersData.total}
          topMembers={membersData.members.slice(0, 3)}
        />

        {/* Member Sidebar (right side, drawer on mobile) */}
        <MemberSidebar
          members={membersData.members}
          totalCount={membersData.total}
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
                <LiquidButton asChild size="xxl" className="text-white font-medium tracking-tight">
                  <Link href="/apply">Apply to join</Link>
                </LiquidButton>
              </div>
            </section>

            {/* Editorial Section */}
            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                <div className="h-16 md:h-24" /> {/* Spacer */}
                <div className="body text-white space-y-5 md:space-y-6">
                  <BlurIn delay={0} duration={800} amount={10}>
                    <p>Before the Renaissance, craft lived in crowded workshops—the bottegas.</p>
                  </BlurIn>

                  <BlurIn delay={30} duration={800} amount={10}>
                    <p>Paintings were collaborative efforts. The master sketched compositions. Assistants and apprentices ground pigments and painted backgrounds.</p>
                  </BlurIn>

                  <BlurIn delay={60} duration={800} amount={10}>
                    <p>Then everything changed. Renaissance artists broke free from the workshop model and became complete creators—studying anatomy, writing poetry, designing machines.</p>
                  </BlurIn>

                  <BlurIn delay={90} duration={800} amount={10}>
                    <p>They claimed authorship. The center shifted from collective output to the singular creator.</p>
                  </BlurIn>

                  <BlurIn delay={120} duration={800} amount={10}>
                    <p>The same shift is happening now. Code is the marble. The prompt is the chisel. The tools are moving the center again from teams of specialists to single creators.</p>
                  </BlurIn>

                  <BlurIn delay={150} duration={800} amount={10}>
                    <p>One person can build a game, cut a film, build a business, create art, ship an app and publish a book.</p>
                  </BlurIn>

                  <BlurIn delay={180} duration={800} amount={10}>
                    <p>This is not a bottega. It&apos;s a commons for those discovering the ultimate ways of creating and expressing with AI.</p>
                  </BlurIn>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                {/* Feature list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-4">
                  {/* Feature 1 */}
                    <div className="group relative rounded-xl p-6 md:p-8 h-[280px] md:h-[280px] overflow-hidden">
                      {/* Layer 1: Blur + Distortion */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          // Slightly stronger blur on larger surface for perceptual match
                          backdropFilter: 'blur(3px)',
                          filter: 'url(#glass-distortion)',
                          // Transparent backplate ensures backdrop-filter engages consistently
                          background: 'rgba(0,0,0,0.001)',
                          zIndex: 0
                        }}
                      />

                      {/* Layer 2: Shine/Highlight */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                        style={{
                          boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                          zIndex: 1
                        }}
                      />

                      {/* Layer 3: Brightness Overlay */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
                        style={{
                          background: 'rgba(255, 255, 255, 1)',
                          zIndex: 2
                        }}
                      />

                      {/* Layer 4: Edge Glow Border */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
                        style={{
                          zIndex: 3
                        }}
                      />

                      {/* Content */}
                      <BlurIn delay={30} duration={800} amount={8}>
                        <div className="relative h-full flex flex-col justify-between" style={{ zIndex: 20 }}>
                          <div>
                            <h3 className="heading text-white">
                              High-signal chat
                            </h3>
                          </div>
                          <p className="body text-white">
                            Your starting point for finding and sharing new tools, new workflows and new ways of thinking.
                          </p>
                        </div>
                      </BlurIn>
                    </div>

                  {/* Feature 2 */}
                    <div className="group relative rounded-xl p-6 md:p-8 h-[280px] md:h-[320px] overflow-hidden">
                      {/* Layer 1: Blur + Distortion */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          backdropFilter: 'blur(3px)',
                          filter: 'url(#glass-distortion)',
                          background: 'rgba(0,0,0,0.001)',
                          zIndex: 0
                        }}
                      />

                      {/* Layer 2: Shine/Highlight */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                        style={{
                          boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                          zIndex: 1
                        }}
                      />

                      {/* Layer 3: Brightness Overlay */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
                        style={{
                          background: 'rgba(255, 255, 255, 1)',
                          zIndex: 2
                        }}
                      />

                      {/* Layer 4: Edge Glow Border */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
                        style={{
                          zIndex: 3
                        }}
                      />

                      {/* Content */}
                      <BlurIn delay={60} duration={800} amount={8}>
                        <div className="relative h-full flex flex-col justify-between" style={{ zIndex: 20 }}>
                          <div>
                            <h3 className="heading text-white">
                              Shared goals and ambitions
                            </h3>
                          </div>
                          <p className="body text-white">
                            Everyone wants to build, create and express at the bleeding edge.
                          </p>
                        </div>
                      </BlurIn>
                    </div>

                  {/* Feature 3 */}
                    <div className="group relative rounded-xl p-6 md:p-8 h-[280px] md:h-[320px] overflow-hidden">
                      {/* Layer 1: Blur + Distortion */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          backdropFilter: 'blur(3px)',
                          filter: 'url(#glass-distortion)',
                          background: 'rgba(0,0,0,0.001)',
                          zIndex: 0
                        }}
                      />

                      {/* Layer 2: Shine/Highlight */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                        style={{
                          boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                          zIndex: 1
                        }}
                      />

                      {/* Layer 3: Brightness Overlay */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
                        style={{
                          background: 'rgba(255, 255, 255, 1)',
                          zIndex: 2
                        }}
                      />

                      {/* Layer 4: Edge Glow Border */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
                        style={{
                          zIndex: 3
                        }}
                      />

                      {/* Content */}
                      <BlurIn delay={90} duration={800} amount={8}>
                        <div className="relative h-full flex flex-col justify-between" style={{ zIndex: 20 }}>
                          <div>
                            <h3 className="heading text-white">
                              Non-performative
                            </h3>
                          </div>
                          <p className="body text-white">
                            A safe place to show work‑in‑progress without performative Twitter energy. The messy stuff is the good stuff.
                          </p>
                        </div>
                      </BlurIn>
                    </div>

                  {/* Feature 4 */}
                    <div className="group relative rounded-xl p-6 md:p-8 h-[280px] md:h-[320px] overflow-hidden">
                      {/* Layer 1: Blur + Distortion */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          backdropFilter: 'blur(3px)',
                          filter: 'url(#glass-distortion)',
                          background: 'rgba(0,0,0,0.001)',
                          zIndex: 0
                        }}
                      />

                      {/* Layer 2: Shine/Highlight */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                        style={{
                          boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                          zIndex: 1
                        }}
                      />

                      {/* Layer 3: Brightness Overlay */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
                        style={{
                          background: 'rgba(255, 255, 255, 1)',
                          zIndex: 2
                        }}
                      />

                      {/* Layer 4: Edge Glow Border */}
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
                        style={{
                          zIndex: 3
                        }}
                      />

                      {/* Content */}
                      <BlurIn delay={120} duration={800} amount={8}>
                        <div className="relative h-full flex flex-col justify-between" style={{ zIndex: 20 }}>
                          <div>
                            <h3 className="heading text-white">
                              Learning as a side effect
                            </h3>
                          </div>
                          <p className="body text-white">
                            The space moves fast. Skills accrue because the only way to learn is by doing.
                          </p>
                        </div>
                      </BlurIn>
                    </div>
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
                  {/* Q1 */}
                  <BlurIn delay={30} duration={800} amount={8}>
                    <div className="border-b border-dashed border-white/30 py-3">
                      <div className="relative mb-3">
                        <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                          01 ::
                        </span>
                        <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                          How is Tempo different from other blockchains?
                        </h3>
                      </div>
                      <p className="body text-white">
                        Tempo is an EVM-compatible L1 blockchain, purpose-built for payments. It doesn&apos;t displace other general-purpose blockchains; rather, it incorporates design choices that meet the needs of high-volume payment use cases. These include predictable low fees in a dedicated payments lane, stablecoin neutrality, a built-in stablecoin exchange, high throughput, low latency, private transactions, payment memos compatible with standards like ISO 20022, compliance hooks, and more.
                      </p>
                    </div>
                  </BlurIn>

                  {/* Q2 */}
                  <BlurIn delay={60} duration={800} amount={8}>
                    <div className="border-b border-dashed border-white/30 py-3">
                      <div className="relative mb-3">
                        <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                          02 ::
                        </span>
                        <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                          Who can build on Tempo?
                        </h3>
                      </div>
                      <p className="body text-white">
                        Tempo is a neutral, permissionless blockchain open for anyone to build on. We&apos;re currently collaborating with global partners to test various use cases, including cross-border payouts, B2B payments, remittances, and ecommerce. Interested in working with Tempo? Request access to our private testnet <a href="#" className="underline">here</a>.
                      </p>
                    </div>
                  </BlurIn>

                  {/* Q3 */}
                  <BlurIn delay={90} duration={800} amount={8}>
                    <div className="border-b border-dashed border-white/30 py-3">
                      <div className="relative mb-3">
                        <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                          03 ::
                        </span>
                        <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                          When will Tempo launch?
                        </h3>
                      </div>
                      <p className="body text-white">
                        We&apos;re providing select partners with priority access to our testnet now. Contact us <a href="#" className="underline">here</a> if you&apos;re interested.
                      </p>
                    </div>
                  </BlurIn>

                  {/* Q4 */}
                  <BlurIn delay={120} duration={800} amount={8}>
                    <div className="border-b border-dashed border-white/30 py-3">
                      <div className="relative mb-3">
                        <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                          04 ::
                        </span>
                        <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                          Who will run validator nodes?
                        </h3>
                      </div>
                      <p className="body text-white">
                        A diverse group of independent entities, including some of Tempo&apos;s design partners, will run validator nodes initially before we transition to a permissionless model.
                      </p>
                    </div>
                  </BlurIn>
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <section className="px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
              <div className="content-container">
                <BlurIn delay={0} duration={800} amount={12}>
                  <Link
                    href="/apply"
                    className="
                      block
                      border border-dashed border-white rounded-[20px]
                      py-16 md:py-20 lg:py-24
                      text-center
                      heading text-white
                      hover:bg-white/5
                      transition-colors duration-200
                    "
                  >
                    Apply to join
                  </Link>
                </BlurIn>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}
