<script setup lang="ts">
import { getGuide } from '~/utils/guildGuides'
import { linzerSets, pompomSets, rvdCookies } from '~/utils/rvdGuide'

const guide = getGuide('rvd')
const pompomSet = ref<(typeof pompomSets)[number]['id']>('3-3')
const linzerSet = ref<(typeof linzerSets)[number]['id']>('high')

const selectedPompom = computed(() => pompomSets.find(set => set.id === pompomSet.value) || pompomSets[0])
const selectedLinzer = computed(() => linzerSets.find(set => set.id === linzerSet.value) || linzerSets[0])
</script>

<template>
  <BossGuideLayout :guide="guide">
    <template #heroNote></template>

    <template #team>
      <div class="team-row">
        <article v-for="cookie in rvdCookies" :key="cookie.id" class="cookie-slot">
          <img class="portrait" :src="cookie.image" :alt="cookie.name">
          <strong>{{ cookie.short }}</strong>
        </article>
      </div>
    </template>

    <template #gear>
      <div class="gear-grid">
        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/rvd/pompom.png" alt="Pompom Dough Cookie">
          <h3>Pompom Dough</h3>
          <div class="gear-row">
            <span>Set</span>
            <select v-model="pompomSet">
              <option v-for="set in pompomSets" :key="set.id" :value="set.id">{{ set.label }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Tart effect</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>CD</span><strong>{{ selectedPompom.cd }}</strong></div>
          <div class="gear-row"><span>CRIT</span><strong>{{ selectedPompom.crit }}</strong></div>
          <div class="gear-row"><span>ATK</span><strong>{{ selectedPompom.atk }}</strong></div>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/rvd/eternal-sugar.png" alt="Eternal Sugar Cookie">
          <h3>Eternal Sugar</h3>
          <div class="gear-row"><span>Toppings</span><strong>Candy tart · 2 Apple Jelly + 2 Peanut + 1 Candy</strong></div>
          <div class="gear-row"><span>Tart effect</span><strong>Healing Received Increase</strong></div>
          <div class="gear-row"><span>CD</span><strong>8.6–9.2%</strong></div>
          <div class="gear-row"><span>AMP</span><strong>22%+</strong></div>
          <div class="gear-row"><span>DR</span><strong>62.5%+</strong></div>
          <div class="gear-row"><span>HP</span><strong>~57.5%</strong></div>
          <div class="gear-row"><span>CRIT</span><strong>Max CRIT</strong></div>
          <p class="hint">Can replace one Peanut with Apple Jelly for Eternal Sugar last-cast death.</p>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/rvd/prune.png" alt="Prune Juice Cookie">
          <h3>Prune Juice</h3>
          <div class="gear-row"><span>Toppings</span><strong>Chocolate tart · 3 Apple Jelly + 2 Chocolate</strong></div>
          <div class="gear-row"><span>Tart effect</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>CD</span><strong>35% (high decimal)–35.1%</strong></div>
          <div class="gear-row"><span>CRIT</span><strong>Max CRIT</strong></div>
          <div class="gear-row"><span>ATK</span><strong>Max ATK</strong></div>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/rvd/black-sapphire.png" alt="Black Sapphire Cookie">
          <h3>Black Sapphire</h3>
          <div class="gear-row"><span>Toppings</span><strong>Chocolate tart · 4 Apple Jelly + 1 Chocolate</strong></div>
          <div class="gear-row"><span>Tart effect</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>CD</span><strong>19.5% (high decimal)–19.6% (min CD)</strong></div>
          <div class="gear-row"><span>CRIT</span><strong>54.0% (max CRIT)</strong></div>
          <div class="gear-row"><span>ATK</span><strong>Max ATK</strong></div>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/rvd/linzer.png" alt="Linzer Cookie">
          <h3>Linzer</h3>
          <div class="gear-row">
            <span>Skill</span>
            <select v-model="linzerSet">
              <option v-for="set in linzerSets" :key="set.id" :value="set.id">{{ set.label }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Tart effect</span><strong>Increased team DMG</strong></div>
          <div class="gear-row"><span>CD</span><strong>{{ selectedLinzer.cd }}</strong></div>
          <div class="gear-row"><span>DR</span><strong>{{ selectedLinzer.dr }}</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>{{ selectedLinzer.aspd }}</strong></div>
        </article>
      </div>
    </template>
  </BossGuideLayout>
</template>

<style scoped>
.hint { margin: 8px 0 0; color: rgba(255, 255, 255, 0.68); font-size: 0.88rem; }

.card-portrait {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid rgba(251, 113, 133, 0.5);
}

.gear-card {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px 16px;
  align-items: start;
}

.gear-card h3 {
  grid-column: 2;
  grid-row: 1;
}

.gear-card .card-portrait {
  grid-column: 1;
  grid-row: 1 / span 20;
}

.gear-card .gear-row,
.gear-card .hint {
  grid-column: 2;
}

select {
  max-width: 100%;
  background: #1a0608;
  color: #ffd700;
  border: 1px solid rgba(251, 113, 133, 0.5);
  border-radius: 8px;
  padding: 4px 6px;
  font: inherit;
}
</style>
