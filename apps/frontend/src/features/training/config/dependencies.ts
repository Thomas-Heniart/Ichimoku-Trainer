import { Dependencies } from '../../../common/store/reduxStore.ts'
import { HttpTradingAlarmGateway } from '../adapters/secondaries/gateways/http-trading-alarm.gateway.ts'
import { UTCDate } from '@date-fns/utc'

export const trainingDependencies = (): Partial<Dependencies> => ({
    tradingAlarmGateway: new HttpTradingAlarmGateway(),
    randomTrainingStartDate: () => new UTCDate(1686963600000),
})
