# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 web application for the Creative Technologists community membership platform. This is part of a monorepo - see `../CLAUDE.md` for full system architecture.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Tests
npm test
```

## Architecture Principles

### Mobile-First Design (CRITICAL)

**This is the driving design principle for the entire application.**

Every design change, component, layout, and feature MUST be optimized for mobile devices first, then enhanced for larger screens.

**Requirements for ALL changes**:
- Test on mobile viewport (375px width minimum) BEFORE desktop
- Touch targets minimum 44x44px for interactive elements
- Text readable at mobile sizes (16px base, never smaller than 14px)
- Forms must be mobile-friendly (large inputs, proper keyboard types, minimal typing)
- Navigation must work with thumbs (bottom-anchored or easily reachable)
- Images and assets optimized for mobile bandwidth
- Horizontal scrolling is NEVER acceptable on mobile
- Tailwind responsive classes: default = mobile, then `sm:`, `md:`, `lg:` for larger screens

**Testing Workflow**:
1. Design/implement for mobile first (320px - 428px)
2. Test in Chrome DevTools mobile view
3. Enhance for tablet (768px - 1024px)
4. Enhance for desktop (1280px+)

**Example Pattern**:
```tsx
// Good: Mobile-first Tailwind classes
<div className="flex flex-col gap-4 md:flex-row md:gap-8">
  <button className="w-full py-4 text-lg md:w-auto md:py-2 md:text-base">
    Submit
  </button>
</div>

// Bad: Desktop-first classes
<div className="flex-row gap-8 md:flex-col md:gap-4">
  <button className="w-auto py-2 text-base md:w-full md:py-4">
    Submit
  </button>
</div>
```

**Common Mobile Pitfalls to Avoid**:
- Fixed-width containers that break on small screens
- Hover-only interactions (use click/tap)
- Small text or buttons that require pinch-zoom
- Complex multi-column layouts on mobile
- Modals that don't fit in mobile viewport

### Data Flow Separation

This application follows a **read/write separation pattern** with the Discord bot:

- **Bot Writes, Web Reads**: Member activity data (`member_status`, `messages`, `reactions`, etc.)
- **Web Writes, Bot Reads**: Application and payment data (`applications`, `customers`, `subscriptions`, etc.)

**Critical**: Never modify bot-managed tables directly. Always read through RLS-enabled queries.

### Bot API Integration

The web app communicates with the Discord bot via FastAPI endpoints:

```
Web App → Bot API (HTTP) → Discord Guild (role management)
Web App → Supabase (SQL) ← Discord Bot (member data)
```

**Bot API Functions** (in `./lib/bot-api.ts`):
- `assignRole()` - Assign member role after payment
- `removeRole()` - Remove role on subscription end
- `getMembers()` - Fetch member directory data
- `assignRoleWithRetry()` - Role assignment with exponential backoff

### Payment Security Architecture

**One-Time Payment Tokens** (`./lib/payment-tokens.ts`):
1. Admin approves application → Generate random 64-char hex token
2. Store bcrypt hash in `payment_tokens` table (never store plaintext)
3. Email payment link to applicant: `/pay/[token]`
4. Token validation uses bcrypt.compare() against all valid hashes
5. Mark token as used after successful payment (prevents reuse)
6. Tokens expire after 7 days

**Stripe Webhook Idempotency** (`./lib/db.ts`):
- `isWebhookProcessed()` checks if event ID exists
- `markWebhookProcessed()` inserts event ID (ignores duplicate key errors)
- Prevents duplicate role assignments and database writes

### Subscription Lifecycle Management

**Stripe Webhook Events** (`./app/api/webhooks/stripe/route.ts`):
- `checkout.session.completed` - Create customer/subscription, assign role
- `invoice.payment_succeeded` - Reinforce role for active members
- `customer.subscription.updated` - Handle status changes, grace periods
- `customer.subscription.deleted` - Remove role when subscription ends

**Role Assignment Logic**:
- Active/past_due subscriptions: Keep role (grace period)
- Canceled subscriptions: Keep role until `current_period_end`
- Expired subscriptions: Remove role automatically

### Discord Auto-Join Flow

**1-Click OAuth** (`./app/api/discord/join/callback/route.ts`):
1. Success page shows "Join Discord" button
2. OAuth with `identify` + `guilds.join` scopes
3. Bot API adds user to guild with member role
4. Fallback to manual invite link if OAuth fails

**Requirements**:
- `DISCORD_BOT_TOKEN` - Bot token for guilds.join API
- Bot permissions: "Manage Server", "Create Invite", "Manage Roles"
- Bot role must be above member role in hierarchy

### Cron Job Architecture

**Daily Role Synchronization** (`/api/cron/sync-roles`):
- Runs daily at 3 AM UTC (configured via `vercel.json`)
- Syncs all subscriptions: assigns/removes roles based on status
- Handles edge cases: manual Discord removals, expired subscriptions, data drift
- **Required**: `CRON_SECRET` for production security (prevents unauthorized access)

### Data Layer Organization

All database operations are centralized in `./lib/db.ts`:

**Pattern**: Each table has dedicated helper functions (no raw Supabase queries in routes)

```typescript
// Good: Use helper function
const app = await getApplication(id)

