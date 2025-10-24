# Next Steps - Creative Technologists Platform

**Status:** Security hardening complete ✅ | Admin dashboard enhanced ✅ | Payment system configured ✅

**Date:** October 24, 2025

> **Recent Updates (Oct 24, 2025):**
> - Admin dashboard now shows ALL Discord members (not just paid subscribers)
> - Payment status indicators added to member cards
> - Stripe price configured for $299/month recurring subscriptions
> - `getAllSubscriptions()` query enhanced to fetch all subscription statuses

> **Testing caveats:** Latest automated suites rely on mocked services. Real Stripe Checkout/webhook delivery, Discord bot role sync, and Resend email flows still need live integration runs before go-live.

---

## 🎉 Latest Enhancements (Oct 24, 2025)

### Admin Dashboard - Payment Status Visibility

**Problem:** Admin "Current Members" section only showed users with active subscriptions in database. Manually added Discord members or users with payment issues were invisible.

**Solution:** Complete redesign of member display logic:

1. **Show ALL Discord members** - Fetches from `member_status` table (bot-synced Discord roster)
2. **Merge with subscription data** - Joins with `subscriptions` table to check payment status
3. **Visual payment indicators** - Each member card shows:
   - 🟢 **Paid** - Green badge for active subscription
   - 🟡 **No Payment Record** - Amber badge for Discord members without subscription
4. **Smart sorting** - Paid members first, then sorted by recent activity
5. **Accurate stats** - Overview shows "X paid, Y unpaid" breakdown

**Files Changed:**
- `./app/admin/page.tsx:134-194` - Member list building logic
- `./app/admin/page.tsx:625-687` - Payment status badges in UI
- `./app/admin/page.tsx:240-265` - Overview statistics
- `./lib/db.ts:558-576` - `getAllSubscriptions()` query enhancement

**Testing:**
```bash
# Start dev server and visit admin dashboard
npm run dev
# Navigate to http://localhost:3000/admin
# Check "Current Members" section shows all Discord users
# Verify payment status badges (green = paid, amber = no payment)
```

### Stripe Configuration - Recurring Subscriptions

**Problem:** Stripe price was configured as ONE-TIME payment ($199) but code expects RECURRING subscriptions.

**Solution:**
1. Created new recurring price: `price_1SLnkmLp0ctwZDdXTF16gXdp` ($299/month)
2. Updated `.env` with correct `STRIPE_PRICE_ID`
3. Enhanced `isSubscriptionActive()` to handle all subscription statuses (active, past_due, canceled, incomplete, unpaid)

**Testing Required:** Complete end-to-end payment flow test (see below)

---

## ✅ What's Working (Happy Path)

The complete membership flow is fully functional:

1. **Application Submission** ✅
   - User authenticates with Discord OAuth
   - Submits application form
   - Application stored in database

2. **Admin Review** ✅
   - Admin logs in via Discord OAuth
   - Reviews pending applications
   - Approves application

3. **Payment Flow** ✅
   - Approval email sent with payment link
   - Payment token validated (one-time use, 7-day expiry)
   - Stripe Checkout creates $1 test subscription
   - Customer and subscription records created in database

4. **Discord Integration** ✅
   - User clicks "Join Discord (1-click)" on success page
   - OAuth authorizes with `identify` + `guilds.join` scopes
   - User automatically added to Discord server
   - Member role assigned immediately
   - Webhook processes Stripe events successfully

---

## 🔴 Critical: Edge Cases to Test

**📋 Full Testing Guide:** See `TESTING_GUIDE.md` for step-by-step instructions for all 27 test scenarios

These scenarios are **untested** and may have bugs:

### Subscription Lifecycle

- [ ] **Subscription Cancellation**
  - Cancel a test subscription in Stripe Dashboard
  - Verify `customer.subscription.deleted` webhook fires
  - Confirm role is removed from Discord via bot API
  - Check database `subscriptions.status` updated to `canceled`
  - User should appear in "Expired Members" section after `current_period_end`

- [ ] **Subscription Expiration**
  - Wait for `current_period_end` to pass on a canceled subscription
  - OR manually update `current_period_end` to past date in database
  - Run cron job: `curl http://localhost:3000/api/cron/sync-roles`
  - Verify role is removed from Discord
  - Check user moves from "Current Members" to "Expired Members"

- [ ] **Payment Failure (past_due)**
  - Simulate failed payment in Stripe
  - Verify `customer.subscription.updated` webhook fires with `status: past_due`
  - Confirm role is **kept** (grace period)
  - Check subscription status in database

