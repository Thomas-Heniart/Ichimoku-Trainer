import { UTCDate } from '@date-fns/utc'
import { IchimokuKlines } from '../models/ichimoku-klines'
import { TradingHorizon } from '../models/trading-alarm'

export interface IchimokuKlineDatasource {
    retrieveKlines(date: UTCDate, tradingHorizon: TradingHorizon): Promise<IchimokuKlines>
}
