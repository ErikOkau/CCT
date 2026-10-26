<script setup lang="ts">
import type { CookieBuildTarget } from '~/utils/gearCheck/types'
import { gearCheckUrl } from '~/utils/guildGuides'
import type { GuideSlug } from '~/utils/guildGuides'

defineProps<{
  bossSlug: GuideSlug
  cookie: CookieBuildTarget
}>()
</script>

<template>
  <article class="gear-card with-portrait">
    <img v-if="cookie.portrait" class="card-portrait" :src="cookie.portrait" :alt="cookie.short">
    <h3>{{ cookie.short }}</h3>
    <div v-for="row in cookie.gearRows ?? []" :key="row.label" class="gear-row">
      <span>{{ row.label }}</span>
      <strong>{{ row.value }}</strong>
    </div>
    <p v-for="(note, i) in cookie.notes ?? []" :key="i" class="hint">{{ note }}</p>
    <NuxtLink :to="gearCheckUrl(bossSlug, cookie.id)" class="gear-check-link">Check stats →</NuxtLink>
  </article>
</template>

<style scoped>
.gear-check-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: #facc15;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
</style>
