export type AllianceCookieBuild = {
  id: string
  name: string
  short: string
  portrait?: string
  role: string
  toppings: string
  tart: string
  beascuit: string
  stats: string
  notes?: string[]
}

/** CCT Master autoplay — mirror the same tuning on all three teams unless Beacon element differs. */
export const allianceTeamsNote =
  'Run **Autoplay only** on Master. Guild score uses each member’s **top 25** run scores — consistency beats manual retries.'

export const allianceBeaconNote =
  'Check **Beacon of Valor** each season for the featured element. Match **elemental DMG** on DPS beascuits (Grass / Fire / etc.) when the beacon asks for it.'

export const allianceTreasures =
  'Typical CCT loadout: **Old Pilgrim’s Scroll**, **Dream Conductor’s Whistle**, and a third DPS or CD treasure (e.g. **Sleepy Watch**) at **+12** or higher.'

export const alliancePrimaryTeam: AllianceCookieBuild[] = [
  {
    id: 'windArcher',
    name: 'Wind Archer Cookie',
    short: 'Wind Archer',
    portrait: '/img/guides/tla/wind-archer.png',
    role: 'Ranged DPS · often Beacon Grass',
    toppings: 'Mostly **Searing Raspberry** (ATK). Add **Swift Chocolate** only if you need more Cooldown without sacrificing too much ATK.',
    tart: '**Increased Team DMG** (~5% tart line on Total screen).',
    beascuit: '**Legendary Attacker** with **Grass DMG** in the high **45–55%** range when Grass is featured.',
    stats: 'Rough Total gear: **~70–85% ATK**, **~22–28% DMG Resist**, **~20–25% Cooldown**. HP ~35% from sets is normal.',
    notes: ['If Beacon is not Grass, swap the elemental line on beascuit to match the season element.']
  },
  {
    id: 'adc',
    name: 'Awakened Dark Cacao Cookie',
    short: 'ADC',
    role: 'Front / skill DPS · Fire beascuit',
    toppings: '**Searing Raspberry** focus. Mix in Swift Chocolate if Cooldown is short after substats.',
    tart: '**Increased DMG to Enemies** (~7% tart).',
    beascuit: '**Fire DMG ~55–60%** on Attacker beascuit (both slots filled when possible).',
    stats: 'Rough Total: **~100–115% ATK**, **~30–40% HP**. Cooldown often **~8–12%**; CRIT optional **~10–15%** if substats allow.',
    notes: ['Fire % is the Beascuit Options line — aim high even if Total CRIT stays low.']
  },
  {
    id: 'blackPearl',
    name: 'Black Pearl Cookie',
    short: 'Black Pearl',
    role: 'Burst DPS',
    toppings: '**Searing Raspberry** or mixed ATK sets; avoid over-stacking Cooldown unless the comp stalls.',
    tart: '**Increased DMG to Enemies** or **Team DMG** — match whatever your guild standard is for this slot.',
    beascuit: 'Attacker beascuit with **element matching Beacon** (often **Fire** or **Dark** depending on week).',
    stats: 'Rough Total: **high ATK**, **moderate CRIT substats**, **~10–20% Cooldown**. DMG Resist **~20–25%** if you can fit Almond substats.',
    notes: ['Black Pearl is sensitive to dead casts on auto — prioritize ATK/CRIT over extra Cooldown once skills flow.']
  },
  {
    id: 'linzer',
    name: 'Linzer Cookie',
    short: 'Linzer',
    portrait: '/img/guides/rvd/linzer.png',
    role: 'Ranged DPS · Fire',
    toppings: '**Searing Raspberry** + **Apple Jelly** (CRIT) mix. Resonant toppings are fine if substats are ATK/CRIT/CD.',
    tart: '**Increased DMG to Enemies** (~7%).',
    beascuit: '**Fire DMG ~55–60%** (Beascuit Options line).',
    stats: 'Rough Total: **~95–105% ATK**, **~12–16% CRIT**, **~12–16% Cooldown**, **~35% HP**.',
    notes: ['Linzer wants enough CRIT substats to stabilize auto damage without starving ATK.']
  },
  {
    id: 'burningSpice',
    name: 'Burning Spice Cookie',
    short: 'Burning Spice',
    role: 'Beast burst · Fire',
    toppings: '**Searing Raspberry**; add Jelly pieces for CRIT if skill crits matter for your copy.',
    tart: '**Increased DMG to Enemies** or **Team DMG**.',
    beascuit: '**Fire DMG** priority on Attacker slots.',
    stats: 'Rough Total: **high ATK**, **CRIT substats** where possible, **~15–25% Cooldown**. DMG Resist **~20%+** if running Almond pieces.',
    notes: ['Swap to **Mystic Flour** or **Capsaicin** if your roster prefers Beast slot flexibility — keep the same tart/element rules.']
  }
]

export const allianceTeamVariants = [
  { label: 'Team 2 — same cookies', detail: 'Clone Team 1 gear. Only change elemental beascuits if you maintain alt sets for different Beacons.' },
  { label: 'Team 3 — same cookies', detail: 'Clone again for Master. Tickets: use daily alliance attempts; no manual skill timing needed.' }
]

export const allianceSubstatPriority =
  'Substat priority (autoplay): **ATK → CRIT → Cooldown** on DPS. Sprinkle **DMG Resist** (~**25%** total across the team via Almond substats) on slots that naturally roll DR without breaking breakpoints.'
