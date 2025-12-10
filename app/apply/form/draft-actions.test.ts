import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ApplicationDraftData } from '@/lib/db'

// Mock dependencies
const mockCookies = {
  get: vi.fn(),
}

const mockParseDiscordUserCookie = vi.fn()
const mockGetDraftByDiscordId = vi.fn()
const mockUpsertDraft = vi.fn()
const mockDeleteDraft = vi.fn()

vi.mock('next/headers', () => ({
  cookies: () => mockCookies,
}))

vi.mock('@/lib/current-user', () => ({
  parseDiscordUserCookie: (value: string) => mockParseDiscordUserCookie(value),
}))

vi.mock('@/lib/db', () => ({
  getDraftByDiscordId: (id: string) => mockGetDraftByDiscordId(id),
  upsertDraft: (id: string, data: ApplicationDraftData) => mockUpsertDraft(id, data),
  deleteDraft: (id: string) => mockDeleteDraft(id),
}))

// Import after mocking
import { saveDraft, loadDraft, clearDraft } from './draft-actions'

describe('Draft Server Actions', () => {
  const mockDraftData: ApplicationDraftData = {
    email: 'test@example.com',
    why_join: 'I want to join because this community is amazing and I can learn a lot',
    what_building: 'Building an AI-powered productivity tool that helps developers write better code',
    experience_level: 'intermediate',
    social_links: [{ type: 'twitter', value: 'https://x.com/testuser' }],
    project_links: ['https://github.com/testuser/project'],
  }

  const mockDiscordUser = {
    id: 'discord-user-123',
    username: 'testuser',
    discriminator: '0',
    avatar: 'abc123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveDraft', () => {
    it('should save draft successfully when authenticated', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockUpsertDraft.mockResolvedValue({ id: 'draft-1', ...mockDraftData })

      const result = await saveDraft(mockDraftData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockUpsertDraft).toHaveBeenCalledWith('discord-user-123', mockDraftData)
    })

    it('should return error when not authenticated (no cookie)', async () => {
      mockCookies.get.mockReturnValue(undefined)

      const result = await saveDraft(mockDraftData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('not_authenticated')
      expect(mockUpsertDraft).not.toHaveBeenCalled()
    })

    it('should return error when cookie is invalid', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(null)

      const result = await saveDraft(mockDraftData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('invalid_session')
      expect(mockUpsertDraft).not.toHaveBeenCalled()
    })

    it('should return error when database operation fails', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockUpsertDraft.mockRejectedValue(new Error('Database error'))

      const result = await saveDraft(mockDraftData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('save_failed')
    })
  })

  describe('loadDraft', () => {
    it('should load draft successfully when authenticated and draft exists', async () => {
      const savedDraft = {
        id: 'draft-1',
        discord_user_id: 'discord-user-123',
        form_data: mockDraftData,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockGetDraftByDiscordId.mockResolvedValue(savedDraft)

      const result = await loadDraft()

      expect(result).toEqual(mockDraftData)
      expect(mockGetDraftByDiscordId).toHaveBeenCalledWith('discord-user-123')
    })

    it('should return null when not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined)

      const result = await loadDraft()

      expect(result).toBeNull()
      expect(mockGetDraftByDiscordId).not.toHaveBeenCalled()
    })

    it('should return null when cookie is invalid', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(null)

      const result = await loadDraft()

      expect(result).toBeNull()
      expect(mockGetDraftByDiscordId).not.toHaveBeenCalled()
    })

    it('should return null when no draft exists', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockGetDraftByDiscordId.mockResolvedValue(null)

      const result = await loadDraft()

      expect(result).toBeNull()
    })

    it('should return null when database operation fails', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockGetDraftByDiscordId.mockRejectedValue(new Error('Database error'))

      const result = await loadDraft()

      expect(result).toBeNull()
    })
  })

  describe('clearDraft', () => {
    it('should clear draft successfully when authenticated', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockDeleteDraft.mockResolvedValue(undefined)

      await clearDraft()

      expect(mockDeleteDraft).toHaveBeenCalledWith('discord-user-123')
    })

    it('should do nothing when not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined)

      await clearDraft()

      expect(mockDeleteDraft).not.toHaveBeenCalled()
    })

    it('should do nothing when cookie is invalid', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(null)

      await clearDraft()

      expect(mockDeleteDraft).not.toHaveBeenCalled()
    })

    it('should not throw when database operation fails (non-critical)', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
      mockParseDiscordUserCookie.mockReturnValue(mockDiscordUser)
      mockDeleteDraft.mockRejectedValue(new Error('Database error'))

      // Should not throw
      await expect(clearDraft()).resolves.not.toThrow()
    })
  })
})

describe('Draft data edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle empty social_links array', async () => {
    const dataWithEmptySocialLinks: ApplicationDraftData = {
      email: 'test@example.com',
      why_join: 'Reason',
      what_building: 'Project',
      experience_level: 'beginner',
      social_links: [],
      project_links: [],
    }

    mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
    mockParseDiscordUserCookie.mockReturnValue({ id: 'user-1', username: 'test', discriminator: '0', avatar: null })
    mockUpsertDraft.mockResolvedValue({ id: 'draft-1', form_data: dataWithEmptySocialLinks })

    const result = await saveDraft(dataWithEmptySocialLinks)

    expect(result.success).toBe(true)
    expect(mockUpsertDraft).toHaveBeenCalledWith('user-1', dataWithEmptySocialLinks)
  })

  it('should handle maximum social_links (5)', async () => {
    const dataWithMaxSocialLinks: ApplicationDraftData = {
      email: 'test@example.com',
      why_join: 'Reason',
      what_building: 'Project',
      experience_level: 'expert',
      social_links: [
        { type: 'twitter', value: 'https://x.com/user' },
        { type: 'github', value: 'https://github.com/user' },
        { type: 'instagram', value: 'https://instagram.com/user' },
        { type: 'portfolio', value: 'https://portfolio.com' },
        { type: 'portfolio', value: 'https://another-portfolio.com' },
      ],
      project_links: ['https://p1.com', 'https://p2.com', 'https://p3.com', 'https://p4.com', 'https://p5.com'],
    }

    mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
    mockParseDiscordUserCookie.mockReturnValue({ id: 'user-1', username: 'test', discriminator: '0', avatar: null })
    mockUpsertDraft.mockResolvedValue({ id: 'draft-1', form_data: dataWithMaxSocialLinks })

    const result = await saveDraft(dataWithMaxSocialLinks)

    expect(result.success).toBe(true)
    expect(dataWithMaxSocialLinks.social_links).toHaveLength(5)
    expect(dataWithMaxSocialLinks.project_links).toHaveLength(5)
  })

  it('should handle long text fields (1000 chars)', async () => {
    const longText = 'A'.repeat(1000)
    const dataWithLongText: ApplicationDraftData = {
      email: 'test@example.com',
      why_join: longText,
      what_building: longText,
      experience_level: 'ai_researcher',
      social_links: [{ type: 'twitter', value: 'https://x.com/user' }],
      project_links: [],
    }

    mockCookies.get.mockReturnValue({ value: 'valid-cookie' })
    mockParseDiscordUserCookie.mockReturnValue({ id: 'user-1', username: 'test', discriminator: '0', avatar: null })
    mockUpsertDraft.mockResolvedValue({ id: 'draft-1', form_data: dataWithLongText })

    const result = await saveDraft(dataWithLongText)

    expect(result.success).toBe(true)
  })
})
