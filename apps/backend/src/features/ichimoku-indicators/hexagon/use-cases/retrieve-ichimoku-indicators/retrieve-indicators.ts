import { IndicatorsGateway } from '../../ports/gateways/indicators.gateway'
import { TradingInterval, TradingTimeUnit } from '../../models/indicators'

const timeUnitIntervals: Record<TradingTimeUnit, Array<TradingInterval>> = {
    ST: ['1d', '1h', '15m'],
    MT: ['1wk', '1d', '1h'],
}

export const retrieveIndicators =
    ({ indicatorsGateway }: { indicatorsGateway: IndicatorsGateway }) =>
    async ({ symbol, date, timeUnit }: RetrieveIndicatorsCommand) =>
        indicatorsGateway.retrieve({ symbol, date, intervals: timeUnitIntervals[timeUnit] })
export type RetrieveIndicatorsCommand = {
    symbol: string
    date: Date
    timeUnit: TradingTimeUnit
}

export type RetrieveIndicatorsUseCase = ReturnType<typeof retrieveIndicators>
