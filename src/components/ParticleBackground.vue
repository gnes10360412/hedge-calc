<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let animationId = null

onMounted(() => {
  const c = canvas.value
  const ctx = c.getContext('2d')
  let w, h

  const resize = () => {
    w = c.width = window.innerWidth
    h = c.height = document.documentElement.scrollHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Create particles
  const particles = []
  const count = 55
  const connectionDist = 200

  // Multi-color palette: cyan, green, gold, pink, purple, orange
  const colors = [
    { rgba: 'rgba(6,182,212,',   group: 'cool' },   // cyan
    { rgba: 'rgba(52,211,153,',  group: 'cool' },   // green (emerald)
    { rgba: 'rgba(129,140,248,', group: 'cool' },   // indigo / purple
    { rgba: 'rgba(251,191,36,',  group: 'warm' },   // gold
    { rgba: 'rgba(251,113,133,', group: 'warm' },   // pink / red
    { rgba: 'rgba(249,115,22,',  group: 'warm' },   // orange
    { rgba: 'rgba(167,139,250,', group: 'cool' },   // violet
  ]

  for (let i = 0; i < count; i++) {
    // Weighted: 40% cyan, 60% spread across others
    const rand = Math.random()
    let colorObj
    if (rand < 0.35) colorObj = colors[0]       // cyan — most common
    else if (rand < 0.50) colorObj = colors[1]   // green
    else if (rand < 0.62) colorObj = colors[2]   // indigo
    else if (rand < 0.74) colorObj = colors[3]   // gold
    else if (rand < 0.82) colorObj = colors[4]   // pink
    else if (rand < 0.90) colorObj = colors[5]   // orange
    else colorObj = colors[6]                     // violet

    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 3.5 + 1.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: colorObj.rgba,
      group: colorObj.group,
      baseAlpha: Math.random() * 0.5 + 0.35,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
    })
  }

  // Data streams (vertical falling lines)
  const streams = []
  const streamCount = 6
  for (let i = 0; i < streamCount; i++) {
    streams.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: Math.random() * 0.8 + 0.3,
      length: Math.random() * 120 + 60,
      alpha: Math.random() * 0.06 + 0.02,
    })
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)

    // Draw data streams (vertical falling lines)
    for (const s of streams) {
      s.y += s.speed
      if (s.y > h + s.length) {
        s.y = -s.length
        s.x = Math.random() * w
      }
      const grd = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length)
      grd.addColorStop(0, `rgba(6,182,212,0)`)
      grd.addColorStop(0.5, `rgba(6,182,212,${s.alpha})`)
      grd.addColorStop(1, `rgba(6,182,212,0)`)
      ctx.beginPath()
      ctx.strokeStyle = grd
      ctx.lineWidth = 1
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x, s.y + s.length)
      ctx.stroke()
    }

    // Connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.16
          ctx.beginPath()
          // Same-group connections use the first particle's color, cross-group uses white
          ctx.strokeStyle = a.group === b.group
            ? a.color + alpha + ')'
            : `rgba(255,255,255,${alpha * 0.35})`
          ctx.lineWidth = 0.6
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.pulse += p.pulseSpeed

      // Wrap around
      if (p.x < -20) p.x = w + 20
      if (p.x > w + 20) p.x = -20
      if (p.y < -20) p.y = h + 20
      if (p.y > h + 20) p.y = -20

      const alpha = p.baseAlpha + Math.sin(p.pulse) * 0.25

      // Glow
      ctx.beginPath()
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7)
      grd.addColorStop(0, p.color + (alpha * 0.5) + ')')
      grd.addColorStop(1, p.color + '0)')
      ctx.fillStyle = grd
      ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2)
      ctx.fill()

      // Core dot
      ctx.beginPath()
      ctx.fillStyle = p.color + alpha + ')'
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    animationId = requestAnimationFrame(draw)
  }

  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })
})
</script>
