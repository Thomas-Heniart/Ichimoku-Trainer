import { Dependencies } from '../../../common/store/reduxStore.ts'
import { HttpTradingAlarmGateway } from '../adapters/secondaries/gateways/http-trading-alarm.gateway.ts'
import { HttpIndicatorGateway } from '../adapters/secondaries/gateways/http-indicator.gateway.ts'
import { randomBTCUSDTDate } from '../adapters/secondaries/random-date.ts'
import { ichimokuCloud } from 'indicatorts'
import { HttpCandleGateway } from '../adapters/secondaries/gateways/http-candle.gateway.ts'

export const trainingDependencies = (): Partial<Dependencies> => ({
    tradingAlarmGateway: new HttpTradingAlarmGateway(),
    randomTrainingStartDate: randomBTCUSDTDate,
    indicatorGateway: new HttpIndicatorGateway(),
    calculateIchimokuIndicators: ({ highs, lows, closings }) => ichimokuCloud(highs, lows, closings),
    candleGateway: new HttpCandleGateway(),
})
