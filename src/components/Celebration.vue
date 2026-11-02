<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  effect: {
    type: String,
    default: 'confetti',
  },
  duration: {
    type: Number,
    default: 2600,
  },
})

const emit = defineEmits(['complete'])
const canvas = ref(null)

const PALETTES = {
  confetti: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#a855f7', '#facc15'],
  stars: ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff', '#fcd34d'],
  hearts: ['#ef4444', '#f43f5e', '#fb7185', '#e879f9', '#ffffff'],
}

let context = null
let particles = []
let rafId = 0
let endTimer = 0
let width = 0
let height = 0

function pickColor(effect) {
  const palette = PALETTES[effect] ?? PALETTES.confetti
  return palette[Math.floor(Math.random() * palette.length)]
}

function resize() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  el.width = Math.floor(width * dpr)
  el.height = Math.floor(height * dpr)
  el.style.width = `${width}px`
  el.style.height = `${height}px`
  context = el.getContext('2d')
  if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function createParticle(effect) {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9
  const speed = 6 + Math.random() * 12
  const maxLife = 90 + Math.random() * 90
  return {
    x: width / 2 + (Math.random() - 0.5) * 90,
    y: height * 0.72,
    vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
    vy: Math.sin(angle) * speed,
    size: 5 + Math.random() * 8,
    color: pickColor(effect),
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.22,
    life: maxLife,
    maxLife,
    shape: effect,
  }
}

function drawStar(size) {
  const spikes = 5
  const outer = size / 1.6
  const inner = outer * 0.45
  context.beginPath()
  for (let index = 0; index < spikes * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner
    const angle = (index * Math.PI) / spikes - Math.PI / 2
    const px = Math.cos(angle) * radius
    const py = Math.sin(angle) * radius
    if (index === 0) context.moveTo(px, py)
    else context.lineTo(px, py)
  }
  context.closePath()
  context.fill()
}

function drawHeart(size) {
  const scale = size / 11
  context.beginPath()
  context.moveTo(0, 3 * scale)
  context.bezierCurveTo(0, 0, -5 * scale, 0, -5 * scale, 3 * scale)
  context.bezierCurveTo(-5 * scale, 6 * scale, 0, 8 * scale, 0, 11 * scale)
  context.bezierCurveTo(0, 8 * scale, 5 * scale, 6 * scale, 5 * scale, 3 * scale)
  context.bezierCurveTo(5 * scale, 0, 0, 0, 0, 3 * scale)
  context.closePath()
  context.fill()
}

function drawParticle(particle) {
  if (!context) return
  context.save()
  context.globalAlpha = Math.max(0, Math.min(1, particle.life / 40))
  context.translate(particle.x, particle.y)
  context.rotate(particle.rotation)
  context.fillStyle = particle.color

  if (particle.shape === 'stars') {
    drawStar(particle.size * 2)
  } else if (particle.shape === 'hearts') {
    drawHeart(particle.size * 1.6)
  } else {
    context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2)
  }

  context.restore()
}

function tick() {
  if (!context) return
  context.clearRect(0, 0, width, height)

  particles.forEach((particle) => {
    particle.vy += 0.18
    particle.vx *= 0.992
    particle.vy *= 0.996
    particle.x += particle.vx
    particle.y += particle.vy
    particle.rotation += particle.vr
    particle.life -= 1
    drawParticle(particle)
  })

  particles = particles.filter((particle) => particle.life > 0)

  if (particles.length > 0) {
    rafId = requestAnimationFrame(tick)
  } else {
    finish()
  }
}

function clearCanvas() {
  if (context) context.clearRect(0, 0, width, height)
}

function stop() {
  cancelAnimationFrame(rafId)
  rafId = 0
  window.clearTimeout(endTimer)
  endTimer = 0
  particles = []
  clearCanvas()
}

function finish() {
  stop()
  emit('complete')
}

function start() {
  stop()
  resize()

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const effect = ['confetti', 'stars', 'hearts'].includes(props.effect) ? props.effect : 'confetti'

  if (reduceMotion) {
    particles = Array.from({ length: 40 }, () => createParticle(effect))
  } else {
    particles = Array.from({ length: 150 }, () => createParticle(effect))
  }

  const duration = reduceMotion ? Math.min(props.duration, 1200) : props.duration
  endTimer = window.setTimeout(finish, duration)
  tick()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nextTick(() => start())
    } else {
      stop()
    }
  },
)

onMounted(() => {
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvas" v-show="visible" class="celebration-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.celebration-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-celebration);
  pointer-events: none;
}
</style>