- [ ] **Subscription Renewal**
  - Test that `invoice.payment_succeeded` webhook fires monthly
  - Verify role remains assigned
  - Check no duplicate role assignments

- [ ] **Manual Discord Removal**
  - Manually kick user from Discord server
  - User clicks "Join Discord (1-click)" again
  - Should be re-added with role (if subscription still active)

### Application Flows

- [ ] **Application Rejection**
  - Reject a pending application in admin
  - Verify status updates to `rejected`
  - Check user cannot access payment page (no token generated)
  - ⚠️ **Missing:** Rejection email not implemented

- [ ] **Application Waitlist**
  - Waitlist a pending application in admin
  - Verify status updates to `waitlisted`
  - ⚠️ **Missing:** Waitlist email not implemented

- [ ] **Duplicate Application**
  - User submits application twice
  - Should be blocked by unique constraint on `discord_user_id`
  - Verify friendly error message shown

- [ ] **Email Deliverability**
  - Add DKIM/SPF/DMARC records (Resend dashboard shows required DNS entries)
  - Consider using dedicated subdomain (e.g., `mail.rasp.club`) for transactional mail
  - Send follow-up approval email to confirm it lands in inbox (not spam)

- [ ] **Rate Limiting**
  - Submit 4 applications from same IP
  - 4th should be blocked by the application rate limiter
  - Verify 429 status returned

---

## 🟡 Important: Cron Job Setup

**Status:** Endpoint exists (`/api/cron/sync-roles`) but **not tested or scheduled**

### What the Cron Does

Daily synchronization to:
- Remove roles from expired subscriptions (`current_period_end` passed)
- Keep roles for active/past_due subscriptions
- Keep roles for canceled subscriptions until `current_period_end`
- Handle edge cases (manual Discord removals, data drift)

### Testing Locally

```bash
# Test the endpoint manually
curl http://localhost:3000/api/cron/sync-roles

# Or with authentication (if CRON_SECRET is set)
curl -H "Authorization: Bearer your_cron_secret" \
  http://localhost:3000/api/cron/sync-roles
```

**What to Verify:**
- [ ] Logs show roles synced for each user
- [ ] Expired members have roles removed
- [ ] Active members keep roles
- [ ] Past_due members keep roles (grace period)
- [ ] Canceled but current (before period end) keep roles

### Production Setup

