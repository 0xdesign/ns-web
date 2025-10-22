'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ADMIN_EMAIL_PREF_KEY,
  readSendEmailPreference,
} from '@/lib/admin-preferences'

type DecisionType = 'approve' | 'waitlist' | 'reject'

interface DecisionActionsProps {
  applicationId: string
  applicantName: string
  defaultSendEmail?: boolean
}

const LABELS: Record<DecisionType, string> = {
  approve: 'Approve',
  waitlist: 'Waitlist',
  reject: 'Reject',
}

const CONFIRM_COPY: Record<DecisionType, string> = {
  approve: 'Approve this applicant and generate a payment link?',
  waitlist: 'Move this applicant to the waitlist?',
  reject: 'Reject this applicant?',
}

export function DecisionActions({
  applicationId,
  applicantName,
  defaultSendEmail = true,
}: DecisionActionsProps) {
  const [sendEmail, setSendEmail] = useState(defaultSendEmail)
  const [pendingAction, setPendingAction] = useState<DecisionType | null>(null)

  const endpointBase = useMemo(
    () => `/api/admin/applications/${applicationId}`,
    [applicationId]
  )

  useEffect(() => {
    try {
      const stored = readSendEmailPreference()
      setSendEmail(stored)
    } catch (error) {
      console.warn('Failed to read admin email preference', error)
    }

    const syncPreference = () => {
      try {
        const stored = readSendEmailPreference()
        setSendEmail(stored)
      } catch (error) {
        console.warn('Failed to sync admin email preference', error)
      }
    }

    const customEventName = 'ct-admin-preferences'
    window.addEventListener('storage', syncPreference)
    window.addEventListener(customEventName, syncPreference as EventListener)

    return () => {
      window.removeEventListener('storage', syncPreference)
      window.removeEventListener(customEventName, syncPreference as EventListener)
    }
  }, [])

  const handleAction = useCallback(
    async (decision: DecisionType) => {
      const confirmMessage = `${CONFIRM_COPY[decision]}

Applicant: ${applicantName}${
        sendEmail ? '\n\nOutcome email will be sent automatically.' : '\n\nOutcome email will NOT be sent.'
      }`

      if (!window.confirm(confirmMessage)) return
      setPendingAction(decision)

      try {
        const requestUrl = `${endpointBase}/${decision}`
        const formData = new FormData()
        formData.append('sendEmail', sendEmail ? 'true' : 'false')

        const response = await fetch(requestUrl, {
          method: 'POST',
          body: formData,
        })

        let payload: Record<string, unknown> | null = null
        try {
          payload = (await response.json()) as Record<string, unknown>
        } catch {
          // Ignore JSON parse errors (endpoint might not return JSON on failure)
        }

        if (!response.ok) {
          const errorMessage =
            (payload?.error as string | undefined) ??
            `Unable to ${decision} ${applicantName}.`
          throw new Error(errorMessage)
        }

        const successMessage =
          (payload?.message as string | undefined) ??
          `${LABELS[decision]}d ${applicantName}.`

        alert(successMessage)
        window.location.reload()
      } catch (error) {
        console.error(`Failed to ${decision} application`, error)
        if (error instanceof Error) {
          alert(error.message)
        } else {
          alert(`Unexpected error performing ${LABELS[decision].toLowerCase()} action.`)
        }
      } finally {
        setPendingAction(null)
      }
    },
    [applicantName, endpointBase, sendEmail]
  )

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Actions</p>
        <button
          type="button"
          onClick={() => {
            const next = !sendEmail
            setSendEmail(next)
            try {
              window.localStorage.setItem(ADMIN_EMAIL_PREF_KEY, next ? 'true' : 'false')
              window.dispatchEvent(new Event('ct-admin-preferences'))
            } catch (error) {
              console.warn('Failed to persist email preference', error)
            }
          }}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-white/70 transition hover:border-white/35 hover:text-white"
        >
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              sendEmail ? 'bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.55)]' : 'bg-white/40'
            }`}
            aria-hidden
          />
          {sendEmail ? 'Email enabled' : 'Email disabled'}
        </button>
      </div>

      <p className="text-xs text-white/50">
        {sendEmail
          ? 'Outcome emails will be sent automatically.'
          : 'Keep the email disabled if you want to follow up manually.'}
      </p>

      <div className="mt-1 grid gap-2">
        {(Object.keys(LABELS) as DecisionType[]).map((decision) => (
          <button
            key={decision}
            type="button"
            onClick={() => handleAction(decision)}
            disabled={pendingAction !== null}
            className={`inline-flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
              decision === 'approve'
                ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                : decision === 'waitlist'
                  ? 'border-blue-400/40 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30'
                  : 'border-rose-400/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
            } ${pendingAction === decision ? 'opacity-80' : ''}`}
          >
            {pendingAction === decision ? 'Working…' : LABELS[decision]}
          </button>
        ))}
      </div>
    </div>
  )
}