// Bad: Raw query in route handler
const { data } = await supabase.from('applications').select()
```

**Key Helpers**:
- Application management: `getApplication()`, `createApplication()`, `updateApplicationStatus()`, `getApplicationsByStatus()`
- Customer/subscription: `getCustomerByDiscordId()`, `getCustomerByStripeId()`, `upsertCustomer()`, `upsertSubscription()`, `getAllSubscriptions()`
- Payment tokens: `createPaymentToken()`, `validatePaymentToken()`, `markTokenUsed()`
- Webhook idempotency: `isWebhookProcessed()`, `markWebhookProcessed()`
- Admin auth: `isAdmin()`

**Note**: Application status now includes `'waitlisted'` in addition to `'pending' | 'approved' | 'rejected'`

## API Route Patterns

### Authentication

**Discord OAuth Flow** (`./app/api/auth/discord/callback/route.ts`):
1. User clicks "Apply" → Redirects to Discord OAuth
2. Discord returns to `/api/auth/discord/callback`
3. Exchange code for access token
4. Fetch Discord user profile
5. Store in session/cookies for application form

**Admin Authentication**:
- Check `admins` table in Supabase using Discord user ID
- Use `isAdmin()` helper from `./lib/db.ts`
- Return 403 if not admin

### Rate Limiting

**Upstash Redis** (application submissions):
```typescript
// 3 applications per day per IP
const key = `ratelimit:apply:${ip}`
const limit = 3
const window = 86400 // 24 hours
```

Applied to: `POST /api/applications`

### Error Handling

**HTTP Status Codes**:
- `400` - Invalid input (validation errors)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (not admin, role assignment failed)
- `404` - Resource not found
- `409` - Conflict (duplicate application, webhook already processed)
- `429` - Rate limit exceeded
- `500` - Internal server error

**Error Response Format**:
```typescript
return NextResponse.json(
  { error: 'User-friendly message', detail: 'Technical details' },
  { status: 400 }
)
```

## TypeScript Patterns

### Type Safety with Supabase

All database types are defined in `./lib/db.ts`:

```typescript
export interface Application {
  id: string
  discord_user_id: string
  status: 'pending' | 'approved' | 'rejected'
  // ... other fields
}
```

**Pattern**: Import types from `./lib/db.ts`, never inline types in route handlers.

### Async/Await Conventions

- All route handlers are async
- Database operations always await
- Use try/catch for error handling (not .then/.catch)
- API calls to bot use exponential backoff retry when critical

## Environment Variables

**Required for Development**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
DISCORD_CLIENT_ID=[client-id]
DISCORD_CLIENT_SECRET=[client-secret]
DISCORD_JOIN_REDIRECT_URI=http://localhost:3000/api/discord/join/callback
DISCORD_BOT_TOKEN=[bot-token]  # Required for guilds.join API
STRIPE_SECRET_KEY=sk_test_[key]
STRIPE_PRICE_ID=price_[id]
BOT_API_URL=http://localhost:8000
BOT_API_KEY=[shared-with-bot]
```

**Required for Production**:
- `CRON_SECRET` - Cron job authentication (prevents unauthorized role sync access)

**Optional but Recommended**:
- `UPSTASH_REDIS_REST_URL` - Rate limiting
- `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` - CAPTCHA
- `RESEND_API_KEY` - Email notifications
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
- `NEXT_PUBLIC_DISCORD_INVITE_URL` - Fallback Discord invite link

**Validation**: Most services will fail loudly if keys are missing. Check terminal output on `npm run dev`.

## Common Development Workflows

### Adding a New API Endpoint

