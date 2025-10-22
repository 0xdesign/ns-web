import { NextRequest } from 'next/server';
import { describe, it, beforeEach, expect, vi } from 'vitest';

const mockRequireAdmin = vi.fn();
const mockGetCurrentDiscordUser = vi.fn();
const mockGetApplication = vi.fn();
const mockUpdateApplicationStatus = vi.fn();
const mockSendRejectionEmail = vi.fn();
const mockSendWaitlistEmail = vi.fn();

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: mockRequireAdmin,
  getCurrentDiscordUser: mockGetCurrentDiscordUser,
}));

vi.mock('@/lib/db', () => ({
  getApplication: mockGetApplication,
  updateApplicationStatus: mockUpdateApplicationStatus,
}));

vi.mock('@/lib/resend', () => ({
  sendRejectionEmail: mockSendRejectionEmail,
  sendWaitlistEmail: mockSendWaitlistEmail,
}));

function createRequest() {
  return new NextRequest(new Request('http://localhost/api/admin/action', { method: 'POST' }));
}

describe('Admin application actions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRequireAdmin.mockResolvedValue(undefined);
    mockGetCurrentDiscordUser.mockResolvedValue({ id: 'admin_123' });
    mockSendRejectionEmail.mockResolvedValue(undefined);
    mockSendWaitlistEmail.mockResolvedValue(undefined);
  });

  describe('reject', () => {
    it('rejects a pending application and sends email', async () => {
      const { POST } = await import('@/app/api/admin/applications/[id]/reject/route');

      mockGetApplication.mockResolvedValue({
        id: 'app_1',
        status: 'pending',
        email: 'user@example.com',
        discord_username: 'user#1234',
      });
      mockUpdateApplicationStatus.mockResolvedValue(undefined);
      mockSendRejectionEmail.mockResolvedValue(undefined);

      const response = await POST(createRequest(), {
        params: Promise.resolve({ id: 'app_1' }),
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        success: true,
        email: 'user@example.com',
      });

      expect(mockRequireAdmin).toHaveBeenCalled();
      expect(mockGetApplication).toHaveBeenCalledWith('app_1');
      expect(mockUpdateApplicationStatus).toHaveBeenCalledWith('app_1', 'rejected', 'admin_123');
      expect(mockSendRejectionEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        username: 'user#1234',
      });
    });

    it('returns 400 if application already processed', async () => {
      const { POST } = await import('@/app/api/admin/applications/[id]/reject/route');

      mockGetApplication.mockResolvedValue({
        id: 'app_2',
        status: 'approved',
        email: 'user@example.com',
        discord_username: 'user#1234',
      });

      const response = await POST(createRequest(), {
        params: Promise.resolve({ id: 'app_2' }),
      });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toMatchObject({
        error: expect.stringContaining('already approved'),
      });
      expect(mockUpdateApplicationStatus).not.toHaveBeenCalled();
      expect(mockSendRejectionEmail).not.toHaveBeenCalled();
    });

    it('returns 404 if application missing', async () => {
      const { POST } = await import('@/app/api/admin/applications/[id]/reject/route');

      mockGetApplication.mockResolvedValue(null);

      const response = await POST(createRequest(), {
        params: Promise.resolve({ id: 'missing_app' }),
      });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toMatchObject({
        error: 'Application not found',
      });
    });
  });

  describe('waitlist', () => {
    it('waitlists a pending application and sends email', async () => {
      const { POST } = await import('@/app/api/admin/applications/[id]/waitlist/route');

      mockGetApplication.mockResolvedValue({
        id: 'app_3',
        status: 'pending',
        email: 'user@example.com',
        discord_username: 'user#9999',
      });

      const response = await POST(createRequest(), {
        params: Promise.resolve({ id: 'app_3' }),
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        success: true,
        email: 'user@example.com',
      });

      expect(mockUpdateApplicationStatus).toHaveBeenCalledWith('app_3', 'waitlisted', 'admin_123');
      expect(mockSendWaitlistEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        username: 'user#9999',
      });
    });
  });
});
