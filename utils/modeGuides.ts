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
    blurb: 'Three auto teams for Master. Toppings, tart, elemental beascuits, and rough Total-gear bands — no OCR required.'
  },
  {
    slug: 'kingdom-arena',
    code: 'ARENA',
    name: 'Kingdom Arena',
    short: 'Kingdom Arena',
    theme: 'kingdom-arena',
    image: '/img/challenger_2.png',
    blurb: 'Auto-only PvP season gear: cooldown, DMG resist, CRIT, and bypass targets for the current CCT defense team.'
  }
]

export function getModeGuide(slug: ModeGuideSlug): ModeGuide {
  const guide = modeGuides.find(g => g.slug === slug)
  if (!guide) throw new Error(`Unknown mode guide: ${slug}`)
  return guide
}

export function gearCheckModeUrl(mode: 'arena' | 'alliance', cookieId?: string) {
  const q = new URLSearchParams({ boss: mode })
  if (cookieId) q.set('cookie', cookieId)
  return `/tools/gear-check?${q.toString()}`
}
