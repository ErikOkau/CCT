export const tlaCookies = [
  { id: 'bbp', name: 'Blueberry Pie Cookie', short: 'Blueberry Pie', image: '/img/guides/tla/blueberry-pie.png' },
  { id: 'cpuff', name: 'Cream Puff Cookie', short: 'Cream Puff', image: '/img/guides/tla/cream-puff.png' },
  { id: 'warcher', name: 'Wind Archer Cookie', short: 'Wind Archer', image: '/img/guides/tla/wind-archer.png' },
  { id: 'ferret', name: 'Cream Ferret Cookie', short: 'Ferret', image: '/img/guides/tla/ferret.png' },
  { id: 'marshmallow', name: 'Marshmallow Bunny Cookie', short: 'Marshmallow', image: '/img/guides/tla/marshmallow.png' }
] as const

export const WA_PASSIVE_HP = 0.3
export const WA_ATK_SPD_REQ = 48.4

export function creamPuffHpRequired(windArcherHp: number, grimoireHpPercent: number) {
  const grimoire = grimoireHpPercent / 100
  return ((1 + WA_PASSIVE_HP + grimoire) / (1 + grimoire)) * windArcherHp
}

export function windArcherTotalAspd(jamPercent: number, toppingPercent: number) {
  return jamPercent + toppingPercent
}

export function formatHp(value: number) {
  return Math.round(value).toLocaleString('en-US')
}
