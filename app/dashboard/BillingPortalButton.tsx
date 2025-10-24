'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { openBillingPortal } from './actions'

type PortalState = {
  error?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? 'Opening portal…' : 'Manage billing'}
    </button>
  )
}

export function BillingPortalButton() {
  const [state, formAction] = useActionState<PortalState, FormData>(
    async () => {
      const result = await openBillingPortal()
      return result ?? {}
    },
    {}
  )

  return (
    <form action={formAction} className="space-y-2">
      <SubmitButton />
      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
    </form>
  )
}
