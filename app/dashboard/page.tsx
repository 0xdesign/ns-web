import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type Stripe from 'stripe'
import { Navigation } from '@/components/Navigation'
import { parseDiscordUserCookie } from '@/lib/current-user'
import {
  getDiscordAuthUrl,
  generateJoinState,
  getJoinDiscordAuthUrl,
} from '@/lib/discord'
import {
  getApplicationByDiscordId,
  getCustomerByDiscordId,
  getLatestSubscriptionForCustomer,
  type Application,
  type Subscription,
} from '@/lib/db'
import {
  getCustomerWithDefaultPaymentMethod,
  listInvoicesForCustomer,
  isStripeConfigured,
} from '@/lib/stripe'
import { BillingPortalButton } from './BillingPortalButton'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatInvoiceDate(timestamp: number | null | undefined): string {
  if (!timestamp) return '—'
  const date = new Date(timestamp * 1000)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(
  amountInMinorUnits: number | null | undefined,
  currency: string | null | undefined
): string {
  if (typeof amountInMinorUnits !== 'number' || !currency) return '—'
  const normalizedCurrency = currency.toUpperCase()
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalizedCurrency,
  })
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  const divisor = 10 ** fractionDigits
  return formatter.format(amountInMinorUnits / divisor)
}

type ApplicationMeta = {
  label: string
  badgeClass: string
  description: string
  detail?: string
  action?: { href: string; label: string }
}

function getApplicationMeta(application: Application | null): ApplicationMeta {
  if (!application) {
    return {
      label: 'Not submitted',
      badgeClass: 'border-white/20 bg-white/10 text-white/70',
      description: 'Start your application to join the community.',
      action: { href: '/apply', label: 'Start application' },
    }
  }

  switch (application.status) {
    case 'pending':
      return {
        label: 'Under review',
        badgeClass: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
        description: 'We’re reviewing your application. Expect an update in a few days.',
        detail: `Submitted on ${formatDate(application.created_at)}`,
      }
    case 'approved':
      return {
        label: 'Approved',
        badgeClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
        description:
          'Your application was approved. Keep your subscription active to maintain membership access.',
        detail: `Approved on ${formatDate(application.reviewed_at ?? application.updated_at)}`,
      }
    case 'waitlisted':
      return {
        label: 'Waitlisted',
        badgeClass: 'border-blue-400/30 bg-blue-500/15 text-blue-100',
        description: 'You’re on the waitlist. We’ll reach out when a spot opens up.',
        detail: `Last updated ${formatDate(application.updated_at)}`,
      }
    case 'rejected':
      return {
        label: 'Not approved',
        badgeClass: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
        description: 'Thanks for applying. You’re welcome to reapply after a few months.',
        detail: `Reviewed on ${formatDate(application.reviewed_at ?? application.updated_at)}`,
      }
    default:
      return {
        label: application.status,
        badgeClass: 'border-white/20 bg-white/10 text-white/70',
        description: 'Application status unavailable.',
      }
  }
}

type SubscriptionMeta = {
  label: string
  badgeClass: string
  description: string
  detail?: string
}

function isMembershipActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  if (subscription.status === 'active' || subscription.status === 'past_due') {
    return true
  }

  if (subscription.status === 'canceled') {
    const periodEnd = new Date(subscription.current_period_end)
    return periodEnd > new Date()
  }

  return false
}

function getSubscriptionMeta(subscription: Subscription | null): SubscriptionMeta {
  if (!subscription) {
    return {
      label: 'Not active',
      badgeClass: 'border-white/20 bg-white/10 text-white/70',
      description: 'We haven’t recorded a paid subscription yet.',
    }
  }

  switch (subscription.status) {
    case 'active':
      return {
        label: 'Active',
        badgeClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
        description: 'Membership is active and in good standing.',
        detail: `Renews on ${formatDate(subscription.current_period_end)}`,
      }
    case 'past_due':
      return {
        label: 'Past due',
        badgeClass: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
        description: 'Payment is past due. Update your billing details to avoid interruptions.',
        detail: `Past due since ${formatDate(subscription.current_period_start)}`,
      }
    case 'canceled': {
      const periodEnd = new Date(subscription.current_period_end)
      const stillActive = periodEnd > new Date()
      return {
        label: stillActive ? 'Cancels soon' : 'Canceled',
        badgeClass: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
        description: stillActive
          ? 'Cancellation is scheduled. Access remains until the end of the billing cycle.'
          : 'Subscription ended. Restart in Stripe to regain access.',
        detail: stillActive
          ? `Ends on ${formatDate(subscription.current_period_end)}`
          : `Ended on ${formatDate(subscription.current_period_end)}`,
      }
    }
    case 'incomplete':
      return {
        label: 'Incomplete',
        badgeClass: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
        description: 'Checkout was not completed. Finish payment to activate membership.',
      }
    case 'unpaid':
      return {
        label: 'Unpaid',
        badgeClass: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
        description: 'Subscription is unpaid. Update billing details in Stripe.',
      }
    default:
      return {
        label: subscription.status,
        badgeClass: 'border-white/20 bg-white/10 text-white/70',
        description: 'Subscription status unavailable.',
      }
  }
}

