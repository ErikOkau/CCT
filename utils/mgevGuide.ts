export const mgevCookies = [
  { id: 'frilled', name: 'Frilled Jellyfish Cookie', short: 'Frilled', image: '/img/guides/mgev/frilled.png' },
  { id: 'seaFairy', name: 'Sea Fairy Cookie', short: 'Sea Fairy', image: '/img/guides/mgev/sea-fairy.png' },
  { id: 'seltzer', name: 'Seltzer Cookie', short: 'Seltzer', image: '/img/guides/mgev/seltzer.png' },
  { id: 'menthol', name: 'Menthol Cookie', short: 'Menthol', image: '/img/guides/mgev/menthol.png' },
  { id: 'ferret', name: 'Cream Ferret Cookie', short: 'Ferret', image: '/img/guides/mgev/ferret.png' }
] as const

export const frilledSets = [
  {
    id: 'cd-water',
    label: '5 CD · CD tart · 4 Water',
    toppings: '5 CD toppings · CD tart · DMG UP to monsters',
    beascuit: '4× Water DMG (4× CD works fine)'
  },
  {
    id: 'atk-cd',
    label: '4 ATK + 1 CD · ATK tart · 4 CD',
    toppings: '4 ATK + 1 CD toppings · ATK tart · DMG UP to monsters',
    beascuit: '4× Cooldown%'
  }
] as const

export const mentholSets = [
  {
    id: 'auto',
    label: '18.8%+ CD (auto)',
    cd: '18.8%+',
    cast: 'Let Menthol auto. 18.9%+ auto costs nothing.'
  },
  {
    id: 'manual',
    label: '19.2%+ CD (manual)',
    cd: '19.2%+',
    cast: 'Cast Menthol at 58.313–58.250.'
  }
] as const

export const ferretSets = [
  {
    id: '3s',
    label: '35.2%+ CD (3s start)',
    toppings: '5 ATK toppings · CD tart · TEAM DMG UP',
    beascuit: '4× Cooldown%',
    cd: '35.2%+'
  },
  {
    id: 'rasp',
    label: 'Full Raspberry 17.8–18% CD',
    toppings: 'Full Raspberry · CD tart · TEAM DMG UP',
    beascuit: '2 ATK + 2 CD',
    cd: '17.8–18%'
  }
] as const
