import { UTCDate } from '@date-fns/utc'
import { Indicators, WorkingUnit, WorkingUnitData } from '../../../hexagon/models/indicators'
import { IchimokuChartDatasource } from '../../../hexagon/ports/ichimoku-chart.datasource'
import { Interval, Spot } from '@binance/connector-typescript'
import { addDays, addHours, addMinutes, startOfDay, startOfHour } from 'date-fns'
import { ichimokuCloud } from 'indicatorts'
import { Candle } from '../../../hexagon/models/candle'

const symbol = 'BTCUSDT'
const intervals: Record<WorkingUnit, Interval> = {
    intervention: Interval['15m'],
    graphical: Interval['1h'],
    horizon: Interval['1d'],
}

const periodsRequiredToHaveACompleteCloud = 52

export class BinanceIchimokuChartDatasource implements IchimokuChartDatasource {
    constructor(private readonly _client: Spot) {}

    async retrieveChartData({ date }: { date: UTCDate }): Promise<Indicators> {
        const [horizon, graphical, intervention] = await Promise.all([
            this.ichimokuIndicators({ date, interval: intervals.horizon }),
            this.ichimokuIndicators({ date, interval: intervals.graphical }),
            this.ichimokuIndicators({ date, interval: intervals.intervention }),
        ])
        return { horizon, graphical, intervention }
    }

    async candleAfter({ date }: { date: UTCDate }): Promise<Candle> {
        const [kline] = await this._client.klineCandlestickData(symbol, Interval['15m'], {
            startTime: date.valueOf() + 1,
            limit: 1,
        })
        return {
            openTime: parseFloat(kline[0] as string),
            open: parseFloat(kline[1] as string),
            high: parseFloat(kline[2] as string),
            low: parseFloat(kline[3] as string),
            close: parseFloat(kline[4] as string),
        }
    }

    private async ichimokuIndicators({
        date,
        interval,
    }: {
        date: UTCDate
        interval: Interval
    }): Promise<WorkingUnitData> {
        const startDate = addPeriods[interval](date, -periodsRequiredToHaveACompleteCloud * 3)
        const binanceKlines = await this._client.klineCandlestickData(symbol, interval, {
            startTime: startDate.valueOf(),
            endTime: date.valueOf(),
        })

        const { timestamps, openings, closings, highs, lows } = binanceKlines.reduce(
            (acc, current) => ({
                timestamps: [...acc.timestamps, new UTCDate(current[0])],
                openings: [...acc.openings, parseFloat(current[1] as string)],
                highs: [...acc.highs, parseFloat(current[2] as string)],
                lows: [...acc.lows, parseFloat(current[3] as string)],
                closings: [...acc.closings, parseFloat(current[4] as string)],
            }),
            {
                timestamps: [] as UTCDate[],
                openings: [] as number[],
                highs: [] as number[],
                lows: [] as number[],
                closings: [] as number[],
            },
        )
        for (let i = 0; i < 26; i++) timestamps.push(addPeriods[interval](timestamps[timestamps.length - 1], 1))
        const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(highs, lows, closings)
        return {
            timestamps: timestamps.map((t) => t.valueOf()),
            candles: {
                open: openings,
                close: closings,
                high: highs,
                low: lows,
            },
            tenkan: tenkan,
            kijun: kijun,
            ssa: ssa,
            ssb: ssb,
            lagging: laggingSpan,
        }
    }
}

const addPeriods: { [interval in Interval]?: (date: UTCDate, qty: number) => UTCDate } = {
    [Interval['1d']]: (date, qty) => addDays(startOfDay(date), qty),
    [Interval['15m']]: (date, qty) => addMinutes(date, 15 * qty),
    [Interval['1h']]: (date, qty) => addHours(startOfHour(date), qty),
}
