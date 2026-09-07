export type GuideSlug = 'mgev' | 'tla' | 'aod' | 'rvd'

export type GuildGuide = {
  slug: GuideSlug
  code: string
  name: string
  short: string
  image: string
  theme: GuideSlug
  blurb: string
}

export const guildGuides: GuildGuide[] = [
  {
    slug: 'mgev',
    code: 'MGEV',
    name: 'Machine-God of the Eternal Void',
    short: 'Machine-God',
    image: '/img/Machine-God_of_the_Eternal_Void_guild_ready.webp',
    theme: 'mgev',
    blurb: 'Void-machine guild boss. Team, toppings, tart, beascuit, and breakpoints will live here.'
  },
  {
    slug: 'tla',
    code: 'TLA',
    name: 'The Living Abyss',
    short: 'Living Abyss',
    image: '/img/Living_Licorice_Abyss.webp',
    theme: 'tla',
    blurb: 'Abyss guild boss. Team, toppings, tart, beascuit, and breakpoints will live here.'
  },
  {
    slug: 'aod',
    code: 'AOD',
    name: 'Avatar of Destiny',
    short: 'Avatar of Destiny',
    image: '/img/Avatar_of_destiny_guild_battle_ready.webp',
    theme: 'aod',
    blurb: 'ATK SPD team. Pudding and Crème carry damage; Mint CD sets Ferret’s cooldown breakpoint.'
  },
  {
    slug: 'rvd',
    code: 'RVD',
    name: 'Red Velvet Dragon',
    short: 'Red Velvet Dragon',
    image: '/img/Red_Velvet_Dragon.webp',
    theme: 'rvd',
    blurb: 'Pompom Dough, Eternal Sugar, Prune Juice, Black Sapphire, and Linzer.'
  }
]

export function getGuide(slug: GuideSlug) {
  const guide = guildGuides.find(item => item.slug === slug)
  if (!guide) throw new Error(`Unknown guide: ${slug}`)
  return guide
}

export const COOKIE_SLOTS = [1, 2, 3, 4, 5] as const

export const GEAR_ROWS = [
  { key: 'toppings', label: 'Toppings' },
  { key: 'tart', label: 'Tart' },
  { key: 'beascuit', label: 'Beascuit' },
  { key: 'stats', label: 'Target stats' }
] as const
