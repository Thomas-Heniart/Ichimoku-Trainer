import { CandleGateway } from '../../../hexagon/ports/gateways/candle.gateway.ts'
import { Candle } from '../../../hexagon/models/candle.model.ts'
import axios from 'axios'

export class HttpCandleGateway implements CandleGateway {
    async candleAfter(lastClosedCandleTimestamp: number): Promise<Candle> {
        const response = await axios.get<{ candle: Candle }>('/api/trading-alarms/next-intervention-candle', {
            params: { after: lastClosedCandleTimestamp },
        })
        return response.data.candle
    }
}
