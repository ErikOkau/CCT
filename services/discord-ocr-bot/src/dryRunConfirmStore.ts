import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface DryRunApproval {
  approvedAt: string
  playerCount: number
  imageCount: number
  userId: string
}

type Store = Record<string, DryRunApproval>

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
const DATA_FILE = join(DATA_DIR, 'dry-run-approvals.json')

function loadStore(): Store {
  try {
    if (!existsSync(DATA_FILE)) return {}
    return JSON.parse(readFileSync(DATA_FILE, 'utf8')) as Store
  } catch {
    return {}
  }
}

function saveStore(store: Store): void {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8')
}

export function approvalKey(guildId: string, seasonId: string): string {
  return `${guildId}:${seasonId}`
}

export function isRequireDryRunFirstEnabled(): boolean {
  const v = process.env.REQUIRE_DRY_RUN_FIRST?.trim().toLowerCase()
  if (!v) return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false
  return true
}

export function markDryRunApproved(
  guildId: string,
  seasonId: string,
  meta: { playerCount: number; imageCount: number; userId: string }
): void {
  const store = loadStore()
  store[approvalKey(guildId, seasonId)] = {
    approvedAt: new Date().toISOString(),
    playerCount: meta.playerCount,
    imageCount: meta.imageCount,
    userId: meta.userId
  }
  saveStore(store)
}

export function getDryRunApproval(
  guildId: string,
  seasonId: string
): DryRunApproval | null {
  const store = loadStore()
  return store[approvalKey(guildId, seasonId)] ?? null
}

export function hasDryRunApproval(guildId: string, seasonId: string): boolean {
  return getDryRunApproval(guildId, seasonId) != null
}

export function listDryRunApprovalsForGuild(guildId: string): { seasonId: string; approval: DryRunApproval }[] {
  const store = loadStore()
  const prefix = `${guildId}:`
  return Object.entries(store)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, approval]) => ({ seasonId: k.slice(prefix.length), approval }))
    .sort((a, b) => b.approval.approvedAt.localeCompare(a.approval.approvedAt))
}
