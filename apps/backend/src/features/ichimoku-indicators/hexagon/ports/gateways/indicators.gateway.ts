import { Indicators, IndicatorsQuery } from '../../models/indicators'

export interface IndicatorsGateway {
    retrieve(query: IndicatorsQuery): Promise<Indicators>
}
