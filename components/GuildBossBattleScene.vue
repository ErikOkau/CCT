<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import type { SeasonBossDamageVisual } from '~/utils/seasonBossDamageVisual'
import { formatGuildBossDamage } from '~/utils/seasonBossDamageVisual'
import { getHubSlotDisplayBoss, getLatestFlightAndSeason } from '~/utils/seasonConfig'

const props = defineProps<{
  visual: SeasonBossDamageVisual | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

type SceneBundle = {
  dispose: () => void
  setBossTextures: (entries: BossTextureEntry[]) => void
  resize: () => void
}

type BossTextureEntry = {
  slot: 1 | 2 | 3
  url: string | null
  active: boolean
}

const hudBosses = computed(() => {
  if (props.visual?.bosses?.length) {
    return props.visual.bosses
  }
  const flight = props.visual?.flight ?? getLatestFlightAndSeason().flight
  return ([1, 2, 3] as const).map(slot => {
    const display = getHubSlotDisplayBoss(flight, slot)
    return {
      slot,
      status: 'unavailable' as const,
      bossKey: null,
      name: display.name,
      image: display.image,
      totalDamage: null,
      barPercent: 0
    }
  })
})

let sceneApi: SceneBundle | null = null

function syncBossTextures() {
  if (!sceneApi) return
  const entries: BossTextureEntry[] = hudBosses.value.map(b => ({
    slot: b.slot,
    url: b.image,
    active: b.status === 'active'
  }))
  // Always render hub art for benched slots (dimmed in applyBossMaterial).
  sceneApi.setBossTextures(entries)
}

watch(() => props.visual, () => syncBossTextures(), { deep: true })

onMounted(async () => {
  if (!canvasRef.value) return
  sceneApi = await createBattleScene(canvasRef.value)
  syncBossTextures()
})

onUnmounted(() => {
  sceneApi?.dispose()
  sceneApi = null
})

async function createBattleScene(canvas: HTMLCanvasElement): Promise<SceneBundle> {
  const THREE = await import('three')

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x0a0612, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x1a0e28, 0.028)

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120)
  camera.position.set(0, 2.2, 13.5)
  camera.lookAt(0, 3.2, 0)

  const skyTex = makeSkyTexture(THREE)
  scene.background = skyTex

  const ambient = new THREE.AmbientLight(0x6b5b95, 0.55)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xc4b5fd, 0.85)
  key.position.set(-4, 8, 6)
  scene.add(key)

  const rim = new THREE.DirectionalLight(0x22d3ee, 0.35)
  rim.position.set(6, 2, -4)
  scene.add(rim)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 40),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
      metalness: 0.05,
      emissive: 0x0e7490,
      emissiveIntensity: 0.08
    })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.2
  scene.add(ground)

  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x120818,
    roughness: 1,
    metalness: 0
  })
  const mountainSpecs = [
    { x: -14, z: -18, s: 6 },
    { x: -6, z: -22, s: 9 },
    { x: 4, z: -20, s: 7 },
    { x: 12, z: -17, s: 8 },
    { x: 0, z: -24, s: 11 }
  ]
  for (const m of mountainSpecs) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(m.s, m.s * 1.8, 5), mountainMat)
    cone.position.set(m.x, m.s * 0.6, m.z)
    scene.add(cone)
  }

  const mistGroup = new THREE.Group()
  for (let i = 0; i < 8; i++) {
    const mist = new THREE.Mesh(
      new THREE.PlaneGeometry(4 + Math.random() * 3, 1.2),
      new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      })
    )
    mist.rotation.x = -Math.PI / 2
    mist.position.set((Math.random() - 0.5) * 16, 0.05, (Math.random() - 0.5) * 6 - 2)
    mistGroup.add(mist)
  }
  scene.add(mistGroup)

  const slotLayout: Record<1 | 2 | 3, { x: number; y: number; z: number; scale: number }> = {
    1: { x: -8.5, y: 3.1, z: -2.2, scale: 1.18 },
    2: { x: 0, y: 4.35, z: 0.5, scale: 1.52 },
    3: { x: 8.5, y: 3.15, z: -2.2, scale: 1.18 }
  }

  const loader = new THREE.TextureLoader()
  const bossMeshes: Record<1 | 2 | 3, THREE.Mesh> = {} as Record<1 | 2 | 3, THREE.Mesh>
  const bossLights: Record<1 | 2 | 3, THREE.PointLight> = {} as Record<1 | 2 | 3, THREE.PointLight>

  for (const slot of [1, 2, 3] as const) {
    const layout = slotLayout[slot]
    const geo = new THREE.PlaneGeometry(5.2, 5.2)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(layout.x, layout.y, layout.z)
    mesh.scale.setScalar(layout.scale)
    scene.add(mesh)
    bossMeshes[slot] = mesh

    const light = new THREE.PointLight(slot === 2 ? 0xa855f7 : 0x6366f1, 0.6, 14)
    light.position.set(layout.x, layout.y - 1, layout.z + 2)
    scene.add(light)
    bossLights[slot] = light
  }

  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 6.2, 0.35, 32),
    new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x312e81,
      emissiveIntensity: 0.15
    })
  )
  podium.position.set(0, 0.05, 1.2)
  scene.add(podium)

  let raf = 0
  let running = true
  const clock = new THREE.Clock()
  const cameraHome = { x: 0, y: 2.2, z: 13.5 }
  const lookAtHome = { x: 0, y: 3.2, z: 0 }

  const resize = () => {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  const animate = () => {
    if (!running) return
    raf = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    camera.position.set(cameraHome.x, cameraHome.y, cameraHome.z)
    camera.lookAt(lookAtHome.x, lookAtHome.y, lookAtHome.z)

    for (const slot of [1, 2, 3] as const) {
      const mesh = bossMeshes[slot]
      const base = slotLayout[slot]
      mesh.position.y = base.y + Math.sin(t * 0.7 + slot) * 0.08
      mesh.position.x = base.x
      mesh.position.z = base.z
      mesh.lookAt(camera.position)
    }

    mistGroup.children.forEach((child, i) => {
      child.position.x += Math.sin(t * 0.3 + i) * 0.002
      child.position.z += Math.cos(t * 0.25 + i) * 0.002
    })

    renderer.render(scene, camera)
  }
  animate()

  const textureCache = new Map<string, THREE.Texture>()

  function applyBossMaterial(slot: 1 | 2 | 3, url: string | null, active: boolean) {
    const mesh = bossMeshes[slot]
    const mat = mesh.material as THREE.MeshBasicMaterial
    const layout = slotLayout[slot]

    if (!url) {
      mat.map = null
      mat.color.setHex(0x334155)
      mat.opacity = active ? 0.25 : 0.15
      mesh.scale.setScalar(layout.scale * (active ? 1 : 0.92))
      bossLights[slot].intensity = active ? 0.25 : 0.08
      mat.needsUpdate = true
      return
    }

    const load = () => {
      let tex = textureCache.get(url)
      if (!tex) {
        tex = loader.load(url)
        tex.colorSpace = THREE.SRGBColorSpace
        textureCache.set(url, tex)
      }
      mat.map = tex
      mat.color.setHex(active ? 0xffffff : 0x9ca3af)
      mat.opacity = active ? 1 : 0.72
      mesh.scale.setScalar(layout.scale * (active ? 1 : 0.94))
      bossLights[slot].intensity = active ? (slot === 2 ? 0.85 : 0.55) : 0.28
      mat.needsUpdate = true
    }
    load()
  }

  return {
    resize,
    setBossTextures(entries: BossTextureEntry[]) {
      for (const e of entries) {
        applyBossMaterial(e.slot, e.url, e.active)
      }
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      textureCache.forEach(t => t.dispose())
      skyTex.dispose()
      renderer.dispose()
    }
  }
}