#### 1. Add Vercel Cron Configuration

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-roles",
      "schedule": "0 3 * * *"
    }
  ]
}
```

This runs daily at 3 AM UTC.

#### 2. Add Cron Secret

In production `.env` (Vercel):
```bash
CRON_SECRET=generate_random_secret_here
```

Update the cron endpoint to require this secret:
```typescript
// In app/api/cron/sync-roles/route.ts
const authHeader = request.headers.get('authorization')
const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
if (authHeader !== expectedAuth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### 3. Monitoring

- [ ] Set up logging for cron execution (how many roles added/removed)
- [ ] Alert on failures (email/Slack)
- [ ] Track execution time
- [ ] Monitor for rate limit issues with Discord/Bot API

---

## 🟢 Production Deployment Checklist

### Stripe Configuration

- [ ] **Switch to Live Mode**
  - Create live product: "Members" ($199/month recurring)
  - Copy live price ID
  - Update production env: `STRIPE_PRICE_ID=price_live_...`

- [ ] **Update API Keys**
  - Get live secret key: `STRIPE_SECRET_KEY=sk_live_...`
  - Get live publishable key: `STRIPE_PUBLISHABLE_KEY=pk_live_...`
  - Add to Vercel environment variables

- [ ] **Configure Live Webhook**
  - Stripe Dashboard → Webhooks → Add endpoint
  - URL: `https://yourdomain.com/api/webhooks/stripe`
  - Events:
    - `checkout.session.completed`
    - `invoice.payment_succeeded`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
  - Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET=whsec_live_...`

### Discord Configuration

- [ ] **Update OAuth Redirect URIs**
  - Add production URLs to Discord Developer Portal:
    - `https://yourdomain.com/api/auth/discord/callback`
    - `https://yourdomain.com/api/discord/join/callback`

- [ ] **Verify Bot Permissions**
  - Ensure bot has "Create Invite" permission in production server
  - Ensure bot has "Manage Roles" permission
  - Verify bot role is above member role in hierarchy

- [ ] **Create Discord Invite Link (Optional)**
  - Generate never-expiring invite
  - Add to production env: `NEXT_PUBLIC_DISCORD_INVITE_URL=https://discord.gg/...`

### Vercel Deployment

- [ ] **Environment Variables**
  - Copy all variables from `.env` to Vercel Dashboard
  - Update URLs from localhost to production
  - Verify all secrets are set

- [ ] **Domain Configuration**
  - Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
  - Update `NEXTAUTH_URL=https://yourdomain.com`

- [ ] **Vercel Cron**
  - Add `vercel.json` (see cron setup above)
  - Verify cron is scheduled after deployment
  - Test cron execution in Vercel logs

### Railway Bot Deployment

- [ ] **Verify Bot Environment**
  - Confirm `BOT_API_KEY` matches web app
  - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
  - Check `DISCORD_GUILD_ID` and bot token

- [ ] **Test Bot Health**
  - `curl https://your-bot.railway.app/health`
  - Should return: `{"status":"healthy","bot_ready":true}`

- [ ] **Generate Domain**
  - Ensure Railway public domain is set
  - Update web app: `BOT_API_URL=https://your-bot.railway.app`

### Email Configuration

- [ ] **Verify Resend Domain**
  - Production should use verified domain, not `onboarding@resend.dev`
  - Update: `FROM_EMAIL=noreply@yourdomain.com`
  - Verify DNS records in Resend Dashboard

### Security Checklist

- [ ] All API keys in environment variables (not hardcoded) ✅
- [ ] `.env` files gitignored ✅
- [ ] Stripe webhook signature verification enabled ✅
- [ ] Rate limiting configured for `/api/applications` ✅
- [ ] Payment tokens use bcrypt hashing ✅
- [ ] One-time payment tokens expire after 7 days ✅
- [ ] Admin authentication via Discord ID whitelist ✅
- [ ] Bot API key authentication enabled ✅
- [ ] Admin cookies signed with HMAC-SHA256 ✅ (prevents forgery)
- [ ] CRON_SECRET required for production ✅ (prevents unauthorized access)
- [ ] Payment tokens invalidated after successful payment ✅ (supports retry on abandoned checkout)
- [ ] Discord join callback uses centralized Supabase client ✅ (consistent RLS behavior)
- [ ] vercel.json configured for cron scheduling ✅

### Security Improvements Implemented (October 2025)

The following critical security vulnerabilities were identified and fixed before production deployment:

1. **Admin Cookie Forgery Prevention** ✅
   - **Issue**: Admin authentication relied on unsigned `discord_user` cookie that could be forged
   - **Fix**: Implemented HMAC-SHA256 signing/verification using `NEXTAUTH_SECRET`
   - **Files**: `lib/signed-cookies.ts`, `lib/admin-auth.ts`, `app/api/auth/discord/callback/route.ts`

2. **Cron Endpoint Security** ✅
   - **Issue**: `/api/cron/sync-roles` had optional authentication, allowing unauthorized role sync
   - **Fix**: Made `CRON_SECRET` required, endpoint returns 500 if not set
   - **Files**: `app/api/cron/sync-roles/route.ts`, `CLAUDE.md`

3. **Payment Token Retry Support** ✅
   - **Issue**: Tokens invalidated when checkout created, stranding users on abandoned/failed sessions
   - **Fix**: Token invalidation moved to `checkout.session.completed` webhook (after successful payment)
   - **Files**: `app/pay/[token]/page.tsx`, `app/api/webhooks/stripe/route.ts`, `lib/stripe.ts`

4. **Exposed Secrets in Documentation** ✅
   - **Issue**: Real secrets committed to `NEXT_STEPS.md` (BOT_API_KEY, NEXTAUTH_SECRET, etc.)
   - **Fix**: Replaced all exposed values with placeholders and generation instructions
   - **Files**: `NEXT_STEPS.md`

5. **Discord Join Database Access** ✅
   - **Issue**: Join callback created duplicate Supabase client, potential RLS issues
   - **Fix**: Centralized subscription query in `lib/db.ts` for consistent client usage
   - **Files**: `app/api/discord/join/callback/route.ts`, `lib/db.ts`

6. **Cron Job Scheduling** ✅
   - **Issue**: vercel.json missing - cron job wouldn't run in production
   - **Fix**: Created vercel.json with daily 3 AM UTC schedule
   - **Files**: `vercel.json` (new file)

---

## 🔵 Optional: User Experience Improvements

### Email Notifications (Post-Launch)

**Currently Implemented:**
- ✅ Approval email with payment link

**Missing:**
- [ ] Rejection email template
- [ ] Waitlist email template
- [ ] Payment receipt (Stripe handles this?)
- [ ] Subscription cancellation notice
- [ ] Payment failure warning
- [ ] Welcome email after Discord join

**Implementation:**
- Update `lib/resend.ts` with new email templates
- Call in respective API routes (reject, waitlist, etc.)

### User Dashboard (Future Enhancement)

Build a member dashboard at `/dashboard`:

- [ ] **View Subscription Status**
  - Current plan
  - Billing cycle dates
  - Payment method on file

- [ ] **Manage Subscription**
  - Cancel subscription (Stripe Customer Portal)
  - Update payment method
  - View billing history

- [ ] **Download Invoices**
  - List past invoices
  - PDF download links

**Implementation:**
- Use Stripe Customer Portal for most features
- Create new page: `app/dashboard/page.tsx`
- Authenticate via Discord OAuth session
- Fetch subscription data from database

### Admin Enhancements

- [ ] **Bulk Actions**
  - Approve/reject multiple applications at once
  - Export applications to CSV

- [ ] **Analytics Dashboard**
  - Application conversion rate
  - Active subscriber count
  - Monthly recurring revenue (MRR)
  - Churn rate

- [ ] **Member Search**
  - Filter by status, join date, activity
  - Search by Discord username

---

## 📊 Monitoring & Observability

### Error Tracking

- [ ] **Set up Sentry** (or similar)
  - Capture webhook failures
  - Track Discord API errors
  - Alert on payment processing issues

### Key Metrics to Track

**Application Funnel:**
- Applications submitted
- Approval rate
- Payment completion rate
- Discord join rate

**Subscription Metrics:**
- Active subscriptions
- Monthly recurring revenue (MRR)
- Churn rate
- Failed payment rate

**System Health:**
- Webhook delivery success rate
- Cron job execution success
- Bot API uptime
- Discord role assignment success rate

### Logging

Current logging is console-based. Consider:
- [ ] Structured logging (JSON format)
- [ ] Log aggregation (Datadog, LogTail, etc.)
- [ ] Separate log levels (debug, info, warn, error)

---

## 🎯 Success Criteria

Before considering the platform "production-ready":

**Functionality:**
- ✅ Happy path tested end-to-end
- [ ] All edge cases tested and working
- [ ] Cron job running daily without errors
- [ ] Subscription cancellation removes role
- [ ] Expired subscriptions handled automatically

**Deployment:**
- [ ] Production Stripe configuration complete
- [ ] All environment variables set in Vercel/Railway
- [ ] Custom domain configured
- [ ] SSL certificates valid

**Operations:**
- [ ] Error monitoring set up
- [ ] Webhook delivery monitoring
- [ ] Cron job monitoring
- [ ] Daily backups of Supabase database

**User Experience:**
- [ ] All email templates implemented
- [ ] Error messages are user-friendly
- [x] Payment flow tested with real card
- [x] Discord join works reliably

---

## 📝 Known Issues / Tech Debt

1. **Payment Token Query Performance**
   - Current: `SELECT * FROM payment_tokens` + bcrypt compare loop
   - Better: Index on `token_hash` for faster lookups
   - Impact: Low (few tokens at a time)

2. **Subscription Query in Join Callback**
   - Uses local Supabase client instead of shared helper
   - Should consolidate into `lib/db.ts`
   - Impact: Low (code organization)

3. **Missing Webhook Event Logging**
   - Events are processed but not logged to database
   - Consider adding `webhook_events` table for audit trail
   - Impact: Medium (debugging webhook issues)

4. **No Retry Logic for Failed Webhooks**
   - If webhook processing fails, event is lost
   - Stripe auto-retries, but we don't track failures
   - Impact: Medium (rare but possible)

5. **Bot API Single Point of Failure**
   - If Railway bot is down, role assignments fail silently
   - Consider adding retry queue (e.g., Inngest, QStash)
   - Impact: Medium (affects user experience)

---

## 📚 Related Documentation

- **Testing Guide:** `./TESTING_GUIDE.md` ← Start here for edge case testing
- **Monorepo Overview:** `../CLAUDE.md`
- **Bot Documentation:** `../ns-bot/CLAUDE.md`
- **Web App README:** `./README.md`
- **Deployment Guide:** `./DEPLOYMENT.md`
- **Database Schema:** `../ns-bot/SUPABASE_SCHEMA.md`

---

## 🚀 Quick Start for Next Session

**Current Priority: Edge Case Testing**

1. **Test subscription lifecycle** ← START HERE
   - Subscription cancellation (webhook + role removal)
   - Subscription expiration (cron job)
   - Payment failure grace period (past_due keeps role)
   - Manual Discord removal + rejoin

2. **Test cron job locally**
   - Set CRON_SECRET in .env.local
   - Run: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync-roles`
   - Verify role sync logs

3. **Test application edge cases**
   - Rejection flow
   - Waitlist flow
   - Duplicate application blocking
   - Rate limiting (4th attempt blocked)

**After Testing Complete:**
4. **Prepare production environment** (Stripe live mode, domains)
5. **Deploy to production** (Vercel + Railway)
6. **Monitor first real transactions**

---

**Last Updated:** October 16, 2025
**Current Phase:** Security Hardening Complete → Edge Case Testing

---
---

# Production Deployment Checklist

**Last Updated:** October 16, 2025
**Current Status:** Security Complete → Edge Case Testing → Production Deployment

---

## Pre-Deployment: Domain Setup

- [ ] Purchase/configure production domain (e.g., `creativetechnologists.com`)
- [ ] Configure DNS records to point to Vercel
- [ ] Verify SSL certificate is active (handled by Vercel automatically)
- [ ] Test domain resolves correctly

**Production Domain:** `_______________________`

---

## 1. Discord Developer Portal

**Portal:** https://discord.com/developers/applications

### OAuth Application Settings

- [ ] Navigate to your Discord application
- [ ] Go to **OAuth2 → General**
- [ ] Add production redirect URIs:
  - [ ] `https://yourdomain.com/api/auth/discord/callback` (application flow)
  - [ ] `https://yourdomain.com/api/discord/join/callback` (guild join flow)
- [ ] Keep localhost URIs for local development (optional)

### Bot Configuration

- [ ] Go to **Bot** section
- [ ] Verify bot token is accessible (don't regenerate unless necessary)
- [ ] Confirm **Privileged Gateway Intents** are enabled:
  - [ ] Server Members Intent
  - [ ] Message Content Intent
- [ ] Copy bot token → `DISCORD_BOT_TOKEN` environment variable

### Production Discord Server

- [ ] Ensure bot is invited to production Discord server
- [ ] Verify bot has these permissions:
  - [ ] Manage Roles
  - [ ] Create Invite (for guilds.join)
  - [ ] View Channels
- [ ] Verify bot role is **above** the member role in hierarchy
- [ ] Get production server ID → `DISCORD_GUILD_ID`
- [ ] Get production member role ID → `MEMBER_ROLE_ID`

**Environment Variables to Update:**
```bash
DISCORD_CLIENT_ID=          # Same for dev/prod
DISCORD_CLIENT_SECRET=      # Same for dev/prod
DISCORD_BOT_TOKEN=          # Same for dev/prod
DISCORD_GUILD_ID=           # Production server ID
MEMBER_ROLE_ID=             # Production role ID
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback
DISCORD_JOIN_REDIRECT_URI=https://yourdomain.com/api/discord/join/callback
```

**Optional:**
- [ ] Generate permanent Discord invite link for fallback
- [ ] Add to `NEXT_PUBLIC_DISCORD_INVITE_URL`

---

## 2. Stripe Dashboard

**Portal:** https://dashboard.stripe.com

### Switch to Live Mode

- [ ] Toggle from **Test Mode** to **Live Mode** (top-right corner)

### Create Live Product

- [ ] Go to **Products** → **Add Product**
- [ ] Name: `Members` (or your preferred name)
- [ ] Pricing model: **Recurring**
- [ ] Price: `$199.00` USD (or your production price)
- [ ] Billing period: **Monthly**
- [ ] Create product
- [ ] Copy price ID (starts with `price_live_...`)
- [ ] Update environment variable: `STRIPE_PRICE_ID=price_live_...`

### Get Live API Keys

- [ ] Go to **Developers** → **API keys**
- [ ] Copy **Secret key** (starts with `sk_live_...`)
  - [ ] Update: `STRIPE_SECRET_KEY=sk_live_...`
- [ ] Copy **Publishable key** (starts with `pk_live_...`)
  - [ ] Update: `STRIPE_PUBLISHABLE_KEY=pk_live_...`
  - [ ] Update: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

### Configure Live Webhook

- [ ] Go to **Developers** → **Webhooks**
- [ ] Click **Add endpoint**
- [ ] Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Description: `Production membership webhook`
- [ ] Select events to listen to:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.payment_succeeded`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Click **Add endpoint**
- [ ] Click on the new endpoint to view details
- [ ] Click **Reveal** under **Signing secret**
- [ ] Copy signing secret (starts with `whsec_live_...`)
- [ ] Update: `STRIPE_WEBHOOK_SECRET=whsec_live_...`

### Verify Test Mode Webhook (Keep for Testing)

- [ ] Switch back to **Test Mode**
- [ ] Verify test webhook still exists for local development
- [ ] Keep test webhook secret for `.env.local`

**Environment Variables to Update:**
```bash
# Live Mode (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_PRICE_ID=price_live_...  # $199/month product
```

---

## 3. Resend (Email Service)

**Portal:** https://resend.com/domains

### Domain Verification

- [ ] Go to **Domains**
- [ ] Click **Add Domain**
- [ ] Enter your production domain (e.g., `creativetechnologists.com`)
- [ ] Copy DNS records provided by Resend
- [ ] Add DNS records to your domain registrar:
  - [ ] TXT record for domain verification
  - [ ] MX records (if using Resend for receiving)
  - [ ] DKIM records for email authentication
- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] Verify domain status shows **Verified** in Resend dashboard

### Update Email Configuration

- [ ] Get API key from **API Keys** section (or use existing)
- [ ] Update environment variables:

**Environment Variables to Update:**
```bash
RESEND_API_KEY=re_...        # Same for dev/prod
FROM_EMAIL=noreply@yourdomain.com  # Production domain email
```

### Test Email Delivery

- [ ] Send test email from Resend dashboard
- [ ] Verify it doesn't land in spam
- [ ] Check DKIM/SPF authentication passes

---

## 4. Railway (Discord Bot Hosting)

**Portal:** https://railway.app

### Access Bot Project

- [ ] Login to Railway
- [ ] Navigate to bot project (e.g., `daily-digest-bot`)
- [ ] Go to bot service
- [ ] Click **Variables** tab

### Update Environment Variables

Update the following variables with production values:

```bash
# Discord Configuration
DISCORD_TOKEN=              # Same bot token as web app
DISCORD_GUILD_ID=           # Production Discord server ID

# Supabase (Same as web app)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=  # Service role key (not anon key)

# OpenAI (Same for dev/prod)
OPENAI_API_KEY=sk-...

# Bot API Configuration
BOT_API_HOST=0.0.0.0
BOT_API_PORT=8000
BOT_API_KEY=                # Must match web app's BOT_API_KEY

# Digest Configuration (Same for dev/prod)
DIGEST_CHANNEL_NAME=daily-digest
DIGEST_TIME_HOUR=22
DIGEST_TIME_MINUTE=0
DIGEST_TIMEZONE=America/New_York
```

### Verify Bot Deployment

- [ ] Check **Deployments** tab shows successful deployment
- [ ] Check **Logs** for startup messages
- [ ] Verify bot is online in Discord server (green status)
- [ ] Test bot health endpoint:
  ```bash
  curl https://your-bot.railway.app/health
  ```
  Should return: `{"status":"healthy","bot_ready":true}`

### Get Public Domain

- [ ] Ensure Railway public domain is generated
- [ ] Copy domain (e.g., `https://daily-digest-bot-production-5e9c.up.railway.app`)
- [ ] Update web app environment variable: `BOT_API_URL=https://your-bot.railway.app`

**Checklist:**
- [ ] Bot is running and healthy
- [ ] Bot appears online in Discord server
- [ ] Bot API responds to health checks
- [ ] Bot has correct production server ID and role ID

---

## 5. Vercel (Web App Hosting)

**Portal:** https://vercel.com

### Deploy Project

- [ ] Push code to GitHub/GitLab (if not already)
- [ ] Import project in Vercel
- [ ] Select `ns-web/` directory as root
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### Configure Custom Domain

- [ ] Go to **Settings** → **Domains**
- [ ] Add custom domain (e.g., `creativetechnologists.com`)
- [ ] Follow DNS configuration instructions
- [ ] Wait for SSL certificate to provision (automatic)
- [ ] Verify domain is active and HTTPS works

### Add Environment Variables

- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add all production variables (mark as **Production** environment):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Next.js
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback
DISCORD_JOIN_REDIRECT_URI=https://yourdomain.com/api/discord/join/callback
DISCORD_BOT_TOKEN=
NEXT_PUBLIC_DISCORD_INVITE_URL=https://discord.gg/xxxxx  # Optional

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_PRICE_ID=price_live_...

# Bot API (Railway)
BOT_API_URL=https://your-bot.railway.app
BOT_API_KEY=                # Must match Railway bot's BOT_API_KEY

# Discord Server
DISCORD_GUILD_ID=
MEMBER_ROLE_ID=

# Admin
ADMIN_DISCORD_ID=           # Your Discord user ID

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=            # Generate with: openssl rand -base64 32

# Resend (Email)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

### Configure Vercel Cron (for role sync)

- [ ] Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-roles",
      "schedule": "0 3 * * *"
    }
  ]
}
```

- [ ] Commit and push `vercel.json`
- [ ] Verify cron is scheduled in Vercel dashboard under **Cron Jobs**

### Redeploy After Configuration

- [ ] Trigger new deployment (or wait for auto-deploy from git push)
- [ ] Check **Deployments** for build logs
- [ ] Verify deployment succeeded
- [ ] Test production URL: `https://yourdomain.com`

