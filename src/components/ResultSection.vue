<template>
  <div class="result-section">
    <div class="result-section-title">{{ title }}</div>
    <div class="result-grid">
      <!-- 左上: 手數 -->
      <div class="result-box lot-box anim-box" style="--i:0">
        <h3>{{ lotLabel }}</h3>
        <div class="value lot"><AnimatedNumber :value="lot" :decimals="2" /></div>
      </div>
      <!-- 右上: 止盈止損點數與金額 -->
      <div class="result-box anim-box" style="--i:1">
        <h3>止盈止損點數{{ showAmounts ? '與金額' : '' }}</h3>
        <template v-if="showAmounts">
          <div class="sub"><span class="icon-tp">▲</span> 止盈: <span class="tp">{{ fmt(tpAmt, 2) }}</span></div>
          <div class="sub"><span class="icon-sl">▼</span> 止損: <span class="sl">{{ fmt(slAmt, 2) }}</span></div>
        </template>
        <div class="sub"><span class="icon-tp">▲</span> 止盈點數: <span>{{ fmt(tpPoints, 5) }}</span></div>
        <div class="sub"><span class="icon-sl">▼</span> 止損點數: <span>{{ fmt(slPoints, 5) }}</span></div>
      </div>
      <!-- 左下: 止盈 -->
      <div class="result-box anim-box" style="--i:2">
        <h3><span class="icon-tp">▲</span> {{ tpLabel }}</h3>
        <div class="value tp"><AnimatedNumber :value="tpPrice" :decimals="5" /></div>
        <div v-if="showAmounts" class="sub">金額: {{ fmt(tpAmt, 2) }} / 點數: {{ fmt(tpPoints, 5) }}</div>
      </div>
      <!-- 右下: 止損 -->
      <div class="result-box anim-box" style="--i:3">
        <h3><span class="icon-sl">▼</span> {{ slLabel }}</h3>
        <div class="value sl"><AnimatedNumber :value="slPrice" :decimals="5" /></div>
        <div v-if="showAmounts" class="sub">金額: {{ fmt(slAmt, 2) }} / 點數: {{ fmt(slPoints, 5) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AnimatedNumber from './AnimatedNumber.vue'

defineProps({
  title: String,
  lotLabel: String,
  tpLabel: String,
  slLabel: String,
  lot: Number,
  tpAmt: { type: Number, default: null },
  slAmt: { type: Number, default: null },
  tpPoints: Number,
  slPoints: Number,
  tpPrice: Number,
  slPrice: Number,
  showAmounts: { type: Boolean, default: false },
  fmt: Function,
})
</script>
