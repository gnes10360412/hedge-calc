import { ref, computed, watch } from 'vue'
import { PLATFORMS, CONTRACT_MULTIPLIER } from '../data/platforms.js'

export function useHedgeCalc() {
  const platformName = ref('Sureleveragefunding(即時資金)')
  const phaseName = ref('真金階段')
  const positionSize = ref(200000)
  const instrument = ref('黃金')
  const direction = ref('空')
  const entryPrice = ref(5293.82)
  const balance = ref(200000)
  const dailyPL = ref(0)
  const expectedSLPoints = ref(null)

  const platformNames = Object.keys(PLATFORMS)
  const currentPlatform = computed(() => PLATFORMS[platformName.value])
  const phaseNames = computed(() => Object.keys(currentPlatform.value.phases))

  function onPlatformChange() {
    const p = currentPlatform.value
    phaseName.value = Object.keys(p.phases)[0]
    positionSize.value = p.positionSizes[p.positionSizes.length - 1]
    balance.value = positionSize.value
  }

  function onPositionSizeChange() {
    balance.value = positionSize.value
  }

  function fmt(n, d) {
    if (n == null || isNaN(n)) return '-'
    return n.toFixed(d !== undefined ? d : 5)
  }

  const result = computed(() => {
    const p = currentPlatform.value
    const phase = p.phases[phaseName.value]
    if (!phase) return null

    const posSize = positionSize.value || 0
    const posIdx = p.positionSizes.indexOf(posSize)
    if (posIdx === -1) return null

    const entry = entryPrice.value || 0
    const bal = balance.value || 0
    const dpl = dailyPL.value || 0
    const expSL = expectedSLPoints.value || 0
    const dir = direction.value
    const inst = instrument.value
    const isReal = phaseName.value.includes('真金')

    // 1. Auto-calculate 浮動倍率
    const hedgeRatio = phase.hedgeRatio || 1
    const fRatio = bal < posSize
      ? 1 - (1 - hedgeRatio) * ((posSize - bal) / (posSize * p.maxDrawdown))
      : 1

    // 2. Lot sizes
    const lotIn = (p.lotTableIn[phaseName.value] || [])[posIdx] || 0
    const lotOutBase = (p.lotTableOut[phaseName.value] || [])[posIdx] || 0
    const lotOut = lotOutBase * fRatio

    // 2. Contract multiplier & value per point
    const multiplier = CONTRACT_MULTIPLIER[inst] || 100
    const contractValueIn = lotIn * multiplier
    const contractValueOut = lotOut * multiplier

    // 3. Key parameters
    const singleLossLimit = isReal ? p.realLossLimit : p.examLossLimit
    const consistency = isReal ? p.realConsistency : p.examConsistency
    const dailyMaxLossAmt = posSize * p.dailyMaxLoss
    const maxDrawdownThreshold = posSize * (1 - p.maxDrawdown)
    const singleLossAmt = posSize * singleLossLimit
    const profitTarget = posSize * phase.profitTargetPct

    // 4. Adjustments
    const adj = p.adjustments
    const dailySLReduceAmt = adj.dailySLReduce * contractValueIn

    // 5. TP Amount
    let tpAmt = consistency > 0 ? profitTarget / consistency : profitTarget
    if (p.maxSingleProfit > 0 && tpAmt > p.maxSingleProfit) tpAmt = p.maxSingleProfit

    // 6. SL Amount (3 constraints)
    const constraint1 = singleLossAmt
    const constraint2 = dailyMaxLossAmt - dpl
    const constraint3 = bal - maxDrawdownThreshold
    let bindingConstraint = Math.min(constraint1, constraint2, constraint3)
    if (bindingConstraint < 0) bindingConstraint = 0
    const slAmt = -(bindingConstraint + dailySLReduceAmt)

    // 7. Convert to points
    let tpPoints = 0, slPoints = 0
    if (contractValueIn > 0) {
      tpPoints = tpAmt / contractValueIn
      slPoints = slAmt / contractValueIn
    }

    // 8. Calculate prices
    let tpPrice, slPrice
    if (dir === '多') {
      tpPrice = entry + tpPoints
      slPrice = entry + slPoints
    } else {
      tpPrice = entry - tpPoints
      slPrice = entry - slPoints
    }

    // 9. Hedge (場外)
    const hedgeTpPoints = Math.abs(slPoints) - adj.slExtra
    const hedgeSlPoints = -(Math.abs(tpPoints) + adj.tpReduce)
    let hedgeTpPrice, hedgeSlPrice
    if (dir === '多') {
      hedgeTpPrice = entry - hedgeTpPoints
      hedgeSlPrice = entry - hedgeSlPoints
    } else {
      hedgeTpPrice = entry + hedgeTpPoints
      hedgeSlPrice = entry + hedgeSlPoints
    }

    // 10. Modified (預期止損)
    let modified = null
    if (expSL && expSL !== 0) {
      const absExpSL = Math.abs(expSL)
      const modContractValue = Math.abs(slAmt) / absExpSL
      const modLot = modContractValue / multiplier
      const modTpPoints = tpAmt / modContractValue
      let modTpPrice, modSlPrice
      if (dir === '多') {
        modTpPrice = entry + modTpPoints
        modSlPrice = entry - absExpSL
      } else {
        modTpPrice = entry - modTpPoints
        modSlPrice = entry + absExpSL
      }
      // 修改後場外手數：等比例調整
      const modLotOut = lotIn > 0 ? lotOut * (modLot / lotIn) : lotOut
      const modHedgeTpPoints = absExpSL - adj.slExtra
      const modHedgeSlPoints = -(modTpPoints + adj.tpReduce)
      let modHedgeTpPrice, modHedgeSlPrice
      if (dir === '多') {
        modHedgeTpPrice = entry - modHedgeTpPoints
        modHedgeSlPrice = entry - modHedgeSlPoints
      } else {
        modHedgeTpPrice = entry + modHedgeTpPoints
        modHedgeSlPrice = entry + modHedgeSlPoints
      }
      modified = {
        lot: modLot, tpPoints: modTpPoints, tpPrice: modTpPrice, slPrice: modSlPrice,
        lotOut: modLotOut,
        hedgeTpPoints: modHedgeTpPoints, hedgeSlPoints: modHedgeSlPoints,
        hedgeTpPrice: modHedgeTpPrice, hedgeSlPrice: modHedgeSlPrice,
      }
    }

    // Info note
    const bindingName = (bindingConstraint === constraint1) ? '單次虧損上限' :
      (bindingConstraint === constraint2) ? '每日最大虧損' : '最大虧損限制'

    return {
      lotIn, lotOut, tpAmt, slAmt, tpPoints, slPoints,
      tpPrice, slPrice,
      hedgeTpPoints, hedgeSlPoints, hedgeTpPrice, hedgeSlPrice,
      modified,
      info: {
        multiplier, contractValueIn, contractValueOut,
        singleLossLimit, singleLossAmt,
        dailyMaxLoss: p.dailyMaxLoss, dailyMaxLossAmt,
        maxDrawdown: p.maxDrawdown, maxDrawdownThreshold,
        profitTarget, consistency, bindingName, bindingConstraint,
        floatRatio: fRatio,
      },
    }
  })

  return {
    platformName, phaseName, positionSize, instrument, direction,
    entryPrice, balance, dailyPL, expectedSLPoints,
    platformNames, currentPlatform, phaseNames,
    onPlatformChange, onPositionSizeChange,
    fmt, result,
  }
}
