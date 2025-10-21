"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const MAX_SOCIAL_LINKS = 5

type FormDataState = {
  email: string
  why_join: string
  what_building: string
  social_links: string[]
}

type ExistingApplication = {
  id: string
  status: string
  created_at: string
  updated_at: string
  email: string
  why_join: string
  what_building: string
  social_links: string[]
}

type Mode = "loading" | "new" | "view" | "edit"

type ApiError = {
  error: string
  errors?: Record<string, string[]>
}

const EMPTY_FORM: FormDataState = {
  email: "",
  why_join: "",
  what_building: "",
  social_links: [""],
}

export default function ApplicationFormPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("loading")
  const [formData, setFormData] = useState<FormDataState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null)
  const [authError, setAuthError] = useState<string>("")
  const [isLoadingExisting, setIsLoadingExisting] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false

    const loadExisting = async () => {
      try {
        const response = await fetch("/api/applications", { method: "GET" })

        if (!response.ok) {
          if (response.status === 401) {
            if (!cancelled) {
              setAuthError("Connect your Discord account to submit an application.")
              setMode("new")
            }
            return
          }

          const data = (await response.json()) as ApiError
          throw new Error(data.error || "Unable to check application status")
        }

        const data = await response.json()

        if (cancelled) return

        if (data.exists && data.application) {
          const app: ExistingApplication = {
            id: data.application.id,
            status: data.application.status,
            created_at: data.application.created_at,
            updated_at: data.application.updated_at,
            email: data.application.email,
            why_join: data.application.why_join,
            what_building: data.application.what_building,
            social_links: Array.isArray(data.application.social_links)
              ? (data.application.social_links as string[])
              : [],
          }

          setExistingApplication(app)
          setFormData({
            email: app.email,
            why_join: app.why_join,
            what_building: app.what_building,
            social_links: app.social_links.length ? app.social_links : [""],
          })
          setMode("view")
        } else {
          setMode("new")
        }
      } catch (error) {
        console.error("Failed to load existing application", error)
        if (!cancelled) {
          setMode("new")
        }
      } finally {
        if (!cancelled) {
          setIsLoadingExisting(false)
        }
      }
    }

    loadExisting()

    return () => {
      cancelled = true
    }
  }, [])

  const timelineMessage = useMemo(() => {
    if (!existingApplication) {
      return "Reviews typically take up to one week after submission."
    }

    const submitted = new Date(existingApplication.created_at)
    return `Submitted ${submitted.toLocaleString()}. Reviews typically take up to one week.`
  }, [existingApplication])

  const handleSocialLinkChange = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.social_links]
      next[index] = value
      return { ...prev, social_links: next }
    })
  }

  const addSocialLink = () => {
    setFormData((prev) => {
      if (prev.social_links.length >= MAX_SOCIAL_LINKS) {
        return prev
      }
      return { ...prev, social_links: [...prev.social_links, ""] }
    })
  }

  const removeSocialLink = (index: number) => {
    setFormData((prev) => {
      if (prev.social_links.length <= 1) {
        return prev
      }
      return {
        ...prev,
        social_links: prev.social_links.filter((_, i) => i !== index),
      }
    })
  }

  const resetErrors = () => {
    setErrors({})
    setSubmitError("")
    setSuccessMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()
    setIsSubmitting(true)

    const payload = {
      ...formData,
      social_links: formData.social_links.filter((link) => link.trim() !== ""),
    }

    const method = mode === "edit" ? "PATCH" : "POST"

    try {
      const response = await fetch("/api/applications", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else if (data.error) {
          setSubmitError(data.error)
        } else {
          setSubmitError("Something went wrong. Please try again.")
        }
        setIsSubmitting(false)
        return
      }

      if (method === "POST") {
        router.push("/apply/success")
        return
      }

      if (data.application) {
        const updatedApp: ExistingApplication = {
          id: data.application.id,
          status: data.application.status,
          created_at: data.application.created_at,
          updated_at: data.application.updated_at,
          email: data.application.email,
          why_join: data.application.why_join,
          what_building: data.application.what_building,
          social_links: Array.isArray(data.application.social_links)
            ? (data.application.social_links as string[])
            : [],
        }
        setExistingApplication(updatedApp)
        setFormData({
          email: updatedApp.email,
          why_join: updatedApp.why_join,
          what_building: updatedApp.what_building,
          social_links: updatedApp.social_links.length ? updatedApp.social_links : [""],
        })
        setMode("view")
        setSuccessMessage("Thanks for the update! We\'ll re-review your responses within a week.")
      }
    } catch (error) {
      console.error("Submission error:", error)
      setSubmitError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStart = () => {
    resetErrors()
    setMode("edit")
  }

  const handleCancelEdit = () => {
    resetErrors()
    if (existingApplication) {
      setFormData({
        email: existingApplication.email,
        why_join: existingApplication.why_join,
        what_building: existingApplication.what_building,
        social_links: existingApplication.social_links.length
          ? existingApplication.social_links
          : [""],
      })
      setMode("view")
    } else {
      setMode("new")
    }
  }

  const renderSocialLinks = () => (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        Social Links *
      </label>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Add links to your GitHub, Twitter, portfolio, or other profiles (minimum 1, maximum {MAX_SOCIAL_LINKS})
      </p>
      <div className="mt-3 space-y-3">
        {formData.social_links.map((link, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row">
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
                className="self-start px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {formData.social_links.length < MAX_SOCIAL_LINKS && (
        <button
          type="button"
          onClick={addSocialLink}
          className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          + Add another link
        </button>
      )}
      {errors.social_links && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.social_links[0]}</p>
      )}
    </div>
  )

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow rounded-2xl p-8">
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

      {/* Why join */}
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

      {/* What building */}
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

      {renderSocialLinks()}

      {submitError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/apply"
            className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Cancel
          </Link>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 text-sm font-semibold text-white rounded-md transition-colors ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"
          }`}
        >
          {isSubmitting ? (mode === "edit" ? "Saving..." : "Submitting...") : mode === "edit" ? "Save updates" : "Submit application"}
        </button>
      </div>
    </form>
  )

  const renderConfirmation = () => {
    if (!existingApplication) return null

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-white/10 bg-white/95 px-6 py-12 text-center shadow-xl dark:bg-neutral-900/90">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-gray-900 dark:text-white">Application already submitted</h1>
        <p className="mt-3 max-w-lg text-sm text-gray-600 dark:text-gray-300">
          {timelineMessage}
        </p>
        {successMessage && (
          <p className="mt-4 text-sm font-medium text-emerald-500">{successMessage}</p>
        )}

        <dl className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white capitalize">{existingApplication.status}</dd>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Submitted</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {new Date(existingApplication.created_at).toLocaleString()}
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Return home
          </Link>
          <Link
            href="/apply/success"
            className="inline-flex items-center justify-center rounded-full border border-primary-500 bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            View next steps
          </Link>
          <button
            type="button"
            onClick={handleEditStart}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-white/20 dark:bg-white/10 dark:text-white"
          >
            Edit responses
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Need to share an urgent update? Reply to your confirmation email or reach the team in Discord.
        </p>
      </div>
    )
  }

  if (mode === "loading" || isLoadingExisting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-transparent dark:border-white/20 dark:border-t-transparent" />
      </main>
    )
  }

  if (mode === "view" && existingApplication) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-24 dark:from-gray-950 dark:to-neutral-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {renderConfirmation()}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-white">
            Creative Technologists
          </Link>
          {mode === "edit" && existingApplication && (
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Editing existing submission
            </span>
          )}
        </nav>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {mode === "edit" ? "Update your application" : "Complete your application"}
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{timelineMessage}</p>
          {authError && (
            <p className="mt-4 text-sm font-medium text-red-500">{authError}</p>
          )}
        </div>

        <div className="mt-10">
          {renderForm()}
        </div>
      </div>
    </main>
  )
}
