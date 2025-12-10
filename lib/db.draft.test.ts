import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ApplicationDraftData } from './db'

// Mock Supabase client - must use factory function
vi.mock('./supabase', () => {
  const mockFrom = vi.fn()
  return {
    supabase: {
      from: mockFrom,
    },
    __mockFrom: mockFrom,
  }
})

// Import after mocking
import { getDraftByDiscordId, upsertDraft, deleteDraft } from './db'
import { supabase } from './supabase'

// Get the mock function
const mockFrom = supabase.from as ReturnType<typeof vi.fn>

describe('Application Draft Database Helpers', () => {
  const mockDraftData: ApplicationDraftData = {
    email: 'test@example.com',
    why_join: 'I want to join because...',
    what_building: 'Building an AI project...',
    experience_level: 'intermediate',
    social_links: [{ type: 'twitter', value: 'https://x.com/test' }],
    project_links: ['https://github.com/test/project'],
  }

  const mockDraft = {
    id: 'draft-123',
    discord_user_id: 'user-456',
    form_data: mockDraftData,
    updated_at: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDraftByDiscordId', () => {
    it('should return draft when found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockDraft, error: null }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getDraftByDiscordId('user-456')

      expect(mockFrom).toHaveBeenCalledWith('application_drafts')
      expect(result).toEqual(mockDraft)
    })

    it('should return null when draft not found (PGRST116)', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'Not found' },
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getDraftByDiscordId('nonexistent-user')

      expect(result).toBeNull()
    })

    it('should throw on other database errors', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '42P01', message: 'Table not found' },
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      await expect(getDraftByDiscordId('user-456')).rejects.toThrow()
    })
  })

  describe('upsertDraft', () => {
    it('should create new draft when none exists', async () => {
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockDraft, error: null }),
        }),
      })
      mockFrom.mockReturnValue({ upsert: mockUpsert })

      const result = await upsertDraft('user-456', mockDraftData)

      expect(mockFrom).toHaveBeenCalledWith('application_drafts')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          discord_user_id: 'user-456',
          form_data: mockDraftData,
        }),
        { onConflict: 'discord_user_id' }
      )
      expect(result).toEqual(mockDraft)
    })

    it('should update existing draft (upsert on conflict)', async () => {
      const updatedDraft = { ...mockDraft, form_data: { ...mockDraftData, email: 'updated@example.com' } }
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: updatedDraft, error: null }),
        }),
      })
      mockFrom.mockReturnValue({ upsert: mockUpsert })

      const result = await upsertDraft('user-456', { ...mockDraftData, email: 'updated@example.com' })

      expect(result.form_data.email).toBe('updated@example.com')
    })

    it('should throw on database error', async () => {
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'Unique violation' },
          }),
        }),
      })
      mockFrom.mockReturnValue({ upsert: mockUpsert })

      await expect(upsertDraft('user-456', mockDraftData)).rejects.toThrow()
    })
  })

  describe('deleteDraft', () => {
    it('should delete draft by discord user id', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      mockFrom.mockReturnValue({ delete: mockDelete })

      await deleteDraft('user-456')

      expect(mockFrom).toHaveBeenCalledWith('application_drafts')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('should throw on database error', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: '42P01', message: 'Table not found' },
        }),
      })
      mockFrom.mockReturnValue({ delete: mockDelete })

      await expect(deleteDraft('user-456')).rejects.toThrow()
    })

    it('should succeed silently if draft does not exist', async () => {
      // Delete on non-existent row is not an error in Supabase
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      mockFrom.mockReturnValue({ delete: mockDelete })

      await expect(deleteDraft('nonexistent-user')).resolves.not.toThrow()
    })
  })
})

describe('ApplicationDraftData type validation', () => {
  it('should accept valid draft data structure', () => {
    const validData: ApplicationDraftData = {
      email: 'test@example.com',
      why_join: 'Reason to join',
      what_building: 'Project description',
      experience_level: 'beginner',
      social_links: [{ type: 'twitter', value: 'https://x.com/user' }],
      project_links: [],
    }

    expect(validData.email).toBe('test@example.com')
    expect(validData.social_links).toHaveLength(1)
    expect(validData.project_links).toHaveLength(0)
  })

  it('should handle multiple social links', () => {
    const data: ApplicationDraftData = {
      email: 'test@example.com',
      why_join: 'Reason',
      what_building: 'Project',
      experience_level: 'advanced',
      social_links: [
        { type: 'twitter', value: 'https://x.com/user' },
        { type: 'github', value: 'https://github.com/user' },
        { type: 'portfolio', value: 'https://portfolio.com' },
      ],
      project_links: ['https://project1.com', 'https://project2.com'],
    }

    expect(data.social_links).toHaveLength(3)
    expect(data.project_links).toHaveLength(2)
  })
})
