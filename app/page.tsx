import Link from 'next/link'
import { getMembers } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { MemberSidebar } from '@/components/MemberSidebar'
import Prism from '@/components/ui/prism'

export default async function Home() {
  const membersData = await getMembers()

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Fixed background with prism */}
      <div className="fixed inset-0 z-0">
        {/* Prism background */}
        <div className="absolute inset-0">
          <Prism
            height={3.5}
            baseWidth={5.5}
            animationType="3drotate"
            glow={1.5}
            noise={0.1}
            transparent={true}
            scale={2.5}
            colorFrequency={1.2}
            timeScale={0.3}
            bloom={1.2}
          />
        </div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
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
            <div className="max-w-[600px]">
              <h1 className="text-[42px] leading-tight font-normal tracking-[-2.94px] text-white mb-6">
                A home for next-gen creators
              </h1>
              <Link
                href="/apply"
                className="
                  inline-block
                  backdrop-blur-[3px] bg-white/10 hover:bg-white/20
                  border-[1.33px] border-white rounded-[48px]
                  px-8 py-4
                  text-sm font-medium text-white tracking-tight
                  transition-all duration-200
                  hover:scale-105
                "
              >
                Apply to join
              </Link>
            </div>
          </section>

          {/* Editorial Section */}
          <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
            <div className="max-w-[600px]">
              <div className="h-16 md:h-24" /> {/* Spacer */}
              <div className="text-base leading-relaxed tracking-tight text-white space-y-5 md:text-lg md:leading-relaxed md:space-y-6">
                <p>Before the Renaissance, craft lived in crowded workshops—the bottegas.</p>

                <p>Paintings were collaborative efforts. The master sketched compositions. Assistants and apprentices ground pigments and painted backgrounds.</p>

                <p>Then everything changed. Renaissance artists broke free from the workshop model and became complete creators—studying anatomy, writing poetry, designing machines.</p>

                <p>They claimed authorship. The center shifted from collective output to the singular creator.</p>

                <p>The same shift is happening now. Code is the marble. The prompt is the chisel. The tools are moving the center again from teams of specialists to single creators.</p>

                <p>One person can build a game, cut a film, build a business, create art, ship an app and publish a book.</p>

                <p>This is not a bottega. It&apos;s a commons for those discovering the ultimate ways of creating and expressing with AI.</p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
            <div className="max-w-[600px]">
              {/* Heading */}
              <div className="mb-12 md:mb-16">
                <h2 className="text-4xl leading-tight font-normal tracking-[-2.8px] text-white">
                  Transform how<br />your business<br />moves money
                </h2>
              </div>

              {/* Feature list */}
              <div className="space-y-0">
                {/* Feature 1 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      01 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      High-signal chat
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    Your starting point for finding and sharing new tools, new workflows and new ways of thinking.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      02 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      Shared goals and ambitions
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    Everyone wants to build, create and express at the bleeding edge.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      03 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      Non-performative
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    A safe place to show work‑in‑progress without performative Twitter energy. The messy stuff is the good stuff.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      04 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      Learning as a side effect
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    The space moves fast. Skills accrue because the only way to learn is by doing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
            <div className="max-w-[600px]">
              {/* Heading */}
              <div className="mb-12 md:mb-16">
                <h2 className="text-4xl leading-tight font-normal tracking-[-2.8px] text-white">
                  Frequently<br />asked questions
                </h2>
              </div>

              {/* FAQ list */}
              <div className="space-y-0">
                {/* Q1 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      01 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      How is Tempo different from other<br />blockchains?
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    Tempo is an EVM-compatible L1 blockchain, purpose-built for payments. It doesn&apos;t displace other general-purpose blockchains; rather, it incorporates design choices that meet the needs of high-volume payment use cases. These include predictable low fees in a dedicated payments lane, stablecoin neutrality, a built-in stablecoin exchange, high throughput, low latency, private transactions, payment memos compatible with standards like ISO 20022, compliance hooks, and more.
                  </p>
                </div>

                {/* Q2 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      02 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      Who can build on Tempo?
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    Tempo is a neutral, permissionless blockchain open for anyone to build on. We&apos;re currently collaborating with global partners to test various use cases, including cross-border payouts, B2B payments, remittances, and ecommerce. Interested in working with Tempo? Request access to our private testnet <a href="#" className="underline">here</a>.
                  </p>
                </div>

                {/* Q3 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      03 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      When will Tempo launch?
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    We&apos;re providing select partners with priority access to our testnet now. Contact us <a href="#" className="underline">here</a> if you&apos;re interested.
                  </p>
                </div>

                {/* Q4 */}
                <div className="border-b border-dashed border-white/30 py-3">
                  <div className="relative mb-3">
                    <span className="absolute -left-7 md:-left-8 top-1/2 -translate-y-1/2 text-xs tracking-tight text-white/70">
                      04 ::
                    </span>
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-white md:text-base">
                      Who will run validator nodes?
                    </h3>
                  </div>
                  <p className="text-sm leading-normal tracking-tight text-white md:text-base md:leading-relaxed">
                    A diverse group of independent entities, including some of Tempo&apos;s design partners, will run validator nodes initially before we transition to a permissionless model.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
            <div className="max-w-[600px]">
              <Link
                href="/apply"
                className="
                  block
                  border border-dashed border-white rounded-[20px]
                  py-16 md:py-20 lg:py-24
                  text-center
                  text-4xl leading-tight font-normal tracking-[-2.8px] text-white
                  hover:bg-white/5
                  transition-colors duration-200
                "
              >
                Apply to join
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