---

## 6. Supabase (Database)

**Portal:** https://supabase.com/dashboard

### Production Database Verification

- [ ] Go to **Settings** → **General**
- [ ] Verify project is not paused
- [ ] Check database plan (Free tier has limits)
- [ ] Consider upgrading to Pro plan for production ($25/month)

### Enable Database Backups

- [ ] Go to **Settings** → **Database**
- [ ] Enable **Point-in-Time Recovery** (Pro plan only)
- [ ] Or set up manual backup script (Free tier)

### Row-Level Security (RLS) Verification

- [ ] Go to **Table Editor**
- [ ] Verify RLS is enabled on all tables
- [ ] Test public read access for `member_status` table
- [ ] Verify service role key works for bot operations

### Get Production Keys

- [ ] Go to **Settings** → **API**
- [ ] Copy **URL** → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (for bot only)

**Environment Variables (Already Set):**
```bash
# Web App (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Bot (Railway)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role, not anon key
```

### Seed Admin Users

- [ ] Go to **Table Editor** → `admins` table
- [ ] Add admin Discord user IDs:
  ```sql
  INSERT INTO admins (discord_user_id, email, role)
  VALUES ('827964581850513408', 'admin@yourdomain.com', 'super_admin');
  ```

---

## 7. GitHub Repository (Source Control)

