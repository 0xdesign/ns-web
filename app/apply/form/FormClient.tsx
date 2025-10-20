'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { BlurIn } from '@/components/ui/blur-in'
import { GlassCard } from '@/components/ui/glass-card'
import Prism from '@/components/ui/prism'
import { EXPERIENCE_LEVELS, type ExperienceLevel } from '@/lib/experience-levels'
import type { MembersResponse } from '@/lib/supabase'
import type { ApplyFormState } from './actions'
import { submitApplication } from './actions'

type SocialLinkType = 'twitter' | 'github' | 'instagram' | 'portfolio'

type SocialLinkEntry = {
  id: string
  type: SocialLinkType
  value: string
}

const SOCIAL_LINK_CONFIG: Record<
  SocialLinkType,
  { label: string; placeholder: string; defaultValue: string }
> = {
  twitter: {
    label: 'Twitter / X',
    placeholder: 'https://x.com/username',
    defaultValue: 'https://x.com/',
  },
  github: {
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    defaultValue: 'https://github.com/',
  },
  instagram: {
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    defaultValue: 'https://instagram.com/',
  },
  portfolio: {
    label: 'Project or Portfolio',
    placeholder: 'https://your-project.com',
    defaultValue: '',
  },
}

const createSocialLink = (type: SocialLinkType): SocialLinkEntry => ({
  id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
  type,
  value: SOCIAL_LINK_CONFIG[type].defaultValue,
})

type ProjectLinkEntry = {
  id: string
  value: string
}

const createProjectLink = (): ProjectLinkEntry => ({
  id: `project-${Math.random().toString(36).slice(2, 9)}`,
  value: '',
})

interface FormClientProps {
  membersData: MembersResponse
}