function formatCardBrand(brand: string | null | undefined): string {
  if (!brand) return 'Card'
  return brand.charAt(0).toUpperCase() + brand.slice(1)
}

function getPaymentMethodDescriptor(paymentMethod: Stripe.PaymentMethod | null): string {
  if (!paymentMethod) {
    return 'Managed in Stripe customer portal.'
  }

  if (paymentMethod.type === 'card' && paymentMethod.card) {
    const brand = formatCardBrand(paymentMethod.card.brand)
    const last4 = paymentMethod.card.last4 ?? '••••'
    const expMonth = paymentMethod.card.exp_month
    const expYear = paymentMethod.card.exp_year
    const expiry =
      expMonth && expYear ? `${String(expMonth).padStart(2, '0')}/${String(expYear)}` : null
    return `${brand} ending ${last4}${expiry ? ` · Expires ${expiry}` : ''}`
  }

  return `Payment method on file (${paymentMethod.type})`
}

function getInvoiceAmount(invoice: Stripe.Invoice): number | null {
  if (typeof invoice.amount_paid === 'number' && invoice.amount_paid > 0) {
    return invoice.amount_paid
  }
  if (typeof invoice.amount_due === 'number') {
    return invoice.amount_due
  }
  if (typeof invoice.total === 'number') {
    return invoice.total
  }
  return null
}

