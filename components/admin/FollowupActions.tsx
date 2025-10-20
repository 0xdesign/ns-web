'use client'

import { useCallback, useMemo, useState } from 'react'

type HistoricalStatus = 'approved' | 'waitlisted' | 'rejected'

interface FollowupActionsProps {
  applicationId: string
  applicantName: string
  status: HistoricalStatus
}

export function FollowupActions({
  applicationId,
  applicantName,
  status,
}: FollowupActionsProps) {
  const [revokeTokens, setRevokeTokens] = useState(status === 'approved')
  const [isReopening, setIsReopening] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const endpointBase = useMemo(
    () => `/api/admin/applications/${applicationId}`,
    [applicationId]
  )

  const handleReopen = useCallback(async () => {
    const confirmMessage = `Move ${applicantName} back to pending review?${
      status === 'approved'
        ? `\n\n${revokeTokens ? 'Active payment tokens will be revoked.' : 'Existing payment link will remain active.'}`
        : ''
    }`

    if (!window.confirm(confirmMessage)) return
    setIsReopening(true)

    try {
      const formData = new FormData()
      formData.append('revokeTokens', revokeTokens ? 'true' : 'false')

      const response = await fetch(`${endpointBase}/reopen`, {
        method: 'POST',
        body: formData,
      })

      let payload: Record<string, unknown> | null = null
      try {
        payload = (await response.json()) as Record<string, unknown>
      } catch {
        // ignore
      }

      if (!response.ok) {
        const message =
          (payload?.error as string | undefined) ??
          `Failed to move ${applicantName} back to pending.`
        throw new Error(message)
      }

      alert(
        (payload?.message as string | undefined) ??
          `${applicantName} moved back to pending.`
      )
      window.location.reload()
    } catch (error) {
      console.error('Failed to reopen application', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Unexpected error reopening application.')
      }
    } finally {
      setIsReopening(false)
    }
  }, [applicantName, endpointBase, revokeTokens, status])

  const handleResend = useCallback(async () => {
    if (
      !window.confirm(
        `Resend the ${status} notification email to ${applicantName}?`
      )
    ) {
      return
    }

    setIsResending(true)

    try {
      const response = await fetch(`${endpointBase}/resend`, {
        method: 'POST',
      })

      let payload: Record<string, unknown> | null = null
      try {
        payload = (await response.json()) as Record<string, unknown>
      } catch {
        // ignore
      }

      if (!response.ok) {
        const message =
          (payload?.error as string | undefined) ??
          `Unable to resend ${status} email.`
        throw new Error(message)
      }

      alert(
        (payload?.message as string | undefined) ??
          'Status email resent successfully.'
      )
    } catch (error) {
      console.error('Failed to resend email', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Unexpected error re-sending email.')
      }
    } finally {
      setIsResending(false)
    }
  }, [applicantName, endpointBase, status])

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/15 p-3">
      {status === 'approved' && (
        <button
          type="button"
          onClick={() => setRevokeTokens((prev) => !prev)}
          className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
        >
          <span>Revoke payment link on reopen</span>
          <span
            className={`ml-2 inline-block h-2.5 w-2.5 rounded-full ${
              revokeTokens ? 'bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.55)]' : 'bg-white/40'
            }`}
          />
        </button>
      )}

      <button
        type="button"
        onClick={handleReopen}
        disabled={isReopening}
        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/35 hover:text-white disabled:cursor-wait"
      >
        {isReopening ? 'Reopening…' : 'Move back to pending'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="inline-flex items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-100 transition hover:bg-blue-500/30 disabled:cursor-wait"
      >
        {isResending ? 'Resending…' : 'Resend status email'}
      </button>
    </div>
  )
}
