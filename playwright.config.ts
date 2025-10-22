import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
        url: 'http://127.0.0.1:3100',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        env: {
          HOST: '127.0.0.1',
          PORT: '3100',
          NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
          NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3100',
          NEXT_PUBLIC_DISCORD_INVITE_URL: 'https://discord.gg/test-invite',
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_playwright',
          STRIPE_SECRET_KEY: 'sk_test_playwright',
          STRIPE_WEBHOOK_SECRET: 'whsec_test_playwright',
          STRIPE_PRICE_ID: 'price_test_playwright',
          DISCORD_CLIENT_ID: 'playwright-client-id',
          DISCORD_CLIENT_SECRET: 'playwright-client-secret',
          DISCORD_REDIRECT_URI: 'http://127.0.0.1:3100/api/auth/discord/callback',
          DISCORD_JOIN_REDIRECT_URI: 'http://127.0.0.1:3100/api/discord/join/callback',
          DISCORD_BOT_TOKEN: 'playwright-bot-token',
          DISCORD_GUILD_ID: 'playwright-guild',
          MEMBER_ROLE_ID: 'playwright-role',
          NEXTAUTH_SECRET: 'playwright-nextauth-secret',
          BOT_API_URL: 'http://127.0.0.1:8000',
          BOT_API_KEY: 'playwright-bot-key',
          RESEND_API_KEY: 'playwright-resend',
          FROM_EMAIL: 'test@example.com',
          CRON_SECRET: 'playwright-cron-secret',
        },
      },
});
