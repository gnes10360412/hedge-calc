export const PLATFORMS = {
  'Sureleveragefunding(即時資金)': {
    phases: {
      '真金階段': {
        available: true,
        profitTarget: 9600,
        profitTargetPct: 0.048,
        hedgeRatio: 0.6,
      },
      '真金階段(已出)': {
        available: false,
        profitTarget: 9600,
        profitTargetPct: 0.048,
        hedgeRatio: 0.6,
      },
    },
    examLossLimit: 0.05,
    realLossLimit: 0.0085,
    dailyMaxLoss: 0.04,
    maxDrawdown: 0.08,
    examConsistency: 4.5,
    realConsistency: 4.5,
    adjustments: {
      profitTargetExtra: 0.5,
      dailySLReduce: -0.8,
      tpReduce: 0.3,
      slExtra: 0.3,
    },
    maxSingleProfit: 0,
    minDailyProfitReq: 0,
    positionSizes: [5500, 11000, 27500, 55000, 110000, 220000, 5000, 10000, 25000, 50000, 100000, 200000],
    lotTableIn: {
      '真金階段':      [0.080, 0.160, 0.400, 0.800, 1.600, 3.200, 0.080, 0.160, 0.400, 0.800, 1.600, 3.200],
      '真金階段(已出)': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    lotTableOut: {
      '真金階段':      [0.040, 0.080, 0.210, 0.430, 0.850, 1.740, 0.050, 0.100, 0.250, 0.550, 1.150, 2.350],
      '真金階段(已出)': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  'getleveraged(三階段)': {
    phases: {
      '第一階段': { available: true, profitTarget: 12000, profitTargetPct: 0.06, hedgeRatio: 0.85 },
      '第二階段': { available: true, profitTarget: 16000, profitTargetPct: 0.08, hedgeRatio: 0.85 },
      '第三階段': { available: true, profitTarget: 20000, profitTargetPct: 0.10, hedgeRatio: 0.85 },
      '真金階段': { available: true, profitTarget: 6000, profitTargetPct: 0.03, hedgeRatio: 0.85 },
      '真金階段(已出)': { available: false, profitTarget: 9600, profitTargetPct: 0.048, hedgeRatio: 0.7 },
    },
    examLossLimit: 0.05,
    realLossLimit: 0.04,
    dailyMaxLoss: 0.03,
    maxDrawdown: 0.06,
    examConsistency: 1,
    realConsistency: 1,
    adjustments: {
      profitTargetExtra: 0.5,
      dailySLReduce: -0.5,
      tpReduce: 0.15,
      slExtra: 0.15,
    },
    maxSingleProfit: 0,
    minDailyProfitReq: 0,
    positionSizes: [250000],
    lotTableIn: {
      '第一階段': [4.700],
      '第二階段': [4.700],
      '第三階段': [4.700],
      '真金階段': [4.700],
      '真金階段(已出)': [0],
    },
    lotTableOut: {
      '第一階段': [1.000],
      '第二階段': [1.500],
      '第三階段': [3.600],
      '真金階段': [3.650],
      '真金階段(已出)': [0],
    },
  },
}

export const CONTRACT_MULTIPLIER = {
  '黃金': 100,
  '歐元': 100000,
  '白銀': 5000,
}
