<script setup lang="ts">
import { guildGuides } from '~/utils/guildGuides'

useHead({
  title: 'Guild Battle Guides — Chaos Control Team'
})
</script>

<template>
  <div class="landing-page">
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

    <section class="hero">
      <div class="hero-content hub-hero">
        <div class="hero-text">
          <div class="guild-badge">
            <div class="guild-logo">
              <img src="/img/cctLogo.png" alt="CCT Logo" class="guild-logo-img">
            </div>
            <div class="guild-name">Chaos Control Team</div>
          </div>
          <h1 class="hero-title">Guild Battle Guides</h1>
          <p class="hero-description">Pick a boss. Each guide will show the same layout: five-cookie team, toppings + tart + beascuit, target stats, then notes. Numbers come later.</p>
        </div>
      </div>
    </section>

    <section class="container gates-wrap">
      <NuxtLink
        v-for="guide in guildGuides"
        :key="guide.slug"
        :to="`/guides/${guide.slug}`"
        class="gate"
        :class="guide.theme"
      >
        <img :src="guide.image" :alt="guide.name">
        <div class="gate-copy">
          <span class="code">{{ guide.code }}</span>
          <h2>{{ guide.name }}</h2>
          <p>{{ guide.blurb }}</p>
          <strong>Open guide →</strong>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.hub-hero {
  grid-template-columns: 1fr;
}

.gates-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  padding: 2.5rem 20px 5rem;
}

.gate {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 18px;
  align-items: center;
  min-height: 180px;
  padding: 18px;
  border-radius: 24px;
  text-decoration: none;
  color: inherit;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.gate::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 6px;
  background: var(--gate);
}

.gate:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--gate) 55%, white);
}

.gate img {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 18px;
  border: 2px solid color-mix(in srgb, var(--gate) 50%, white);
}

.gate h2 {
  margin: 0.35rem 0 0.4rem;
  color: #ffd700;
  font-size: 1.25rem;
}

.gate p {
  margin: 0 0 0.8rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.92rem;
}

.code {
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--gate);
}

.gate strong { color: var(--gate); }

.gate.mgev { --gate: #c084fc; }
.gate.tla { --gate: #34d399; }
.gate.aod { --gate: #7eb6ff; }
.gate.rvd { --gate: #fb7185; }

@media (max-width: 860px) {
  .gates-wrap, .gate { grid-template-columns: 1fr; }
  .gate img { width: 100%; height: 180px; }
}
</style>