function makeSkyTexture(THREE: typeof import('three')) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#1e1033')
  grad.addColorStop(0.35, '#4c1d6e')
  grad.addColorStop(0.62, '#3b0764')
  grad.addColorStop(0.85, '#134e4a')
  grad.addColorStop(1, '#0c1929')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  ctx.globalAlpha = 0.35
  for (let i = 0; i < 6; i++) {
    const g = ctx.createRadialGradient(
      120 + i * 70,
      80 + (i % 3) * 40,
      10,
      120 + i * 70,
      80 + (i % 3) * 40,
      180
    )
    g.addColorStop(0, '#c026d3')
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
</script>

<template>
  <div class="battle-scene" aria-hidden="true">
    <canvas ref="canvasRef" class="battle-canvas" />

    <div class="battle-hud">
      <div class="boss-hud-row">
        <article
          v-for="boss in hudBosses"
          :key="boss.slot"
          class="boss-hud"
          :class="[
            `slot-${boss.slot}`,
            boss.status === 'unavailable' ? 'unavailable' : 'active'
          ]"
        >
          <h3 class="boss-name">{{ boss.name }}</h3>
          <div class="dmg-bar" :class="{ muted: boss.status === 'unavailable' }">
            <div v-if="boss.status === 'active'" class="dmg-fill" />
            <span class="dmg-text">
              {{
                boss.status === 'unavailable'
                  ? 'Not available'
                  : formatGuildBossDamage(boss.totalDamage)
              }}
            </span>
          </div>
          <p v-if="boss.status === 'active'" class="dmg-label">Total DMG Dealt</p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.battle-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.battle-hud {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 1.5rem 2.25rem;
  background:
    linear-gradient(180deg, transparent 45%, rgba(6, 8, 18, 0.55) 78%, rgba(6, 8, 18, 0.82) 100%),
    linear-gradient(90deg, rgba(6, 8, 18, 0.5) 0%, transparent 38%);
  pointer-events: none;
}

