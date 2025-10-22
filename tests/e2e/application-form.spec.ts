import { expect, test } from '@playwright/test';

const APPLICATION_API_ROUTE = '**/api/applications';

test.describe('Application form', () => {
  test('renders form for new applicants when not authenticated', async ({ page }) => {
    await page.route(APPLICATION_API_ROUTE, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not authenticated' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/apply/form');

    await expect(page.getByRole('heading', { name: 'Complete your application' })).toBeVisible();
    await expect(
      page.getByText('Connect your Discord account to submit an application.')
    ).toBeVisible();
    await expect(page.getByLabel('Email Address *')).toBeVisible();
    await expect(
      page.getByLabel('Why do you want to join this community? *')
    ).toBeVisible();
    await expect(
      page.getByLabel('What are you currently building? *')
    ).toBeVisible();
  });

  test('submits a new application successfully and navigates to success page', async ({ page }) => {
    await page.route(APPLICATION_API_ROUTE, async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not authenticated' }),
        });
        return;
      }

      if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            application: {
              id: 'app_123',
              status: 'pending',
              created_at: new Date().toISOString(),
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/apply/form');

    await page.getByLabel('Email Address *').fill('applicant@example.com');
    await page
      .getByLabel('Why do you want to join this community? *')
      .fill(
        'I want to collaborate with fellow creative technologists and contribute to community projects.'
      );
    await page
      .getByLabel('What are you currently building? *')
      .fill(
        'Right now I am experimenting with AI-driven visual tools and building prototypes to share with others.'
      );
    await page.getByPlaceholder('https://github.com/username').fill('https://github.com/example');

    await page.getByRole('button', { name: 'Submit application' }).click();

    await page.waitForURL('**/apply/success');
    await expect(page).toHaveURL(/\/apply\/success$/);
  });

  test('surfaces validation errors returned from the API', async ({ page }) => {
    await page.route(APPLICATION_API_ROUTE, async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not authenticated' }),
        });
        return;
      }

      if (request.method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation failed',
            errors: {
              why_join: ['Minimum 50 characters required'],
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/apply/form');

    await page.getByLabel('Email Address *').fill('applicant@example.com');
    await page.getByLabel('Why do you want to join this community? *').fill('Too short response');
    await page
      .getByLabel('What are you currently building? *')
      .fill('Another short answer that should trigger validation.');
    await page.getByPlaceholder('https://github.com/username').fill('https://github.com/example');

    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByText('Minimum 50 characters required')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit application' })).not.toBeDisabled();
  });

  test('shows existing application details when an application is already on file', async ({ page }) => {
    const now = new Date().toISOString();

    await page.route(APPLICATION_API_ROUTE, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            exists: true,
            application: {
              id: 'app_existing',
              status: 'pending',
              created_at: now,
              updated_at: now,
              email: 'member@example.com',
              why_join:
                'I love contributing to creative coding projects and want to collaborate with other makers.',
              what_building:
                'Building an interactive installation that fuses physical computing with generative AI.',
              social_links: ['https://twitter.com/member'],
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/apply/form');

    await expect(
      page.getByRole('heading', { name: 'Application already submitted' })
    ).toBeVisible();
    await expect(page.getByText('pending', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit responses' })).toBeVisible();
  });
});
