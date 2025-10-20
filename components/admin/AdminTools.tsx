'use client'

import { useEffect, useState } from 'react'
import {
  ADMIN_EMAIL_PREF_KEY,
  persistSendEmailPreference,
  readSendEmailPreference,
} from '@/lib/admin-preferences'

const PREFERENCE_EVENT = 'ct-admin-preferences'

export function AdminTools() {
  const [sendEmailsByDefault, setSendEmailsByDefault] = useState(true)

  useEffect(() => {
    const sync = () => {
      try {
        setSendEmailsByDefault(readSendEmailPreference())
      } catch (error) {
        console.warn('Unable to read admin email preference', error)
      }
    }

    sync()
    window.addEventListener('storage', sync)
    window.addEventListener(PREFERENCE_EVENT, sync as EventListener)

    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(PREFERENCE_EVENT, sync as EventListener)
    }
  }, [])

  const updatePreference = (value: boolean) => {
    setSendEmailsByDefault(value)
    try {
      persistSendEmailPreference(value)
      window.dispatchEvent(new Event(PREFERENCE_EVENT))
    } catch (error) {
      console.warn('Failed to persist admin preference', error)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
          Admin tools
        </h3>
        <p className="mt-2 text-sm text-white/65">
          Shortcuts that put you in control of the review pipeline and communications.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="/api/admin/applications/export"
          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/35 hover:text-white"
        >
          Export applications CSV
        </a>
        <button
          type="button"
          onClick={() => {
            const anchor = document.getElementById('audit-log')
            anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/35 hover:text-white"
        >
          View audit log
        </button>
        <button
          type="button"
          onClick={() => {
            const anchor = document.getElementById('expired')
            anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/35 hover:text-white"
        >
          Follow up on churn
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Auto email decisions</p>
            <p className="text-xs text-white/55">
              Toggle whether approve/reject actions send email by default.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updatePreference(!sendEmailsByDefault)}
            className="relative inline-flex h-6 w-11 items-center rounded-full border border-white/15 bg-white/10 transition hover:border-white/35"
            aria-pressed={sendEmailsByDefault}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition ${
                sendEmailsByDefault
                  ? 'translate-x-5 bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.55)]'
                  : 'translate-x-1 bg-white/40'
              }`}
            />
            <span className="sr-only">
              {sendEmailsByDefault ? 'Disable auto emails' : 'Enable auto emails'}
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
        <p>
          Preferences persist per browser via local storage (`{ADMIN_EMAIL_PREF_KEY}`).
        </p>
      </div>
    </div>
  )
}
