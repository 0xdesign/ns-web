# Vercel Deployment Guide

This guide covers deploying the Creative Technologists web application to Vercel.

## Prerequisites

- GitHub repository created: https://github.com/0xdesign/creative-technologists-web
- Vercel account (sign up at vercel.com)
- Discord bot running on Railway (provides API endpoints)
- Supabase project configured
- All required API keys and credentials

## Step 1: Connect Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select **creative-technologists-web** from GitHub
4. Click "Import"

## Step 2: Configure Build Settings

Vercel should auto-detect Next.js settings, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)
- **Node Version**: 18.x or higher

## Step 3: Add Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add all of the following:

### Supabase (Required)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Discord OAuth (Required)

```
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

**Note**: Update Discord OAuth redirect URI to:
- `https://your-vercel-domain.vercel.app/api/auth/discord/callback` (or custom domain)

### Stripe (Required)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note**: Configure webhook endpoint in Stripe dashboard:
- URL: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
- Events to send: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`

### Bot API (Required)

```
BOT_API_URL=https://your-railway-bot.up.railway.app
BOT_API_KEY=your_bot_api_key
```

**Note**: Must match bot's `BOT_API_KEY` environment variable in Railway

### Upstash Redis (Required - Rate Limiting)

```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Cloudflare Turnstile (Required - CAPTCHA)

```
TURNSTILE_SITE_KEY=0x4AAAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAAA...
```

### NextAuth (Required)

```
NEXTAUTH_SECRET=your_generated_secret
```

Generate with: `openssl rand -base64 32`

### Resend (Required - Email Notifications)

```
RESEND_API_KEY=re_...
```

### App URL (Required)

```
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

Or use Vercel domain: `https://your-project.vercel.app`

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide a deployment URL

## Step 5: Update External Services

### Discord OAuth Redirect URI

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Navigate to your application → OAuth2 → Redirects
3. Add: `https://your-vercel-domain.vercel.app/api/auth/discord/callback`
4. Save changes

### Stripe Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel
6. Save endpoint

## Step 6: Verify Deployment

### Test Public Routes

- Visit: `https://your-vercel-domain.vercel.app/`
  - Should load landing page
- Visit: `https://your-vercel-domain.vercel.app/members`
  - Should show member directory (reads from Supabase)

### Test Bot API Connection

```bash
curl https://your-vercel-domain.vercel.app/api/health
```

Should return: `{"ok": true}`

### Test Discord OAuth

1. Visit: `https://your-vercel-domain.vercel.app/apply`
2. Click "Login with Discord"
3. Should redirect to Discord OAuth
4. After auth, should redirect back to application form

### Test Application Flow

1. Complete application form
2. Submit (should create record in Supabase `applications` table)
3. Check admin dashboard: `https://your-vercel-domain.vercel.app/admin`

## Step 7: Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `creativetechnologists.com`)
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

### Update Environment Variables

After custom domain is configured:

1. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
2. Update Discord OAuth redirect URI
3. Update Stripe webhook endpoint URL
4. Redeploy to apply changes

## Step 8: Set Up Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Track page views, performance, and errors

### Vercel Logs

- Access real-time logs: Project → Deployments → [Latest] → Logs
- Monitor API errors, webhook failures, etc.

### Supabase Monitoring

- Monitor database queries in Supabase dashboard
- Set up alerts for high query counts or slow queries

### Stripe Dashboard

- Monitor webhook delivery in Stripe dashboard
- Check for failed webhook events

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found"

**Solution**: Verify `package.json` dependencies are correct, run `npm install` locally to test

**Issue**: Build fails with environment variable errors

**Solution**: Verify all required env vars are set in Vercel dashboard

### Runtime Errors

**Issue**: "Bot API connection failed"

**Solution**:
1. Verify `BOT_API_URL` is correct (Railway deployment URL)
2. Verify `BOT_API_KEY` matches bot's key
3. Test bot API: `curl https://your-railway-bot.up.railway.app/health`

**Issue**: "Discord OAuth not working"

**Solution**:
1. Verify redirect URI matches in Discord developer portal
2. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
3. Check browser console for errors

**Issue**: "Stripe webhook signature verification failed"

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Ensure webhook endpoint URL is correct
3. Check Stripe dashboard for webhook delivery logs

**Issue**: "Member directory not loading"

**Solution**:
1. Verify Supabase connection (check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
2. Verify Row Level Security (RLS) policy allows public SELECT on `member_status` table
3. Verify bot is writing data to Supabase

### Performance Issues

**Issue**: Slow page loads

**Solution**:
1. Enable Vercel Analytics to identify bottlenecks
2. Optimize Supabase queries (add indexes)
3. Consider edge caching for member directory

## Continuous Deployment

Vercel automatically deploys on:
- **Push to main branch**: Production deployment
- **Push to other branches**: Preview deployment
- **Pull requests**: Preview deployment with unique URL

To disable auto-deploy:
1. Go to project → Settings → Git
2. Disable "Production Branch"

## Rollback

To rollback to a previous deployment:

1. Go to project → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Discord OAuth redirect URI updated
- [ ] Stripe webhook endpoint configured and tested
- [ ] Bot API accessible from web app
- [ ] Supabase RLS policies enabled
- [ ] Admin users seeded in `admins` table
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring enabled (Vercel Analytics)
- [ ] Test full application flow (apply → pay → role assignment)
- [ ] Test admin dashboard functionality
- [ ] Verify member directory displays data

## Post-Deployment

### Regular Maintenance

- **Monitor Vercel logs** for errors
- **Monitor Stripe webhook delivery** for failures
- **Monitor Supabase database** for growth and performance
- **Review Vercel Analytics** for usage patterns
- **Update dependencies** regularly for security patches

### Scaling Considerations

- Vercel automatically scales for traffic
- Monitor Supabase usage (free tier: 500MB database, 2GB bandwidth)
- Consider upgrading Supabase plan if needed
- Monitor bot API response times (Railway may need scaling)

## Support

For deployment issues:
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)

For code issues:
- Open an issue in the repository
- Check `README.md` for troubleshooting tips