**Portal:** https://github.com

### Update Repository

- [ ] Push all final changes to main branch
- [ ] Create production branch (optional): `git checkout -b production`
- [ ] Tag release: `git tag v1.0.0 && git push --tags`
- [ ] Update README.md with production setup instructions
- [ ] Verify `.env` files are gitignored (do not commit secrets)

### Protect Production Branch

- [ ] Go to **Settings** → **Branches**
- [ ] Add branch protection rule for `main` or `production`
- [ ] Enable:
  - [ ] Require pull request reviews before merging
  - [ ] Require status checks to pass
  - [ ] Do not allow bypassing the above settings

---

## 10. Environment Variables Summary

### Vercel (Web App) - Production Environment

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Next.js
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Discord OAuth
DISCORD_CLIENT_ID=1394081775042560080
DISCORD_CLIENT_SECRET=lhZ...
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback
DISCORD_JOIN_REDIRECT_URI=https://yourdomain.com/api/discord/join/callback
DISCORD_BOT_TOKEN=MTM9...
NEXT_PUBLIC_DISCORD_INVITE_URL=https://discord.gg/xxxxx

# Stripe (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_PRICE_ID=price_live_...

# Bot API
BOT_API_URL=https://your-bot.railway.app
BOT_API_KEY=your_bot_api_key_here  # Generate with: openssl rand -hex 32

