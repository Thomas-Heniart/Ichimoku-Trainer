import { IndicatorsQuery } from '../use-cases/retrieve-indicators/retrieve-indicators'
import { Indicators } from '../models/indicators.model'

export interface IndicatorGateway {
    retrieveIndicators(query: IndicatorsQuery): Promise<Indicators>
}
