import { PermissionFlagsBits, type GuildMember, type Message } from 'discord.js'

/** Match env or these CCT defaults (emoji in Discord role names ignored). */
export const DEFAULT_GUILD_ROLE_MATCHERS = [
  'cct guild officer',
  'cct guild leader',
  'website manager'
] as const

function parseRoleIds(): string[] {
  return (process.env.DISCORD_ALLOWED_ROLE_IDS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function parseRoleNamesFromEnv(): string[] {
  return (process.env.DISCORD_ALLOWED_ROLE_NAMES ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

export function normalizeRoleName(name: string): string {
  return name
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function effectiveRoleMatchers(): string[] {
  const fromEnv = parseRoleNamesFromEnv()
  if (fromEnv.length > 0) {
    return fromEnv.map(n => normalizeRoleName(n))
  }
  return [...DEFAULT_GUILD_ROLE_MATCHERS]
}

export function roleGateConfigured(): boolean {
  return true
}

export function roleGateDescription(): string {
  const ids = parseRoleIds()
  const matchers = effectiveRoleMatchers()
  const parts = [
    'Server owner',
    'Administrator',
    ...matchers.map(m => m.replace(/\b\w/g, c => c.toUpperCase()))
  ]
  if (ids.length) parts.push(`${ids.length} extra role id(s) from env`)
  return parts.join(' · ')
}

function memberHasAllowedRole(member: GuildMember, matchers: string[]): boolean {
  return member.roles.cache.some(r => {
    const norm = normalizeRoleName(r.name)
    return matchers.some(m => norm.includes(m) || m.includes(norm))
  })
}

export async function memberCanRunImport(message: Message): Promise<{ ok: boolean; reason?: string }> {
  if (!message.guild) {
    return { ok: false, reason: 'Import commands only work in a server channel.' }
  }

  if (message.guild.ownerId === message.author.id) {
    return { ok: true }
  }

  let member = message.member
  if (!member) {
    try {
      member = await message.guild.members.fetch(message.author.id)
    } catch {
      return { ok: false, reason: 'Could not verify your roles.' }
    }
  }

  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return { ok: true }
  }

  const roleIds = parseRoleIds()
  if (roleIds.some(id => member.roles.cache.has(id))) {
    return { ok: true }
  }

  const matchers = effectiveRoleMatchers()
  if (memberHasAllowedRole(member, matchers)) {
    return { ok: true }
  }

  return {
    ok: false,
    reason:
      'Need **CCT Guild Officer**, **CCT Guild Leader**, **Website Manager**, **server owner**, or **Administrator**.'
  }
}
