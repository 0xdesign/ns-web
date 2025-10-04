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
          <section className="min-h-screen flex flex-col justify-center px-[18px] py-32">
            <div className="max-w-[600px]">
              <h1 className="text-[42px] leading-[34.44px] font-normal tracking-[-2.94px] text-white mb-6">
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
          <section className="min-h-screen flex flex-col justify-center px-[18px] py-32">
            <div className="max-w-[600px] space-y-3.5">
              <div className="h-[100px]" /> {/* Spacer matching Figma */}
              <div className="text-[15px] leading-[1.4] tracking-[-0.3px] text-white space-y-[1em]">
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
          <section className="min-h-screen px-[18px] py-32">
            <div className="max-w-[600px]">
              {/* Heading */}
              <div className="pt-[78px] pb-[30px]">
                <h2 className="text-[40px] leading-[33.2px] font-normal tracking-[-2.8px] text-white">
                  Transform how<br />your business<br />moves money
                </h2>
              </div>

              {/* Feature list */}
              <div className="space-y-0">
                {/* Feature 1 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5">
                    <span className="absolute -left-7 top-1/2 -translate-y-1/2 text-[12.9px] tracking-[-0.28px] text-white/70">
                      01 ::
                    </span>
                    <h3 className="text-[13.9px] font-bold leading-[15.4px] tracking-[-0.28px] text-white">
                      High-signal chat
                    </h3>
                  </div>
                  <p className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    Your starting point for finding and sharing new tools, new workflows and new ways of thinking.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5">
                    <span className="absolute -left-7 top-1/2 -translate-y-1/2 text-[12.6px] tracking-[-0.28px] text-white/70">
                      02 ::
                    </span>
                    <h3 className="text-[14px] font-bold leading-[15.4px] tracking-[-0.28px] text-white">
                      Shared goals and ambitions
                    </h3>
                  </div>
                  <p className="text-[13.7px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    Everyone wants to build, create and express at the bleeding edge.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5">
                    <span className="absolute -left-7 top-1/2 -translate-y-1/2 text-[12.4px] tracking-[-0.28px] text-white/70">
                      03 ::
                    </span>
                    <h3 className="text-[13.8px] font-bold leading-[15.4px] tracking-[-0.28px] text-white">
                      Non-performative
                    </h3>
                  </div>
                  <p className="text-[13.9px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    A safe place to show work‑in‑progress without performative Twitter energy. The messy stuff is the good stuff.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5">
                    <span className="absolute -left-7 top-1/2 -translate-y-1/2 text-[12.9px] tracking-[-0.28px] text-white/70">
                      04 ::
                    </span>
                    <h3 className="text-[14px] font-bold leading-[15.4px] tracking-[-0.28px] text-white">
                      Learning as a side effect
                    </h3>
                  </div>
                  <p className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    The space moves fast. Skills accrue because the only way to learn is by doing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="min-h-screen px-[18px] py-32">
            <div className="max-w-[600px]">
              {/* Heading */}
              <div className="pt-[78px] pb-[30px]">
                <h2 className="text-[38.9px] leading-[33.2px] font-normal tracking-[-2.8px] text-white">
                  Frequently<br />asked questions
                </h2>
              </div>

              {/* FAQ list */}
              <div className="space-y-0">
                {/* Q1 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5 pb-2.5">
                    <span className="absolute -left-7 top-[7.7px] -translate-y-1/2 text-[12.9px] tracking-[-0.28px] text-white/70">
                      01 ::
                    </span>
                    <h3 className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white">
                      How is Tempo different from other<br />blockchains?
                    </h3>
                  </div>
                  <div className="text-[13.8px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    <p>Tempo is an EVM-compatible L1<br />blockchain, purpose-built for<br />payments. It doesn&apos;t displace other<br />general-purpose blockchains; rather,<br />it incorporates design choices that<br />meet the needs of high-volume<br />payment use cases. These include<br />predictable low fees in a dedicated<br />payments lane, stablecoin neutrality,<br />a built-in stablecoin exchange, high<br />throughput, low latency, private<br />transactions, payment memos<br />compatible with standards like ISO<br />20022, compliance hooks, and more.</p>
                  </div>
                </div>

                {/* Q2 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5 pb-2.5">
                    <span className="absolute -left-7 top-[7.7px] -translate-y-1/2 text-[12.6px] tracking-[-0.28px] text-white/70">
                      02 ::
                    </span>
                    <h3 className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white">
                      Who can build on Tempo?
                    </h3>
                  </div>
                  <div className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    <p>Tempo is a neutral, permissionless<br />blockchain open for anyone to build<br />on. We&apos;re currently collaborating<br />with global partners to test various<br />use cases, including cross-border<br />payouts, B2B payments, remittances,<br />and ecommerce. Interested in<br />working with Tempo? Request access<br />to our private testnet{' '}
                      <a href="#" className="underline">here</a>.
                    </p>
                  </div>
                </div>

                {/* Q3 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5 pb-2.5">
                    <span className="absolute -left-7 top-[7.7px] -translate-y-1/2 text-[12.4px] tracking-[-0.28px] text-white/70">
                      03 ::
                    </span>
                    <h3 className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white">
                      When will Tempo launch?
                    </h3>
                  </div>
                  <div className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    <p>We&apos;re providing select partners with<br />priority access to our testnet now.<br />Contact us{' '}
                      <a href="#" className="underline">here</a>{' '}
                      if you&apos;re interested.
                    </p>
                  </div>
                </div>

                {/* Q4 */}
                <div className="border-b border-dashed border-white/30 pb-[11px] pt-[10px] pr-[30px]">
                  <div className="relative mb-2.5 pb-2.5">
                    <span className="absolute -left-7 top-[7.7px] -translate-y-1/2 text-[12.9px] tracking-[-0.28px] text-white/70">
                      04 ::
                    </span>
                    <h3 className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white">
                      Who will run validator nodes?
                    </h3>
                  </div>
                  <div className="text-[14px] leading-[15.4px] tracking-[-0.28px] text-white pl-[26px]">
                    <p>A diverse group of independent<br />entities, including some of Tempo&apos;s<br />design partners, will run validator<br />nodes initially before we transition to<br />a permissionless model.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="px-[18px] py-32">
            <div className="max-w-full px-[18px]">
              <Link
                href="/apply"
                className="
                  block
                  border border-dashed border-white rounded-[20px]
                  py-32
                  text-center
                  text-[40px] leading-[32.8px] font-normal tracking-[-2.8px] text-white
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
