<template>
  <div class="result-section">
    <div class="result-section-title">{{ title }}</div>
    <div class="result-grid">
      <!-- 左上: 手數 -->
      <div class="result-box">
        <h3>{{ lotLabel }}</h3>
        <div class="value lot">{{ fmt(lot, 2) }}</div>
      </div>
      <!-- 右上: 止盈止損點數與金額 -->
      <div class="result-box">
        <h3>止盈止損點數{{ showAmounts ? '與金額' : '' }}</h3>
        <template v-if="showAmounts">
          <div class="sub">止盈: <span class="tp">{{ fmt(tpAmt, 2) }}</span></div>
          <div class="sub">止損: <span class="sl">{{ fmt(slAmt, 2) }}</span></div>
        </template>
        <div class="sub">止盈點數: <span>{{ fmt(tpPoints, 2) }}</span></div>
        <div class="sub">止損點數: <span>{{ fmt(slPoints, 2) }}</span></div>
      </div>
      <!-- 左下: 止盈 -->
      <div class="result-box">
        <h3>{{ tpLabel }}</h3>
        <div class="value tp">{{ fmt(tpPrice, 2) }}</div>
        <div v-if="showAmounts" class="sub">金額: {{ fmt(tpAmt, 2) }} / 點數: {{ fmt(tpPoints, 2) }}</div>
      </div>
      <!-- 右下: 止損 -->
      <div class="result-box">
        <h3>{{ slLabel }}</h3>
        <div class="value sl">{{ fmt(slPrice, 2) }}</div>
        <div v-if="showAmounts" class="sub">金額: {{ fmt(slAmt, 2) }} / 點數: {{ fmt(slPoints, 2) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
