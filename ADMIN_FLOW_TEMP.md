# Admin Experience Flow (Temporary Notes)

## Entry & Authentication
- **Direct `/admin` visit with valid admin cookie**: cookie verified via `verifyCookieValue`; matching `ADMIN_DISCORD_ID` loads dashboard with hydrated data (applications, members, subscriptions).
- **Direct `/admin` visit without cookie**: `isAdmin` fails → immediate redirect to `/admin/login`.
- **`/admin/login`**: prompts Discord OAuth using `DISCORD_CLIENT_ID`/`DISCORD_REDIRECT_URI`; successful OAuth roundtrip should set `discord_user` signed cookie and route back to `/admin`.
- **Edge cases**: missing env vars prevents login button from being well-formed; tampered/expired cookie rejected (logs warning, forces login); only a single admin ID supported today—no role list.

## Dashboard Data Lifecycle
- **Initial load**: `Promise.all` fetches pending + status buckets, members, subscriptions. No loading state since render waits for data.
- **Derived metrics**: acceptance rate, total members, pending & expired summaries computed server-side every request.
- **Empty states**: each section renders explicit copy when zero records (pending, approved, waitlisted, rejected, expired members, current members).
- **Edge cases**: any fetch error currently throws (no try/catch), leading to 500 error. Expired members limited to first 30 to protect layout; no pagination elsewhere.

## Application Review Actions
- **Approve**: POST form to `/api/admin/applications/[id]/approve`; validates pending status, ensures no existing payment token, generates Stripe payment token, updates status, attempts to send approval email (failure tolerated). Returns JSON success but UI does not read response (no optimistic update).
- **Waitlist / Reject**: similar flow without payment token; ensure pending status, update, best-effort email.
- **Post-action UX**: server components rely on subsequent page reload/redirect to reflect status changes; users must refresh manually after submitting.
- **Edge cases**: repeated submissions on already-processed application get 400 with status message; email failures logged but not surfaced; API unauthorized throws 401 (form submission would reload with error blob if surfaced).

## Membership Monitoring
- **Expired members**: sourced from Stripe subscriptions with `status === 'canceled'` and `current_period_end <= now`; surfaces Discord IDs and period end.
- **Current members**: Supabase roster sorted by activity. Shows top 30 only; activity status label is upper → lower case transform, may be cryptic.
- **Edge**: long project names may overflow chip; BigInt mod for default avatar relies on browser BigInt support (available in modern browsers).

## UX Evaluation (w/ Updated Design)
- **Strengths**: glassmorphic styling now mirrors marketing site; quick navigation and overview stats clarify priorities; badges + contextual summaries reduce cognitive load.
- **Gaps**: forms still trigger full page reload with no inline success/failure feedback; decision actions lack confirmation dialogs; no search/filter across historical applications; metrics assume synchronous data fetch (no background refresh or stale indicator); mobile experience needs verification for card-heavy layout.
- **Opportunities**: consider server actions for inline mutations, toast feedback for API errors, pagination or filters for large queues, and richer member drill-down (e.g., contact links).

## Additional Edge Cases to Validate
- Admin logs in but Discord OAuth returns user not matching `ADMIN_DISCORD_ID` (should block access, ensure fallback message).
- Concurrent admin decisions on same application (second submit should see 400—needs clearer feedback).
- Missing or malformed `social_links` / `project_links` JSON (parser gracefully returns empty, confirmed).
- Light mode rendering: gradients currently dark-biased; confirm contrast when system theme is light.
- Accessibility: many interactive elements rely on color alone; review focus styles and ARIA labeling for badge counts.
