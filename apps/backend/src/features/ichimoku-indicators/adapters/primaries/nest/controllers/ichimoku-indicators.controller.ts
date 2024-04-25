import { RetrieveIndicatorsUseCase } from '../../../../hexagon/use-cases/retrieve-ichimoku-indicators/retrieve-indicators'
import { Controller, Get, Inject, Query } from '@nestjs/common'
import { TradingTimeUnit } from '../../../../hexagon/models/indicators'
import { UTCDate } from '@date-fns/utc'

import { retrieveIndicatorsProviderToken } from '../retrieve-indicators.provider'

@Controller()
export class IchimokuIndicatorsController {
    constructor(
        @Inject(retrieveIndicatorsProviderToken) private readonly _retrieveIndicators: RetrieveIndicatorsUseCase,
    ) {}

    @Get('/indicators')
    async indicators(
        @Query('symbol') symbol: string,
        @Query('date') date: string,
        @Query('time-unit') timeUnit: TradingTimeUnit,
    ) {
        return await this._retrieveIndicators({ symbol, date: new UTCDate(date), timeUnit })
    }
}
