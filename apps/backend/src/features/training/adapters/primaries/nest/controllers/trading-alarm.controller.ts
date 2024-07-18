import { Controller, Get, Inject, Query } from '@nestjs/common'
import { NextAlarmFrom } from '../../../../hexagon/use-cases/next-alarm/next-alarm-from'

import { NEXT_ALARM_FROM_TOKEN } from '../../../../config/nest/next-alarm.provider'
import { UTCDate } from '@date-fns/utc'
import { ICHIMOKU_CHART_DATASOURCE_TOKEN } from '../../../../config/nest/ichimoku-chart-datasource.provider'
import { IchimokuChartDatasource } from '../../../../hexagon/ports/ichimoku-chart.datasource'
import { fromUnixTime } from 'date-fns'

@Controller('/trading-alarms')
export class TradingAlarmController {
    constructor(
        @Inject(NEXT_ALARM_FROM_TOKEN) private readonly _nextAlarmFrom: NextAlarmFrom,
        @Inject(ICHIMOKU_CHART_DATASOURCE_TOKEN) private readonly _ichimokuChartDatasource: IchimokuChartDatasource,
    ) {}

    @Get('/from')
    async from(@Query('date') dateInMs: number) {
        const from = new UTCDate(fromUnixTime(dateInMs / 1000))
        const alarm = await this._nextAlarmFrom({ from, tradingHorizon: 'SHORT_TERM' })
        return {
            alarm,
        }
    }

    @Get('/chart-data')
    async retrieveChartData(@Query('date') dateInMs: number) {
        const date = new UTCDate(fromUnixTime(dateInMs / 1000))
        const chartData = await this._ichimokuChartDatasource.retrieveChartData({ graphicalDate: date })
        return {
            chartData,
        }
    }

    @Get('/next-intervention-candle')
    async retrieveNexInterventionCandle(@Query('after') dateInMs: number) {
        const date = new UTCDate(fromUnixTime(dateInMs / 1000))
        const candle = await this._ichimokuChartDatasource.candleAfter({ date })
        return {
            candle,
        }
    }
}
