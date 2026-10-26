<script setup lang="ts">
import { guildGuides, type GuideSlug } from '~/utils/guildGuides'
import { getCookieBuildTargets } from '~/utils/gearCheck/buildTargets'
import { drawGearOverlay, downloadCanvas } from '~/utils/gearCheck/drawOverlay'
import { buildGearFixList } from '~/utils/gearCheck/fixList'
import type { GearCheckResult } from '~/utils/gearCheck/types'

useHead({ title: 'Gear Check — Chaos Control Team' })

const route = useRoute()
const bossSlug = ref<GuideSlug>((route.query.boss as GuideSlug) || 'mgev')
const overrideBuildId = ref((route.query.cookie as string) || '')
const batchMode = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const pending = ref(false)
const error = ref('')
const result = ref<GearCheckResult | null>(null)
const batchResults = ref<GearCheckResult[]>([])
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const windArcherHp = ref<number | undefined>()
const grimoireHp = ref(12)
const copyDone = ref(false)

const activeGuides = computed(() => guildGuides.filter(g => !g.parked))
const cookieOptions = computed(() => getCookieBuildTargets(bossSlug.value))
const fixListText = computed(() => (result.value ? buildGearFixList(result.value) : ''))

watch(bossSlug, () => {
  if (!route.query.cookie) overrideBuildId.value = ''
  result.value = null
  batchResults.value = []
})

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = batchMode.value ? input.files?.[0] : input.files?.[0]
  if (!file) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  result.value = null
  batchResults.value = []
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function analyze() {
  error.value = ''
  result.value = null
  batchResults.value = []
  const files = fileInput.value?.files
  if (!files?.length) {
    error.value = 'Upload a Gear screenshot first (Total tab).'
    return
  }

  pending.value = true
  try {
    const images: string[] = []
    const limit = batchMode.value ? Math.min(files.length, 6) : 1
    for (let i = 0; i < limit; i++) {
      images.push(await readFileAsDataUrl(files[i]!))
    }
    const res = await $fetch<{ result: GearCheckResult; results: GearCheckResult[] }>('/api/analyze-gear', {
      method: 'POST',
      body: {
        images,
        bossSlug: bossSlug.value,
        overrideBuildId: overrideBuildId.value || null,
        tlaContext:
          bossSlug.value === 'tla'
            ? { windArcherHp: windArcherHp.value, grimoireHpPercent: grimoireHp.value }
            : undefined
      }
    })
    result.value = res.result
    batchResults.value = res.results ?? [res.result]
    await nextTick()
    paintOverlay()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Analysis failed'
  } finally {
    pending.value = false
  }
}

async function copyFixList() {
  if (!fixListText.value) return
  await navigator.clipboard.writeText(fixListText.value.replace(/\*\*/g, ''))
  copyDone.value = true
  setTimeout(() => { copyDone.value = false }, 2000)
}

function paintOverlay() {
  const canvas = canvasRef.value
  const img = imageRef.value
  if (!canvas || !img || !result.value) return
  if (!img.complete) {
    img.onload = () => drawGearOverlay(canvas, img, result.value!.comparisons)
    return
  }
  drawGearOverlay(canvas, img, result.value.comparisons)
}

function saveAnnotated() {
  const canvas = canvasRef.value
  if (!canvas) return
  const name = result.value?.matchedShort || 'gear'
  downloadCanvas(canvas, `cct-gear-${bossSlug.value}-${name}.png`)
}

function statusClass(status: string) {
  return `status-${status}`
}
</script>

