# Manual Testing Checklist

**Phase 2: Manual Verification**
**Date:** October 17, 2025
**Prerequisites:** Phase 1 automated tests complete ✅

---

## Environment Setup

Before starting manual tests:
- [ ] Both servers running (Next.js:3000, Bot API:8000)
- [ ] CRON_SECRET added to .env (already done ✅)
- [ ] Stripe test mode active
- [ ] Discord bot has proper permissions
- [ ] Test Discord account ready
- [ ] Stripe CLI running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Critical Path Testing (30 minutes)

### 1. Discord OAuth Flow (5 min)

**Application Flow:**
- [ ] Visit http://localhost:3000/apply
- [ ] Click "Continue with Discord"
- [ ] Authorize with test Discord account
- [ ] Verify redirect back to application form
- [ ] Check Discord user data loaded correctly

**Admin Flow:**
- [ ] Visit http://localhost:3000/admin/login
- [ ] Click "Continue with Discord"
- [ ] Authorize with admin Discord account (ID: 827964581850513408)
- [ ] Verify redirect to admin dashboard
- [ ] Check admin cookie is set and signed

---

### 2. Application Submission (5 min)

- [ ] Fill out application form with test data
- [ ] Complete CAPTCHA (if enabled)
- [ ] Submit application
- [ ] Verify success message
- [ ] Check application appears in admin dashboard as "pending"
- [ ] Verify database: `SELECT * FROM applications ORDER BY created_at DESC LIMIT 1;`

**Test rate limiting:**
- [ ] Submit 3 more applications from same IP
- [ ] Verify 4th submission is blocked with 429 error

---

### 3. Admin Dashboard Workflows (10 min)

**Approve Application:**
- [ ] Login to admin dashboard
- [ ] Find pending test application
- [ ] Click "Approve"
- [ ] Verify payment token created in database
- [ ] Check approval email sent (check terminal logs or Resend dashboard)
- [ ] Verify payment link in email: `/pay/[token]`

**Reject Application:**
- [ ] Submit another test application
- [ ] Click "Reject" in admin dashboard
- [ ] Verify status updated to "rejected"
- [ ] Verify NO payment token created
- [ ] Check rejection email sent

**Waitlist Application:**
- [ ] Submit another test application
- [ ] Click "Waitlist" in admin dashboard
- [ ] Verify status updated to "waitlisted"
- [ ] Check waitlist email sent

---

### 4. Payment Flow (10 min)

- [ ] Click payment link from approval email
- [ ] Verify token validation passes
- [ ] Redirected to Stripe Checkout
- [ ] Complete payment with test card: `4242 4242 4242 4242`
- [ ] Verify webhook received: `checkout.session.completed`
- [ ] Check Stripe CLI output for webhook delivery
- [ ] Verify in database:
  ```sql
  SELECT * FROM customers WHERE discord_user_id = 'test_user_id';
  SELECT * FROM subscriptions WHERE customer_id = 'cus_xxx';
  ```
- [ ] Verify payment token marked as `used`
- [ ] Check Discord role assigned (check bot API logs)

**Test token expiry:**
- [ ] Manually set token `expires_at` to past date
- [ ] Try to use expired token
- [ ] Verify error message shown

**Test token reuse:**
- [ ] Try to use already-used payment token
- [ ] Verify error message shown

---

### 5. Discord Auto-Join (5 min)

- [ ] After payment, visit `/success` page
- [ ] Click "Join Discord (1-click)" button
- [ ] Authorize Discord OAuth (guilds.join scope)
- [ ] Verify added to Discord server automatically
- [ ] Check member role assigned
- [ ] Verify fallback invite link shown (if configured)

---

## Subscription Lifecycle Testing (Optional - 20 minutes)

### Test 1: Subscription Cancellation

- [ ] In Stripe Dashboard → Find test subscription
- [ ] Cancel subscription immediately
- [ ] Verify webhook: `customer.subscription.deleted`
- [ ] Check role removed from Discord
- [ ] Verify database: `status = 'canceled'`

---

### Test 2: Payment Failure (Grace Period)

- [ ] In Stripe Dashboard → Create test event `customer.subscription.updated`
- [ ] Set `status: "past_due"`
- [ ] Verify webhook processed
- [ ] **CRITICAL:** Verify role is KEPT (not removed)
- [ ] Run cron manually: `curl -H "Authorization: Bearer $(cat /tmp/cron_secret.txt | tr -d '\n')" http://localhost:3000/api/cron/sync-roles`
- [ ] Verify role still assigned

---

### Test 3: Manual Discord Removal + Rejoin

- [ ] Manually kick test user from Discord server
- [ ] User clicks "Join Discord" again on `/success` page
- [ ] Verify OAuth flow completes
- [ ] Verify user re-added with role
- [ ] Verify subscription still active in database

