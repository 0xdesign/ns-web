# Edge Case Testing Guide

**Purpose:** Systematic testing of untested scenarios before production deployment

**Date:** October 16, 2025

---

## Prerequisites

### Development Environment Running
- [ ] Web app: `npm run dev` (port 3000)
- [ ] Discord bot: `cd ../ns-bot && python src/bot.py` (bot API on port 8000)
- [ ] Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Environment Variables Set
- [ ] `CRON_SECRET` in `.env.local` (generate with `openssl rand -hex 32`)
- [ ] All other env vars from `.env.local`

### Test Data Setup
- [ ] Admin seeded in `admins` table
- [ ] Test Discord server with bot configured
- [ ] Stripe test mode active

---

## Test Suite 1: Subscription Lifecycle

### Test 1.1: Subscription Cancellation

**Scenario:** User cancels subscription → Role removed immediately

**Steps:**
1. Complete happy path: Application → Payment → Discord join ✅
2. Verify user has member role in Discord
3. In Stripe Dashboard:
   - Go to **Customers** → Find test customer
   - Click on active subscription
   - Click **Actions** → **Cancel subscription**
   - Select **Cancel immediately**
4. Verify webhook fired:
   - Check Stripe CLI output: `customer.subscription.deleted`
   - Check Next.js terminal for webhook processing logs
5. Verify database updated:
   ```sql
   SELECT status, canceled_at FROM subscriptions
   WHERE customer_id = 'xxx'
   ORDER BY created_at DESC LIMIT 1;
   ```
   - Expected: `status = 'canceled'`, `canceled_at` = timestamp
6. Verify role removed from Discord
7. Verify user appears in admin "Expired Members" section

**Expected Result:** ✅ Role removed, subscription marked canceled

**Actual Result:** _[Record here]_

---

### Test 1.2: Subscription Expiration (Cron Job)

**Scenario:** Canceled subscription reaches `current_period_end` → Cron removes role

**Steps:**

**Option A: Wait for period end (if subscription will expire soon)**
1. Cancel test subscription in Stripe (select "at period end")
2. Wait for `current_period_end` timestamp
3. Wait for cron job (3 AM UTC) OR trigger manually (Step 4)
4. Run cron manually:
   ```bash
   curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" \
     http://localhost:3000/api/cron/sync-roles
   ```
5. Check logs for role removal
6. Verify role removed from Discord

**Option B: Manual database update (faster)**
1. Cancel test subscription (at period end)
2. Manually set `current_period_end` to past date:
   ```sql
   UPDATE subscriptions
   SET current_period_end = '2025-01-01T00:00:00Z'
   WHERE customer_id = 'xxx';
   ```
3. Run cron manually (step 4 above)
4. Verify role removed from Discord

**Expected Result:** ✅ Role removed when period ends

**Actual Result:** _[Record here]_

---

### Test 1.3: Payment Failure (past_due) - Grace Period

**Scenario:** Payment fails → Subscription goes `past_due` → Role kept (grace period)

**Steps:**
1. Complete happy path with test subscription
2. In Stripe Dashboard → **Developers** → **Events**
3. Create test event: `customer.subscription.updated`
   - Set `status: "past_due"`
   - Use your test subscription ID
   - Send event
4. Verify webhook processed:
   - Check Stripe CLI output
   - Check Next.js logs
5. Verify database updated:
   ```sql
   SELECT status FROM subscriptions WHERE customer_id = 'xxx';
   ```
   - Expected: `status = 'past_due'`
6. **CRITICAL:** Verify role is KEPT (not removed)
7. Run cron job manually - role should still be kept:
   ```bash
   curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" \
     http://localhost:3000/api/cron/sync-roles
   ```

**Expected Result:** ✅ Role kept during grace period

**Actual Result:** _[Record here]_

---

### Test 1.4: Subscription Renewal

**Scenario:** Monthly renewal → No duplicate role assignments

**Steps:**
1. Complete happy path with test subscription
2. In Stripe Dashboard → **Developers** → **Events**
3. Create test event: `invoice.payment_succeeded`
   - Use your test subscription ID
   - Send event
4. Verify webhook processed
5. Check logs for duplicate role assignment attempts
6. Verify no errors in logs

