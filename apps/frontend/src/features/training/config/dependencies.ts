import { Dependencies } from '../../../common/store/reduxStore.ts'
import { HttpTradingAlarmGateway } from '../adapters/secondaries/gateways/http-trading-alarm.gateway.ts'
import { HttpIndicatorGateway } from '../adapters/secondaries/gateways/http-indicator.gateway.ts'
import { randomBTCUSDTDate } from '../adapters/secondaries/random-date.ts'
import { HttpCandleGateway } from '../adapters/secondaries/gateways/http-candle.gateway.ts'

export const trainingDependencies = (): Partial<Dependencies> => ({
    tradingAlarmGateway: new HttpTradingAlarmGateway(),
    randomTrainingStartDate: randomBTCUSDTDate,
    indicatorGateway: new HttpIndicatorGateway(),
    candleGateway: new HttpCandleGateway(),
})
