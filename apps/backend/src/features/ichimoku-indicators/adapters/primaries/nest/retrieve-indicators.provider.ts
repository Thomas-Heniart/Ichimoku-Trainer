import { Provider } from '@nestjs/common'
import { retrieveIndicators } from '../../../hexagon/use-cases/retrieve-ichimoku-indicators/retrieve-indicators'
import { YahooFinanceIndicatorsGateway } from '../../secondaries/gateways/yahoo-finance-indicators.gateway'

export const retrieveIndicatorsProviderToken = 'RETRIEVE_INDICATORS'
export const retrieveIndicatorsProvider: Provider = {
    provide: retrieveIndicatorsProviderToken,
    useValue: retrieveIndicators({ indicatorsGateway: new YahooFinanceIndicatorsGateway() }),
}
