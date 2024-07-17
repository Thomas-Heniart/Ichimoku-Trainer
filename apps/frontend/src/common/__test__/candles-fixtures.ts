import { UTCDate } from '@date-fns/utc'
import { Indicators, WorkingUnitData } from '../../features/training/hexagon/models/indicators.model.ts'
import { ichimokuCloud } from 'indicatorts'
import { FIFTEEN_MINUTES_IN_MS, ONE_DAY_IN_MS, ONE_HOUR_IN_MS } from '../../features/training/constants.ts'
import { addMinutes, endOfDay, startOfHour } from 'date-fns'

export const neutralIndicatorsFinishingADay = (lastTimestamp = new UTCDate('2024-01-01')): Indicators => ({
    horizon: neutralMarketCandles(lastTimestamp, ONE_DAY_IN_MS),
    graphical: neutralMarketCandles(startOfHour(endOfDay(lastTimestamp)), ONE_HOUR_IN_MS),
    intervention: neutralMarketCandles(addMinutes(startOfHour(endOfDay(lastTimestamp)), 45), FIFTEEN_MINUTES_IN_MS),
})

export const NEUTRAL_VALUE = 20

export const neutralMarketCandles = (lastCandleTimestamp: UTCDate, intervalInMs: number): WorkingUnitData => {
    const timestamps = new Array<number>(52)
        .fill(lastCandleTimestamp.valueOf())
        .map((timestamp, i) => timestamp - i * intervalInMs)
        .reverse()
    for (let i = 1; i <= 26; i++) timestamps.push(lastCandleTimestamp.valueOf() + i * intervalInMs)
    const open = new Array<number>(52).fill(NEUTRAL_VALUE)
    const close = new Array<number>(52).fill(NEUTRAL_VALUE)
    const high = new Array<number>(52).fill(NEUTRAL_VALUE)
    const low = new Array<number>(52).fill(NEUTRAL_VALUE)
    const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(high, low, close)
    return {
        timestamps,
        candles: {
            open,
            close,
            low,
            high,
        },
        tenkan,
        kijun,
        ssa,
        ssb,
        lagging: laggingSpan,
    }
}
