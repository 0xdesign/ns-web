/**
 * Validation schemas using Zod
 *
 * Provides type-safe validation for forms and API requests.
 */

import { z } from 'zod'
import { EXPERIENCE_LEVEL_VALUES } from './experience-levels'

/**
 * Application form validation schema
 */
export const applicationSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),

  why_join: z
    .string()
    .min(50, 'Please provide at least 50 characters explaining why you want to join')
    .max(1000, 'Please keep your response under 1000 characters'),

  what_building: z
    .string()
    .min(50, 'Please provide at least 50 characters describing what you\'re building')
    .max(1000, 'Please keep your response under 1000 characters'),

  experience_level: z.enum(EXPERIENCE_LEVEL_VALUES, {
    errorMap: () => ({
      message: 'Please select the option that best matches your AI experience level',
    }),
  }),

  social_links: z
    .array(z.string().url('Invalid URL'))
    .min(1, 'Please provide at least one social link (GitHub, Twitter, portfolio, etc.)')
    .max(5, 'Maximum 5 social links allowed'),

  project_links: z
    .array(z.string().url('Invalid URL'))
    .max(5, 'Maximum 5 project links allowed')
    .default([]),
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

/**
 * Validate application form data
 */
export function validateApplicationForm(data: unknown): {
  success: boolean
  data?: ApplicationFormData
  errors?: Record<string, string[]>
} {
  const result = applicationSchema.safeParse(data)

  if (!result.success) {
    const errors: Record<string, string[]> = {}
    result.error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(err.message)
    })

    return { success: false, errors }
  }

  return { success: true, data: result.data }
}
