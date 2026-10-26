import { getCookieBuildTargets, type GearCheckMode } from './buildTargets'

export function buildGearValidatePrompt(): string {
  return `Look at this Cookie Run: Kingdom screenshot. Return JSON only:
{
  "isGearScreen": true/false,
  "statsTab": "Total|Details|Other",
  "cookieName": "selected cookie or empty",
  "warnings": []
}
Rules: Gear screen has Toppings & Beascuits, left cookie list with gold frame + checkmark. Prefer Total tab.`
}

export function buildGearVisionPrompt(mode: GearCheckMode): string {
  const roster = getCookieBuildTargets(mode)
    .map(c => `- ${c.names[0]} (${c.short})`)
    .join('\n')

  const contextLabel = `${mode.toUpperCase()} guild battle`

  return `You are reading a Cookie Run: Kingdom screenshot of the **Gear** window (Toppings & Beascuits).

Layout rules:
- LEFT sidebar: cookie portraits. The **selected** cookie has a **gold/yellow frame** and **green checkmark**.
- RIGHT panel: stat rows (Total tab preferred). Labels like Cooldown, ATK SPD, CRIT, ATK, HP, etc.
- Tart effect line and Beascuit elemental bonuses may appear above or within the stats.

Mode context: **${contextLabel}**. Known cookies:
${roster}

Return **only** JSON:
{
  "cookieName": "exact selected cookie name",
  "gameMode": "Guild Battle or other if visible",
  "statsTab": "Total or Details",
  "tartEffect": "tart name or null",
  "tartValue": number or null,
  "elementalType": "Water|Wind|Electricity|... or null",
  "elementalValue": number or null,
  "stats": [
    {
      "label": "Cooldown",
      "value": 24.5,
      "unit": "percent",
      "box": { "x": 0.55, "y": 0.42, "w": 0.18, "h": 0.028 }
    }
  ],
  "warnings": []
}

Rules:
- Read numbers exactly as shown (percent values without the % sign in \`value\`).
- For each stat row, include \`box\`: normalized 0–1 coordinates of the **value text** (not the label), relative to the full screenshot.
- If a stat is not visible, omit it (do not guess).
- Include Cooldown, ATK SPD, CRIT, ATK, HP when visible on Total tab.
- Map Water/Wind/Electricity elemental DMG lines to label "Water DMG" etc.
- \`warnings\`: note blur, wrong tab, or cookie not in roster.`
}
