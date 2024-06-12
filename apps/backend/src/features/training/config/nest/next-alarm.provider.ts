import { Provider } from '@nestjs/common'
import { DetectTradingAlarm } from '../../../trading-alarm/hexagon/use-cases/detect-trading-alarm/detect-trading-alarm'
import { nextAlarmFrom, NextAlarmFrom } from '../../hexagon/use-cases/next-alarm/next-alarm-from'

import { DETECT_TRADING_ALARM_TOKEN } from '../../../trading-alarm/adapters/primaries/nest/detect-trading-alarm.provider'
import { MAX_RETRIES } from '../constants'

export const NEXT_ALARM_FROM_TOKEN = 'NEXT_ALARM_FROM_TOKEN'

export const nextAlarmFromProvider: Provider = {
    provide: NEXT_ALARM_FROM_TOKEN,
    useFactory: (detectAlarm: DetectTradingAlarm): NextAlarmFrom =>
        nextAlarmFrom({ detectAlarm, maxRetries: MAX_RETRIES }),
    inject: [DETECT_TRADING_ALARM_TOKEN],
}