.boss-hud-row {
  display: grid;
  grid-template-columns: 1fr 1.12fr 1fr;
  gap: 0.85rem;
  align-items: end;
  width: min(820px, calc(100% - 1rem));
  margin: 0 auto;
  padding-left: clamp(0px, 34vw, 400px);
  box-sizing: border-box;
}

.boss-hud {
  text-align: center;
  padding: 0.65rem 0.75rem 0.75rem;
  border-radius: 14px;
  background: rgba(12, 10, 24, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
}

.boss-hud.slot-2 {
  transform: translateY(-8px);
  border-color: rgba(192, 132, 252, 0.5);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 0 32px rgba(168, 85, 247, 0.18);
}

.boss-hud.unavailable {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.boss-hud.unavailable .boss-name {
  color: rgba(255, 255, 255, 0.72);
}

.boss-name {
  margin: 0 0 0.45rem;
  font-size: clamp(0.65rem, 1.45vw, 0.8rem);
  line-height: 1.3;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
  min-height: 2.35em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dmg-bar {
  position: relative;
  height: 26px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dmg-bar.muted {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.dmg-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #9333ea, #6d28d9 55%, #4c1d95);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.dmg-text {
  position: relative;
  z-index: 1;
  display: block;
  font-size: clamp(0.62rem, 1.5vw, 0.82rem);
  font-weight: 800;
  line-height: 26px;
  color: #fef08a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  padding: 0 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dmg-bar.muted .dmg-text {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
  font-size: 0.62rem;
}

.dmg-label {
  margin: 0.35rem 0 0;
  font-size: 0.62rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
}

@media (max-width: 768px) {
  .battle-hud {
    padding-bottom: 1.25rem;
  }

  .boss-hud-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding-left: 0;
  }

  .boss-hud.slot-2 {
    transform: none;
    order: -1;
  }
}
</style>
