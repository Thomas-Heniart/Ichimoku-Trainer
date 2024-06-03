import { UTCDate } from '@date-fns/utc'
import { IchimokuKlines } from '../models/ichimoku-klines'

export interface IchimokuKlineDatasource {
    retrieveKlines(date: UTCDate): Promise<IchimokuKlines>
}
