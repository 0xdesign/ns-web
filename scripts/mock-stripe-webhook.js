#!/usr/bin/env node

/**
 * Simulate the checkout.session.completed webhook handler without hitting
 * external services. Compiles the TypeScript route on the fly and stubs
 * Stripe/Supabase/bot clients so we can exercise success paths.
 */

const fs = require('fs')
const path = require('path')
const Module = require('module')
const ts = require('typescript')

const projectRoot = path.resolve(__dirname, '..')
const routePath = path.join(projectRoot, 'app/api/webhooks/stripe/route.ts')
const tempOutputPath = path.join(projectRoot, '.tmp__route.js')

const originalRequire = Module.prototype.require

const state = {
  processedEvents: new Set(),
  stripeCustomers: {},
  stripeSubscriptions: {},
  dbCustomersByDiscord: {},
  dbCustomersByStripe: {},
  dbSubscriptions: {},
  application: null,
  usedTokens: [],
  roleAssignments: [],
  roleRemovals: [],
}

const resetState = () => {
  state.processedEvents.clear()
  state.stripeCustomers = {}
  state.stripeSubscriptions = {}
  state.dbCustomersByDiscord = {}
  state.dbCustomersByStripe = {}
  state.dbSubscriptions = {}
  state.application = null
  state.usedTokens = []
  state.roleAssignments = []
  state.roleRemovals = []
}

const mockStripeModule = {
  stripe: {
    customers: {
      retrieve: async (customerId) => {
        if (!(customerId in state.stripeCustomers)) {
          throw new Error(`Missing stub for Stripe customer ${customerId}`)
        }
        return state.stripeCustomers[customerId]
      },
    },
    subscriptions: {
      retrieve: async (subscriptionId) => {
        if (!(subscriptionId in state.stripeSubscriptions)) {
          throw new Error(`Missing stub for Stripe subscription ${subscriptionId}`)
        }
        return state.stripeSubscriptions[subscriptionId]
      },
    },
  },
  verifyWebhookSignature: (payload) => JSON.parse(payload),
}

const mockDbModule = {
  async isWebhookProcessed(eventId) {
    return state.processedEvents.has(eventId)
  },
  async markWebhookProcessed(eventId, source, eventType) {
    state.processedEvents.add(eventId)
    state.lastProcessed = { eventId, source, eventType }
  },
  async upsertCustomer(data) {
    const existing =
      state.dbCustomersByDiscord[data.discord_user_id] ??
      state.dbCustomersByStripe[data.stripe_customer_id]

    const record = {
      id: existing?.id ?? `db_cust_${Object.keys(state.dbCustomersByDiscord).length + 1}`,
      ...existing,
      ...data,
    }

    state.dbCustomersByDiscord[data.discord_user_id] = record
    state.dbCustomersByStripe[data.stripe_customer_id] = record
    return record
  },
  async upsertSubscription(data) {
    const existing = state.dbSubscriptions[data.stripe_subscription_id]
    const record = {
      id: existing?.id ?? `db_sub_${Object.keys(state.dbSubscriptions).length + 1}`,
      ...existing,
      ...data,
    }
    state.dbSubscriptions[data.stripe_subscription_id] = record
    return record
  },
  async getApplicationByDiscordId() {
    return state.application
  },
  async getCustomerByStripeId(stripeCustomerId) {
    return state.dbCustomersByStripe[stripeCustomerId] ?? null
  },
}

const mockPaymentTokensModule = {
  async markTokenAsUsed(tokenId) {
    state.usedTokens.push(tokenId)
  },
}

const mockBotApiModule = {
  async assignRoleWithRetry(discordUserId, roleId) {
    state.roleAssignments.push({ discordUserId, roleId })
  },
  async removeRole(discordUserId, roleId) {
    state.roleRemovals.push({ discordUserId, roleId })
  },
}

const mockNextServerModule = {
  NextResponse: {
    json(body, init = {}) {
      return { status: init.status ?? 200, body }
    },
  },
}

const overrideRequire = () => {
  Module.prototype.require = function mockRequire(request) {
    if (request === '@/lib/stripe') return mockStripeModule
    if (request === '@/lib/db') return mockDbModule
    if (request === '@/lib/payment-tokens') return mockPaymentTokensModule
    if (request === '@/lib/bot-api') return mockBotApiModule
    if (request === 'next/server') return mockNextServerModule
    return originalRequire.call(this, request)
  }
}

