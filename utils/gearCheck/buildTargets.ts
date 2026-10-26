import type { GuideSlug } from '~/utils/guildGuides'
import type { CookieBuildTarget } from './types'

export type GearCheckMode = GuideSlug | 'arena' | 'alliance'

/** Guild-battle targets from CCT boss guides (Total / Beascuit stats page). */
const MGEV: CookieBuildTarget[] = [
  {
    id: 'frilled',
    short: 'Frilled',
    names: ['Frilled Jellyfish', 'Frilled'],
    portrait: '/img/guides/mgev/frilled.png',
    requirements: [{ statKey: 'cooldown', label: 'Cooldown', min: 35, unit: 'percent', hint: 'CD tart · 5 CD or 4 ATK+1 CD' }],
    gearRows: [
      { label: 'Toppings', value: '5 CD or 4 ATK+1 CD · CD/ATK tart · DMG UP to monsters' },
      { label: 'Beascuit', value: '4× Water DMG or 4× CD' }
    ],
    notes: ['Tart: DMG UP to monsters', 'Beascuit: 4× Water or 4× CD']
  },
  {
    id: 'seaFairy',
    short: 'Sea Fairy',
    names: ['Sea Fairy'],
    portrait: '/img/guides/mgev/sea-fairy.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 35, unit: 'percent' },
      { statKey: 'waterDmg', label: 'Water DMG', min: 20, unit: 'percent', hint: '4× Water on beascuit' }
    ],
    notes: ['Highest crystal jam · ATK max but below Menthol']
  },
  {
    id: 'seltzer',
    short: 'Seltzer',
    names: ['Seltzer'],
    portrait: '/img/guides/mgev/seltzer.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 24.1, unit: 'percent' },
      { statKey: 'waterDmg', label: 'Water DMG', min: 20, unit: 'percent' }
    ]
  },
  {
    id: 'menthol',
    short: 'Menthol',
    names: ['Menthol'],
    portrait: '/img/guides/mgev/menthol.png',
    requirements: [
      { statKey: 'atkSpd', label: 'ATK SPD', min: 11.7, unit: 'percent' },
      { statKey: 'cooldown', label: 'Cooldown', min: 18.8, unit: 'percent', hint: '19.2%+ if manual cast' }
    ],
    gearRows: [
      { label: 'Toppings', value: '4 ATK + 1 CD · CD tart · DMG UP to monsters' },
      { label: 'Beascuit', value: '4× Water DMG' },
      { label: 'ATK SPD', value: '11.7%+' },
      { label: 'CD', value: '18.8%+ (19.2%+ manual)' }
    ],
    notes: ['Highest ATK on team', '4× Water beascuit']
  },
  {
    id: 'ferret',
    short: 'Ferret',
    names: ['Cream Ferret', 'Ferret'],
    portrait: '/img/guides/mgev/ferret.png',
    requirements: [{ statKey: 'cooldown', label: 'Cooldown', min: 35.2, unit: 'percent', hint: 'Alt raspberry ~17.8–18%' }],
    notes: ['TEAM DMG UP tart · 5 ATK or full Raspberry']
  }
]

const TLA: CookieBuildTarget[] = [
  {
    id: 'bbp',
    short: 'Blueberry Pie',
    names: ['Blueberry Pie'],
    portrait: '/img/guides/tla/blueberry-pie.png',
    requirements: [{ statKey: 'atkSpd', label: 'ATK SPD', min: 33.1, unit: 'percent' }],
    notes: ['4× Electricity beascuit']
  },
  {
    id: 'cpuff',
    short: 'Cream Puff',
    names: ['Cream Puff'],
    portrait: '/img/guides/tla/cream-puff.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 14.1, max: 14.4, unit: 'percent' },
      { statKey: 'crit', label: 'CRIT', min: 50, unit: 'percent', hint: 'On Total page' }
    ],
    notes: ['HP must exceed Wind Archer × coefficient — use TLA guide calculator']
  },
  {
    id: 'warcher',
    short: 'Wind Archer',
    names: ['Wind Archer'],
    portrait: '/img/guides/tla/wind-archer.png',
    requirements: [{ statKey: 'atkSpd', label: 'ATK SPD (total)', min: 48.4, unit: 'percent', hint: 'Jam + topping ATK SPD' }],
    notes: ['4× Wind beascuit']
  },
  {
    id: 'ferret',
    short: 'Ferret',
    names: ['Cream Ferret', 'Ferret'],
    portrait: '/img/guides/tla/ferret.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 58.9, unit: 'percent' },
      { statKey: 'atkSpd', label: 'ATK SPD', min: 6, max: 8, unit: 'percent' }
    ]
  },
  {
    id: 'marshmallow',
    short: 'Marshmallow',
    names: ['Marshmallow Bunny', 'Marshmallow'],
    portrait: '/img/guides/tla/marshmallow.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 50.4, max: 50.7, unit: 'percent' },
      { statKey: 'ampBuff', label: 'Amp Buff', min: 25, unit: 'percent' }
    ]
  }
]

