<template>
  <span class="animated-num" :class="{ flash: isFlashing }">{{ display }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  decimals: { type: Number, default: 2 },
  duration: { type: Number, default: 400 },
})

const display = ref('')
const isFlashing = ref(false)
let raf = null

function formatNum(v) {
  return v.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  })
}

function animateTo(from, to) {
  if (raf) cancelAnimationFrame(raf)
  const start = performance.now()
  const diff = to - from
  isFlashing.value = true
  setTimeout(() => { isFlashing.value = false }, 500)

  const step = (now) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / props.duration, 1)
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    display.value = formatNum(from + diff * ease)
    if (progress < 1) {
      raf = requestAnimationFrame(step)
    }
  }
  raf = requestAnimationFrame(step)
}

let prev = props.value
onMounted(() => { display.value = formatNum(props.value) })

watch(() => props.value, (newVal) => {
  animateTo(prev, newVal)
  prev = newVal
})
</script>
