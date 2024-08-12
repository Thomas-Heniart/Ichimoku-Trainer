import { ichimokuCloud } from 'indicatorts'
import { addMinutes, endOfMinute } from 'date-fns'
import { UTCDate } from '@date-fns/utc'

export type Indicators = {
    timestamps: Array<number>
    candles: {
        open: Array<number>
        high: Array<number>
        low: Array<number>
        close: Array<number>
    }
    tenkan: Array<number>
    kijun: Array<number>
    ssa: Array<number>
    ssb: Array<number>
    lagging: Array<number>
}

export type AllIndicators = Record<WorkingUnit, Indicators>

export type WorkingUnit = 'horizon' | 'graphical' | 'intervention'

export const updateIchimokuIndicators = (indicators: Indicators) => {
    const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(
        indicators.candles.high,
        indicators.candles.low,
        indicators.candles.close,
    )
    indicators.tenkan = tenkan
    indicators.kijun = kijun
    indicators.ssa = ssa
    indicators.ssb = ssb
    indicators.lagging = laggingSpan
}

export const lastCandleTimestamp = (indicators: Indicators) =>
    indicators.timestamps[indicators.candles.close.length - 1]

export const lastClosingPrice = (indicators: Indicators) =>
    indicators.candles.close[indicators.candles.close.length - 1]

export const endOfInterventionCandleTimestamp = (indicators: Indicators) =>
    endOfInterventionTimestamp(new UTCDate(lastCandleTimestamp(indicators)))

export const endOfInterventionTimestamp = (timestamp: UTCDate) => endOfMinute(addMinutes(timestamp, 14)).valueOf()
