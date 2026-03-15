<template>
  <div class="container">
    <h1>對沖計算器</h1>

    <!-- 基本設定 -->
    <div class="card hud-corners">
      <span class="corner-bl"></span><span class="corner-br"></span>
      <h2><i class="fa-solid fa-gear"></i> 基本設定</h2>
      <div class="grid">
        <div class="field">
          <label>平台</label>
          <select v-model="platformName" @change="onPlatformChange">
            <option v-for="name in platformNames" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div class="field">
          <label>場內倉位</label>
          <select v-model.number="positionSize" @change="onPositionSizeChange">
            <option v-for="s in currentPlatform.positionSizes" :key="s" :value="s">{{ s.toLocaleString() }}</option>
          </select>
        </div>
        <div class="field">
          <label>階段</label>
          <select v-model="phaseName">
            <option v-for="name in phaseNames" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div class="field">
          <label>標的</label>
          <select v-model="instrument">
            <option value="黃金">黃金 (Gold)</option>
            <option value="歐元">歐元 (EUR)</option>
            <option value="白銀">白銀 (Silver)</option>
          </select>
        </div>
        <div class="field">
          <label>場內餘額</label>
          <input type="number" v-model.number="balance" step="1">
        </div>
        <div class="field">
          <label>每日獲利/虧損數值 (預設0)</label>
          <input type="number" v-model.number="dailyPL" step="0.01">
        </div>
        <div class="field">
          <label>場內多空</label>
          <select v-model="direction">
            <option value="多">多 (Long)</option>
            <option value="空">空 (Short)</option>
          </select>
        </div>
        <div class="field">
          <label>場內進場點位</label>
          <input type="number" v-model.number="entryPrice" step="0.01">
        </div>
      </div>
    </div>

    <!-- 進階設定 -->
    <div class="card hud-corners">
      <span class="corner-bl"></span><span class="corner-br"></span>
      <h2><i class="fa-solid fa-sliders"></i> 進階設定（選填）</h2>
      <div class="grid">
        <div class="field">
          <label>預期止損點數（可改，要加負號）</label>
          <input type="number" v-model.number="expectedSLPoints" placeholder="例: -14" step="0.01">
        </div>
      </div>
    </div>

    <!-- 警告通知 -->
    <div v-if="result && result.warnings.length" class="warnings">
      <div v-for="(w, i) in result.warnings" :key="i" class="warning-box">
        {{ w }}
      </div>
    </div>

    <!-- 計算結果 -->
    <div class="card hud-corners" v-if="result">
      <span class="corner-bl"></span><span class="corner-br"></span>
      <h2><i class="fa-solid fa-chart-line"></i> 計算結果</h2>

      <!-- 有填進階設定時，只顯示修改後的版本 -->
      <template v-if="result.modified">
        <ResultSection
          title="場內（依預期止損點數）"
          lotLabel="場內手數"
          tpLabel="場內止盈"
          slLabel="場內止損"
          :lot="result.modified.lot"
          :tpAmt="result.tpAmt"
          :slAmt="result.slAmt"
          :tpPoints="result.modified.tpPoints"
          :slPoints="expectedSLPoints"
          :tpPrice="result.modified.tpPrice"
          :slPrice="result.modified.slPrice"
          :showAmounts="true"
          :fmt="fmt"
        />

        <ResultSection
          title="場外（對沖）"
          lotLabel="場外手數"
          tpLabel="場外止盈"
          slLabel="場外止損"
          :lot="result.modified.lotOut"
          :tpPoints="result.modified.hedgeTpPoints"
          :slPoints="result.modified.hedgeSlPoints"
          :tpPrice="result.modified.hedgeTpPrice"
          :slPrice="result.modified.hedgeSlPrice"
          :fmt="fmt"
        />
      </template>

      <!-- 沒填進階設定時，顯示原始版本 -->
      <template v-else>
        <ResultSection
          title="場內"
          lotLabel="場內手數"
          tpLabel="場內止盈"
          slLabel="場內止損"
          :lot="result.lotIn"
          :tpAmt="result.tpAmt"
          :slAmt="result.slAmt"
          :tpPoints="result.tpPoints"
          :slPoints="result.slPoints"
          :tpPrice="result.tpPrice"
          :slPrice="result.slPrice"
          :showAmounts="true"
          :fmt="fmt"
        />

        <ResultSection
          title="場外（對沖）"
          lotLabel="場外手數"
          tpLabel="場外止盈"
          slLabel="場外止損"
          :lot="result.lotOut"
          :tpPoints="result.hedgeTpPoints"
          :slPoints="result.hedgeSlPoints"
          :tpPrice="result.hedgeTpPrice"
          :slPrice="result.hedgeSlPrice"
          :fmt="fmt"
        />
      </template>

      <!-- Info note -->
      <div class="note">
        <b><i class="fa-solid fa-circle-info"></i> 參數資訊</b>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">標的乘數</div>
            <div class="info-value">{{ result.info.multiplier }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">標的數值 (場內)</div>
            <div class="info-value">{{ fmt(result.info.contractValueIn, 2) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">標的數值 (場外)</div>
            <div class="info-value">{{ fmt(result.info.contractValueOut, 2) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">單次虧損上限</div>
            <div class="info-value">{{ (result.info.singleLossLimit * 100).toFixed(2) }}% = {{ fmt(result.info.singleLossAmt, 2) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">每日最大虧損</div>
            <div class="info-value">{{ (result.info.dailyMaxLoss * 100) }}% = {{ fmt(result.info.dailyMaxLossAmt, 2) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">最大虧損門檻</div>
            <div class="info-value">{{ (result.info.maxDrawdown * 100) }}% → {{ fmt(result.info.maxDrawdownThreshold, 2) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">獲利目標</div>
            <div class="info-value">{{ result.info.profitTarget }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">獲利一致性次數</div>
            <div class="info-value">{{ result.info.consistency }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">浮動倍率</div>
            <div class="info-value">{{ fmt(result.info.floatRatio, 4) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">止損約束</div>
            <div class="info-value">{{ result.info.bindingName }} ({{ fmt(result.info.bindingConstraint, 2) }})</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ResultSection from './ResultSection.vue'
import { useHedgeCalc } from '../composables/useHedgeCalc.js'

const {
  platformName, phaseName, positionSize, instrument, direction,
  entryPrice, balance, dailyPL, expectedSLPoints,
  platformNames, currentPlatform, phaseNames,
  onPlatformChange, onPositionSizeChange,
  fmt, result,
} = useHedgeCalc()
</script>