function getInvoiceStatusMeta(status: Stripe.Invoice.Status | null | undefined) {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        className: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
      }
    case 'open':
      return {
        label: 'Open',
        className: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
      }
    case 'void':
    case 'uncollectible':
      return {
        label: status === 'void' ? 'Voided' : 'Uncollectible',
        className: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
      }
    default:
      return {
        label: status ?? 'Unknown',
        className: 'border-white/20 bg-white/10 text-white/70',
      }
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const discordUserCookie = cookieStore.get('discord_user')
  const loginUrl = getDiscordAuthUrl('/dashboard')

  if (!discordUserCookie) {
    redirect(loginUrl)
  }

  const discordUser = parseDiscordUserCookie(discordUserCookie.value)
  if (!discordUser) {
    cookieStore.delete('discord_user')
    redirect(loginUrl)
  }

  const [application, customer] = await Promise.all([
    getApplicationByDiscordId(discordUser.id),
    getCustomerByDiscordId(discordUser.id),
  ])

  const stripeReady = isStripeConfigured()

  const subscription = customer
    ? await getLatestSubscriptionForCustomer(customer.id)
    : null

  let defaultPaymentMethod: Stripe.PaymentMethod | null = null
  if (customer && stripeReady) {
    try {
      const stripeCustomer = await getCustomerWithDefaultPaymentMethod(
        customer.stripe_customer_id
      )
      const pm = stripeCustomer.invoice_settings?.default_payment_method
      if (pm && typeof pm !== 'string') {
        defaultPaymentMethod = pm as Stripe.PaymentMethod
      }
    } catch (error) {
      console.error('Failed to load Stripe customer details for dashboard:', error)
    }
  }

  let invoices: Stripe.Invoice[] = []
  if (customer && stripeReady) {
    try {
      const invoiceList = await listInvoicesForCustomer({
        customerId: customer.stripe_customer_id,
        limit: 6,
      })
      invoices = invoiceList.data ?? []
    } catch (error) {
      console.error('Failed to load Stripe invoices for dashboard:', error)
    }
  }

  const subscriptionMeta = getSubscriptionMeta(subscription)
  const applicationMeta = getApplicationMeta(application)
  const membershipActive = isMembershipActive(subscription)

  let joinUrl: string | null = null
  let joinError: string | null = null
  if (application && application.status === 'approved' && membershipActive) {
    try {
      const joinState = generateJoinState({ appId: application.id })
      joinUrl = getJoinDiscordAuthUrl(joinState)
    } catch (error) {
      joinError =
        error instanceof Error ? error.message : 'Discord join link not configured.'
    }
  }

  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? null

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />
      <div className="absolute inset-0 opacity-[0.05] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wMyIgZD0iTTAgMGg3MHY3MEgweiIvPjxwYXRoIGQ9Ik0wIDBoNTB2NTBIMHoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')]" />

      <Navigation
        memberCount={0}
        discordUser={discordUser}
        discordAuthUrl={loginUrl}
        showMemberCount={false}
        showAuthActions
        loginLabel="Log in"
        dashboardHref="/dashboard"
        dashboardLabel="Dashboard"
        logoutUrl="/api/auth/discord/logout?redirect=/"
      />

      <main className="relative z-10 pt-28 pb-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Welcome back
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Membership dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
              Track your application, manage billing, and access the community when your membership is active.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/60 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Discord · {discordUser.username}
                {discordUser.discriminator && discordUser.discriminator !== '0'
                  ? `#${discordUser.discriminator}`
                  : ''}
              </span>
              {application?.email && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Application email · {application.email}
                </span>
              )}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Application status</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Keep an eye on your approval state.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${applicationMeta.badgeClass}`}
                >
                  {applicationMeta.label}
                </span>
              </div>
              <p className="mt-4 text-sm text-white/70">{applicationMeta.description}</p>
              {applicationMeta.detail && (
                <p className="mt-4 text-xs text-white/45">{applicationMeta.detail}</p>
              )}
              <dl className="mt-6 space-y-3 text-sm text-white/60">
                <div className="flex items-center justify-between">
                  <dt>Discord ID</dt>
                  <dd className="font-medium text-white/80">{discordUser.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Email</dt>
                  <dd className="font-medium text-white/80">
                    {application?.email ?? '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Submitted</dt>
                  <dd className="font-medium text-white/80">
                    {application ? formatDate(application.created_at) : '—'}
                  </dd>
                </div>
              </dl>
              {applicationMeta.action && (
                <div className="mt-6">
                  <Link
                    href={applicationMeta.action.href}
                    className="inline-flex min-h-11 items-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                  >
                    {applicationMeta.action.label}
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Membership</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Status updates from your Stripe subscription.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${subscriptionMeta.badgeClass}`}
                >
                  {subscriptionMeta.label}
                </span>
              </div>

              <p className="mt-4 text-sm text-white/70">{subscriptionMeta.description}</p>
              {subscriptionMeta.detail && (
                <p className="mt-3 text-xs text-white/45">{subscriptionMeta.detail}</p>
              )}

              <dl className="mt-6 space-y-3 text-sm text-white/65">
                <div className="flex items-center justify-between">
                  <dt>Current period</dt>
                  <dd className="font-medium text-white/85">
                    {subscription
                      ? `${formatDate(subscription.current_period_start)} → ${formatDate(subscription.current_period_end)}`
                      : '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Status</dt>
                  <dd className="font-medium text-white/85">
                    {subscription?.status ?? 'No subscription'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Auto-renew</dt>
                  <dd className="font-medium text-white/85">
                    {subscription
                      ? subscription.cancel_at_period_end
                        ? 'Ends at period end'
                        : 'Enabled'
                      : '—'}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-3">
                {membershipActive && joinUrl && (
                  <a
                    href={joinUrl}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#4752C4]"
                  >
                    Join Discord server
                  </a>
                )}
                {!joinUrl && membershipActive && inviteUrl && (
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
                  >
                    Open invite link
                  </a>
                )}
                {joinError && (
                  <p className="text-xs text-amber-300/80">{joinError}</p>
                )}
                {!membershipActive && (
                  <p className="text-xs text-white/45">
                    Discord access unlocks when your subscription becomes active.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Invoice history</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Recent charges recorded for your membership.
                  </p>
                </div>
                <span className="text-xs font-medium text-white/50">
                  {stripeReady
                    ? `Last ${Math.min(invoices.length, 6)} entries`
                    : 'Stripe not configured'}
                </span>
              </div>

              {!stripeReady ? (
                <p className="mt-6 text-sm text-white/60">
                  Billing activity is unavailable in this environment because Stripe is not configured.
                </p>
              ) : invoices.length === 0 ? (
                <p className="mt-6 text-sm text-white/60">
                  No invoices yet. You’ll see receipts here after your first successful payment.
                </p>
              ) : (
                <ul className="mt-6 space-y-4">
                  {invoices.map((invoice) => {
                    const amount = getInvoiceAmount(invoice)
                    const statusMeta = getInvoiceStatusMeta(invoice.status)
                    return (
                      <li
                        key={invoice.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {formatCurrency(amount, invoice.currency)}
                            </p>
                            <p className="text-xs text-white/50">
                              {formatInvoiceDate(invoice.created)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </span>
                            {invoice.invoice_pdf && (
                              <a
                                href={invoice.invoice_pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-white/80 underline underline-offset-4 hover:text-white"
                              >
                                Download PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Manage billing</h2>
                <p className="mt-1 text-sm text-white/60">
                  {stripeReady
                    ? 'Update payment method, cancel, or view full billing history in Stripe.'
                    : 'Stripe billing is disabled in this environment. Configure STRIPE_SECRET_KEY to enable it.'}
                </p>
              </div>

              {stripeReady ? (
                <BillingPortalButton />
              ) : (
                <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  Billing portal unavailable while Stripe is not configured.
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Plan
                </p>
                <p className="mt-2 text-sm font-semibold text-white">Creative Technologists · Monthly</p>
                <p className="mt-1 text-xs text-white/45">
                  USD $299 per month, billed through Stripe.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Payment method
                </p>
                <p className="mt-2 text-sm font-semibold text-white/80">
                  {stripeReady
                    ? getPaymentMethodDescriptor(defaultPaymentMethod)
                    : 'Unavailable — Stripe not configured'}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {stripeReady
                    ? 'Securely stored with Stripe. Changes happen in the billing portal.'
                    : 'Add STRIPE_SECRET_KEY to enable billing information.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
