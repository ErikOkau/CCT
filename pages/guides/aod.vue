<script setup lang="ts">
import { getGuide } from '~/utils/guildGuides'
import { aodCookies, cremeToppingSets, mintBreakpoints } from '~/utils/aodGuide'

const guide = getGuide('aod')
const mintIndex = ref(0)
const ferretIndex = ref(0)
const mintAtkSpdUp = ref(false)
const cremeSet = ref<(typeof cremeToppingSets)[number]['id']>('4rasp')

const selectedCreme = computed(() => cremeToppingSets.find(set => set.id === cremeSet.value) || cremeToppingSets[0])
const effectiveMintIndex = computed(() => Math.max(0, mintIndex.value - (mintAtkSpdUp.value ? 1 : 0)))
const selectedMint = computed(() => mintBreakpoints[effectiveMintIndex.value])
const ferretOptions = computed(() => selectedMint.value.ferret)
const selectedFerret = computed(() => ferretOptions.value[ferretIndex.value] || ferretOptions.value[0])

watch([mintIndex, mintAtkSpdUp], () => {
  ferretIndex.value = 0
})
</script>

<template>
  <BossGuideLayout :guide="guide">
    <template #heroNote></template>

    <template #team>
      <div class="team-row">
        <article v-for="cookie in aodCookies" :key="cookie.id" class="cookie-slot">
          <img class="portrait" :src="cookie.image" :alt="cookie.name">
          <strong>{{ cookie.short }}</strong>
        </article>
      </div>
    </template>

    <template #gear>
      <div class="gear-grid">
        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/aod/pudding.png" alt="Pudding à la Mode">
          <h3>Pudding à la Mode</h3>
          <div class="gear-row"><span>Toppings</span><strong>2 Amp Buff, or SPD + CRIT + CD</strong></div>
          <div class="gear-row"><span>Tart</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× ATK SPD%</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>79.5% min</strong></div>
          <div class="gear-row"><span>CRIT</span><strong>21.5% is enough</strong></div>
          <div class="gear-row"><span>CD</span><strong>3%+</strong></div>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/aod/mint.png" alt="Mint Choco">
          <h3>Mint Choco</h3>
          <div class="gear-row">
            <span>CD</span>
            <select v-model.number="mintIndex">
              <option v-for="(row, index) in mintBreakpoints" :key="row.mintCd" :value="index">{{ row.mintCd }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Tart</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>Full cooldown%</strong></div>
          <label class="check">
            <input v-model="mintAtkSpdUp" type="checkbox">
            10.5%+ ATK SPD (1 breakpoint up)
          </label>
          <p v-if="mintAtkSpdUp && mintIndex === 0" class="hint">Already on the highest Mint CD block.</p>
          <p v-else-if="mintAtkSpdUp" class="hint">Treated as {{ selectedMint.mintCd }} for Ferret CD.</p>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/aod/creme.png" alt="Crème Brûlée">
          <h3>Crème Brûlée</h3>
          <div class="gear-row">
            <span>Toppings</span>
            <select v-model="cremeSet">
              <option v-for="set in cremeToppingSets" :key="set.id" :value="set.id">{{ set.label }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Tart</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× ATK SPD%</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>{{ selectedCreme.spd }} breakpoint</strong></div>
          <div class="gear-row"><span>CD</span><strong>7.7%+</strong></div>
          <p v-if="cremeSet === '3rasp'" class="hint">Maximize ATK + CRIT. Avoid dead stats.</p>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/aod/ferret.png" alt="Cream Ferret">
          <h3>Cream Ferret</h3>
          <div class="gear-row">
            <span>CD</span>
            <select v-model.number="ferretIndex">
              <option v-for="(row, index) in ferretOptions" :key="row.cd" :value="index">{{ row.cd }} · {{ row.cast }}</option>
            </select>
          </div>
          <div class="gear-row"><span>Cast</span><strong>{{ selectedFerret.cast }}</strong></div>
          <div class="gear-row"><span>Tart</span><strong>Increased team DMG</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>Full cooldown%</strong></div>
          <div class="gear-row"><span>Other</span><strong>0 ATK SPD · max ATK / CRIT%</strong></div>
        </article>

        <article class="gear-card">
          <img class="card-portrait" src="/img/guides/aod/coral.png" alt="Star Coral">
          <h3>Star Coral</h3>
          <div class="gear-row"><span>Tart</span><strong>DMG vs all enemies</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>Full cooldown%</strong></div>
          <div class="gear-row"><span>CD</span><strong>49.2–49.5%</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>1.7–3%</strong></div>
          <div class="gear-row"><span>Debuff Resist</span><strong>2.6–4%</strong></div>
        </article>
      </div>
    </template>

    <template #extra>
      <section class="table-wrap">
        <div class="section-head">
          <h2>Mint CD → Ferret CD</h2>
        </div>
        <p class="table-lede">Highest Mint CD is the default. Lower Mint CD needs higher Ferret CD. 10.5%+ ATK SPD on Mint moves you one block up.</p>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Mint CD</th>
                <th>Ferret Cast</th>
                <th>Ferret CD</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(block, blockIndex) in mintBreakpoints" :key="block.mintCd">
                <tr
                  v-for="(row, rowIndex) in block.ferret"
                  :key="row.cd"
                  :class="{
                    alt: blockIndex % 2 === 1,
                    active: blockIndex === effectiveMintIndex && rowIndex === ferretIndex
                  }"
                >
                  <td v-if="rowIndex === 0" :rowspan="block.ferret.length">{{ block.mintCd }}</td>
                  <td>{{ row.cast }}</td>
                  <td>{{ row.cd }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template #notes>
      <p>Pudding, Mint, and Crème: DMG vs all enemies tart. Ferret: increased team DMG tart. Star Coral: DMG vs all enemies tart. Pudding and Crème Brûlée: 4× ATK SPD% beascuit. Mint, Star Coral, and Cream Ferret: full cooldown% beascuit.</p>
    </template>
  </BossGuideLayout>
</template>

<style scoped>
.muted, .table-lede, .hint {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.88rem;
}

.hint { margin: 8px 0 0; }

.card-portrait {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid rgba(126, 182, 255, 0.45);
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
.gear-card .check,
.gear-card .hint {
  grid-column: 2;
}

select {
  max-width: 100%;
  background: #071024;
  color: #ffd700;
  border: 1px solid rgba(126, 182, 255, 0.45);
  border-radius: 8px;
  padding: 4px 6px;
  font: inherit;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.86rem;
}

.table-wrap {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(126, 182, 255, 0.28);
  border-radius: 18px;
  padding: 16px;
}

.section-head h2 { margin: 0 0 8px; color: #ffd700; font-size: 1.25rem; }
.table-lede { margin: 0 0 12px; }

.table-scroll { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

th, td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  background: rgba(7, 16, 36, 0.85);
  color: #7eb6ff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

tr.alt td { background: rgba(22, 58, 122, 0.35); }
tr.active td {
  background: rgba(126, 182, 255, 0.22);
  color: #ffd700;
  font-weight: 700;
}

td:first-child { font-weight: 700; color: #7eb6ff; }
</style>
