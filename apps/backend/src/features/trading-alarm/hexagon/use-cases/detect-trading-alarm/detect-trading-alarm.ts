import { UTCDate } from '@date-fns/utc'
import { IchimokuKline } from '../../models/ichimoku-klines'
import { TradingAlarm, TradingHorizon } from '../../models/trading-alarm'
import { IchimokuKlineDatasource } from '../../ports/ichimoku-kline.datasource'

export const detectTradingAlarm =
    ({ ichimokuKlineDatasource }: { ichimokuKlineDatasource: IchimokuKlineDatasource }) =>
    async ({
        date,
        tradingHorizon,
    }: {
        date: UTCDate
        tradingHorizon: TradingHorizon
    }): Promise<TradingAlarm | null> => {
        const klines = await ichimokuKlineDatasource.retrieveKlines(date, tradingHorizon)
        if (klines.length < 2) return null
        const previous = klines[klines.length - 2]
        const last = klines[klines.length - 1]
        if (isInBullishTrend(previous, last) && isTenkanBreakingClose(previous, last))
            return {
                type: 'ESTABLISHED_TREND',
                side: 'LONG',
                date: klines[klines.length - 1].openDate,
            }
        return null
    }

export type DetectTradingAlarm = ReturnType<typeof detectTradingAlarm>
const isTenkanBreakingClose = (previous: IchimokuKline, last: IchimokuKline) =>
    previous.tenkan < last.close && last.close < last.tenkan
const isInBullishTrend = (previous: IchimokuKline, last: IchimokuKline) => {
    const previousCloudTop = cloudTop(previous)
    const lastCloudTop = cloudTop(last)
    return (
        previous.close > previousCloudTop &&
        last.close > lastCloudTop &&
        previous.kijun > previousCloudTop &&
        last.kijun > lastCloudTop
    )
}
const cloudTop = (kline: IchimokuKline) => Math.max(kline.ssa, kline.ssb)
