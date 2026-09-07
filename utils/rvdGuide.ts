export const pompomSets = [
  {
    id: '3-3',
    label: '3 Raspberry + 2 Apple Jelly · Apple Jelly tart',
    cd: '9%+',
    crit: '48%+',
    atk: '76%+ ATK'
  },
  {
    id: '4-2',
    label: '4 Apple Jelly + 1 Raspberry · Raspberry tart',
    cd: '9.2%+',
    crit: '54.0% (max CRIT)',
    atk: 'Max ATK'
  }
] as const

export const linzerSets = [
  {
    id: 'high',
    label: 'High skill level',
    cd: '11.4%',
    dr: '75% DR',
    aspd: '37.x%+ ATK SPD (as high as possible)'
  },
  {
    id: 'low',
    label: 'Low skill level',
    cd: '11.9%',
    dr: '~65% DR (up to 74.1% if max skill lvl)',
    aspd: '40%+ ATK SPD (as high as possible)'
  }
] as const

export const rvdCookies = [
  {
    id: 'pompom',
    name: 'Pompom Dough Cookie',
    short: 'Pompom',
    image: '/img/guides/rvd/pompom.png'
  },
  {
    id: 'eternal',
    name: 'Eternal Sugar Cookie',
    short: 'Eternal Sugar',
    image: '/img/guides/rvd/eternal-sugar.png'
  },
  {
    id: 'prune',
    name: 'Prune Juice Cookie',
    short: 'Prune',
    image: '/img/guides/rvd/prune.png'
  },
  {
    id: 'bsaph',
    name: 'Black Sapphire Cookie',
    short: 'Black Sapphire',
    image: '/img/guides/rvd/black-sapphire.png'
  },
  {
    id: 'linzer',
    name: 'Linzer Cookie',
    short: 'Linzer',
    image: '/img/guides/rvd/linzer.png'
  }
] as const
