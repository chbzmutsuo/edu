// import {StockCl} from 'src/non-common/EsCollection/(stock)/StockCl'
// import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'

// // export const TERMS = {
// //   windowSize: {
// //     label: '過去n日間',
// //     value: 5,
// //   },
// //   thresholdPercent: {
// //     label: '上昇率閾値（%）',
// //     value: 5,
// //   },
// // }

// // const windowSize = TERMS.windowSize.value
// // const thresholdPercent = TERMS.thresholdPercent.value

// export const getBarometerCols: ({config}: {config: Awaited<ReturnType<typeof getStockConfig>>}) => {
//   [key: string]: {
//     id: string
//     label: string
//     description: string
//     func: (stockClThis: StockCl) => boolean
//   }
// } = ({config}) => {
//   const thresholdPercent = config['上昇閾値']
//   const riseWindowSize = config['上昇期間']
//   const crashWindowSize = config['クラッシュ期間']

//   return {
//     josho: {
//       id: 'josho',
//       label: '単純上',
//       description: `前日終値と当日終値の上昇率が${config}%以上か判定`,
//       func(stockClThis) {
//         const risePercent = stockClThis.riseRate
//         return risePercent >= thresholdPercent
//       },
//     },
//     dekidakaJosho: {
//       id: 'dekidakaJosho',
//       label: '急上',
//       description: `終値の上昇率と出来高の増加率が両方とも閾値以上か判定`,
//       func(stockClThis) {
//         const volumeThreshold = 50

//         const priceRise =
//           (((stockClThis.latest?.Close ?? 0) - (stockClThis.previous?.Close ?? 0)) / (stockClThis.previous?.Close ?? 0)) * 100
//         const volumeRise =
//           (((stockClThis.latest?.Volume ?? 0) - (stockClThis.previous?.Volume ?? 0)) / (stockClThis.previous?.Volume ?? 0)) * 100
//         return priceRise >= thresholdPercent && volumeRise >= volumeThreshold
//       },
//     },
//     renzokuJosho: {
//       id: 'renzokuJosho',
//       label: '連続上',
//       description: `過去${riseWindowSize}日間連続で終値が前日より高い場合に検知`,
//       func(stockClThis) {
//         const latest = stockClThis.latest
//         const previous = stockClThis.previous
//         const previousList = stockClThis.PrevListDesc
//         if (previousList.length < riseWindowSize) return false

//         // 最新日の終値が前日より高いか確認
//         if ((latest?.Close ?? 0) <= (previous?.Close ?? 0)) return false

//         // 過去windowSize-1日間で連続して上昇しているか確認
//         for (let i = 0; i < riseWindowSize - 1; i++) {
//           const today = previousList[i]
//           const yeasterDay = previousList[i + 1]

//           if (!yeasterDay?.Close || !today?.Close) continue

//           if ((yeasterDay?.Close ?? 0) > (today?.Close ?? 0)) {
//             return false
//           }
//         }

//         return true
//       },
//     },
//     // takaneBreakout: {
//     //   id: 'takaneBreakout',
//     //   label: '高値ブレイクアウト',
//     //   description: `過去${riseWindowSize}日間の高値を当日高値が上回った場合に検知`,
//     //   func(stockClThis) {
//     //     const latest = stockClThis.latest
//     //     const previousList = stockClThis.PrevListDesc
//     //     if (previousList.length < riseWindowSize) return false
//     //     const maxHigh = Math.max(...previousList.slice(-riseWindowSize).map(d => d.High ?? 0))
//     //     return (latest?.High ?? 0) > maxHigh
//     //   },
//     // },
//     // idoHeikinKairiJosho: {
//     //   id: 'idoHeikinKairiJosho',
//     //   label: '移動平均乖離上昇',
//     //   description: `当日終値が過去${riseWindowSize}日間の終値平均より一定以上上昇した場合に検知`,
//     //   func(stockClThis) {
//     //     const latest = stockClThis.latest
//     //     const previousList = stockClThis.PrevListDesc
//     //     if (previousList.length < riseWindowSize) return false
//     //     const avg = previousList.slice(-riseWindowSize).reduce((sum, d) => sum + (d.Close ?? 0), 0) / riseWindowSize
//     //     const deviation = ((latest?.Close ?? 0) - avg) / avg
//     //     return deviation >= thresholdPercent
//     //   },
//     // },
//     spike: {
//       id: 'spike',
//       label: 'スパイク',
//       description: `当日の値幅（High-Low）が過去${riseWindowSize}日間の平均値幅より大きく拡大した場合に検知`,
//       func(stockClThis) {
//         const latest = stockClThis.latest
//         const previousList = stockClThis.PrevListDesc
//         if (previousList.length < riseWindowSize + 1) return false
//         const avgRange =
//           previousList.slice(-riseWindowSize).reduce((sum, d) => sum + (d.High ?? 0) - (d.Low ?? 0), 0) / riseWindowSize
//         const todayRange = (latest?.High ?? 0) - (latest?.Low ?? 0)
//         return todayRange >= avgRange * thresholdPercent
//       },
//     },
//     // spikeFall: {
//     //   id: 'spikeFall',
//     //   label: 'スパイク下降',
//     //   description: `当日の値幅（High-Low）が過去${riseWindowSize}日間の平均値幅より大きく拡大した場合に検知`,
//     //   func(stockClThis) {
//     //     return stockClThis.spike && stockClThis.josho
//     //   },
//     // },
//     // spikeRise: {
//     //   id: 'spikeRise',
//     //   label: 'スパイク上昇',
//     //   description: `当日の値幅（High-Low）が過去${riseWindowSize}日間の平均値幅より大きく拡大した場合に検知`,
//     //   func(stockClThis) {
//     //     return stockClThis.spike && !stockClThis.josho
//     //   },
//     // },

//     recentCrash: {
//       id: 'recentCrash',
//       label: '暴落',
//       description: `過去${crashWindowSize}日間で一定割合以上の下落があった場合に検知`,
//       func(stockClThis) {
//         const previousList = stockClThis.PrevListDesc
//         if (previousList.length < crashWindowSize) return false

//         const latest = stockClThis.latest
//         if (!latest?.Close) return false

//         // windowSize期間内の最高値を取得
//         const periodHighest = Math.max(...previousList.slice(0, crashWindowSize).map(d => d.Close ?? 0))

//         // 最高値からの下落率を計算
//         const dropRate = ((latest.Close - periodHighest) / periodHighest) * 100

//         // 下落率が閾値以下（より大きな負の値）ならtrue
//         return dropRate <= -Math.abs(thresholdPercent)
//       },
//     },
//   }
// }
