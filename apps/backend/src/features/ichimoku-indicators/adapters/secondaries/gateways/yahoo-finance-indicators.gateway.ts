import { IndicatorsGateway } from '../../../hexagon/ports/gateways/indicators.gateway'
import { Indicators, IndicatorsQuery, TradingInterval, WorkingUnitData } from '../../../hexagon/models/indicators'
import { addBusinessDays, addDays, endOfDay, startOfDay } from 'date-fns'
import { ChartOptionsWithReturnArray } from 'yahoo-finance2/dist/esm/src/modules/chart'
import yahooFinance from 'yahoo-finance2'
import { ichimokuCloud } from 'indicatorts'

export class YahooFinanceIndicatorsGateway implements IndicatorsGateway {
    async retrieve({ symbol, date, intervals }: IndicatorsQuery): Promise<Indicators> {
        const [horizon, graphical, intervention] = await Promise.all([
            this.ichimokuIndicators({ symbol, date, interval: intervals[0] }),
            this.ichimokuIndicators({ symbol, date, interval: intervals[1] }),
            this.ichimokuIndicators({ symbol, date, interval: intervals[2] }),
        ])
        return { horizon, graphical, intervention }
    }

    private async ichimokuIndicators({
        date,
        symbol,
        interval,
    }: {
        date: Date
        symbol: string
        interval: TradingInterval
    }): Promise<WorkingUnitData> {
        const endDate = endOfDay(addBusinessDays(date, -1))
        const startDate = startOfDay(addDays(endDate, interval === '15m' ? -50 : -365))
        const queryOptions: ChartOptionsWithReturnArray = {
            period1: startDate,
            period2: endDate,
            interval,
        }
        const response = await yahooFinance.chart(symbol, queryOptions)
        const data = response.quotes
        const { timestamps, openings, closings, highs, lows } = data.reduce(
            (acc, current) => ({
                timestamps: [...acc.timestamps, current.date],
                openings: [...acc.openings, current.open],
                closings: [...acc.closings, current.close],
                highs: [...acc.highs, current.high],
                lows: [...acc.lows, current.low],
            }),
            {
                timestamps: [] as Date[],
                openings: [] as number[],
                closings: [] as number[],
                highs: [] as number[],
                lows: [] as number[],
            },
        )
        for (let i = 0; i < 26; i++) timestamps.push(addBusinessDays(timestamps[timestamps.length - 1], 1))
        const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(highs, lows, closings)
        return {
            timestamps: timestamps.map((t) => t.valueOf()),
            candles: {
                open: openings,
                close: closings,
                high: highs,
                low: lows,
            },
            tenkan,
            kijun,
            ssa,
            ssb,
            lagging: laggingSpan,
        }
    }
}
