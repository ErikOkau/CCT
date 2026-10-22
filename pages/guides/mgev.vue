<script setup lang="ts">
import { getGuide } from '~/utils/guildGuides'
import { ferretSets, frilledSets, mentholSets, mgevCookies } from '~/utils/mgevGuide'

const guide = getGuide('mgev')
const frilledSet = ref<(typeof frilledSets)[number]['id']>('cd-water')
const mentholSet = ref<(typeof mentholSets)[number]['id']>('auto')
const ferretSet = ref<(typeof ferretSets)[number]['id']>('3s')

const selectedFrilled = computed(() => frilledSets.find(set => set.id === frilledSet.value) || frilledSets[0])
const selectedMenthol = computed(() => mentholSets.find(set => set.id === mentholSet.value) || mentholSets[0])
const selectedFerret = computed(() => ferretSets.find(set => set.id === ferretSet.value) || ferretSets[0])
</script>

<template>
  <BossGuideLayout :guide="guide">
    <template #heroNote>
      <p class="lede">Immune to non-Water debuffs, +12% Water DMG taken. Seltzer applies Stinging Fizz; Menthol detonates it. Manual the opener.</p>
    </template>

    <template #team>
      <div class="team-row">
        <article v-for="cookie in mgevCookies" :key="cookie.id" class="cookie-slot">
          <img class="portrait" :src="cookie.image" :alt="cookie.name">
          <strong>{{ cookie.short }}</strong>
        </article>
      </div>
    </template>

    <template #treasures>
      <div class="treasure-row">
        <span>Scroll</span>
        <span>Crimson Whistle</span>
        <span>Watch</span>
      </div>
    </template>

    <template #gear>
      <div class="gear-grid">
        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/mgev/frilled.png" alt="Frilled Jellyfish Cookie">
          <h3>Frilled Jellyfish</h3>
          <div class="gear-row">
            <span>Set</span>
            <select v-model="frilledSet">
              <option v-for="set in frilledSets" :key="set.id" :value="set.id">{{ set.label }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Toppings</span><strong>{{ selectedFrilled.toppings }}</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>{{ selectedFrilled.beascuit }}</strong></div>
          <div class="gear-row"><span>Magic Candy</span><strong>Lv 30</strong></div>
          <div class="gear-row"><span>CD</span><strong>35%+</strong></div>
          <div class="gear-row"><span>ATK</span><strong>Max ATK afterwards</strong></div>
          <p class="hint">4 Water barely adds damage over 4 CD.</p>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/mgev/sea-fairy.png" alt="Sea Fairy Cookie">
          <h3>Sea Fairy</h3>
          <div class="gear-row"><span>Toppings</span><strong>5 CD toppings · CD tart · DMG UP to monsters</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Water DMG</strong></div>
          <div class="gear-row"><span>Crystal Jam</span><strong>As high as possible</strong></div>
          <div class="gear-row"><span>CD</span><strong>35%+</strong></div>
          <div class="gear-row"><span>ATK</span><strong>Max ATK, but lower than Menthol</strong></div>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/mgev/seltzer.png" alt="Seltzer Cookie">
          <h3>Seltzer</h3>
          <div class="gear-row"><span>Toppings</span><strong>3 ATK + 2 CD toppings · CD tart · DMG UP to monsters</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Water DMG</strong></div>
          <div class="gear-row"><span>CD</span><strong>24.1%+</strong></div>
          <div class="gear-row"><span>ATK</span><strong>Max ATK afterwards</strong></div>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/mgev/menthol.png" alt="Menthol Cookie">
          <h3>Menthol — main priority</h3>
          <div class="gear-row">
            <span>CD</span>
            <select v-model="mentholSet">
              <option v-for="set in mentholSets" :key="set.id" :value="set.id">{{ set.label }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Toppings</span><strong>4 ATK + 1 CD toppings · CD tart · DMG UP to monsters</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Water DMG</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>11.7%+</strong></div>
          <div class="gear-row"><span>ATK</span><strong>Highest ATK on the team, then max ATK</strong></div>
          <p class="hint">{{ selectedMenthol.cast }} Not worth dropping significant ATK to chase the next breakpoint.</p>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/mgev/ferret.png" alt="Cream Ferret Cookie">
          <h3>Cream Ferret</h3>
          <div class="gear-row">
            <span>Set</span>
            <select v-model="ferretSet">
              <option v-for="set in ferretSets" :key="set.id" :value="set.id">{{ set.label }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Toppings</span><strong>{{ selectedFerret.toppings }}</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>{{ selectedFerret.beascuit }}</strong></div>
          <div class="gear-row"><span>CD</span><strong>{{ selectedFerret.cd }}</strong></div>
          <p v-if="ferretSet === 'rasp'" class="hint">Tiny damage gain. Timing stays the same.</p>
        </article>
      </div>
    </template>

    <template #extra>
      <div class="extra-stack">
      <section>
        <div class="section-head">
          <h2>Timings</h2>
        </div>
        <ol class="timing-list">
          <li>Queue Ferret before the boss.</li>
          <li>Queue Sea Fairy after Ferret casts.</li>
          <li>Spam Seltzer right before the boss banner.</li>
          <li>Cast Frilled at <strong>59.188–59.000</strong>.</li>
          <li>
            <template v-if="mentholSet === 'auto'">Let Menthol auto (<strong>18.8%+ CD</strong>).</template>
            <template v-else>Cast Menthol at <strong>58.313–58.250</strong> (<strong>19.2%+ CD</strong>).</template>
          </li>
          <li>Spam everyone for the rest of the fight. Always queue Menthol so he never delays.</li>
          <li>Final Seltzer: delay a few frames and cast right after Menthol at <strong>2.625–2.563</strong>.</li>
        </ol>
      </section>
      </div>
    </template>

    <template #notes>
      <p>With CRIT bonds this team caps CRIT% at 101%. Nobody needs to run any CRIT.</p>
    </template>
  </BossGuideLayout>
</template>
