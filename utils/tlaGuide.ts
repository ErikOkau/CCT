export const tlaCookies = [
  { id: 'bbp', name: 'Blueberry Pie Cookie', short: 'Blueberry Pie', image: '/img/guides/tla/blueberry-pie.png' },
  { id: 'cpuff', name: 'Cream Puff Cookie', short: 'Cream Puff', image: '/img/guides/tla/cream-puff.png' },
  { id: 'warcher', name: 'Wind Archer Cookie', short: 'Wind Archer', image: '/img/guides/tla/wind-archer.png' },
  { id: 'ferret', name: 'Cream Ferret Cookie', short: 'Ferret', image: '/img/guides/tla/ferret.png' },
  { id: 'marshmallow', name: 'Marshmallow Bunny Cookie', short: 'Marshmallow', image: '/img/guides/tla/marshmallow.png' }
] as const

export const WA_PASSIVE_HP = 0.3
/** Minimum combined Jam + topping ATK SPD (Total gear check / guide calculator). */
export const WA_ATK_SPD_REQ = 48.4

/** Wind Archer Crystal Jam ATK SPD % at max jam (add topping ATK SPD from Total for full total). */
export const WA_JAM_ATK_SPD_MAX = 22.3

/** Topping ATK SPD on Gear → Total when jam is max — reaches {@link WA_ATK_SPD_REQ} combined. */
export const WA_TOPPING_ATK_SPD_MIN_MAX_JAM = 26.1

/**
 * Wind Archer Crystal Jam → ATK SPD % by jam upgrade level (guide calculator).
 * Extend when you confirm more chart rows.
 */
export const WA_JAM_ATK_SPD_BY_LEVEL: Record<number, number> = {
  30: 19.4,
  // max jam uses WA_JAM_ATK_SPD_MAX (22.3) → 26.1% toppings
}

export function windArcherJamAspdAtLevel(level: number): number {
  return WA_JAM_ATK_SPD_BY_LEVEL[level] ?? WA_JAM_ATK_SPD_MAX
}

/** Topping ATK SPD floor on Gear → Total (defaults to max jam / 26.1%). */
export function windArcherToppingAspdMinForGearCheck(jamLevel?: number): number {
  if (jamLevel == null) {
    return WA_TOPPING_ATK_SPD_MIN_MAX_JAM
  }
  const jam = windArcherJamAspdAtLevel(jamLevel)
  return Math.round((WA_ATK_SPD_REQ - jam) * 10) / 10
}

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
