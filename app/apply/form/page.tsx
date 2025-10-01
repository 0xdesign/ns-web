'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ApplicationFormPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    why_join: '',
    what_building: '',
    social_links: [''],
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setSubmitError('')

    // Filter out empty social links
    const filteredSocialLinks = formData.social_links.filter((link) => link.trim() !== '')

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          social_links: filteredSocialLinks,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setSubmitError(data.error || 'Failed to submit application')
        }
        setIsSubmitting(false)
        return
      }

      // Success! Redirect to success page
      router.push('/apply/success')
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold">Creative Technologists</h1>
            </Link>
          </div>
        </nav>
      </header>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Complete Your Application
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Tell us about yourself and what you're building
          </p>
        </div>

        {/* Global Error */}
        {submitError && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email[0]}</p>
            )}
          </div>

          {/* Why Join */}
          <div>
            <label htmlFor="why_join" className="block text-sm font-medium text-gray-900 dark:text-white">
              Why do you want to join this community? *
            </label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Minimum 50 characters. Tell us what draws you to this community.
            </p>
            <textarea
              id="why_join"
              rows={5}
              value={formData.why_join}
              onChange={(e) => setFormData({ ...formData, why_join: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.why_join.length}/1000 characters
            </p>
            {errors.why_join && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.why_join[0]}</p>
            )}
          </div>

          {/* What Building */}
          <div>
            <label htmlFor="what_building" className="block text-sm font-medium text-gray-900 dark:text-white">
              What are you currently building? *
            </label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Minimum 50 characters. Share your current projects, ideas, or experiments.
            </p>
            <textarea
              id="what_building"
              rows={5}
              value={formData.what_building}
              onChange={(e) => setFormData({ ...formData, what_building: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.what_building.length}/1000 characters
            </p>
            {errors.what_building && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.what_building[0]}</p>
            )}
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Social Links *
            </label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add links to your GitHub, Twitter, portfolio, or other profiles (minimum 1, maximum 5)
            </p>
            <div className="mt-2 space-y-2">
              {formData.social_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    placeholder="https://github.com/username"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                  />
                  {formData.social_links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
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
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Add another link
              </button>
            )}
            {errors.social_links && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.social_links[0]}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/apply"
              className="px-6 py-3 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
