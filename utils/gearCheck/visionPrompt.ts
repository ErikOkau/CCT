import type { GuideSlug } from '~/utils/guildGuides'
import { getCookieBuildTargets } from './buildTargets'

export function buildGearVisionPrompt(bossSlug: GuideSlug): string {
  const roster = getCookieBuildTargets(bossSlug)
    .map(c => `- ${c.names[0]} (${c.short})`)
    .join('\n')

  return `You are reading a Cookie Run: Kingdom screenshot of the **Gear** window (Toppings & Beascuits).

Layout rules:
- LEFT sidebar: cookie portraits. The **selected** cookie has a **gold/yellow frame** and **green checkmark**.
- RIGHT panel: stat rows (Total tab preferred). Labels like Cooldown, ATK SPD, CRIT, ATK, HP, etc.
- Tart effect line and Beascuit elemental bonuses may appear above or within the stats.

Boss context: **${bossSlug.toUpperCase()}** guild battle team. Known cookies:
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
