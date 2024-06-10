import { IndicatorsQuery } from '../use-cases/retrieve-indicators/retrieve-indicators.ts'
import { Indicators } from '../models/indicators.model.ts'

export interface IndicatorGateway {
    retrieveIndicators(query: IndicatorsQuery): Promise<Indicators>
}
