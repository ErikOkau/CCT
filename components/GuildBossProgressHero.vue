<script setup lang="ts">
import type { SeasonBossDamageVisual } from '~/utils/seasonBossDamageVisual'
import { formatGuildBossDamage } from '~/utils/seasonBossDamageVisual'

const props = defineProps<{
  visual: SeasonBossDamageVisual | null
}>()
</script>

<template>
  <div v-if="visual" class="boss-damage-hero" aria-hidden="true">
    <div class="boss-damage-inner">
      <p class="season-pill">Season {{ visual.seasonLabel }} · guild sheet totals</p>

      <div class="boss-cards">
        <article v-for="boss in visual.bosses" :key="boss.bossKey" class="boss-card">
          <img class="boss-thumb" :src="boss.image" :alt="boss.name">
          <h3>{{ boss.name }}</h3>
          <div class="dmg-bar">
            <div class="dmg-fill" :style="{ width: `${boss.barPercent}%` }" />
            <span class="dmg-text">{{ formatGuildBossDamage(boss.totalDamage) }}</span>
          </div>
          <p class="dmg-label">Total DMG Dealt</p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boss-damage-hero {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.92;
}

.boss-damage-inner {
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
  margin: 0;
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
  padding: 0.85rem 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
  box-shadow: 0 0 24px rgba(168, 85, 247, 0.3);
}

.boss-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
  margin: 0 auto 0.5rem;
  display: block;
}

.boss-card h3 {
  font-size: 0.78rem;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.dmg-bar {
  position: relative;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.dmg-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  min-width: 4%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  transition: width 0.5s ease;
}

.dmg-text {
  position: relative;
  z-index: 1;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 26px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  padding: 0 0.35rem;
}

.dmg-label {
  font-size: 0.65rem;
  margin: 0;
  color: #fbbf24;
  font-weight: 600;
}
</style>
