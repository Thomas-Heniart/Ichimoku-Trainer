import { UTCDate } from '@date-fns/utc'
import { AllIndicators } from '../../../hexagon/models/indicators.model.ts'
import { IndicatorGateway } from '../../../hexagon/ports/gateways/indicator.gateway.ts'
import axios from 'axios'

export class HttpIndicatorGateway implements IndicatorGateway {
    async retrieveIndicators(date: UTCDate): Promise<AllIndicators> {
        const response = await axios.get<RetrieveIndicatorsResponse>('/api/trading-alarms/chart-data', {
            params: { date: date.valueOf() },
        })
        return response.data.chartData
    }
}

type RetrieveIndicatorsResponse = {
    chartData: AllIndicators
}
