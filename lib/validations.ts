/**
 * Validation schemas using Zod
 *
 * Provides type-safe validation for forms and API requests.
 */

import { z } from 'zod'

/**
 * Application form validation schema (create)
 */
export const applicationCreateSchema = z.object({
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

  social_links: z
    .array(z.string().url('Invalid URL'))
    .min(1, 'Please provide at least one social link (GitHub, Twitter, portfolio, etc.)')
    .max(5, 'Maximum 5 social links allowed'),

  experience_level: z.string().optional(),
  project_links: z.array(z.string().url('Invalid URL')).max(5, 'Maximum 5 project links allowed').optional(),
})

/**
 * Application form validation schema (partial updates)
 */
export const applicationUpdateSchema = applicationCreateSchema.partial()

export type ApplicationFormData = z.infer<typeof applicationCreateSchema>
export type ApplicationUpdateData = z.infer<typeof applicationUpdateSchema>

/**
 * Validate application form data
 */
function validateWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): {
  success: boolean
  data?: z.infer<T>
  errors?: Record<string, string[]>
} {
  const result = schema.safeParse(data)

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

export function validateApplicationForm(data: unknown) {
  return validateWithSchema(applicationCreateSchema, data)
}

export function validateApplicationUpdate(data: unknown) {
  return validateWithSchema(applicationUpdateSchema, data)
}
