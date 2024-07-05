import { Candle } from '../../models/candle.model.ts'

export interface CandleGateway {
    candleAfter(lastClosedCandleTimestamp: number): Promise<Candle>
}
