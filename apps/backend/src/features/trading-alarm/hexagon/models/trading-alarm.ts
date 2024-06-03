import { UTCDate } from '@date-fns/utc'

export type TradingAlarm = {
    date: UTCDate
    type: TradingAlarmType
    side: TradingSide
}
export type TradingAlarmType = 'ESTABLISHED_TREND'
export type TradingSide = 'LONG' | 'SHORT'