const restoreRequire = () => {
  Module.prototype.require = originalRequire
}

const compileRoute = () => {
  const source = fs.readFileSync(routePath, 'utf8')
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      allowJs: true,
      isolatedModules: true,
    },
    fileName: routePath,
  })
  fs.writeFileSync(tempOutputPath, result.outputText, 'utf8')
}

const cleanup = () => {
  if (fs.existsSync(tempOutputPath)) {
    fs.unlinkSync(tempOutputPath)
  }
}

const createRequest = (payload) => ({
  headers: {
    get(name) {
      return name.toLowerCase() === 'stripe-signature' ? 'stub-test-signature' : null
    },
  },
  async text() {
    return payload
  },
})

const captureConsole = () => {
  const logs = []
  const originals = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }

  for (const level of Object.keys(originals)) {
    console[level] = (...args) => {
      logs.push({ level, message: args.map((v) => String(v)).join(' ') })
    }
  }

  return {
    logs,
    restore: () => {
      Object.entries(originals).forEach(([level, fn]) => {
        console[level] = fn
      })
    },
  }
}

const runScenario = async (POST, scenario) => {
  resetState()
  state.stripeCustomers = scenario.stripeCustomers
  state.stripeSubscriptions = scenario.stripeSubscriptions
  state.dbCustomersByStripe = scenario.dbCustomersByStripe ?? {}
  state.dbCustomersByDiscord = Object.values(state.dbCustomersByStripe || {}).reduce(
    (acc, record) => {
      acc[record.discord_user_id] = record
      return acc
    },
    {}
  )
  state.application = scenario.application ?? null

  const payload = JSON.stringify({
    id: scenario.eventId,
    type: 'checkout.session.completed',
    data: {
      object: {
        customer: scenario.customerId,
        subscription: scenario.subscriptionId,
        metadata: scenario.sessionMetadata ?? {},
      },
    },
  })

  const request = createRequest(payload)
  const { logs, restore } = captureConsole()

  let response
  let error
  try {
    response = await POST(request)
  } catch (err) {
    error = err
  } finally {
    restore()
  }

  return {
    label: scenario.label,
    response,
    error: error ? error.message : null,
    dbCustomers: { ...state.dbCustomersByStripe },
    dbSubscriptions: { ...state.dbSubscriptions },
    usedTokens: [...state.usedTokens],
    logs,
  }
}

const main = async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_stub'

  compileRoute()
  overrideRequire()

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { POST } = require(tempOutputPath)

    const scenarios = [
      {
        label: 'Fresh customer (metadata present)',
        eventId: 'evt_1',
        customerId: 'cus_fresh',
        subscriptionId: 'sub_new',
        sessionMetadata: { payment_token_id: 'tok_new' },
        stripeCustomers: {
          cus_fresh: {
            id: 'cus_fresh',
            email: 'fresh@example.com',
            metadata: { discord_user_id: 'discord_123', discord_username: 'freshie' },
          },
        },
        stripeSubscriptions: {
          sub_new: {
            id: 'sub_new',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
            cancel_at_period_end: false,
            canceled_at: null,
          },
        },
      },
      {
        label: 'Legacy customer (metadata missing, fallback to DB)',
        eventId: 'evt_2',
        customerId: 'cus_legacy',
        subscriptionId: 'sub_legacy',
        sessionMetadata: { payment_token_id: 'tok_legacy' },
        stripeCustomers: {
          cus_legacy: {
            id: 'cus_legacy',
            email: 'legacy@example.com',
            metadata: {},
          },
        },
        stripeSubscriptions: {
          sub_legacy: {
            id: 'sub_legacy',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000) - 3600,
            current_period_end: Math.floor(Date.now() / 1000) + 3600,
            cancel_at_period_end: false,
            canceled_at: null,
          },
        },
        dbCustomersByStripe: {
          cus_legacy: {
            id: 'db_cust_existing',
            discord_user_id: 'discord_legacy',
            stripe_customer_id: 'cus_legacy',
            email: 'legacy-db@example.com',
          },
        },
      },
    ]

    const results = []
    for (const scenario of scenarios) {
      const outcome = await runScenario(POST, scenario)
      results.push(outcome)
    }

    console.log(JSON.stringify(results, null, 2))
  } finally {
    restoreRequire()
    cleanup()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