**Expected Result:** ✅ No errors, role remains assigned

**Actual Result:** _[Record here]_

---

### Test 1.5: Manual Discord Removal + Rejoin

**Scenario:** User manually kicked from Discord → Can rejoin if subscription active

**Steps:**
1. Complete happy path
2. Manually kick user from Discord server
3. User clicks "Join Discord (1-click)" again on `/success` page
4. Verify OAuth flow completes
5. Verify user re-added to Discord with role
6. Check database - subscription still active

**Expected Result:** ✅ User re-added with role

**Actual Result:** _[Record here]_

---

## Test Suite 2: Cron Job Validation

### Test 2.1: Cron Authentication Required

**Scenario:** Cron endpoint rejects requests without CRON_SECRET

**Steps:**
1. Ensure `CRON_SECRET` is set in `.env.local`
2. Test without auth:
   ```bash
   curl http://localhost:3000/api/cron/sync-roles
   ```
3. Test with wrong auth:
   ```bash
   curl -H "Authorization: Bearer wrong_secret" \
     http://localhost:3000/api/cron/sync-roles
   ```
4. Test with correct auth:
   ```bash
   curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" \
     http://localhost:3000/api/cron/sync-roles
   ```

**Expected Results:**
- Step 2: 401 Unauthorized
- Step 3: 401 Unauthorized
- Step 4: 200 OK with sync logs

**Actual Result:** _[Record here]_

---

### Test 2.2: Cron Missing CRON_SECRET

**Scenario:** Server returns 500 if CRON_SECRET not configured

**Steps:**
1. Remove `CRON_SECRET` from `.env.local`
2. Restart dev server
3. Try to access cron endpoint:
   ```bash
   curl http://localhost:3000/api/cron/sync-roles
   ```

**Expected Result:** 500 Internal Server Error with message about missing CRON_SECRET

**Actual Result:** _[Record here]_

**Cleanup:** Re-add `CRON_SECRET` to `.env.local` and restart server

---

### Test 2.3: Cron Role Sync Logic

**Scenario:** Cron correctly handles all subscription states

**Setup:**
Create test data with various subscription states:
```sql
-- Active subscription (should keep role)
INSERT INTO subscriptions (customer_id, status, current_period_end)
VALUES ('cust_active', 'active', '2025-12-31T23:59:59Z');

-- Past due subscription (should keep role - grace period)
INSERT INTO subscriptions (customer_id, status, current_period_end)
VALUES ('cust_pastdue', 'past_due', '2025-12-31T23:59:59Z');

-- Canceled but current (should keep role until period end)
INSERT INTO subscriptions (customer_id, status, current_period_end, canceled_at)
VALUES ('cust_canceled_current', 'canceled', '2025-12-31T23:59:59Z', '2025-10-01T00:00:00Z');

-- Expired (should remove role)
INSERT INTO subscriptions (customer_id, status, current_period_end)
VALUES ('cust_expired', 'canceled', '2025-01-01T00:00:00Z');
```

**Steps:**
1. Run cron manually
2. Check logs for each customer:
   - Active: Role assigned (or kept)
   - Past due: Role assigned (or kept)
   - Canceled but current: Role assigned (or kept)
   - Expired: Role removed

**Expected Result:** ✅ Roles synced correctly per subscription state

**Actual Result:** _[Record here]_

---

## Test Suite 3: Application Edge Cases

### Test 3.1: Approval Email Delivery

**Scenario:** Admin approval triggers payment token + Resend email

**Steps:**
1. Submit a new test application and confirm it appears in the admin dashboard.
2. Approve the application in the admin panel.
3. Verify payment token exists in database:
   ```sql
   SELECT id, expires_at, used_at FROM payment_tokens WHERE application_id = 'xxx';
   ```
   - Expected: `used_at` is `NULL`, `expires_at` within 7 days
4. Confirm approval email was dispatched:
   - Check terminal/log output for `Approval email sent successfully`
   - Or verify delivery status in the Resend dashboard
5. Open the email and confirm payment link matches `/pay/<token>`

**Expected Result:** ✅ Token created and approval email delivered with valid link

**Actual Result:** _[Record here]_

