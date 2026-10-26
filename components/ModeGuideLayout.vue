<script setup lang="ts">
import type { ModeGuide } from '~/utils/modeGuides'
import { modeGuides } from '~/utils/modeGuides'
const props = defineProps<{
  guide: ModeGuide
}>()

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
        <img class="mode-art" :src="guide.image" :alt="guide.name">
        <div>
          <p class="code-pill">{{ guide.code }}</p>
          <h1>{{ guide.name }}</h1>
          <p class="lede">{{ guide.blurb }}</p>
          <slot name="heroNote" />
        </div>
      </div>
    </section>

    <main class="container guide-body">
      <slot />
    </main>

    <nav class="other-gates container">
      <NuxtLink
        v-for="other in modeGuides.filter(g => g.slug !== guide.slug)"
        :key="other.slug"
        :to="`/guides/${other.slug}`"
        class="mini-gate"
      >
        <img :src="other.image" :alt="other.name">
        <span>{{ other.code }}</span>
      </NuxtLink>
      <NuxtLink to="/guides" class="mini-gate guild-hub">
        <span>Guild bosses →</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.guide-page {
  min-height: 100vh;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.guide-page.cookie-alliance {
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.22), transparent 40%),
    linear-gradient(160deg, #3d2a06 0%, #1a1208 55%, #000 100%);
  --accent: #fbbf24;
  --accent-2: #d97706;
}

.guide-page.kingdom-arena {
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.25), transparent 40%),
    linear-gradient(160deg, #1e3a5f 0%, #0f172a 55%, #000 100%);
  --accent: #60a5fa;
  --accent-2: #2563eb;
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
  grid-template-columns: 120px 1fr;
  gap: 2rem;
  align-items: center;
}

.mode-art {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 20px;
  border: 3px solid color-mix(in srgb, var(--accent) 55%, white);
}

.code-pill {
  display: inline-block;
  margin: 0 0 0.6rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  font-weight: 800;
  font-size: 0.75rem;
}

.lede {
  max-width: 52ch;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}

.guide-body {
  padding: 2rem 20px 3rem;
}

.other-gates {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 3rem;
}

.mini-gate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  text-decoration: none;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}

.mini-gate img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
}

.guild-hub {
  margin-left: auto;
}
</style>