1. Create route file: `./app/api/[name]/route.ts`
2. Define request validation schema (if needed)
3. Add database helper to `./lib/db.ts` (don't inline Supabase queries)
4. Implement handler with proper error codes
5. Add TypeScript types to `./lib/db.ts`

### Adding a New UI Component or Page

1. Design mobile layout FIRST (375px viewport)
2. Create component with mobile-first Tailwind classes
3. Test on mobile viewport in Chrome DevTools
4. Add responsive enhancements for tablet (`md:`) and desktop (`lg:`)
5. Verify all interactive elements are touch-friendly (44x44px)
6. Check text readability (minimum 16px base size)
7. Test with actual mobile device if possible

### Testing Stripe Integration Locally

```bash
# Terminal 1: Start web app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Use test card: 4242 4242 4242 4242
```

**Note**: Copy webhook signing secret from Stripe CLI output to `STRIPE_WEBHOOK_SECRET`

### Testing Bot API Integration Locally

1. Start bot: `cd ../ns-bot && python src/bot.py`
2. Verify bot API: `curl http://localhost:8000/health`
3. Start web: `npm run dev`
4. Check member directory: `http://localhost:3000/members`

**Troubleshooting**: If members don't appear, check bot is writing to Supabase and RLS policies allow public read.

### Testing Subscription & Discord Integration

**Subscription Lifecycle (Local)**:
```bash
# Terminal 1: Start web app
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test subscription events in Stripe Dashboard or with test cards
```

**Discord Auto-Join (Local)**:
1. Set `DISCORD_BOT_TOKEN` and `DISCORD_JOIN_REDIRECT_URI` in `.env.local`
2. Complete a test payment → Visit `/success` page
3. Click "Join Discord (1-click)" button
4. Verify user added to Discord server with role

**Cron Job (Manual)**:
```bash
# Test role synchronization endpoint
curl http://localhost:3000/api/cron/sync-roles

# With CRON_SECRET (if configured)
curl -H "Authorization: Bearer your_cron_secret" \
  http://localhost:3000/api/cron/sync-roles
```

**Complete Testing**: See `NEXT_STEPS.md` for comprehensive edge case scenarios (subscription cancellation, expiration, payment failures, etc.)

## Key Implementation Details

### Member Directory Caching

**Bot API Response Caching** (`./lib/bot-api.ts`):
```typescript
next: { revalidate: 300 } // 5-minute cache
```

Prevents excessive bot API calls while keeping data reasonably fresh.

### Stripe Checkout Flow

1. Application approved → Generate payment token
2. Email token link: `/pay/[token]`
3. Payment page validates token, creates Stripe customer
4. Redirect to Stripe Checkout (subscription mode)
5. Webhook handler processes `checkout.session.completed`
6. Role assigned via bot API
7. Mark token as used

### Discord Role Assignment Retry Logic

**Exponential Backoff** (`./lib/bot-api.ts`):
```typescript
assignRoleWithRetry(userId, roleId, appId, maxRetries: 3)
// Retry delays: 1s, 2s, 4s
```

**Why**: Discord API rate limits and bot may be temporarily unavailable.

### Admin Dashboard Real-Time Updates

**Polling Strategy**: Admin dashboard refetches applications every 30 seconds to show new submissions.

**Alternative**: Could use Supabase real-time subscriptions (not implemented).

## Testing Strategy

### TDD Workflow (from global CLAUDE.md)

1. Write tests first
2. Implement feature
3. Test and refactor

**Current Coverage**: Tests should be co-located with features in `./app/` directory.

### Manual Testing Checklist

**Mobile-First Testing (REQUIRED)**:
- [ ] Test ALL pages on mobile viewport (375px) FIRST
- [ ] All interactive elements are touch-friendly (44x44px minimum)
- [ ] Text is readable without zooming (16px minimum)
- [ ] No horizontal scrolling on any page
- [ ] Forms work well with mobile keyboards
- [ ] Navigation is thumb-accessible

**Application Flow**:
- [ ] Discord OAuth redirects correctly (mobile + desktop)
- [ ] Application form validates inputs (mobile + desktop)
- [ ] Rate limiting blocks after 3 submissions
- [ ] CAPTCHA verifies (if enabled)

**Payment Flow**:
- [ ] Payment token link works (mobile + desktop)
- [ ] Token expires after 7 days
- [ ] Token can only be used once
- [ ] Stripe checkout completes (mobile + desktop)
- [ ] Webhook assigns Discord role

**Admin Flow**:
- [ ] Only whitelisted users can access `/admin` (mobile + desktop)
- [ ] Applications show pending status (mobile + desktop)
- [ ] Approve button generates payment token
- [ ] Reject button updates status

## Deployment (Vercel)

See `./DEPLOYMENT.md` for complete deployment guide.

**Quick Deploy**:
1. Push to GitHub
2. Import project in Vercel (select `ns-web/` directory)
3. Add all environment variables
4. Deploy

**Post-Deploy**:
- Configure Stripe webhook: `https://[domain]/api/webhooks/stripe`
- Update Discord OAuth redirect: `https://[domain]/api/auth/discord/callback`
- Seed `admins` table with Discord user IDs

## Common Issues

### "Bot API is not healthy"

**Check**:
1. `BOT_API_URL` environment variable is correct
2. Bot is running: `curl $BOT_API_URL/health`
3. Railway service isn't sleeping (upgrade to Hobby plan if needed)

### "Member directory is empty"

**Check**:
1. Bot is running and connected to Discord
2. `member_status` table has data in Supabase
3. RLS policy allows public SELECT on `member_status`
4. Browser console for fetch errors

### "Stripe webhook failed"

**Check**:
1. `STRIPE_WEBHOOK_SECRET` matches webhook endpoint secret
2. Webhook endpoint is publicly accessible
3. Stripe dashboard shows delivery attempts
4. Check Vercel/Railway logs for errors

### "Application already exists"

User has already submitted an application. This is rate limiting working correctly. Check `applications` table for duplicate `discord_user_id`.

### "Discord auto-join fails"

**Check**:
1. `DISCORD_BOT_TOKEN` is set correctly
2. Bot has "Manage Server", "Create Invite", and "Manage Roles" permissions
3. Bot role is **above** member role in server hierarchy
4. OAuth redirect URI includes `/api/discord/join/callback`
5. Verify subscription is active (check `subscriptions` table)

**Fallback**: User can use manual invite link if configured via `NEXT_PUBLIC_DISCORD_INVITE_URL`

### "Cron job not running"

**Check**:
1. `vercel.json` exists and includes cron configuration
2. File is committed and deployed to Vercel
3. Check Vercel dashboard → Functions → Cron Jobs
4. Test manually: `curl https://yourdomain.com/api/cron/sync-roles`
5. Check Vercel logs for cron execution history

**Note**: Cron jobs don't run in local development. Use manual curl for local testing.

### "Subscription webhook not processing"

**Check**:
1. `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard webhook secret
2. Webhook signature verification passes (check logs)
3. Idempotency check isn't blocking legitimate events
4. Customer has `discord_user_id` in metadata
5. Test locally with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**See also**: `NEXT_STEPS.md` for complete edge case testing scenarios

## File Reference

**Core Libraries**:
- `./lib/db.ts` - Database operations, types, Supabase client
- `./lib/bot-api.ts` - Bot API client, member data fetching
- `./lib/stripe.ts` - Stripe operations, subscription management
- `./lib/payment-tokens.ts` - Secure token generation/validation
- `./lib/discord.ts` - Discord OAuth helpers
- `./lib/validations.ts` - Input validation schemas

**API Routes**:
- `./app/api/auth/discord/callback/route.ts` - Discord OAuth callback
- `./app/api/applications/route.ts` - Application submission
- `./app/api/admin/applications/[id]/approve/route.ts` - Approve application
- `./app/api/admin/applications/[id]/reject/route.ts` - Reject application
- `./app/api/admin/applications/[id]/waitlist/route.ts` - Waitlist application
- `./app/api/webhooks/stripe/route.ts` - Stripe webhook handler (subscription lifecycle)
- `./app/api/cron/sync-roles/route.ts` - Daily role synchronization
- `./app/api/discord/join/callback/route.ts` - Discord auto-join OAuth callback

**Pages**:
- `./app/page.tsx` - Landing page
- `./app/members/page.tsx` - Public member directory
- `./app/apply/page.tsx` - Application start (Discord OAuth)
- `./app/apply/form/page.tsx` - Application form
- `./app/admin/page.tsx` - Admin dashboard (multiple views)
- `./app/admin/login/page.tsx` - Admin login page
- `./app/pay/[token]/page.tsx` - Payment page
- `./app/success/page.tsx` - Post-payment success page (Discord join)

## Related Documentation

- **Monorepo Overview**: `../CLAUDE.md`
- **Bot Documentation**: `../ns-bot/CLAUDE.md`
- **Database Schema**: `../ns-bot/SUPABASE_SCHEMA.md`
- **Design System**: `./DESIGN_SYSTEM.md`
- **Web README**: `./README.md`
- **Deployment Guide**: `./DEPLOYMENT.md`
- **Production Deployment & Testing**: `./NEXT_STEPS.md`

## Plan Mode Instructions

When in plan mode (before implementation):
- Sacrifice grammar for the sake of concision
- List any unresolved questions at the end of your plan
- Format questions clearly and concisely
- Prioritize questions by importance (critical → nice-to-have)
- If no questions exist, explicitly state that the plan is ready for execution

## Documentation Workflow

When completing items in `NEXT_STEPS.md`:
1. Mark the item complete (✅) in `NEXT_STEPS.md`
2. Update relevant sections in `CLAUDE.md` (architecture, workflows, environment variables)
3. Keep documentation in sync with implemented features