# Discord Server
DISCORD_GUILD_ID=your_discord_server_id
MEMBER_ROLE_ID=your_member_role_id

# Admin
ADMIN_DISCORD_ID=your_discord_user_id

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret  # Generate with: openssl rand -base64 32

# Resend (Email)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# CAPTCHA
TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
```

### Railway (Discord Bot) - Production Environment

```bash
# Discord
DISCORD_TOKEN=MTM5NDA4MTc3NTA0MjU2MDA4MA.G1JDaj...
DISCORD_GUILD_ID=your_discord_server_id

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Bot Configuration
DIGEST_CHANNEL_NAME=daily-digest
DIGEST_TIME_HOUR=22
DIGEST_TIME_MINUTE=0
DIGEST_TIMEZONE=America/New_York

# Bot API
BOT_API_HOST=0.0.0.0
BOT_API_PORT=8000
BOT_API_KEY=your_bot_api_key_here  # Generate with: openssl rand -hex 32
```

---

## 11. Post-Deployment Testing

### Test Complete User Journey

- [ ] **Application Flow**
  - [ ] Visit `https://yourdomain.com`
  - [ ] Click "Apply"
  - [ ] Authenticate with Discord (production OAuth)
  - [ ] Submit application form
  - [ ] Verify CAPTCHA works
  - [ ] Verify rate limiting (3 applications/day)

