import { IndicatorGateway } from '../../../hexagon/ports/indicator.gateway.ts'
import { Indicators } from '../../../hexagon/models/indicators.model.ts'
import { demoIndicators } from '../../../config/dependencies/demo-indicators.ts'

export class DemoIndicatorGateway implements IndicatorGateway {
    async retrieveIndicators(): Promise<Indicators> {
        return demoIndicators
    }
}
