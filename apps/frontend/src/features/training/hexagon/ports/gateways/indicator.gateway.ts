import { Indicators } from '../../models/indicators.model.ts'
import { UTCDate } from '@date-fns/utc'

export interface IndicatorGateway {
    retrieveIndicators(date: UTCDate): Promise<Indicators>
}
