import { expect, test } from '@playwright/test';

test.describe('Apply landing', () => {
  test('surface Discord CTA with configured OAuth link', async ({ page }) => {
    await page.goto('/apply');

    const discordButton = page.getByRole('link', { name: 'Continue with Discord' });
    await expect(discordButton).toBeVisible();
    await expect(discordButton).toHaveAttribute('href', /discord\.com\/oauth2\/authorize/);
  });

  test('shows friendly error message for Discord auth failures', async ({ page }) => {
    await page.goto('/apply?error=oauth_failed');

    await expect(page.getByText('Discord authentication failed')).toBeVisible();
  });
});
