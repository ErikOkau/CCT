<script setup lang="ts">
import { getGuide } from '~/utils/guildGuides'
import {
  creamPuffHpRequired,
  formatHp,
  tlaCookies,
  WA_ATK_SPD_REQ,
  windArcherTotalAspd
} from '~/utils/tlaGuide'

const guide = getGuide('tla')
const jamAspd = ref(22.3)
const toppingAspd = ref(27.1)
const grimoireHp = ref(12)
const creamPuffHp = ref(1254272)
const windArcherHp = ref(977251)

const waTotal = computed(() => windArcherTotalAspd(jamAspd.value, toppingAspd.value))
const hpRequired = computed(() => creamPuffHpRequired(windArcherHp.value, grimoireHp.value))
const hpPass = computed(() => creamPuffHp.value > hpRequired.value)
const aspdPass = computed(() => waTotal.value >= WA_ATK_SPD_REQ)
</script>

<template>
  <BossGuideLayout :guide="guide">
    <template #heroNote>
      <p class="lede">Damage through Licorice Ooze. Stun/incap stacks Weakness. Floor: 5A Cream Puff +10 candy, 2★ +15 Wind Archer, and psychotic toppings.</p>
    </template>

    <template #team>
      <div class="team-row">
        <article v-for="cookie in tlaCookies" :key="cookie.id" class="cookie-slot">
          <img class="portrait" :src="cookie.image" :alt="cookie.name">
          <strong>{{ cookie.short }}</strong>
        </article>
      </div>
    </template>

    <template #gear>
      <div class="gear-grid">
        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/tla/blueberry-pie.png" alt="Blueberry Pie Cookie">
          <h3>Blueberry Pie</h3>
          <div class="gear-row"><span>Toppings</span><strong>2 Raspberry + 2 Apple Jelly + 1 Caramel · Caramel tart · DMG UP to monsters</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Electricity</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>33.1%</strong></div>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/tla/cream-puff.png" alt="Cream Puff Cookie">
          <h3>Cream Puff</h3>
          <div class="gear-row"><span>Toppings</span><strong>3 Peanut + 2 Apple Jelly · Swift tart · DMG UP to monsters</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× HP</strong></div>
          <div class="gear-row"><span>CD</span><strong>14.1–14.4%</strong></div>
          <div class="gear-row"><span>HP</span><strong>Above coefficient × Wind Archer HP</strong></div>
          <div class="gear-row"><span>CRIT</span><strong>Aim 50% on the Total page</strong></div>
          <p class="hint">Swap Apple Jelly for more Peanut until HP beats Wind Archer. Floor: 5A +10 candy.</p>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/tla/wind-archer.png" alt="Wind Archer Cookie">
          <h3>Wind Archer</h3>
          <div class="gear-row"><span>Toppings</span><strong>3 Raspberry + 2 Caramel · Raspberry tart · DMG UP to monsters</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Wind</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>48.4%+ total (Jam + toppings)</strong></div>
          <p class="hint">Floor: 2★ +15. Jam ATK SPD + topping ATK SPD = total.</p>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/tla/ferret.png" alt="Cream Ferret Cookie">
          <h3>Cream Ferret</h3>
          <div class="gear-row"><span>Toppings</span><strong>5 Swift · Swift tart · TEAM DMG UP</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Cooldown%</strong></div>
          <div class="gear-row"><span>CD</span><strong>58.9%+</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>6.x–7.x%</strong></div>
        </article>

        <article class="gear-card with-portrait">
          <img class="card-portrait" src="/img/guides/tla/marshmallow.png" alt="Marshmallow Bunny Cookie">
          <h3>Marshmallow Bunny</h3>
          <div class="gear-row"><span>Toppings</span><strong>3 Swift + 2 Candy · Swift tart · TEAM DMG UP</strong></div>
          <div class="gear-row"><span>Beascuit</span><strong>4× Cooldown%</strong></div>
          <div class="gear-row"><span>CD</span><strong>50.4–50.7%</strong></div>
          <div class="gear-row"><span>ATK SPD</span><strong>0</strong></div>
          <div class="gear-row"><span>Amp Buff</span><strong>25% (include costume bonds)</strong></div>
        </article>
      </div>
    </template>

    <template #extra>
      <div class="extra-stack">
      <section>
        <div class="section-head">
          <h2>Check your numbers</h2>
        </div>
        <div class="calc-grid">
          <article class="calc-card">
            <h3>Wind Archer total ATK SPD</h3>
            <label>Jam ATK SPD % <input v-model.number="jamAspd" type="number" min="0" step="0.1"></label>
            <label>Topping ATK SPD % <input v-model.number="toppingAspd" type="number" min="0" step="0.1"></label>
            <p>
              Total {{ waTotal.toFixed(1) }}%
              <span :class="aspdPass ? 'pass' : 'fail'">{{ aspdPass ? `meets ${WA_ATK_SPD_REQ}%+` : `needs ${WA_ATK_SPD_REQ}%+` }}</span>
            </p>
          </article>

          <article class="calc-card">
            <h3>Cream Puff minimum HP</h3>
            <label>Grimoire HP bonus % <input v-model.number="grimoireHp" type="number" min="0" step="0.1"></label>
            <label>Wind Archer HP <input v-model.number="windArcherHp" type="number" min="0" step="1"></label>
            <label>Cream Puff HP <input v-model.number="creamPuffHp" type="number" min="0" step="1"></label>
            <p>
              Need more than {{ formatHp(hpRequired) }}
              <span :class="hpPass ? 'pass' : 'fail'">{{ hpPass ? 'passes' : 'too low' }}</span>
            </p>
            <p class="hint">HP buff from WA passive is a constant 30%. Formula: (1 + 0.3 + Grimoire) / (1 + Grimoire) × WA HP.</p>
          </article>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h2>Timings</h2>
        </div>
        <ol class="timing-list">
          <li>Insta auto Ferret → Marshmallow → Wind Archer.</li>
          <li>Blueberry Pie at <strong>58.313</strong>.</li>
          <li>Cream Puff at <strong>58.000</strong>.</li>
          <li>Auto until this Cream Puff / Wind Archer set. WA should cast at exactly <strong>43.625</strong>. If not, Bunny is wrong.</li>
          <li>Queue Marshmallow → auto Ferret → auto Cream Puff.</li>
          <li>Wind Archer at <strong>24.875</strong>.</li>
          <li>Auto Marshmallow.</li>
          <li>Queue Blueberry Pie.</li>
          <li>Ferret after 3 ATK SPD debuffs.</li>
          <li>Auto Marshmallow → auto Cream Puff → manual Ferret → auto Wind Archer at <strong>7.688</strong>.</li>
        </ol>
      </section>
      </div>
    </template>

    <template #notes>
      <p>TEAM DMG UP is required on Ferret or Marshmallow, not both. Amp Buff on Marshmallow includes costume bonds.</p>
    </template>
  </BossGuideLayout>
</template>
