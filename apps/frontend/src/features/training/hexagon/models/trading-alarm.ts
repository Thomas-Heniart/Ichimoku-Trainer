type TradingSide = 'LONG' | 'SHORT'
type TradingAlarmType = 'ESTABLISHED_TREND'

export type TradingAlarm = { date: string; type: TradingAlarmType; side: TradingSide }