export function FormClient({ membersData }: FormClientProps) {
  const [formData, setFormData] = useState({
    email: '',
    why_join: '',
    what_building: '',
  })
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    EXPERIENCE_LEVELS[0].value
  )
  const [socialLinks, setSocialLinks] = useState<SocialLinkEntry[]>(() => [
    createSocialLink('twitter'),
  ])
  const [projectLinks, setProjectLinks] = useState<ProjectLinkEntry[]>([])
  const [showLinkOptions, setShowLinkOptions] = useState(false)
  const [state, formAction] = useActionState<ApplyFormState, FormData>(
    async (prevState: ApplyFormState, formData: FormData) => {
      const result = await submitApplication(prevState, formData)
      return result || {}
    },
    {}
  )

  const getErrors = (field: string): string[] => {
    if (!state?.errors) return []
    return Object.entries(state.errors)
      .filter(([key]) => key === field || key.startsWith(`${field}.`))
      .flatMap(([, messages]) => messages)
  }

  const handleSocialLinkChange = (id: string, value: string) => {
    setSocialLinks((links) =>
      links.map((link) => (link.id === id ? { ...link, value } : link))
    )
  }

  const addSocialLink = (type: SocialLinkType) => {
    setSocialLinks((links) => {
      if (links.length >= 5) {
        return links
      }
      if (type !== 'portfolio' && links.some((link) => link.type === type)) {
        return links
      }
      return [...links, createSocialLink(type)]
    })
    setShowLinkOptions(false)
  }

  const removeSocialLink = (id: string) => {
    setSocialLinks((links) => {
      if (links.length <= 1) {
        return links
      }
      return links.filter((link) => link.id !== id)
    })
  }

  const handleProjectLinkChange = (id: string, value: string) => {
    setProjectLinks((links) =>
      links.map((link) => (link.id === id ? { ...link, value } : link))
    )
  }

  const addProjectLink = () => {
    setProjectLinks((links) => {
      if (links.length >= 5) {
        return links
      }
      return [...links, createProjectLink()]
    })
  }

  const removeProjectLink = (id: string) => {
    setProjectLinks((links) => links.filter((link) => link.id !== id))
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

  function CharacterProgress({
    current,
    min,
    max,
  }: {
    current: number
    min: number
    max: number
  }) {
    const progress = Math.max(0, Math.min(1, current / max))
    const minPercent = Math.max(0, Math.min(1, min / max)) * 100
    const meetsMinimum = current >= min
    const barColor = meetsMinimum ? 'bg-emerald-400' : 'bg-white/60'
    const markerColor = meetsMinimum ? 'bg-emerald-500' : 'bg-white/80'

    return (
      <div className="mt-3 space-y-2">
        <div className="relative">
          <div className="relative h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${barColor}`}
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute inset-y-0"
              style={{ left: `calc(${minPercent}% - 1px)` }}
            >
              <div className={`h-full w-0.5 ${markerColor}`} />
            </div>
          </div>
          <div
            className="pointer-events-none absolute top-full mt-1 flex -translate-x-1/2 text-[10px] uppercase tracking-wide text-white/60"
            style={{ left: `${minPercent}%` }}
          >
            Min {min}
          </div>
        </div>
      </div>
    )
  }

  const socialLinkErrors = getErrors('social_links')
  const projectLinkErrors = getErrors('project_links')
  const experienceErrors = getErrors('experience_level')

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
      <Navigation memberCount={membersData.total} />

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
                <GlassCard
                  className="mb-8 rounded-xl"
                  contentClassName="px-6 py-4 border-l-4 border-red-400"
                >
                  <p className="text-sm font-medium text-red-400">{state.submitError}</p>
                </GlassCard>
              </BlurIn>
            )}

            {/* Form */}
            <BlurIn delay={state?.submitError ? 90 : 60} duration={800} amount={8}>
              <div className="rounded-xl border border-white/10 bg-neutral-900/80 px-6 py-8 md:px-8 md:py-10">
                <form action={formAction} className="space-y-8">
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
                      Why do you want to join? *
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
                    <CharacterProgress current={formData.why_join.length} min={50} max={1000} />
                    {state?.errors?.why_join && (
                      <p className="mt-2 text-sm text-red-400">{state.errors.why_join[0]}</p>
                    )}
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
                    <CharacterProgress current={formData.what_building.length} min={50} max={1000} />
                    {state?.errors?.what_building && (
                      <p className="mt-2 text-sm text-red-400">{state.errors.what_building[0]}</p>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      What&apos;s your experience level creating with AI? *
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {EXPERIENCE_LEVELS.map((option) => {
                        const isSelected = experienceLevel === option.value
                        return (
                          <label
                            key={option.value}
                            className={`relative flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                              isSelected
                                ? 'border-white/60 bg-white/10'
                                : 'border-white/15 bg-white/5 hover:border-white/35'
                            }`}
                          >
                            <input
                              type="radio"
                              name="experience_level"
                              value={option.value}
                              checked={isSelected}
                              onChange={() => setExperienceLevel(option.value)}
                              className="sr-only"
                              required
                            />
                            <span
                              className={`mt-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                                isSelected ? 'border-white bg-white' : 'border-white/40'
                              }`}
                              aria-hidden="true"
                            >
                              {isSelected && <span className="h-2 w-2 rounded-full bg-neutral-900" />}
                            </span>
                            <span className="flex flex-col text-left">
                              <span className="text-sm font-semibold text-white">{option.title}</span>
                              <span className="text-sm text-white/60">{option.description}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    {experienceErrors.length > 0 && (
                      <p className="mt-2 text-sm text-red-400">{experienceErrors[0]}</p>
                    )}
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Social Links *
                    </label>
                    <div className="space-y-5">
                      {socialLinks.map((link) => {
                        const config = SOCIAL_LINK_CONFIG[link.type]
                        const inputId = `${link.id}-input`
                        return (
                          <div key={link.id}>
                            <label htmlFor={inputId} className="block text-sm font-medium text-white">
                              {config.label}
                            </label>
                            <div className="mt-2 flex gap-2">
                              <input
                                id={inputId}
                                type="url"
                                name="social_links"
                                value={link.value}
                                onChange={(e) => handleSocialLinkChange(link.id, e.target.value)}
                                placeholder={config.placeholder}
                                className="block w-full rounded-lg px-4 py-3 text-white placeholder-white/40 bg-neutral-900 border border-white/25 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:outline-none transition-colors"
                                required
                              />
                              {socialLinks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSocialLink(link.id)}
                                  className="flex-shrink-0 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {socialLinks.length < 5 && (
                      <div className="mt-3">
                        {showLinkOptions ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {(['github', 'instagram', 'portfolio'] as SocialLinkType[]).map((type) => {
                              const isDisabled =
                                type !== 'portfolio' && socialLinks.some((entry) => entry.type === type)
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => addSocialLink(type)}
                                  disabled={isDisabled}
                                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 hover:text-white hover:border-white/40 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {isDisabled ? 'Already added' : `Add ${SOCIAL_LINK_CONFIG[type].label}`}
                                </button>
                              )
                            })}
                            <button
                              type="button"
                              onClick={() => setShowLinkOptions(false)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowLinkOptions(true)}
                            className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add link
                          </button>
                        )}
                      </div>
                    )}
                    {socialLinkErrors.length > 0 && (
                      <p className="mt-2 text-sm text-red-400">{socialLinkErrors[0]}</p>
                    )}
                  </div>

                  {/* Project Links */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Past project links (optional)
                    </label>
                    <p className="text-sm text-white/55 mb-3">
                      Share up to 5 URLs that showcase what you&apos;ve built before.
                    </p>
                    <div className="space-y-3">
                      {projectLinks.map((link) => (
                        <div key={link.id} className="flex gap-2">
                          <input
                            type="url"
                            name="project_links"
                            value={link.value}
                            onChange={(e) => handleProjectLinkChange(link.id, e.target.value)}
                            placeholder="https://your-project.com"
                            className="block w-full rounded-lg px-4 py-3 text-white placeholder-white/40 bg-neutral-900 border border-white/25 focus:border-white/50 focus:ring-2 focus:ring-white/20 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeProjectLink(link.id)}
                            className="flex-shrink-0 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    {projectLinks.length < 5 && (
                      <button
                        type="button"
                        onClick={addProjectLink}
                        className="mt-3 text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add project link
                      </button>
                    )}
                    {projectLinkErrors.length > 0 && (
                      <p className="mt-2 text-sm text-red-400">{projectLinkErrors[0]}</p>
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