const AOD: CookieBuildTarget[] = [
  {
    id: 'pudding',
    short: 'Pudding',
    names: ['Pudding à la Mode', 'Pudding a la Mode', 'Pudding'],
    portrait: '/img/guides/aod/pudding.png',
    requirements: [
      { statKey: 'atkSpd', label: 'ATK SPD', min: 79.5, unit: 'percent' },
      { statKey: 'crit', label: 'CRIT', min: 21.5, unit: 'percent' },
      { statKey: 'cooldown', label: 'Cooldown', min: 3.5, max: 4.2, unit: 'percent' },
      { statKey: 'ampBuff', label: 'Amp Buff', min: 15, unit: 'percent', hint: '8.5%+ on alt topping set' }
    ]
  },
  {
    id: 'creme',
    short: 'Crème',
    names: ['Crème Brûlée', 'Creme Brulee', 'Crème'],
    portrait: '/img/guides/aod/creme.png',
    requirements: [{ statKey: 'cooldown', label: 'Cooldown', min: 7.7, unit: 'percent' }]
  },
  {
    id: 'coral',
    short: 'Star Coral',
    names: ['Star Coral', 'Coral'],
    portrait: '/img/guides/aod/coral.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 49.2, max: 49.5, unit: 'percent' },
      { statKey: 'atkSpd', label: 'ATK SPD', min: 1.7, max: 3, unit: 'percent' },
      { statKey: 'debuffResist', label: 'Debuff Resist', min: 2.6, max: 4, unit: 'percent' }
    ]
  },
  {
    id: 'ferret',
    short: 'Ferret',
    names: ['Cream Ferret', 'Ferret'],
    portrait: '/img/guides/aod/ferret.png',
    requirements: [],
    notes: ['CD follows Mint breakpoint — see AoD guide table']
  },
  {
    id: 'mint',
    short: 'Mint',
    names: ['Mint Choco', 'Mint'],
    portrait: '/img/guides/aod/mint.png',
    requirements: [{ statKey: 'atkSpd', label: 'ATK SPD', min: 10.5, unit: 'percent', hint: 'Each 10.5%+ ≈ +1 Ferret breakpoint' }],
    notes: ['Full CD beascuit · pick highest CD you can hit']
  }
]

const RVD: CookieBuildTarget[] = [
  {
    id: 'pompom',
    short: 'Pompom',
    names: ['Pompom Dough', 'Pompom'],
    portrait: '/img/guides/rvd/pompom.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 9, unit: 'percent' },
      { statKey: 'crit', label: 'CRIT', min: 48, unit: 'percent' }
    ]
  },
  {
    id: 'linzer',
    short: 'Linzer',
    names: ['Linzer'],
    portrait: '/img/guides/rvd/linzer.png',
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 11.4, unit: 'percent' },
      { statKey: 'atkSpd', label: 'ATK SPD', min: 37, unit: 'percent' }
    ]
  }
]

