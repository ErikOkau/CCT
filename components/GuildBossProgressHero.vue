<script setup lang="ts">
import type { GuildBossProgress } from '~/utils/guildBossProgressSheet'
import {
  estimateRoundTrophyGain,
  formatGuildBossDamage,
  GUILD_TROPHY_ESTIMATE_DISCLAIMER
} from '~/utils/guildBossTrophies'

const props = defineProps<{
  progress: GuildBossProgress | null
}>()

const seasonLabel = computed(() => {
  if (!props.progress?.flight || !props.progress?.season) return null
  return `Destiny's Flight ${props.progress.flight}-${props.progress.season}`
})

const trophyDelta = computed(() => {
  if (!props.progress) return null
  if (props.progress.roundTrophyBaseline != null && props.progress.guildTrophies != null) {
    return props.progress.guildTrophies - props.progress.roundTrophyBaseline
  }
  const est = estimateRoundTrophyGain(
    props.progress.bosses.map(b => ({
      bossKey: b.bossKey,
      level: b.level,
      roundStartLevel: b.roundStartLevel
    }))
  )
  return est > 0 ? est : null
})

const activeBosses = computed(() =>
  props.progress?.bosses.filter(b => b.status === 'active') ?? []
)

const nextBoss = computed(() => props.progress?.bosses.find(b => b.status === 'next') ?? null)
</script>

<template>
  <div v-if="progress" class="boss-progress-hero" aria-hidden="true">
    <div class="boss-progress-inner">
      <div v-if="seasonLabel" class="season-pill">
        {{ seasonLabel }}
        <span v-if="progress.round"> · Round {{ progress.round }}</span>
      </div>

      <div class="boss-cards">
        <article
          v-for="boss in activeBosses"
          :key="boss.bossKey"
          class="boss-card active"
        >
          <div class="level-tag">Lv. {{ boss.level ?? '—' }}</div>
          <img class="boss-thumb" :src="boss.image" :alt="boss.name">
          <h3>{{ boss.name }}</h3>
          <div class="hp-bar">
            <div
              class="hp-fill"
              :style="{ width: `${Math.min(100, Math.max(0, boss.hpPercent ?? 0))}%` }"
            />
            <span class="hp-text">
              {{ formatGuildBossDamage(boss.totalDamage) }}
              <template v-if="boss.hpPercent != null"> ({{ boss.hpPercent }}%)</template>
            </span>
          </div>
          <p class="dmg-label">
            Total DMG
            <span v-if="boss.sheetDamage != null" class="dmg-src">(guild sheet)</span>
          </p>
          <p v-if="boss.hubDamage != null" class="hub-dmg">
            In-game hub: {{ formatGuildBossDamage(boss.hubDamage) }}
          </p>
        </article>

        <article v-if="nextBoss" class="boss-card next">
          <p class="next-label">Next season</p>
          <h3>{{ nextBoss.name }}</h3>
          <p class="muted">Approaching…</p>
        </article>
      </div>

      <div v-if="progress.guildTrophies != null || progress.guildRank != null" class="trophy-row">
        <span v-if="progress.guildTrophies != null">
          Guild Trophies: {{ progress.guildTrophies.toLocaleString('en-US') }}
        </span>
        <span v-if="progress.guildRank != null">Rank #{{ progress.guildRank }}</span>
        <span v-if="trophyDelta != null" class="trophy-est">
          +{{ trophyDelta.toLocaleString('en-US') }} this round
          <span v-if="progress.roundTrophyBaseline == null" class="est-tag">est.</span>
        </span>
      </div>
      <p v-if="trophyDelta != null && progress.roundTrophyBaseline == null" class="disclaimer">
        {{ GUILD_TROPHY_ESTIMATE_DISCLAIMER }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.boss-progress-hero {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.92;
}

.boss-progress-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 1.5rem 2rem;
  gap: 1rem;
  background:
    radial-gradient(circle at 70% 40%, rgba(88, 28, 135, 0.55), transparent 55%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 60, 114, 0.85));
}

.season-pill {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  align-self: flex-end;
}

.boss-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 520px;
}

.boss-card {
  width: 220px;
  padding: 0.75rem 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
  position: relative;
}

.boss-card.active {
  box-shadow: 0 0 24px rgba(168, 85, 247, 0.35);
}

.level-tag {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc2626;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.boss-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
  margin: 0.5rem auto;
  display: block;
}

.boss-card h3 {
  font-size: 0.78rem;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.hp-bar {
  position: relative;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.hp-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  transition: width 0.4s ease;
}

.hp-text {
  position: relative;
  z-index: 1;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 22px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.dmg-label {
  font-size: 0.65rem;
  margin: 0;
  color: #fbbf24;
  font-weight: 600;
}

.dmg-src {
  font-weight: 500;
  opacity: 0.85;
}

.hub-dmg {
  font-size: 0.58rem;
  margin: 0.2rem 0 0;
  color: rgba(255, 255, 255, 0.55);
}

.boss-card.next {
  opacity: 0.65;
  border-style: dashed;
}

.next-label {
  font-size: 0.7rem;
  margin: 0;
  color: #fca5a5;
}

.muted {
  font-size: 0.72rem;
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.65);
}

.trophy-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  justify-content: flex-end;
}

.trophy-est {
  color: #fde047;
}

.est-tag {
  font-size: 0.65rem;
  opacity: 0.85;
  margin-left: 0.25rem;
}

.disclaimer {
  max-width: 420px;
  font-size: 0.62rem;
  text-align: right;
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.35;
}
</style>
