export type ModeGuideSlug = 'cookie-alliance' | 'kingdom-arena'

export type ModeGuide = {
  slug: ModeGuideSlug
  code: string
  name: string
  short: string
  theme: ModeGuideSlug
  blurb: string
  image: string
}

export const modeGuides: ModeGuide[] = [
  {
    slug: 'cookie-alliance',
    code: 'ALLIANCE',
    name: 'Cookie Alliance',
    short: 'Cookie Alliance',
    theme: 'cookie-alliance',
    image: '/img/cctLogo.png',
    blurb: 'Doc-only Master autoplay: teams, toppings, tart, elemental beascuits, and rough gear bands.'
  },
  {
    slug: 'kingdom-arena',
    code: 'ARENA',
    name: 'Kingdom Arena',
    short: 'Kingdom Arena',
    theme: 'kingdom-arena',
    image: '/img/challenger_2.png',
    blurb: 'Doc-only: Arcade Arena rank-up team, normal Kingdom Arena defense, and Le counter sheet — no Gear Check.'
  }
]

export function getModeGuide(slug: ModeGuideSlug): ModeGuide {
  const guide = modeGuides.find(g => g.slug === slug)
  if (!guide) throw new Error(`Unknown mode guide: ${slug}`)
  return guide
}
