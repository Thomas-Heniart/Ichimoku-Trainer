import { UTCDate } from '@date-fns/utc'
import { Indicators } from '../models/indicators'

export interface IchimokuChartDatasource {
    retrieveChartData({ date }: { date: UTCDate }): Promise<Indicators>
}
