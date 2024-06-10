import { UTCDate } from '@date-fns/utc'
import { TradingAlarm } from '../../models/trading-alarm.ts'

export interface TradingAlarmGateway {
    nextAlarmFrom({ from }: { from: UTCDate }): Promise<TradingAlarm | null>
}