---

### Test 4: Cron Job Role Sync

**Setup test data:**
```sql
-- Active subscription (should keep role)
UPDATE subscriptions
SET status = 'active', current_period_end = '2025-12-31T23:59:59Z'
WHERE customer_id = 'cus_test1';

-- Expired subscription (should remove role)
UPDATE subscriptions
SET status = 'canceled', current_period_end = '2025-01-01T00:00:00Z'
WHERE customer_id = 'cus_test2';
```

**Run cron:**
- [ ] Run: `curl -H "Authorization: Bearer $(cat /tmp/cron_secret.txt | tr -d '\n')" http://localhost:3000/api/cron/sync-roles`
- [ ] Check logs for role assignments/removals
- [ ] Verify Discord roles match subscription states

---

## Visual/UI Verification (10 minutes)

### Desktop Testing
- [ ] Landing page loads and looks correct
- [ ] Members directory layout looks good
- [ ] Apply page is clear and professional
- [ ] Admin dashboard is usable
- [ ] All buttons and links work

### Mobile Testing (CRITICAL - Mobile-First Design)
- [ ] Open http://localhost:3000 on mobile device or Chrome DevTools (375px width)
- [ ] Verify no horizontal scrolling
- [ ] Test all interactive elements are touch-friendly (44x44px minimum)
- [ ] Verify text is readable (no zoom required)
- [ ] Test navigation works with thumbs
- [ ] Check forms are mobile-friendly
- [ ] Verify members directory is responsive

---

## Discord Integration Verification (5 minutes)

- [ ] Check Discord server - verify test user appears
- [ ] Verify member role is visible in Discord UI
- [ ] Test role permissions work (can access member-only channels)
- [ ] Verify bot API health: `curl http://localhost:8000/health`
- [ ] Check bot API logs for role assignment confirmations

---

## Email Verification (5 minutes)

**Check Resend Dashboard or terminal logs for:**
- [ ] Approval email sent successfully
- [ ] Rejection email sent successfully
- [ ] Waitlist email sent successfully
- [ ] All emails contain correct content
- [ ] Payment links work when clicked from email

---

## Security Verification (5 minutes)

**Admin Cookie Security:**
- [ ] Use browser dev tools to view admin cookie
- [ ] Verify format: `{data}.{signature}`
- [ ] Try to tamper with cookie value
- [ ] Refresh admin page
- [ ] Verify redirected to login (tampered cookie rejected)

**CRON_SECRET Security:**
- [ ] Already tested in Phase 1 automated tests ✅
- [ ] Verify CRON_SECRET is in .env (not .env.local - Next.js uses .env in dev)
- [ ] Verify environment variable loaded in Vercel (production)

**Webhook Signature Verification:**
- [ ] Send POST to `/api/webhooks/stripe` without valid signature
- [ ] Verify 400 Bad Request response
- [ ] Check Stripe CLI for valid signature handling

---

## Production Readiness Checklist

Before deploying to production:

**Environment Variables (Vercel):**
- [ ] `CRON_SECRET` set in Vercel
- [ ] `DISCORD_BOT_TOKEN` set
- [ ] `STRIPE_WEBHOOK_SECRET` updated with production webhook secret
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] All other env vars from `.env.example` configured

**Stripe Configuration:**
- [ ] Webhook endpoint configured: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Webhook secret copied to `STRIPE_WEBHOOK_SECRET`
- [ ] Switch to live mode (not test mode)
- [ ] Update `STRIPE_PRICE_ID` to production price

**Discord Configuration:**
- [ ] Update OAuth redirect URIs to production domain
- [ ] Verify bot has correct permissions
- [ ] Update `DISCORD_JOIN_REDIRECT_URI` to production
- [ ] Test Discord OAuth flow in production

**Database:**
- [ ] Seed `admins` table with production admin Discord IDs
- [ ] Verify RLS policies are active
- [ ] Check Supabase project is not paused

**Monitoring:**
- [ ] Set up Vercel monitoring/alerts
- [ ] Configure Sentry or error tracking (optional)
- [ ] Test cron job runs at 3 AM UTC in production
- [ ] Monitor Stripe webhook delivery logs

---

## Test Results Summary

**Total Tests:** ___/50
**Tests Passed:** ___
**Tests Failed:** ___
**Tests Skipped:** ___

**Critical Bugs Found:**
- _[List any blocking issues]_

**Nice-to-Have Issues:**
- _[List non-blocking improvements]_

**Production Readiness:** ⚠️ NOT READY / ✅ READY

---

**Testing Date:** _____________
**Tested By:** _____________
**Reviewed By:** _____________

**Notes:**
_[Add any additional observations or issues discovered during testing]_
