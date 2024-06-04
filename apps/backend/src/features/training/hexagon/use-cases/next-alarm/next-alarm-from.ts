import { DetectTradingAlarm } from '../../../../trading-alarm/hexagon/use-cases/detect-trading-alarm/detect-trading-alarm'
import { UTCDate } from '@date-fns/utc'
import { addDays, addHours } from 'date-fns'

import { TradingHorizon } from '../../../../trading-alarm/hexagon/models/trading-alarm'

export const nextAlarmFrom =
    ({ detectAlarm, maxRetries }: { detectAlarm: DetectTradingAlarm; maxRetries: number }) =>
    async ({ from, tradingHorizon }: { from: UTCDate; tradingHorizon: TradingHorizon }) => {
        if (!maxRetries) return null
        return (
            (await detectAlarm({ date: from, tradingHorizon })) ||
            (await nextAlarmFrom({ detectAlarm, maxRetries: maxRetries - 1 })({
                from: nextDate(from, tradingHorizon),
                tradingHorizon,
            }))
        )
    }

const nextDate = (date: UTCDate, tradingHorizon: TradingHorizon) => {
    if (tradingHorizon === 'MID_TERM') return addDays(date, 1)
    return addHours(date, 1)
}
