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

  for (let i = 0; i < count; i++) {
    const rand = Math.random()
    const isCyan = rand > 0.25
    const isGold = !isCyan && rand > 0.1
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 3.5 + 1.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: isCyan ? 'rgba(6,182,212,' : isGold ? 'rgba(251,191,36,' : 'rgba(251,113,133,',
      isCyan,
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
          ctx.strokeStyle = a.isCyan && b.isCyan
            ? `rgba(6,182,212,${alpha})`
            : `rgba(255,255,255,${alpha * 0.4})`
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
