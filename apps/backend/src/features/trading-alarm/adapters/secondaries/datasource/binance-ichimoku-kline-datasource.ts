import { IchimokuKlineDatasource } from '../../../hexagon/ports/ichimoku-kline.datasource'
import { UTCDate } from '@date-fns/utc'
import { TradingHorizon } from '../../../hexagon/models/trading-alarm'
import { IchimokuKline, IchimokuKlines } from '../../../hexagon/models/ichimoku-klines'
import { Interval, Spot } from '@binance/connector-typescript'
import { ichimokuCloud } from 'indicatorts'
import { addDays, addHours } from 'date-fns'

export class BinanceIchimokuKlineDatasource implements IchimokuKlineDatasource {
    constructor(
        private readonly _client: Spot,
        private readonly _maxRetries: number,
        private _cachedResponse: BinanceKlines = [],
    ) {}
    async retrieveKlines(date: UTCDate, tradingHorizon: TradingHorizon): Promise<IchimokuKlines> {
        const binanceKlines = await this.retrieveBinanceKlines(date, tradingHorizon)
        const klines = this.klinesForDate(date, binanceKlines)
        const openTimes: Array<UTCDate> = klines.map((k) => new UTCDate(k[0]))
        const opens = klines.map((k) => k[1] as number)
        const highs = klines.map((k) => k[2] as number)
        const lows = klines.map((k) => k[3] as number)
        const closes = klines.map((k) => k[4] as number)
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

    private async retrieveBinanceKlines(date: UTCDate, tradingHorizon: TradingHorizon) {
        if (this._cachedResponse.length) return this._cachedResponse
        const startTime = addPeriods(date, tradingHorizon, -104)
        const endTime = addPeriods(date, tradingHorizon, this._maxRetries)
        const response = await this._client.klineCandlestickData('BTCUSDT', toInterval(tradingHorizon), {
            startTime: startTime.valueOf(),
            endTime: endTime.valueOf(),
        })
        this._cachedResponse = response
        return response
    }

    private klinesForDate(date: UTCDate, binanceKlines: BinanceKlines) {
        const i = binanceKlines.findIndex((b) => (b[0] as number) >= date.valueOf())
        return binanceKlines.slice(0, i)
    }
}

type BinanceKlines = Array<Array<number | string>>

const toInterval = (tradingHorizon: TradingHorizon): Interval => {
    if (tradingHorizon === 'MID_TERM') return Interval['1d']
    return Interval['1h']
}

const addPeriods = (date: UTCDate, tradingHorizon: TradingHorizon, qty: number) => {
    if (tradingHorizon === 'MID_TERM') return addDays(date, qty)
    return addHours(date, qty)
}