<template>
  <div class="landing-page gear-check-page">
    <header class="nav-header">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-brand">
          <img src="/img/cctLogo.png" alt="CCT Logo" class="nav-logo">
          <span class="nav-title">Chaos Control Team</span>
        </NuxtLink>
        <nav class="nav-menu">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/guides" class="nav-link">Guides</NuxtLink>
          <NuxtLink to="/tools/gear-check" class="nav-link active">Gear Check</NuxtLink>
        </nav>
      </div>
    </header>

    <section class="hero compact-hero">
      <div class="hero-content hub-hero">
        <h1 class="hero-title">Gear stat check</h1>
        <p class="hero-description">
          Upload the in-game <strong>Gear → Total</strong> screen (the one with toppings, tart, and beascuit stats).
          Vision reads your numbers and compares them to CCT boss-guide targets — green/yellow/red on the screenshot plus a checklist.
        </p>
      </div>
    </section>

    <section class="container tool-panel">
      <div class="controls">
        <label>
          Boss guide
          <select v-model="bossSlug">
            <option v-for="g in activeGuides" :key="g.slug" :value="g.slug">{{ g.name }}</option>
            <option value="rvd">Red Velvet Dragon (parked)</option>
          </select>
        </label>
        <label>
          Cookie override (if vision misreads)
          <select v-model="overrideBuildId">
            <option value="">Auto from screenshot</option>
            <option v-for="c in cookieOptions" :key="c.id" :value="c.id">{{ c.short }}</option>
          </select>
        </label>
        <label>
          <input v-model="batchMode" type="checkbox"> Batch team (up to 6 images)
        </label>
        <label class="file-label">
          Screenshot(s)
          <input ref="fileInput" type="file" accept="image/*" :multiple="batchMode" @change="onPickFile">
        </label>
        <template v-if="bossSlug === 'tla'">
          <label>Wind Archer HP (Cream Puff check)
            <input v-model.number="windArcherHp" type="number" min="0" placeholder="From WA gear screen">
          </label>
          <label>Grimoire HP %
            <input v-model.number="grimoireHp" type="number" min="0" step="0.1">
          </label>
        </template>
        <button type="button" class="primary-btn" :disabled="pending" @click="analyze">
          {{ pending ? 'Analyzing…' : 'Analyze gear' }}
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="previewUrl" class="result-grid">
        <div class="preview-col">
          <img ref="imageRef" :src="previewUrl" alt="Gear screenshot" class="hidden-source" @load="paintOverlay">
          <canvas ref="canvasRef" class="annotated-canvas" />
          <button v-if="result" type="button" class="secondary-btn" @click="saveAnnotated">Download annotated PNG</button>
        </div>

        <div v-if="result" class="checklist">
          <h2>
            {{ result.matchedShort || 'Unknown cookie' }}
            <span v-if="result.cookieName" class="muted">({{ result.cookieName }})</span>
          </h2>
          <p v-if="result.vision.statsTab" class="muted">Tab: {{ result.vision.statsTab }}</p>
          <ul v-if="result.vision.warnings.length" class="warnings">
            <li v-for="(w, i) in result.vision.warnings" :key="i">{{ w }}</li>
          </ul>
          <table>
            <thead>
              <tr>
                <th>Stat</th>
                <th>Yours</th>
                <th>Target</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in result.comparisons" :key="row.statKey + row.label">
                <td>{{ row.label }}</td>
                <td>{{ row.scannedLabel }}</td>
                <td>{{ row.targetLabel }}</td>
                <td><span class="pill" :class="statusClass(row.status)">{{ row.status }}</span></td>
              </tr>
            </tbody>
          </table>
          <p v-if="result.vision.tartEffect" class="muted">Tart: {{ result.vision.tartEffect }}</p>
          <button v-if="result" type="button" class="secondary-btn" @click="copyFixList">
            {{ copyDone ? 'Copied!' : 'Copy fix list for Discord' }}
          </button>
          <NuxtLink :to="`/guides/${bossSlug}`" class="guide-link">Open full {{ bossSlug.toUpperCase() }} guide →</NuxtLink>
        </div>

        <div v-if="batchResults.length > 1" class="batch-summary">
          <h3>Team batch</h3>
          <ul>
            <li v-for="(r, i) in batchResults" :key="i">
              {{ r.matchedShort || r.cookieName }} —
              {{ r.comparisons.filter(c => c.status === 'met').length }}/{{ r.comparisons.length }} met
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.compact-hero {
  padding-bottom: 1rem;
}

.hub-hero {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 0;
}

.tool-panel {
  max-width: 1100px;
  margin: 0 auto 4rem;
  padding: 0 1.25rem;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
  margin-bottom: 1.5rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #cbd5e1;
}

select,
input[type='file'] {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f8fafc;
}

.primary-btn,
.secondary-btn {
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  background: linear-gradient(135deg, #facc15, #f59e0b);
  color: #1e293b;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.secondary-btn {
  margin-top: 0.75rem;
  background: #334155;
  color: #f8fafc;
}

.error {
  color: #fca5a5;
  margin-bottom: 1rem;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
}

.hidden-source {
  display: none;
}

.annotated-canvas {
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 1px solid #334155;
  background: #020617;
}

.checklist {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
}

.checklist h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.muted {
  color: #94a3b8;
  font-size: 0.9rem;
}

.warnings {
  color: #fcd34d;
  font-size: 0.85rem;
  padding-left: 1.2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}

th,
td {
  text-align: left;
  padding: 0.45rem 0.35rem;
  border-bottom: 1px solid #334155;
}

.pill {
  font-size: 0.75rem;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-weight: 700;
}

.status-met {
  background: #166534;
  color: #bbf7d0;
}

.status-close {
  background: #854d0e;
  color: #fef08a;
}

.status-low,
.status-high,
.status-missing {
  background: #991b1b;
  color: #fecaca;
}

.status-info {
  background: #475569;
  color: #e2e8f0;
}

.guide-link {
  color: #facc15;
  text-decoration: none;
  font-weight: 600;
}

.nav-link.active {
  color: #facc15;
}
</style>
