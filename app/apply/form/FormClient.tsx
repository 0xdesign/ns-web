'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurIn } from '@/components/ui/blur-in'
import Prism from '@/components/ui/prism'
import type { MembersResponse } from '@/lib/supabase'
import type { ApplyFormState } from './actions'
import { submitApplication } from './actions'

interface FormClientProps {
  membersData: MembersResponse
}

export function FormClient({ membersData }: FormClientProps) {
  const [formData, setFormData] = useState({
    email: '',
    why_join: '',
    what_building: '',
    social_links: [''],
  })
  const [state, formAction] = useActionState<ApplyFormState, FormData>(
    async (prevState: ApplyFormState, formData: FormData) => {
      const result = await submitApplication(prevState, formData)
      return result || {}
    },
    {}
  )

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.social_links]
    newLinks[index] = value
    setFormData({ ...formData, social_links: newLinks })
  }

  const addSocialLink = () => {
    if (formData.social_links.length < 5) {
      setFormData({
        ...formData,
        social_links: [...formData.social_links, ''],
      })
    }
  }

  const removeSocialLink = (index: number) => {
    if (formData.social_links.length > 1) {
      const newLinks = formData.social_links.filter((_, i) => i !== index)
      setFormData({ ...formData, social_links: newLinks })
    }
  }

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <LiquidButton
        type="submit"
        disabled={pending}
        size="lg"
        className="text-white font-medium tracking-tight"
      >
        {pending ? 'Submitting...' : 'Submit Application'}
      </LiquidButton>
    )
  }

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
        memberCount={membersData.total}
        topMembers={membersData.members.slice(0, 3)}
      />

      {/* Main content */}
      <main className="relative z-10">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-20 md:py-32 lg:py-40">
          <div className="content-container">
            {/* Hero Section */}
            <div className="mb-12 md:mb-16">
              <BlurIn delay={0} duration={800} amount={12}>
                <h1 className="heading text-white mb-4">Complete Your Application</h1>
              </BlurIn>
              <BlurIn delay={30} duration={800} amount={10}>
                <p className="body text-white">
                  Tell us about yourself and what you&apos;re building
                </p>
              </BlurIn>
            </div>

            {/* Global Error */}
            {state?.submitError && (
              <BlurIn delay={60} duration={800} amount={8}>
                <div className="group relative rounded-xl overflow-hidden mb-8">
                  {/* Liquid glass layers */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      backdropFilter: 'blur(2px)',
                      filter: 'url(#glass-distortion)',
                      zIndex: 0
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                      zIndex: 1
                    }}
                  />

                  {/* Content */}
                  <div className="relative px-6 py-4 border-l-4 border-red-400" style={{ zIndex: 20 }}>
                    <p className="text-sm text-red-400 font-medium">{state.submitError}</p>
                  </div>
                </div>
              </BlurIn>
            )}

            {/* Form */}
            <BlurIn delay={state?.submitError ? 90 : 60} duration={800} amount={8}>
              <div className="group relative rounded-xl overflow-hidden">
                {/* Liquid glass layers for form container */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    backdropFilter: 'blur(2px)',
                    filter: 'url(#glass-distortion)',
                    zIndex: 0
                  }}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                    zIndex: 1
                  }}
                />

                {/* Form Content */}
                <form action={formAction} className="relative space-y-8 px-6 py-8 md:px-8 md:py-10" style={{ zIndex: 20 }}>
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full rounded-lg px-4 py-3 text-white placeholder-white/40 bg-white/5 border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:outline-none backdrop-blur-sm transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                    {state?.errors?.email && (
                      <p className="mt-2 text-sm text-red-400">{state.errors.email[0]}</p>
                    )}
                  </div>

                  {/* Why Join */}
                  <div>
                    <label htmlFor="why_join" className="block text-sm font-medium text-white mb-2">
                      Why do you want to join this community? *
                    </label>
                    <p className="text-sm text-white/55 mb-2">
                      Minimum 50 characters. Tell us what draws you to this community.
                    </p>
                    <textarea
                      id="why_join"
                      name="why_join"
                      rows={5}
                      value={formData.why_join}
                      onChange={(e) => setFormData({ ...formData, why_join: e.target.value })}
                      className="block w-full rounded-lg px-4 py-3 text-white placeholder-white/40 bg-white/5 border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:outline-none backdrop-blur-sm transition-colors resize-none"
                      placeholder="Share your motivation..."
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-white/55">
                        {formData.why_join.length}/1000 characters
                      </p>
                      {state?.errors?.why_join && (
                        <p className="text-sm text-red-400">{state.errors.why_join[0]}</p>
                      )}
                    </div>
                  </div>

                  {/* What Building */}
                  <div>
                    <label htmlFor="what_building" className="block text-sm font-medium text-white mb-2">
                      What are you currently building? *
                    </label>
                    <p className="text-sm text-white/55 mb-2">
                      Minimum 50 characters. Share your current projects, ideas, or experiments.
                    </p>
                    <textarea
                      id="what_building"
                      name="what_building"
                      rows={5}
                      value={formData.what_building}
                      onChange={(e) => setFormData({ ...formData, what_building: e.target.value })}
                      className="block w-full rounded-lg px-4 py-3 text-white placeholder-white/40 bg-white/5 border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:outline-none backdrop-blur-sm transition-colors resize-none"
                      placeholder="Describe your projects..."
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-white/55">
                        {formData.what_building.length}/1000 characters
                      </p>
                      {state?.errors?.what_building && (
                        <p className="text-sm text-red-400">{state.errors.what_building[0]}</p>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Social Links *
                    </label>
                    <p className="text-sm text-white/55 mb-3">
                      Add links to your GitHub, Twitter, portfolio, or other profiles (minimum 1, maximum 5)
                    </p>
                    <div className="space-y-3">
                      {formData.social_links.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            name="social_links"
                            value={link}
                            onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                            placeholder="https://github.com/username"
                            className="block w-full rounded-lg px-4 py-3 text-white placeholder-white/40 bg-white/5 border border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:outline-none backdrop-blur-sm transition-colors"
                          />
                          {formData.social_links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSocialLink(index)}
                              className="flex-shrink-0 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.social_links.length < 5 && (
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="mt-3 text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add another link
                      </button>
                    )}
                    {state?.errors?.social_links && (
                      <p className="mt-2 text-sm text-red-400">{state.errors.social_links[0]}</p>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
                    <Link
                      href="/apply"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Cancel
                    </Link>
                    <SubmitButton />
                  </div>
                </form>
              </div>
            </BlurIn>
          </div>
        </div>
      </main>
    </div>
  )
}