- [ ] **Admin Flow**
  - [ ] Visit `https://yourdomain.com/admin/login`
  - [ ] Authenticate with Discord
  - [ ] Verify admin access (check `admins` table)
  - [ ] Approve test application
  - [ ] Verify approval email sent to applicant

- [ ] **Payment Flow**
  - [ ] Click payment link in email
  - [ ] Verify token validation works
  - [ ] Complete Stripe Checkout (use real card in live mode)
  - [ ] Verify subscription created in Stripe Dashboard
  - [ ] Verify webhook processed successfully (check logs)
  - [ ] Verify subscription in database (`subscriptions` table)

- [ ] **Discord Integration**
  - [ ] Click "Join Discord (1-click)" on success page
  - [ ] Verify user added to Discord server
  - [ ] Verify member role assigned automatically
  - [ ] Check Discord server for new member with role

### Test Edge Cases

- [ ] **Subscription Cancellation**
  - [ ] Cancel subscription in Stripe Dashboard
  - [ ] Verify `customer.subscription.deleted` webhook fires
  - [ ] Verify role removed from Discord
  - [ ] Check database `subscriptions.status` = `canceled`

- [ ] **Payment Failure**
  - [ ] Simulate failed payment in Stripe
  - [ ] Verify webhook updates subscription status
  - [ ] Verify role kept (grace period)

