export type ArenaCookieBuild = {
  id: string
  name: string
  short: string
  portrait?: string
  toppings: string
  tart: string
  beascuit: string
  stats: string
  notes?: string[]
}

export type ArenaCounterSubgroup = {
  /** e.g. "1s" — enemy skill start timing you are countering */
  title: string
  blurb?: string
  matchups: string[]
}

/** Top-level counter bucket (Le = main meta answers; others are specific hard counters). */
export type ArenaCounterSection = {
  title: string
  intro?: string
  subgroups?: ArenaCounterSubgroup[]
  matchups?: string[]
}

export const arenaModeNote =
  'Kingdom Arena is auto-only. Defense and offense share the same gear. Losses are usually stat/build gaps, not team order.'

/** CCT “normal” Kingdom Arena defense (from in-game Gear screens). */
export const arenaPrimaryTeam: ArenaCookieBuild[] = [
  {
    id: 'windArcher',
    name: 'Wind Archer Cookie',
    short: 'Wind Archer',
    portrait: '/img/guides/tla/wind-archer.png',
    toppings: 'Searing Raspberry + Apple Jelly (CRIT).',
    tart: 'Increased DMG Resist or defensive tart if needed.',
    beascuit: 'Attacker — CRIT and DMG Resist Bypass substats.',
    stats: 'Rough Total: ~25–35% ATK, ~70–80% CRIT, ~25–30% DMG Resist, ~50–60% DMG Resist Bypass, ~5–10% CD.',
    notes: ['Do not use guild-battle ATK SPD builds here.']
  },
  {
    id: 'adc',
    name: 'Awakened Dark Cacao Cookie',
    short: 'ADC',
    toppings: '5 Swift Chocolate or 4 Swift + 1 Solid Almond.',
    tart: 'Increased Healing Given & Received (~3%) or DMG Resist.',
    beascuit: 'Cooldown substats on Attacker beascuit.',
    stats: 'Rough Total: ~105–115% ATK, ~28–32% CD, ~24–28% DMG Resist, ~35% HP.',
    notes: []
  },
  {
    id: 'blackPearl',
    name: 'Black Pearl Cookie',
    short: 'Black Pearl',
    toppings: 'Searing Raspberry + Jelly for CRIT.',
    tart: 'Increased DMG to Enemies or team DMG.',
    beascuit: 'CRIT / ATK substats.',
    stats: 'High ATK, strong CRIT, ~15–25% CD; some DR from Almond helps.',
    notes: []
  },
  {
    id: 'mysticFlour',
    name: 'Mystic Flour Cookie',
    short: 'Mystic Flour',
    toppings: 'Swift Chocolate + Solid Almond mix.',
    tart: 'Team DMG or DR.',
    beascuit: 'CD and DMG Resist substats.',
    stats: 'Rough Total: ~25–30% DMG Resist, ~25–35% CD.',
    notes: ['Swap for Linzer for more ranged CRIT pressure.']
  },
  {
    id: 'linzer',
    name: 'Linzer Cookie',
    short: 'Linzer',
    portrait: '/img/guides/rvd/linzer.png',
    toppings: 'Searing Raspberry + Apple Jelly.',
    tart: 'Increased DMG to Enemies.',
    beascuit: 'CRIT-focused Attacker.',
    stats: 'Rough Total: ~90–100% ATK, ~12–18% CRIT, ~12–18% CD.',
    notes: []
  }
]

export const arcadeArenaIntro =
  'Arcade Arena Season 1 — easy rank-up team (lychee meta). Tune for autoplay; you mainly lose when their builds/stat totals beat yours.'

export const arcadeArenaEasyTeam: ArenaCookieBuild[] = [
  {
    id: 'rambutan',
    name: 'Rambutan Cookie',
    short: 'Rambutan',
    toppings: 'Cooldown-focused set.',
    tart: 'As needed for breakpoints.',
    beascuit: '4× Cooldown or 4× DMG Resist (whichever completes your totals).',
    stats: '~40% CD, max DMG Resist & ATK (within reason for your account).',
    notes: []
  },
  {
    id: 'financier',
    name: 'Financier Cookie',
    short: 'Financier',
    toppings: 'CD + bulk (Swift / Almond mix).',
    tart: 'Defensive or CD tart.',
    beascuit: '4× Cooldown.',
    stats: '~25% CD+, max DMG Resist, DMG Resist Bypass, DEF & HP.',
    notes: ['DBR = DMG Resist Bypass on Total gear.']
  },
  {
    id: 'caramelArrow',
    name: 'Caramel Arrow Cookie',
    short: 'Caramel Arrow',
    toppings: 'Mix for DR + ATK SPD.',
    tart: 'DR or ATK tart.',
    beascuit: '4× DMG Resist Bypass.',
    stats: '~25% DMG Resist, max ATK & ATK SPD.',
    notes: []
  },
  {
    id: 'mogra',
    name: 'Mogra Cookie',
    short: 'Mogra',
    toppings: 'HP / DR priority.',
    tart: 'Team or DR tart.',
    beascuit: '4× DMG Resist.',
    stats: '~75% DMG Resist, max HP & ATK.',
    notes: []
  },
  {
    id: 'smokedCheese',
    name: 'Smoked Cheese Cookie',
    short: 'Smoked Cheese',
    toppings: 'Swift for 2s skill start (~44.5% CD breakpoint).',
    tart: 'Increased Team DMG.',
    beascuit: '4× Cooldown.',
    stats: '2s start (44.5% CD), max DMG Resist & ATK.',
    notes: []
  }
]

export const arcadeArenaCounters =
  'You mainly lose to better builds/stats. Tough comps: Pastry teams, Tea Knight teams, some Drizzle teams.'

export const leArenaCounters: ArenaCounterSection = {
  title: 'Le counters',
  intro:
    'Main Kingdom Arena counter list. 1s and 2s refer to the enemy team’s initial skill start (1-second vs 2-second CD breakpoint) — pick the line that matches what they’re running.',
  subgroups: [
    {
      title: '1s',
      blurb: 'Vs ~1s initial skill start',
      matchups: ['Raja + Salt', 'Raja + Time Shadow (2s)', 'Raja + Povi (2s)']
    },
    {
      title: '2s',
      blurb: 'Vs ~2s initial skill start',
      matchups: [
        'Raja + Eternal Sugar (4★ needed)',
        'Raja + Bunny (2s) — mainly vs Povi',
        'Raja + Time Povi (1s Povi)',
        'Hollyberry (50/50)'
      ]
    }
  ]
}

export const otherArenaCounterSections: ArenaCounterSection[] = [
  {
    title: 'Povi hard counters',
    matchups: [
      'Raja + SMC (2s) — 4★ needed',
      'Raja + Bunny (2s) — 4–5 asc★ needed',
      'Hollyberry (50/50)'
    ]
  },
  {
    title: 'Time Shadow Cookie hard counters',
    matchups: ['Raja + Povi (2s)']
  }
]

export const arenaTreasures =
  'Use strongest PvP treasures (Scroll, Whistle, third stat stick). Level 12+ is the guild baseline.'
