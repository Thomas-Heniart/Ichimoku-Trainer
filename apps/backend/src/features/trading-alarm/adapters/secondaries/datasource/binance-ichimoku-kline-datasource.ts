import { IchimokuKlineDatasource } from '../../../hexagon/ports/ichimoku-kline.datasource'
import { UTCDate } from '@date-fns/utc'
import { TradingHorizon } from '../../../hexagon/models/trading-alarm'
import { IchimokuKline, IchimokuKlines } from '../../../hexagon/models/ichimoku-klines'
import { Interval, Spot } from '@binance/connector-typescript'
import { ichimokuCloud } from 'indicatorts'

export class BinanceIchimokuKlineDatasource implements IchimokuKlineDatasource {
    constructor(private readonly _client: Spot) {}
    async retrieveKlines(date: UTCDate, tradingHorizon: TradingHorizon): Promise<IchimokuKlines> {
        const response = await this._client.klineCandlestickData('BTCUSDT', toInterval(tradingHorizon), {
            endTime: date.valueOf(),
            limit: 104,
        })
        const openTimes: Array<UTCDate> = response.map((k) => new UTCDate(k[0]))
        const opens = response.map((k) => k[1] as number)
        const highs = response.map((k) => k[2] as number)
        const lows = response.map((k) => k[3] as number)
        const closes = response.map((k) => k[4] as number)
        const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(highs, lows, closes)
        return openTimes.map<IchimokuKline>((openDate, i) => ({
            openDate,
            open: opens[i],
            high: highs[i],
            low: lows[i],
            close: closes[i],
            tenkan: tenkan[i],
            kijun: kijun[i],
            ssa: ssa[i],
            ssb: ssb[i],
            lagging: laggingSpan[i],
        }))
    }
}

const toInterval = (tradingHorizon: TradingHorizon): Interval => {
    if (tradingHorizon === 'MID_TERM') return Interval['1d']
    return Interval['1h']
}
