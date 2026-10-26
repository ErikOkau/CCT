import { playerNamesSimilar } from '~/utils/guildBattlePlayerMerge'
import type { CookieBuildTarget } from './types'

export function normalizeCookieName(name: string): string {
  return name.normalize('NFKC').replace(/\s*cookie\s*$/i, '').trim()
}

export function matchCookieBuild(
  cookieName: string,
  targets: CookieBuildTarget[],
  overrideBuildId?: string | null
): CookieBuildTarget | null {
  if (overrideBuildId) {
    return targets.find(t => t.id === overrideBuildId) ?? null
  }
  const raw = normalizeCookieName(cookieName)
  if (!raw) return null

  for (const target of targets) {
    for (const alias of target.names) {
      if (playerNamesSimilar(raw, alias)) return target
    }
  }

  const lower = raw.toLowerCase()
  return (
    targets.find(t =>
      t.names.some(alias => lower.includes(alias.toLowerCase()) || alias.toLowerCase().includes(lower))
    ) ?? null
  )
}
