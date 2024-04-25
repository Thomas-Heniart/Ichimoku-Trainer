export type IndicatorsQuery = {
    symbol: string
    date: Date
    intervals: Array<TradingInterval>
}
export type TradingInterval = '1wk' | '1d' | '1h' | '15m'
export type TradingTimeUnit = 'ST' | 'MT'
export type Indicators = Record<WorkingUnit, WorkingUnitData>
export type WorkingUnit = 'horizon' | 'graphical' | 'intervention'
export type WorkingUnitData = {
    timestamps: Array<number>
    candles: {
        open: Array<number>
        close: Array<number>
        high: Array<number>
        low: Array<number>
    }
    tenkan: Array<number>
    kijun: Array<number>
    ssa: Array<number>
    ssb: Array<number>
    lagging: Array<number>
}
