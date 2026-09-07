<script setup lang="ts">
import type { GuildGuide } from '~/utils/guildGuides'
import { COOKIE_SLOTS, GEAR_ROWS, guildGuides } from '~/utils/guildGuides'

const props = defineProps<{
  guide: GuildGuide
}>()

const slots = useSlots()

useHead({
  title: `${props.guide.code} · ${props.guide.short} — Chaos Control Team`
})
</script>

<template>
  <div class="guide-page" :class="guide.theme">
    <header class="nav-header">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-brand">
          <img src="/img/cctLogo.png" alt="CCT Logo" class="nav-logo">
          <span class="nav-title">Chaos Control Team</span>
        </NuxtLink>
        <nav class="nav-menu">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/guides" class="nav-link">Guides</NuxtLink>
        </nav>
      </div>
    </header>

    <section class="guide-hero">
      <div class="container hero-grid">
        <img class="boss-art" :src="guide.image" :alt="guide.name">
        <div>
          <p class="code-pill">{{ guide.code }}</p>
          <h1>{{ guide.name }}</h1>
          <p v-if="!slots.heroNote" class="lede">{{ guide.blurb }}</p>
          <slot name="heroNote" />
        </div>
      </div>
    </section>

    <main class="container guide-body">
      <section>
        <div class="section-head">
          <h2>Recommended team</h2>
          <span v-if="!slots.team" class="soon">Coming soon</span>
        </div>
        <slot name="team">
          <div class="team-row">
            <article v-for="slot in COOKIE_SLOTS" :key="slot" class="cookie-slot">
              <div class="portrait">{{ slot }}</div>
              <strong>Cookie {{ slot }}</strong>
            </article>
          </div>
        </slot>
      </section>

      <section>
        <div class="section-head">
          <h2>Gear per cookie</h2>
          <span v-if="!slots.gear" class="soon">Coming soon</span>
        </div>
        <slot name="gear">
          <div class="gear-grid">
            <article v-for="slot in COOKIE_SLOTS" :key="slot" class="gear-card">
              <h3>Cookie {{ slot }}</h3>
              <div v-for="row in GEAR_ROWS" :key="row.key" class="gear-row">
                <span>{{ row.label }}</span>
                <strong>—</strong>
              </div>
            </article>
          </div>
        </slot>
      </section>

      <slot name="extra" />

      <section v-if="slots.notes" class="notes-card">
        <div class="section-head">
          <h2>Notes</h2>
        </div>
        <slot name="notes" />
      </section>

      <nav class="other-gates">
        <NuxtLink
          v-for="other in guildGuides.filter(item => item.slug !== guide.slug)"
          :key="other.slug"
          :to="`/guides/${other.slug}`"
          class="mini-gate"
        >
          <img :src="other.image" :alt="other.name">
          <span>{{ other.code }}</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.guide-page {
  min-height: 100vh;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 28%, transparent), transparent 36%),
    linear-gradient(160deg, var(--wash) 0%, var(--deep) 55%, #000 100%);
}

.guide-page.mgev {
  --accent: #c084fc;
  --accent-2: #7c3aed;
  --deep: #120818;
  --wash: #3b1d6e;
}

.guide-page.tla {
  --accent: #34d399;
  --accent-2: #0f766e;
  --deep: #041411;
  --wash: #0b3d38;
}

.guide-page.aod {
  --accent: #7eb6ff;
  --accent-2: #3b6cff;
  --deep: #071024;
  --wash: #163a7a;
}

.guide-page.rvd {
  --accent: #fb7185;
  --accent-2: #dc2626;
  --deep: #1a0608;
  --wash: #7f1d1d;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.guide-hero {
  padding: 2.5rem 0 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
}

.hero-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 2rem;
  align-items: center;
}

.boss-art {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 24px;
  border: 3px solid color-mix(in srgb, var(--accent) 55%, white);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.code-pill {
  display: inline-block;
  margin: 0 0 0.6rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #1a1203;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
}

h1 {
  margin: 0 0 0.6rem;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.1;
}

.lede { margin: 0 0 0.6rem; max-width: 640px; }
.muted { margin: 0; color: rgba(255, 255, 255, 0.62); }

.guide-body {
  display: grid;
  gap: 2.2rem;
  padding: 2.2rem 20px 4.5rem;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

h2 { margin: 0; color: #ffd700; font-size: 1.25rem; }
h3, :slotted(h3) { margin: 0 0 0.8rem; color: var(--accent); }

.soon {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
}

.team-row, :slotted(.team-row) {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.gear-grid, :slotted(.gear-grid) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.cookie-slot, .gear-card, .notes-card,
:slotted(.cookie-slot), :slotted(.gear-card) {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.cookie-slot, :slotted(.cookie-slot) {
  text-align: center;
  border-top: 4px solid var(--accent);
}

.cookie-slot span, .notes-card p, :slotted(.cookie-slot span) {
  display: block;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.88rem;
}

.portrait, :slotted(.portrait) {
  width: 72px;
  height: 72px;
  margin: 0 auto 10px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #1a1203;
  object-fit: cover;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: 2px solid color-mix(in srgb, var(--accent) 50%, white);
}

.gear-row, :slotted(.gear-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
}

.gear-row:last-child, :slotted(.gear-row:last-child) { border-bottom: 0; }
.gear-row strong, :slotted(.gear-row strong) { color: #ffd700; }

.other-gates {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mini-gate {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: inherit;
  text-decoration: none;
  font-weight: 700;
}

.mini-gate img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50%;
}

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
  .team-row, :slotted(.team-row) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .boss-art { width: 120px; height: 120px; }
}
</style>