---

### Test 3.2: Application Rejection

**Scenario:** Admin rejects application → Status updated, no payment token

**Steps:**
1. Submit new test application
2. Login to admin dashboard
3. Find pending application
4. Click "Reject"
5. Verify database updated:
   ```sql
   SELECT status, reviewed_at FROM applications WHERE id = 'xxx';
   ```
   - Expected: `status = 'rejected'`, `reviewed_at` = timestamp
6. Verify no payment token created:
   ```sql
   SELECT * FROM payment_tokens WHERE application_id = 'xxx';
   ```
   - Expected: 0 rows
7. Confirm rejection email was dispatched:
   - Check terminal/log output for `Rejection email sent successfully`
   - Or verify delivery status in the Resend dashboard
   - Optional: confirm email content in Resend activity feed

**Expected Result:** ✅ Status updated, no token created

**Actual Result:** _[Record here]_

---

### Test 3.3: Application Waitlist

**Scenario:** Admin waitlists application → Status updated

**Steps:**
1. Submit new test application
2. Login to admin dashboard
3. Find pending application
4. Click "Waitlist"
5. Verify database updated:
   ```sql
   SELECT status, reviewed_at FROM applications WHERE id = 'xxx';
   ```
   - Expected: `status = 'waitlisted'`, `reviewed_at` = timestamp
6. Confirm waitlist email was dispatched:
   - Check terminal/log output for `Waitlist email sent successfully`
   - Or verify delivery status in the Resend dashboard
   - Optional: confirm email content in Resend activity feed

**Expected Result:** ✅ Status updated to waitlisted

**Actual Result:** _[Record here]_

---

### Test 3.4: Duplicate Application

**Scenario:** User tries to apply twice → Blocked by unique constraint

**Steps:**
1. Submit test application with Discord account A
2. Complete application form
3. Try to submit second application with same Discord account A
4. Verify error message shown to user
5. Verify database constraint:
   ```sql
   SELECT COUNT(*) FROM applications WHERE discord_user_id = 'xxx';
   ```
   - Expected: 1 row only

**Expected Result:** ✅ Error message, duplicate blocked

**Actual Result:** _[Record here]_

---

### Test 3.5: Rate Limiting

**Scenario:** 4th application from same IP blocked

**Setup:**
- Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- Or use local rate limiting (check implementation)

**Steps:**
1. Submit application #1 from IP address X
2. Submit application #2 from same IP X (different Discord accounts)
3. Submit application #3 from same IP X
4. Submit application #4 from same IP X
5. Verify 4th request returns 429 Too Many Requests
6. Check error message shown to user

**Expected Result:** ✅ 4th request blocked with 429 status

**Actual Result:** _[Record here]_

**Note:** May need to clear Redis or wait 24 hours between test runs

---

## Test Suite 4: Payment Token Edge Cases

### Test 4.1: Abandoned Checkout Session

**Scenario:** User abandons Stripe Checkout → Can retry payment with same token

**Steps:**
1. Admin approves application → Token generated
2. User clicks payment link → Redirected to Stripe Checkout
3. User closes browser tab (abandons checkout)
4. User clicks payment link again
5. Verify token still valid (not marked as used)
6. Complete payment this time
7. Verify token marked as used after `checkout.session.completed`

**Expected Result:** ✅ Token reusable until payment succeeds

**Actual Result:** _[Record here]_

---

### Test 4.2: Token Expiration

**Scenario:** Token expires after 7 days

**Steps:**
1. Generate payment token
2. Manually update `expires_at` to past date:
   ```sql
   UPDATE payment_tokens
   SET expires_at = '2025-01-01T00:00:00Z'
   WHERE id = 'xxx';
   ```
3. Try to use payment link
4. Verify error message shown

**Expected Result:** ✅ Token rejected, friendly error message

**Actual Result:** _[Record here]_

---

### Test 4.3: Token Already Used

**Scenario:** Token marked as used → Cannot be reused

**Steps:**
1. Complete payment flow (token marked as used)
2. Try to use same payment link again
3. Verify error message shown
4. Verify database:
   ```sql
   SELECT used_at FROM payment_tokens WHERE id = 'xxx';
   ```
   - Expected: `used_at` = timestamp (not null)