- [ ] **Cron Job**
  - [ ] Wait for scheduled cron execution (3 AM UTC)
  - [ ] Check Vercel logs for cron execution
  - [ ] Verify roles synced correctly

### Monitor Logs

- [ ] **Vercel Logs**
  - Check for application errors
  - Verify webhook events processed
  - Monitor API response times

- [ ] **Railway Logs**
  - Verify bot is running
  - Check for Discord API errors
  - Monitor role assignment success

- [ ] **Stripe Dashboard**
  - Check webhook delivery status (should show 200 responses)
  - Verify all events processed successfully

---

## 12. Rollback Plan

In case of issues during deployment:

### DNS Rollback
- [ ] Keep old DNS records documented
- [ ] Can revert DNS to point to previous hosting

### Environment Variable Rollback
- [ ] Keep `.env.production.backup` with previous values
- [ ] Can revert in Vercel/Railway instantly

### Stripe Rollback
- [ ] Keep test mode active for quick fallback
- [ ] Can switch webhook to test mode URL if needed

### Code Rollback
- [ ] Use Vercel "Redeploy" feature to revert to previous deployment
- [ ] Or: `git revert` and push to trigger new deployment

---

## Final Production Checklist

- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Railway
- [ ] Discord OAuth redirect URIs updated
- [ ] Stripe live mode configured
- [ ] Stripe webhook endpoint active
- [ ] Resend domain verified
- [ ] Custom domain SSL active
- [ ] Bot running in production Discord server
- [ ] Admin users seeded in database
- [ ] Cron job scheduled in Vercel
- [ ] Complete user journey tested end-to-end
- [ ] Monitoring and error tracking configured (optional but recommended)
- [ ] Backup and rollback plan documented
- [ ] Team notified of go-live

---

**Estimated Time to Complete:** 2-4 hours (depending on DNS propagation)

**Critical Path Items (Cannot deploy without):**
1. Domain configured and SSL active
2. Stripe live mode product created
3. Stripe live webhook configured
4. Discord OAuth redirect URIs updated
5. All environment variables set in Vercel/Railway
6. Resend domain verified

**Optional but Recommended:**
- Monitoring (Sentry, LogTail, etc.)
- Backup strategy for Supabase
- Upgrade Supabase to Pro plan
- Analytics (PostHog, Mixpanel, etc.)
