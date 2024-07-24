import { ichimokuCloud } from 'indicatorts'

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