**Expected Result:** ✅ Token rejected, friendly error message

**Actual Result:** _[Record here]_

---

## Test Suite 5: Admin Cookie Security

### Test 5.1: Cookie Signature Verification

**Scenario:** Tampered admin cookie rejected

**Steps:**
1. Login as admin → Cookie set
2. Use browser dev tools to view cookie value
3. Manually edit cookie value (change any character)
4. Refresh admin page
5. Verify redirected to login (cookie signature invalid)

**Expected Result:** ✅ Tampered cookie rejected, user logged out

**Actual Result:** _[Record here]_

---

### Test 5.2: Admin Cookie Signing

**Scenario:** Cookie properly signed on login

**Steps:**
1. Login as admin via Discord OAuth
2. Check cookie value - should be in format `{data}.{signature}`
3. Verify signature length (HMAC-SHA256 = 64 hex chars)
4. Verify can access admin pages

**Expected Result:** ✅ Cookie format correct, signature present

**Actual Result:** _[Record here]_

---

## Test Suite 6: Discord Integration Edge Cases

### Test 6.1: Discord Invite Fallback

**Scenario:** If auto-join fails, fallback invite link available

**Steps:**
1. Complete payment
2. On success page, if auto-join fails or user doesn't click:
3. Verify fallback invite link shown (if `NEXT_PUBLIC_DISCORD_INVITE_URL` set)
4. Click fallback link → Opens Discord invite
5. Verify user can join manually

**Expected Result:** ✅ Fallback invite link works

**Actual Result:** _[Record here]_

---

### Test 6.2: Invalid Discord OAuth State

**Scenario:** Tampered state parameter rejected

**Steps:**
1. Start Discord join flow
2. Copy OAuth URL
3. Manually edit `state` parameter
4. Visit modified URL
5. Verify error message shown

**Expected Result:** ✅ Invalid state rejected

**Actual Result:** _[Record here]_

---

## Test Suite 7: Stripe Webhook Edge Cases

### Test 7.1: Webhook Idempotency

**Scenario:** Duplicate webhook events ignored

**Steps:**
1. Complete payment → `checkout.session.completed` webhook fires
2. Manually resend same event:
   - In Stripe Dashboard → **Developers** → **Events**
   - Find event → Click **Resend event**
3. Verify second event logged but skipped:
   - Check webhook_events table
   - Verify no duplicate role assignment

**Expected Result:** ✅ Duplicate event skipped, no errors

**Actual Result:** _[Record here]_

---

### Test 7.2: Webhook Signature Verification

**Scenario:** Invalid webhook signature rejected

**Steps:**
1. Send POST request to `/api/webhooks/stripe` without valid signature
2. Verify 400 Bad Request response

**Expected Result:** ✅ Invalid signature rejected

**Actual Result:** _[Record here]_

---

## Summary Checklist

### Critical Tests (Must Pass Before Production)
- [ ] Subscription cancellation removes role
- [ ] Subscription expiration removes role (cron)
- [ ] Past_due keeps role (grace period)
- [ ] Cron requires CRON_SECRET authentication
- [ ] Cron returns 500 if CRON_SECRET not set
- [ ] Payment token reusable on abandoned checkout
- [ ] Admin cookie signature verified
- [ ] Webhook idempotency working
- [ ] Duplicate applications blocked
- [ ] Rate limiting blocks 4th application

### Nice-to-Have Tests
- [ ] Subscription renewal (no duplicate roles)
- [ ] Manual Discord removal + rejoin
- [ ] Application rejection flow
- [ ] Application waitlist flow
- [ ] Token expiration
- [ ] Token already used
- [ ] Discord invite fallback
- [ ] Invalid OAuth state
- [ ] Webhook signature verification

---

## Test Results Summary

**Total Tests:** 27
**Tests Passed:** _[Fill in]_
**Tests Failed:** _[Fill in]_
**Tests Skipped:** _[Fill in]_

**Critical Bugs Found:** _[List here]_

**Production Readiness:** ⚠️ NOT READY / ✅ READY

---

**Last Updated:** October 16, 2025
**Tester:** _[Your name]_
