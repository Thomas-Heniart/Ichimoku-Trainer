import { UTCDate } from '@date-fns/utc'

export type TradingAlarm = {
    date: UTCDate
    type: TradingAlarmType
    side: TradingSide
}
export type TradingAlarmType = 'ESTABLISHED_TREND'
export type TradingSide = 'LONG' | 'SHORT'
export type TradingHorizon = 'SHORT_TERM' | 'MID_TERM'
