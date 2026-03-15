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
  const count = 40
  const connectionDist = 160

  for (let i = 0; i < count; i++) {
    const isCyan = Math.random() > 0.3
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 4 + 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: isCyan ? 'rgba(6,182,212,' : 'rgba(251,113,133,',
      isCyan,
      baseAlpha: Math.random() * 0.5 + 0.3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.01 + 0.005,
    })
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)

    // Connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.12
          ctx.beginPath()
          ctx.strokeStyle = a.isCyan && b.isCyan
            ? `rgba(6,182,212,${alpha})`
            : `rgba(255,255,255,${alpha * 0.5})`
          ctx.lineWidth = 0.5
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

      const alpha = p.baseAlpha + Math.sin(p.pulse) * 0.2

      // Glow
      ctx.beginPath()
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
      grd.addColorStop(0, p.color + (alpha * 0.4) + ')')
      grd.addColorStop(1, p.color + '0)')
      ctx.fillStyle = grd
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
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
