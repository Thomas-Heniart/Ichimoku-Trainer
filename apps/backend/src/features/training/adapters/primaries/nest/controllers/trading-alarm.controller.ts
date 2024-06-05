import { Controller, Get, Inject, Query } from '@nestjs/common'
import { NextAlarmFrom } from '../../../../hexagon/use-cases/next-alarm/next-alarm-from'

import { NEXT_ALARM_FROM_TOKEN } from '../next-alarm.provider'
import { UTCDate } from '@date-fns/utc'
import { fromUnixTime } from 'date-fns'

@Controller('/trading-alarms')
export class TradingAlarmController {
    constructor(@Inject(NEXT_ALARM_FROM_TOKEN) private _nextAlarmFrom: NextAlarmFrom) {}

    @Get('/from')
    async from(@Query('date') date: number) {
        const from = new UTCDate(fromUnixTime(date / 1000))
        return await this._nextAlarmFrom({ from, tradingHorizon: 'SHORT_TERM' })
    }
}
