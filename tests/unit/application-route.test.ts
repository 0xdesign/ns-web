import { NextRequest } from 'next/server';
import { describe, it, beforeEach, expect, vi } from 'vitest';

const mockCookiesGet = vi.fn();
const mockCookiesDelete = vi.fn();
const mockGetApplicationByDiscordId = vi.fn();
const mockCreateApplication = vi.fn();
const mockUpdateApplicationDetails = vi.fn();
const mockValidateApplicationForm = vi.fn();
const mockValidateApplicationUpdate = vi.fn();
const mockEnforceApplicationRateLimit = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: mockCookiesGet,
    delete: mockCookiesDelete,
  }),
}));

vi.mock('@/lib/db', () => ({
  getApplicationByDiscordId: mockGetApplicationByDiscordId,
  createApplication: mockCreateApplication,
  updateApplicationDetails: mockUpdateApplicationDetails,
}));

vi.mock('@/lib/validations', () => ({
  validateApplicationForm: mockValidateApplicationForm,
  validateApplicationUpdate: mockValidateApplicationUpdate,
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceApplicationRateLimit: mockEnforceApplicationRateLimit,
  resetApplicationRateLimitMemory: vi.fn(),
}));

function createRequest(body: unknown, method: string = 'POST') {
  return new NextRequest(
    new Request('http://localhost/api/applications', {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        'x-forwarded-for': '203.0.113.5',
      },
    })
  );
}

describe('Applications API route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockCookiesDelete.mockResolvedValue(undefined);
    mockCookiesGet.mockReturnValue({
      value: JSON.stringify({
        id: 'discord-user-1',
        username: 'test-user',
        discriminator: '1234',
      }),
    });
    mockEnforceApplicationRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 2,
      reset: Date.now() + 1000,
    });
    mockValidateApplicationUpdate.mockReturnValue({
      success: true,
      data: {},
    });
  });

  it('rejects duplicate submissions', async () => {
    mockGetApplicationByDiscordId.mockResolvedValue({
      id: 'existing-app',
      status: 'pending',
    });

    const { POST } = await import('@/app/api/applications/route');
    const response = await POST(
      createRequest({
        email: 'test@example.com',
        why_join: 'A'.repeat(60),
        what_building: 'B'.repeat(60),
        social_links: ['https://github.com/example'],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('already submitted');
    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it('validates incoming payload', async () => {
    mockGetApplicationByDiscordId.mockResolvedValue(null);
    mockValidateApplicationForm.mockReturnValue({
      success: false,
      errors: { email: ['Invalid email'] },
    });

    const { POST } = await import('@/app/api/applications/route');
    const response = await POST(createRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors?.email).toContain('Invalid email');
    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it('creates a new application and clears cookie', async () => {
    mockGetApplicationByDiscordId.mockResolvedValue(null);
    mockValidateApplicationForm.mockReturnValue({
      success: true,
      data: {
        email: 'test@example.com',
        why_join: 'A'.repeat(60),
        what_building: 'B'.repeat(60),
        social_links: ['https://github.com/example'],
      },
    });
    mockCreateApplication.mockResolvedValue({
      id: 'new-app',
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    const { POST } = await import('@/app/api/applications/route');
    const response = await POST(
      createRequest({
        email: 'test@example.com',
        why_join: 'A'.repeat(60),
        what_building: 'B'.repeat(60),
        social_links: ['https://github.com/example'],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockCreateApplication).toHaveBeenCalled();
    expect(mockCookiesDelete).toHaveBeenCalledWith('discord_user');
  });

  it('applies rate limiting', async () => {
    mockEnforceApplicationRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      reset: Date.now() + 3600 * 1000,
    });

    const { POST } = await import('@/app/api/applications/route');
    const response = await POST(
      createRequest({
        email: 'test@example.com',
        why_join: 'A'.repeat(60),
        what_building: 'B'.repeat(60),
        social_links: ['https://github.com/example'],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toContain('Too many applications');
    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it('updates an application with partial data', async () => {
    const existing = {
      id: 'existing-app',
      status: 'pending',
      email: 'test@example.com',
      why_join: 'A'.repeat(60),
      what_building: 'B'.repeat(60),
      experience_level: 'intermediate',
      social_links: '["https://github.com/example"]',
      project_links: '[]',
    };

    mockGetApplicationByDiscordId.mockResolvedValue(existing);
    mockValidateApplicationUpdate.mockReturnValue({
      success: true,
      data: {
        why_join: 'C'.repeat(60),
      },
    });
    mockUpdateApplicationDetails.mockResolvedValue({
      ...existing,
      why_join: 'C'.repeat(60),
      updated_at: new Date().toISOString(),
    });

    const { PATCH } = await import('@/app/api/applications/route');
    const response = await PATCH(
      createRequest(
        {
          why_join: 'C'.repeat(60),
        },
        'PATCH'
      )
    );

    expect(response.status).toBe(200);
    expect(mockValidateApplicationUpdate).toHaveBeenCalled();
    expect(mockUpdateApplicationDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'existing-app',
        why_join: 'C'.repeat(60),
        email: existing.email,
      })
    );
  });
});
