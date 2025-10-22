import { expect, test } from '@playwright/test';

test.describe('Subscription success page', () => {
  test('displays one-click Discord join when app id present', async ({ page }) => {
    await page.goto('/success?app=app_456');

    const joinButton = page.getByRole('link', { name: /Join Discord/ });
    await expect(joinButton).toBeVisible();
    await expect(joinButton).toHaveAttribute('href', /discord\.com\/oauth2\/authorize/);
  });

  test('falls back to invite link when no app id is provided', async ({ page }) => {
    await page.goto('/success');

    const inviteButton = page.getByRole('link', { name: 'Join Discord Server' });
    await expect(inviteButton).toBeVisible();
    await expect(inviteButton).toHaveAttribute('href', 'https://discord.gg/test-invite');
  });
});
