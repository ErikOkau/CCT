export type FerretOption = {
  cast: string
  cd: string
}

export type MintBreakpoint = {
  mintCd: string
  ferret: FerretOption[]
}

export const mintBreakpoints: MintBreakpoint[] = [
  {
    mintCd: '59.77–60.00%',
    ferret: [
      { cast: '51.563s', cd: '35.42–35.76%' },
      { cast: '51.625s', cd: '35.76–36.11%' },
      { cast: '51.688s', cd: '36.11–36.46%' }
    ]
  },
  {
    mintCd: '59.38–59.77%',
    ferret: [
      { cast: '51.750s', cd: '36.46–36.81%' },
      { cast: '51.813s', cd: '36.81–37.15%' },
      { cast: '51.875s', cd: '37.15–37.50%' }
    ]
  },
  {
    mintCd: '58.98–59.38%',
    ferret: [
      { cast: '51.938s', cd: '37.50–37.85%' },
      { cast: '52.000s', cd: '37.85–38.19%' },
      { cast: '52.063s', cd: '38.19–38.54%' }
    ]
  },
  {
    mintCd: '58.59–58.98%',
    ferret: [
      { cast: '52.125s', cd: '38.54–38.89%' },
      { cast: '52.188s', cd: '38.89–39.24%' },
      { cast: '52.250s', cd: '39.24–39.58%' }
    ]
  },
  {
    mintCd: '58.20–58.59%',
    ferret: [
      { cast: '52.313s', cd: '39.58–39.93%' },
      { cast: '52.375s', cd: '39.93–40.28%' },
      { cast: '52.438s', cd: '40.28–40.63%' }
    ]
  },
  {
    mintCd: '57.81–58.20%',
    ferret: [
      { cast: '52.500s', cd: '40.63–40.97%' },
      { cast: '52.563s', cd: '40.97–41.32%' },
      { cast: '52.625s', cd: '41.32–41.67%' }
    ]
  },
  {
    mintCd: '57.42–57.81%',
    ferret: [
      { cast: '52.688s', cd: '41.67–42.01%' },
      { cast: '52.750s', cd: '42.01–42.36%' },
      { cast: '52.813s', cd: '42.36–42.71%' }
    ]
  },
  {
    mintCd: '57.03–57.42%',
    ferret: [
      { cast: '52.875s', cd: '42.71–43.06%' },
      { cast: '52.938s', cd: '43.06–43.40%' },
      { cast: '53.000s', cd: '43.40–43.75%' }
    ]
  }
]

export const cremeToppingSets = [
  { id: '4rasp', label: '4 Raspberry + 2 Caramel', spd: '74.2%' },
  { id: '3rasp', label: '3 Raspberry + 3 Caramel', spd: '75.3%' }
] as const

export const aodCookies = [
  {
    id: 'pudding',
    name: 'Pudding à la Mode',
    short: 'Pudding',
    role: 'ATK SPD DPS',
    image: '/img/guides/aod/pudding.png',
    toppings: 'Prefer 2 Amplify Buff. If you cannot, prioritize ATK SPD + CRIT + CD.',
    tart: 'DMG vs all enemies',
    beascuit: '4× ATK SPD%',
    stats: 'ATK SPD 79.5% min · CRIT 21.5% is enough · CD 3%+'
  },
  {
    id: 'mint',
    name: 'Mint Choco',
    short: 'Mint',
    role: 'ATK SPD support',
    image: '/img/guides/aod/mint.png',
    toppings: 'Aim for the highest CD breakpoint you can hit.',
    tart: 'DMG vs all enemies',
    beascuit: 'Full cooldown%',
    stats: '10.5%+ ATK SPD counts as 1 breakpoint up the table.'
  },
  {
    id: 'creme',
    name: 'Crème Brûlée',
    short: 'Crème',
    role: 'Main DPS',
    image: '/img/guides/aod/creme.png',
    toppings: '',
    tart: 'DMG vs all enemies',
    beascuit: '4× ATK SPD%',
    stats: 'CD 7.7%+'
  },
  {
    id: 'ferret',
    name: 'Cream Ferret',
    short: 'Ferret',
    role: 'Heal / support',
    image: '/img/guides/aod/ferret.png',
    toppings: '0 ATK SPD rolls. Maximize ATK / CRIT%.',
    tart: 'Increased team DMG',
    beascuit: 'Full cooldown%',
    stats: 'CD follows Mint’s breakpoint.'
  },
  {
    id: 'coral',
    name: 'Star Coral',
    short: 'Star Coral',
    role: 'Support',
    image: '/img/guides/aod/coral.png',
    toppings: '—',
    tart: 'DMG vs all enemies',
    beascuit: 'Full cooldown%',
    stats: 'CD 49.2–49.5% · ATK SPD 1.7–3% · Debuff Resist 2.6–4%'
  }
] as const
