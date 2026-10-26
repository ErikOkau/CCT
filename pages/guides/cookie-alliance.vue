<script setup lang="ts">
import { getModeGuide } from '~/utils/modeGuides'
import {
  allianceBeaconNote,
  alliancePrimaryTeam,
  allianceSubstatPriority,
  allianceTeamVariants,
  allianceTeamsNote,
  allianceTreasures
} from '~/utils/cookieAllianceGuide'

const guide = getModeGuide('cookie-alliance')
</script>

<template>
  <ModeGuideLayout :guide="guide">
    <template #heroNote>
      <p class="autoplay-note">{{ allianceTeamsNote }}</p>
    </template>

    <section class="block">
      <h2>Master autoplay team</h2>
      <p class="muted">Use the same five cookies on all three teams unless Beacon forces an element swap.</p>
      <div class="team-row">
        <article v-for="c in alliancePrimaryTeam" :key="c.id" class="cookie-chip">
          <img v-if="c.portrait" class="portrait" :src="c.portrait" :alt="c.short">
          <div v-else class="portrait placeholder">{{ c.short[0] }}</div>
          <strong>{{ c.short }}</strong>
          <span class="role">{{ c.role }}</span>
        </article>
      </div>
    </section>

    <section class="block">
      <h2>Gear per cookie</h2>
      <div class="gear-grid">
        <article v-for="c in alliancePrimaryTeam" :key="c.id" class="gear-card">
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
        </article>
      </div>
    </section>

    <section class="block">
      <h2>Three teams &amp; Beacon</h2>
      <p>{{ allianceBeaconNote }}</p>
      <ul>
        <li v-for="row in allianceTeamVariants" :key="row.label">
          <strong>{{ row.label }}:</strong> {{ row.detail }}
        </li>
      </ul>
      <p>{{ allianceSubstatPriority }}</p>
    </section>

    <section class="block">
      <h2>Treasures</h2>
      <p>{{ allianceTreasures }}</p>
    </section>
  </ModeGuideLayout>
</template>

<style scoped>
.autoplay-note {
  margin-top: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.35);
  font-size: 0.92rem;
}

.block {
  margin-bottom: 2.5rem;
}

.block h2 {
  margin-bottom: 0.75rem;
}

.muted {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.team-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.cookie-chip {
  width: 120px;
  text-align: center;
  padding: 0.75rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.portrait {
  width: 64px;
  height: 64px;
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
  font-size: 1.5rem;
}

.role {
  display: block;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 0.25rem;
}

.gear-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.gear-card {
  padding: 1rem 1.1rem;
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
  object-fit: cover;
}

.gear-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.45rem;
}

.gear-row span {
  color: rgba(255, 255, 255, 0.6);
}

.notes {
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
}

</style>
