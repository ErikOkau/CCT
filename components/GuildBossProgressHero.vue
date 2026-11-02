<script setup lang="ts">
import type { SeasonBossDamageVisual } from '~/utils/seasonBossDamageVisual'
import { formatGuildBossDamage } from '~/utils/seasonBossDamageVisual'

defineProps<{
  visual: SeasonBossDamageVisual | null
}>()
</script>

<template>
  <div v-if="visual" class="boss-stage" aria-hidden="true">
    <div class="boss-stage-inner">
      <p class="season-pill">Season {{ visual.seasonLabel }} · total damage (guild sheet)</p>

      <div class="stage-floor" />
      <div class="pillars">
        <article
          v-for="boss in visual.bosses"
          :key="boss.slot"
          class="pillar"
          :class="[
            `slot-${boss.slot}`,
            boss.status === 'unavailable' ? 'unavailable' : 'active'
          ]"
        >
          <div class="pillar-card">
            <img
              v-if="boss.image"
              class="boss-thumb"
              :src="boss.image"
              :alt="boss.name"
            >
            <div v-else class="boss-thumb placeholder">?</div>
            <h3>{{ boss.status === 'unavailable' ? 'Not available' : boss.name }}</h3>

            <div class="dmg-bar" :class="{ muted: boss.status === 'unavailable' }">
              <div
                v-if="boss.status === 'active'"
                class="dmg-fill"
                :style="{ width: `${boss.barPercent}%` }"
              />
              <span class="dmg-text">
                {{
                  boss.status === 'unavailable'
                    ? 'Not available'
                    : formatGuildBossDamage(boss.totalDamage)
                }}
              </span>
            </div>
            <p v-if="boss.status === 'active'" class="dmg-label">Total DMG Dealt</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boss-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.94;
}

.boss-stage-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 1.25rem 1.5rem 2rem;
  gap: 0.75rem;
  background:
    radial-gradient(ellipse 80% 50% at 70% 85%, rgba(88, 28, 135, 0.45), transparent),
    radial-gradient(circle at 75% 35%, rgba(59, 130, 246, 0.2), transparent 50%),
    linear-gradient(160deg, rgba(10, 15, 30, 0.88), rgba(30, 58, 95, 0.82));
}

.season-pill {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
  margin: 0;
  align-self: flex-end;
}

.stage-floor {
  position: absolute;
  right: 2%;
  bottom: 18%;
  width: min(520px, 55vw);
  height: 120px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.35));
  transform: perspective(600px) rotateX(72deg);
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.7;
}

.pillars {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 0.65rem;
  width: min(540px, 92vw);
  perspective: 900px;
  perspective-origin: 50% 40%;
  padding-bottom: 0.5rem;
}

.pillar {
  flex: 1;
  max-width: 168px;
  transform-style: preserve-3d;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.pillar.slot-1 {
  transform: rotateY(24deg) translateZ(-28px) translateY(8px);
  opacity: 0.88;
}

.pillar.slot-2 {
  transform: rotateY(0deg) translateZ(36px) scale(1.05);
  z-index: 2;
}

.pillar.slot-3 {
  transform: rotateY(-24deg) translateZ(-28px) translateY(8px);
  opacity: 0.88;
}

.pillar.unavailable {
  opacity: 0.55;
  filter: grayscale(0.85);
}

.pillar.unavailable.slot-2 {
  transform: rotateY(0deg) translateZ(12px) scale(0.98);
}

.pillar-card {
  padding: 0.75rem 0.65rem 0.9rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.14);
  text-align: center;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 20px rgba(124, 58, 237, 0.15);
  backface-visibility: hidden;
}

.pillar.active .pillar-card {
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 28px rgba(168, 85, 247, 0.35);
}

.boss-thumb {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 10px;
  margin: 0 auto 0.45rem;
  display: block;
}

.boss-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.35);
  font-size: 1.25rem;
  font-weight: 700;
}

.pillar-card h3 {
  font-size: 0.68rem;
  margin: 0 0 0.45rem;
  line-height: 1.25;
  min-height: 2.5em;
}

.dmg-bar {
  position: relative;
  height: 24px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-bottom: 0.3rem;
}

.dmg-bar.muted {
  background: rgba(255, 255, 255, 0.06);
}

.dmg-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #6d28d9, #a855f7);
  transition: width 0.55s ease;
}

.dmg-text {
  position: relative;
  z-index: 1;
  display: block;
  font-size: 0.58rem;
  font-weight: 700;
  line-height: 24px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  padding: 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dmg-bar.muted .dmg-text {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
  font-size: 0.55rem;
}

.dmg-label {
  font-size: 0.58rem;
  margin: 0;
  color: #fbbf24;
  font-weight: 600;
}

@media (max-width: 720px) {
  .pillars {
    gap: 0.35rem;
  }

  .pillar.slot-1 {
    transform: rotateY(18deg) translateZ(-16px);
  }

  .pillar.slot-3 {
    transform: rotateY(-18deg) translateZ(-16px);
  }

  .pillar-card h3 {
    font-size: 0.6rem;
  }
}
</style>