const ALLIANCE: CookieBuildTarget[] = [
  {
    id: 'windArcher',
    short: 'Wind Archer',
    names: ['Wind Archer'],
    portrait: '/img/guides/tla/wind-archer.png',
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 70, unit: 'percent' },
      { statKey: 'dmgResist', label: 'DMG Resist', min: 22, unit: 'percent' },
      { statKey: 'cooldown', label: 'Cooldown', min: 20, unit: 'percent' }
    ],
    gearRows: [
      { label: 'Toppings', value: 'Searing Raspberry (+ Swift if needed)' },
      { label: 'Tart', value: 'Increased Team DMG' },
      { label: 'Beascuit', value: 'Grass DMG ~45–55% when Beacon is Grass' }
    ]
  },
  {
    id: 'adc',
    short: 'ADC',
    names: ['Awakened Dark Cacao', 'Dark Cacao'],
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 100, unit: 'percent' },
      { statKey: 'fireDmg', label: 'Fire DMG', min: 52, unit: 'percent', hint: 'Beascuit Options' }
    ],
    gearRows: [
      { label: 'Toppings', value: 'Searing Raspberry' },
      { label: 'Tart', value: 'Increased DMG to Enemies' },
      { label: 'Beascuit', value: 'Fire DMG ~55–60%' }
    ]
  },
  {
    id: 'linzer',
    short: 'Linzer',
    names: ['Linzer'],
    portrait: '/img/guides/rvd/linzer.png',
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 90, unit: 'percent' },
      { statKey: 'crit', label: 'CRIT', min: 12, unit: 'percent' },
      { statKey: 'cooldown', label: 'Cooldown', min: 12, unit: 'percent' }
    ],
    gearRows: [
      { label: 'Toppings', value: 'Raspberry + Apple Jelly' },
      { label: 'Tart', value: 'Increased DMG to Enemies' },
      { label: 'Beascuit', value: 'Fire DMG ~55–60%' }
    ]
  },
  {
    id: 'blackPearl',
    short: 'Black Pearl',
    names: ['Black Pearl'],
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 85, unit: 'percent' },
      { statKey: 'cooldown', label: 'Cooldown', min: 10, unit: 'percent' }
    ],
    notes: ['Elemental beascuit matches Beacon when possible']
  },
  {
    id: 'burningSpice',
    short: 'Burning Spice',
    names: ['Burning Spice'],
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 85, unit: 'percent' },
      { statKey: 'fireDmg', label: 'Fire DMG', min: 50, unit: 'percent' }
    ]
  }
]

const ARENA: CookieBuildTarget[] = [
  {
    id: 'windArcher',
    short: 'Wind Archer',
    names: ['Wind Archer'],
    portrait: '/img/guides/tla/wind-archer.png',
    requirements: [
      { statKey: 'crit', label: 'CRIT', min: 65, unit: 'percent' },
      { statKey: 'dmgResist', label: 'DMG Resist', min: 24, unit: 'percent' },
      { statKey: 'dmgResistBypass', label: 'DMG Resist Bypass', min: 48, unit: 'percent' }
    ],
    gearRows: [
      { label: 'Toppings', value: 'Raspberry + Apple Jelly' },
      { label: 'Beascuit', value: 'CRIT / bypass substats' }
    ]
  },
  {
    id: 'adc',
    short: 'ADC',
    names: ['Awakened Dark Cacao', 'Dark Cacao'],
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 28, unit: 'percent' },
      { statKey: 'dmgResist', label: 'DMG Resist', min: 24, unit: 'percent' },
      { statKey: 'atk', label: 'ATK', min: 100, unit: 'percent' }
    ],
    gearRows: [
      { label: 'Toppings', value: '5 Swift or 4 Swift + 1 Almond' },
      { label: 'Tart', value: 'Healing or DMG Resist' }
    ]
  },
  {
    id: 'blackPearl',
    short: 'Black Pearl',
    names: ['Black Pearl'],
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 80, unit: 'percent' },
      { statKey: 'crit', label: 'CRIT', min: 20, unit: 'percent' }
    ]
  },
  {
    id: 'mysticFlour',
    short: 'Mystic Flour',
    names: ['Mystic Flour'],
    requirements: [
      { statKey: 'cooldown', label: 'Cooldown', min: 25, unit: 'percent' },
      { statKey: 'dmgResist', label: 'DMG Resist', min: 22, unit: 'percent' }
    ]
  },
  {
    id: 'linzer',
    short: 'Linzer',
    names: ['Linzer'],
    portrait: '/img/guides/rvd/linzer.png',
    requirements: [
      { statKey: 'atk', label: 'ATK', min: 88, unit: 'percent' },
      { statKey: 'crit', label: 'CRIT', min: 12, unit: 'percent' }
    ]
  }
]

const BY_MODE: Record<GearCheckMode, CookieBuildTarget[]> = {
  mgev: MGEV,
  tla: TLA,
  aod: AOD,
  rvd: RVD,
  alliance: ALLIANCE,
  arena: ARENA
}

export function getCookieBuildTargets(mode: GearCheckMode): CookieBuildTarget[] {
  return BY_MODE[mode] ?? []
}

export function getCookieBuildTarget(mode: GearCheckMode, buildId: string): CookieBuildTarget | null {
  return getCookieBuildTargets(mode).find(c => c.id === buildId) ?? null
}

export function isGearCheckMode(value: string): value is GearCheckMode {
  return value in BY_MODE
}
