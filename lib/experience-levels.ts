export const EXPERIENCE_LEVEL_VALUES = [
  'just_exploring',
  'experimenting',
  'building_products',
  'leading_teams',
] as const

export type ExperienceLevel = (typeof EXPERIENCE_LEVEL_VALUES)[number]

export const EXPERIENCE_LEVELS = [
  {
    value: EXPERIENCE_LEVEL_VALUES[0],
    title: 'Just exploring AI',
    description: 'Learning the landscape and experimenting with your first AI ideas.',
  },
  {
    value: EXPERIENCE_LEVEL_VALUES[1],
    title: 'Building prototypes',
    description: 'Creating demos or internal tools to explore what’s possible.',
  },
  {
    value: EXPERIENCE_LEVEL_VALUES[2],
    title: 'Shipping with users',
    description: 'Running AI features or products in production for real users.',
  },
  {
    value: EXPERIENCE_LEVEL_VALUES[3],
    title: 'Monetized at least one product',
    description: 'Generating revenue from products or services built with AI.',
  },
] as const satisfies ReadonlyArray<{
  value: ExperienceLevel
  title: string
  description: string
}>

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = EXPERIENCE_LEVELS.reduce(
  (acc, option) => {
    acc[option.value] = option.title
    return acc
  },
  {} as Record<ExperienceLevel, string>
)
