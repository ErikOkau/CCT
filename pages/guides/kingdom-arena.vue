<script setup lang="ts">
import { getModeGuide, gearCheckModeUrl } from '~/utils/modeGuides'
import {
  arcadeArenaCounters,
  arcadeArenaEasyTeam,
  arcadeArenaIntro,
  arenaModeNote,
  arenaPrimaryTeam,
  arenaTreasures,
  leArenaCounters,
  otherArenaCounterSections
} from '~/utils/kingdomArenaGuide'

const guide = getModeGuide('kingdom-arena')
</script>

<template>
  <ModeGuideLayout :guide="guide">
    <template #heroNote>
      <p class="arena-note">{{ arenaModeNote }}</p>
    </template>

    <section class="block arcade-block">
      <h2>Arcade Arena — Season 1 (easy rank-up)</h2>
      <p class="lede">{{ arcadeArenaIntro }}</p>
      <div class="team-row">
        <article v-for="c in arcadeArenaEasyTeam" :key="c.id" class="cookie-chip">
          <div class="portrait placeholder">{{ c.short[0] }}</div>
          <strong>{{ c.short }}</strong>
        </article>
      </div>
      <div class="gear-grid compact-top">
        <article v-for="c in arcadeArenaEasyTeam" :key="`arc-${c.id}`" class="gear-card">
          <h3>{{ c.short }}</h3>
          <div class="gear-row"><span>Toppings</span><strong>{{ c.toppings }}</strong></div>
          <div class="gear-row"><span>Tart</span><strong>{{ c.tart }}</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>{{ c.beascuit }}</strong></div>
          <div class="gear-row"><span>Targets</span><strong>{{ c.stats }}</strong></div>
          <ul v-if="c.notes?.length" class="notes">
            <li v-for="(n, i) in c.notes" :key="i">{{ n }}</li>
          </ul>
        </article>
      </div>
      <p class="counter-note">{{ arcadeArenaCounters }}</p>
    </section>

    <section class="block">
      <h2>Normal Kingdom Arena — CCT defense</h2>
      <div class="team-row">
        <article v-for="c in arenaPrimaryTeam" :key="c.id" class="cookie-chip">
          <img v-if="c.portrait" class="portrait" :src="c.portrait" :alt="c.short">
          <div v-else class="portrait placeholder">{{ c.short[0] }}</div>
          <strong>{{ c.short }}</strong>
        </article>
      </div>
      <div class="gear-grid">
        <article v-for="c in arenaPrimaryTeam" :key="c.id" class="gear-card">
          <div class="card-head">
            <img v-if="c.portrait" class="card-portrait" :src="c.portrait" :alt="c.name">
            <h3>{{ c.short }}</h3>
          </div>
          <div class="gear-row"><span>Toppings</span><strong>{{ c.toppings }}</strong></div>
          <div class="gear-row"><span>Tart</span><strong>{{ c.tart }}</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>{{ c.beascuit }}</strong></div>
          <div class="gear-row"><span>Total gear (rough)</span><strong>{{ c.stats }}</strong></div>
          <ul v-if="c.notes?.length" class="notes">
            <li v-for="(n, i) in c.notes" :key="i">{{ n }}</li>
          </ul>
          <NuxtLink :to="gearCheckModeUrl('arena', c.id)" class="check-link">Gear Check →</NuxtLink>
        </article>
      </div>
    </section>

    <section class="block">
      <h2>Normal Arena — counter sheet</h2>
      <p class="lede">Raja = Rajah Cacao / meta shorthand. Star and ascension requirements matter.</p>

      <article class="le-counter-block">
        <h3>{{ leArenaCounters.title }}</h3>
        <p v-if="leArenaCounters.intro" class="le-intro">{{ leArenaCounters.intro }}</p>
        <div class="le-subgroups">
          <div
            v-for="sub in leArenaCounters.subgroups"
            :key="sub.title"
            class="counter-card le-sub"
          >
            <h4>{{ sub.title }}</h4>
            <p v-if="sub.blurb" class="sub-blurb">{{ sub.blurb }}</p>
            <ul>
              <li v-for="(line, i) in sub.matchups" :key="i">{{ line }}</li>
            </ul>
          </div>
        </div>
      </article>

      <div class="counter-grid other-counters">
        <article
          v-for="group in otherArenaCounterSections"
          :key="group.title"
          class="counter-card"
        >
          <h3>{{ group.title }}</h3>
          <ul>
            <li v-for="(line, i) in group.matchups" :key="i">{{ line }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="block">
      <h2>Treasures</h2>
      <p>{{ arenaTreasures }}</p>
    </section>
  </ModeGuideLayout>
</template>

<style scoped>
.arena-note {
  margin-top: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.35);
  font-size: 0.92rem;
}

.block {
  margin-bottom: 2.5rem;
}

.arcade-block {
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(251, 191, 36, 0.25);
}

.lede {
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 1rem;
  max-width: 60ch;
}

.counter-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.team-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1rem;
}

.cookie-chip {
  width: 100px;
  text-align: center;
  padding: 0.75rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
}

.portrait {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  margin: 0 auto 0.5rem;
  display: block;
}

.portrait.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  font-size: 1.25rem;
}

.gear-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.compact-top {
  margin-top: 0.5rem;
}

.gear-card {
  padding: 1rem;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.card-portrait {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.gear-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.45rem;
}

.gear-row span {
  color: rgba(255, 255, 255, 0.6);
}

.notes {
  font-size: 0.82rem;
  padding-left: 1.1rem;
}

.check-link {
  display: inline-block;
  margin-top: 0.75rem;
  font-weight: 700;
  color: #60a5fa;
}

.le-counter-block {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(96, 165, 250, 0.35);
}

.le-counter-block > h3 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  color: #fde047;
}

.le-intro {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.78);
  max-width: 65ch;
}

.le-subgroups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.le-sub h4 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #93c5fd;
}

.sub-blurb {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.other-counters {
  margin-top: 0.5rem;
}

.counter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.counter-card {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.counter-card h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: #93c5fd;
}

.counter-card ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.88rem;
  line-height: 1.45;
}
</style>
