# Creative Technologists - Web Application

Next.js 15 web application for the Creative Technologist community membership platform.

This repository contains the **web frontend** for the membership platform. The Discord bot backend is maintained in a separate repository: [creative-technologists-bot](https://github.com/0xdesign/daily-digest-bot)

## Features

- **Landing Page** - Public homepage with membership information
- **Member Directory** - Public directory of active members with status
- **Application System** - Discord OAuth + application form with CAPTCHA
- **Payment Integration** - Stripe Subscriptions ($299/month recurring)
- **User Dashboard** - Self-service subscription management via Stripe Customer Portal
- **Admin Dashboard** - Review applications, manage members
- **Automated Role Management** - Discord roles assigned/removed based on subscription status

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (Postgres 17)
- **Payments**: Stripe Subscriptions
- **Auth**: Discord OAuth
- **Rate Limiting**: Upstash Redis
- **CAPTCHA**: Cloudflare Turnstile

## Architecture

This web application is **read-only** for member data. The Discord bot writes member activity data to Supabase, and this web app reads from it via Row Level Security (RLS) for public member directory display.

**Data Flow:**
```
Discord Bot (Python) → Supabase (Postgres) → Web App (Next.js)
                    ↓
                Bot API (FastAPI)
                    ↓
                Web App (role management)
```

**Related Repositories:**
- **Bot**: [creative-technologists-bot](https://github.com/0xdesign/daily-digest-bot) - Python Discord bot with message collection, member tracking, daily digest
- **Web**: This repository - Next.js membership platform

## Getting Started

### Prerequisites

- Node.js 18+
- Discord bot must be running for role management features
- Supabase project with required schema (see Database Schema section)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public read access)
- `DISCORD_CLIENT_ID` - Discord OAuth app client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth app client secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PRICE_ID` - Stripe price ID for $299/month subscription
- `BOT_API_URL` - URL to bot API (e.g., http://localhost:8000 for local, or Railway URL for production)
- `BOT_API_KEY` - API key for bot API calls
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token
- `TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key
- `NEXTAUTH_SECRET` - NextAuth secret (generate with: `openssl rand -base64 32`)
- `RESEND_API_KEY` - Resend API key for email notifications

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
creative-technologists-web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── apply/             # Application flow
│   ├── pay/[token]/       # Payment page
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin dashboard
│   ├── members/           # Public member directory
│   └── api/               # API routes
│       ├── auth/          # Discord OAuth
│       ├── applications/  # Application endpoints
│       └── webhooks/      # Stripe webhooks
├── lib/                   # Utility libraries
│   ├── db.ts             # Database utilities
│   ├── stripe.ts         # Stripe utilities
│   ├── discord.ts        # Discord OAuth utilities
│   ├── bot-api.ts        # Bot API client
│   └── supabase.ts       # Supabase client
├── components/            # React components
├── scripts/              # Utility scripts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Database Schema

This web app uses Supabase (Postgres) for data storage. The database is shared with the Discord bot.

### Web-Specific Tables (This App Writes)

- **applications** - Member applications with Discord OAuth data
- **customers** - Links Discord users to Stripe customers
- **subscriptions** - Active Stripe subscriptions
- **payment_methods** - Payment method details
- **invoices** - Invoice history
- **role_sync_events** - Discord role assignment audit log
- **payment_tokens** - Secure one-time payment tokens
- **webhook_events** - Webhook idempotency tracking
- **admins** - Admin user whitelist

### Bot-Managed Tables (Read-Only for Web)

- **member_status** - Member activity tracking (NEW/ACTIVE/IDLE/LURKER/GHOST)
- **messages** - Discord message storage
- **reactions** - Message reaction tracking
- **resources** - Extracted links, code, files
- **member_goals** - Goals from intro messages
- **goal_progress** - Win tracking

**Schema Documentation**: See the bot repository's `SUPABASE_SCHEMA.md` for complete schema documentation.

**Migration Management**: Database migrations are managed by the **bot repository** as the single source of truth.

## API Endpoints

### Public

- `GET /` - Landing page
- `GET /members` - Member directory
- `GET /api/members` - Member data (proxied from bot API)

### Authenticated (Discord OAuth)

- `GET /apply` - Application form
- `POST /api/applications` - Submit application
- `GET /dashboard` - User dashboard
- `POST /api/portal` - Create Stripe portal session

### Admin Only

- `GET /admin` - Admin dashboard
- `GET /api/admin/applications` - List applications
- `POST /api/admin/applications/:id/approve` - Approve application
- `POST /api/admin/applications/:id/reject` - Reject application

### Webhooks

- `POST /api/webhooks/stripe` - Stripe webhook handler

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Vercel will automatically:
- Build and deploy on push to main branch
- Set up preview deployments for PRs
- Configure edge functions for API routes

### Environment Variables in Production

All environment variables from `.env.example` must be set in Vercel dashboard under **Project Settings → Environment Variables**.

**Critical Production Variables:**
- `BOT_API_URL` - Must point to production bot API (Railway deployment)
- `BOT_API_KEY` - Must match bot's `BOT_API_KEY` environment variable
- `STRIPE_WEBHOOK_SECRET` - Obtain from Stripe webhook configuration
- `NEXT_PUBLIC_APP_URL` - Set to your production domain (e.g., https://creativetechnologists.com)

### Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Stripe webhook endpoint configured (https://yourdomain.com/api/webhooks/stripe)
- [ ] Discord OAuth redirect URI updated (https://yourdomain.com/api/auth/discord/callback)
- [ ] Bot API accessible from web app (test `/health` endpoint)
- [ ] Supabase RLS policies enabled for member_status table
- [ ] Admin users seeded in `admins` table

## Security

- ✅ API key authentication for bot API calls
- ✅ Webhook signature verification (Stripe)
- ✅ CAPTCHA on application form (Turnstile)
- ✅ Rate limiting (3 applications/day per IP via Upstash Redis)
- ✅ Payment token security (bcrypt hashed, one-time use, 7-day expiry)
- ✅ Webhook idempotency (prevents duplicate Stripe event processing)
- ✅ Admin authentication (Discord ID whitelist)
- ✅ Row Level Security (RLS) on Supabase for public member directory

## Integration with Discord Bot

This web app communicates with the Discord bot via:

1. **Supabase (Read-Only)**: Reads member data from `member_status` table
2. **Bot API (HTTP)**: Calls bot's FastAPI endpoints for role management

**Bot API Endpoints Used:**
- `GET /health` - Health check
- `GET /api/members` - Public member directory data
- `GET /api/members/{user_id}` - Individual member status
- `POST /api/assign-role` - Assign role after payment
- `POST /api/remove-role` - Remove role on subscription end
- `POST /api/sync-role` - Daily role sync

**Local Development Setup:**
1. Run bot: `cd ../creative-technologists-bot && python src/bot.py`
2. Run web: `npm run dev`
3. Bot API available at `http://localhost:8000`
4. Web app available at `http://localhost:3000`

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check Supabase project status (not paused)
4. Verify RLS policies allow public read on `member_status`

### Stripe Webhooks Not Working

1. Check webhook secret: `STRIPE_WEBHOOK_SECRET`
2. Verify webhook endpoint is accessible
3. Check Stripe dashboard for webhook delivery logs
4. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Bot API Connection Issues

1. Ensure bot is running and accessible
2. Check `BOT_API_URL` is correct (Railway URL for production)
3. Verify `BOT_API_KEY` matches bot configuration
4. Test bot API health: `curl $BOT_API_URL/health`
5. Check bot logs for API request errors

### Member Directory Not Showing Members

1. Verify bot is running and writing to Supabase
2. Check `member_status` table has data
3. Verify RLS policy allows public SELECT on `member_status`
4. Check browser console for API errors

## Phase Status

- ✅ **Phase 1**: Bot API foundation
- ✅ **Phase 2**: Web foundation + Landing page
- ✅ **Phase 3**: Discord OAuth + Applications
- ✅ **Phase 4**: Admin Dashboard
- ✅ **Phase 5**: Stripe Subscriptions (partial - payment flow complete)
- 🚧 **Phase 6**: User Dashboard (in progress)
- ⏳ **Phase 7**: Daily Role Sync Job
- ⏳ **Phase 8**: Polish + Testing
- ⏳ **Phase 9**: Deployment

## Related Documentation

- **Bot Repository**: [creative-technologists-bot](https://github.com/0xdesign/daily-digest-bot)
- **Supabase Schema**: See bot repo's `SUPABASE_SCHEMA.md`
- **Phase Reports**: See `PHASE_*_COMPLETE.md` files for detailed phase completion reports

## License

Private repository - All rights reserved

## Support

For issues or questions, contact the maintainer or open an issue in the repository.
