import type { ComparisonRow, CookieBuildTarget, GearVisionResult, ScannedStat, StatRequirement } from './types'
import { formatStatValue } from './statNormalize'
import { fallbackBoxForStat } from './templateBoxes'

const CLOSE_PERCENT = 0.92

function targetLabel(req: StatRequirement): string {
  if (req.min != null && req.max != null) return `${req.min}–${req.max}%`
  if (req.min != null) return `${req.min}%+`
  if (req.max != null) return `≤${req.max}%`
  return 'See guide'
}

function findScanned(stats: ScannedStat[], key: StatRequirement['statKey']): ScannedStat | undefined {
  return stats.find(s => s.statKey === key)
}

function compareOne(req: StatRequirement, scanned: ScannedStat | undefined): ComparisonRow {
  const value = scanned?.value ?? null
  const scannedLabel = formatStatValue(value, req.unit)
  const target = targetLabel(req)

  if (value === null) {
    return {
      statKey: req.statKey,
      label: req.label,
      scanned: null,
      scannedLabel,
      targetLabel: target,
      status: 'missing',
      gap: null,
      box: scanned?.box,
      hint: req.hint
    }
  }

  let status: ComparisonRow['status'] = 'met'
  let gap: number | null = null

  if (req.min != null && req.max != null) {
    if (value >= req.min && value <= req.max) status = 'met'
    else if (value < req.min) {
      gap = value - req.min
      status = value >= req.min * CLOSE_PERCENT ? 'close' : 'low'
    } else {
      gap = value - req.max
      status = 'high'
    }
  } else if (req.min != null) {
    gap = value - req.min
    if (value >= req.min) status = 'met'
    else if (value >= req.min * CLOSE_PERCENT) status = 'close'
    else status = 'low'
  } else if (req.max != null) {
    gap = value - req.max
    if (value <= req.max) status = 'met'
    else status = 'high'
  } else {
    status = 'info'
  }

  return {
    statKey: req.statKey,
    label: req.label,
    scanned: value,
    scannedLabel,
    targetLabel: target,
    status,
    gap,
    box: scanned?.box ?? fallbackBoxForStat(req.statKey),
    hint: req.hint
  }
}

export function compareGearToBuild(
  vision: GearVisionResult,
  build: CookieBuildTarget | null
): ComparisonRow[] {
  if (!build) {
    return vision.stats.map(s => ({
      statKey: s.statKey,
      label: s.label,
      scanned: s.value,
      scannedLabel: formatStatValue(s.value, s.unit),
      targetLabel: 'Pick cookie',
      status: 'info',
      gap: null,
      box: s.box
    }))
  }

  const rows = build.requirements.map(req => compareOne(req, findScanned(vision.stats, req.statKey)))

  if (vision.elementalValue != null && vision.elementalType) {
    const key =
      vision.elementalType.toLowerCase().includes('water')
        ? 'waterDmg'
        : vision.elementalType.toLowerCase().includes('wind')
          ? 'windDmg'
          : 'elementalDmg'
    const already = rows.some(r => r.statKey === key)
    if (!already) {
      rows.push(
        compareOne(
          {
            statKey: key as StatRequirement['statKey'],
            label: `${vision.elementalType} DMG`,
            min: 15,
            unit: 'percent',
            hint: 'Beascuit elemental lines'
          },
          {
            statKey: key as ScannedStat['statKey'],
            label: `${vision.elementalType} DMG`,
            value: vision.elementalValue,
            unit: 'percent',
            box: null
          }
        )
      )
    }
  }

  return rows
}

export function statusColor(status: ComparisonRow['status']): string {
  switch (status) {
    case 'met':
      return '#22c55e'
    case 'close':
      return '#eab308'
    case 'low':
    case 'high':
    case 'missing':
      return '#ef4444'
    default:
      return '#94a3b8'
  }
}
