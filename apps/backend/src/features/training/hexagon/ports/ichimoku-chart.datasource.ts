import { UTCDate } from '@date-fns/utc'
import { Indicators } from '../models/indicators'
import { Candle } from '../models/candle'

export interface IchimokuChartDatasource {
    retrieveChartData({ date }: { date: UTCDate }): Promise<Indicators>
    candleAfter({ date }: { date: UTCDate }): Promise<Candle>
}
