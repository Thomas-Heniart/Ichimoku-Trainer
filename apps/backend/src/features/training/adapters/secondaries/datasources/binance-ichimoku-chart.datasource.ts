import { UTCDate } from '@date-fns/utc'
import { Indicators, WorkingUnit } from '../../../hexagon/models/indicators'
import { IchimokuChartDatasource } from '../../../hexagon/ports/ichimoku-chart.datasource'
import { Interval, Spot } from '@binance/connector-typescript'
import { WorkingUnitData } from '../../../../ichimoku-indicators/hexagon/models/indicators'
import { addDays, addHours, addMinutes, startOfDay, startOfHour } from 'date-fns'
import { ichimokuCloud } from 'indicatorts'

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
            timestamps: timestamps.map((t) => t.valueOf()).slice(periodsRequiredToHaveACompleteCloud - 1),
            candles: {
                open: openings.slice(periodsRequiredToHaveACompleteCloud - 1),
                close: closings.slice(periodsRequiredToHaveACompleteCloud - 1),
                high: highs.slice(periodsRequiredToHaveACompleteCloud - 1),
                low: lows.slice(periodsRequiredToHaveACompleteCloud - 1),
            },
            tenkan: tenkan.slice(periodsRequiredToHaveACompleteCloud - 1),
            kijun: kijun.slice(periodsRequiredToHaveACompleteCloud - 1),
            ssa: ssa.slice(periodsRequiredToHaveACompleteCloud - 1),
            ssb: ssb.slice(periodsRequiredToHaveACompleteCloud - 1),
            lagging: laggingSpan.slice(periodsRequiredToHaveACompleteCloud - 1),
        }
    }
}

const addPeriods: { [interval in Interval]?: (date: UTCDate, qty: number) => UTCDate } = {
    [Interval['1d']]: (date, qty) => addDays(startOfDay(date), qty),
    [Interval['15m']]: (date, qty) => addMinutes(date, 15 * qty),
    [Interval['1h']]: (date, qty) => addHours(startOfHour(date), qty),
}
