import { UTCDate } from '@date-fns/utc'

describe('Alarm detector', () => {
    let sut: SUT

    beforeEach(() => {
        sut = new SUT()
    })

    const noAlarm = null

    describe('LONG side ESTABLISHED_TREND', () => {
        const longAlarm: TradingAlarm = {
            type: 'ESTABLISHED_TREND',
            side: 'LONG',
            date: new UTCDate('2023-01-02'),
        }

        it.each`
            previousClose | previousTenkan | lastClose | lastTenkan | expectedAlarm
            ${100}        | ${99}          | ${100}    | ${101}     | ${longAlarm}
            ${100}        | ${99}          | ${100}    | ${100}     | ${noAlarm}
        `(
            'tenkan has to break close price',
            async ({
                previousClose,
                previousTenkan,
                lastClose,
                lastTenkan,
                expectedAlarm,
            }: {
                previousClose: number
                previousTenkan: number
                lastClose: number
                lastTenkan: number
                expectedAlarm: TradingAlarm | null
            }) => {
                sut.feedWith([
                    arbitraryKline({
                        openDate: new UTCDate('2023-01-01'),
                        close: previousClose,
                        tenkan: previousTenkan,
                        kijun: 100,
                        ssa: 99,
                        ssb: 98,
                    }),
                    arbitraryKline({
                        openDate: new UTCDate('2023-01-02'),
                        close: lastClose,
                        tenkan: lastTenkan,
                        kijun: 100,
                        ssa: 99,
                        ssb: 98,
                    }),
                ])

                expect(await sut.detectAlarmFrom(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(expectedAlarm)
            },
        )

        it.each`
            previous                              | last
            ${{ close: 199, ssa: 200, ssb: 100 }} | ${{ close: 201, ssa: 200, ssb: 100 }}
            ${{ close: 201, ssa: 200, ssb: 100 }} | ${{ close: 199, ssa: 200, ssb: 100 }}
            ${{ close: 199, ssa: 100, ssb: 200 }} | ${{ close: 201, ssa: 100, ssb: 200 }}
            ${{ close: 201, ssa: 100, ssb: 200 }} | ${{ close: 199, ssa: 100, ssb: 200 }}
        `(
            'close price must be above the cloud',
            async ({ previous, last }: { previous: Partial<IchimokuKline>; last: Partial<IchimokuKline> }) => {
                const previousKline = arbitraryKline({
                    openDate: new UTCDate('2023-01-01'),
                    close: previous.close,
                    ssa: previous.ssa,
                    ssb: previous.ssb,
                    tenkan: previous.close - 1,
                })
                const lastKline = arbitraryKline({
                    openDate: new UTCDate('2023-01-02'),
                    close: last.close,
                    ssa: last.ssa,
                    ssb: last.ssb,
                    tenkan: last.close + 1,
                })
                sut.feedWith([previousKline, lastKline])

                expect(await sut.detectAlarmFrom(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            },
        )

        it('kijun must be above the cloud', async () => {
            const previousKline = ({ kijun, ssa, ssb }: { kijun: number; ssa: number; ssb: number }): IchimokuKline =>
                arbitraryKline({
                    openDate: new UTCDate('2023-01-01'),
                    kijun,
                    ssa,
                    ssb,
                    close: 210,
                    tenkan: 210 - 1,
                })
            const lastKline = ({ kijun, ssa, ssb }: { kijun: number; ssa: number; ssb: number }): IchimokuKline =>
                arbitraryKline({
                    openDate: new UTCDate('2023-01-02'),
                    kijun,
                    ssa,
                    ssb,
                    close: 210,
                    tenkan: 210 + 1,
                })
            {
                sut.feedWith([
                    previousKline({ kijun: 198, ssa: 200, ssb: 100 }),
                    lastKline({
                        kijun: 201,
                        ssa: 200,
                        ssb: 100,
                    }),
                ])

                expect(await sut.detectAlarmFrom(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            }
            {
                sut.feedWith([
                    previousKline({
                        kijun: 201,
                        ssa: 200,
                        ssb: 100,
                    }),
                    lastKline({
                        kijun: 199,
                        ssa: 200,
                        ssb: 100,
                    }),
                ])

                expect(await sut.detectAlarmFrom(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            }
            {
                sut.feedWith([
                    previousKline({
                        kijun: 199,
                        ssa: 100,
                        ssb: 200,
                    }),
                    lastKline({
                        kijun: 201,
                        ssa: 100,
                        ssb: 200,
                    }),
                ])

                expect(await sut.detectAlarmFrom(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            }
            {
                sut.feedWith([
                    previousKline({
                        kijun: 201,
                        ssa: 100,
                        ssb: 200,
                    }),
                    lastKline({
                        kijun: 199,
                        ssa: 100,
                        ssb: 200,
                    }),
                ])

                expect(await sut.detectAlarmFrom(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            }
        })
    })

    class SUT {
        private readonly _ichimokuKlineDatasource = new StubIchimokuKlineDatasource()
        feedWith(klines: IchimokuKlines) {
            this._ichimokuKlineDatasource.klines = klines
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async detectAlarmFrom(from: Date): Promise<TradingAlarm | null> {
            const klines = await this._ichimokuKlineDatasource.retrieveKlines()
            if (!klines.length) return null
            const previous = klines[klines.length - 2]
            const last = klines[klines.length - 1]
            if (isInBullishTrend(previous, last) && isTenkanBreakingClose(previous, last))
                return {
                    type: 'ESTABLISHED_TREND',
                    side: 'LONG',
                    date: klines[klines.length - 1].openDate,
                }
            return null
        }
    }
})

const isTenkanBreakingClose = (previous: IchimokuKline, last: IchimokuKline) =>
    previous.tenkan < last.close && last.close < last.tenkan

const isInBullishTrend = (previous: IchimokuKline, last: IchimokuKline) => {
    const previousCloudTop = cloudTop(previous)
    const lastCloudTop = cloudTop(last)
    return (
        previous.close > previousCloudTop &&
        last.close > lastCloudTop &&
        previous.kijun > previousCloudTop &&
        last.kijun > lastCloudTop
    )
}

const cloudTop = (kline: IchimokuKline) => Math.max(kline.ssa, kline.ssb)

export interface IchimokuKlineDatasource {
    retrieveKlines(): Promise<IchimokuKlines>
}

class StubIchimokuKlineDatasource implements IchimokuKlineDatasource {
    private _klines: IchimokuKlines

    async retrieveKlines() {
        return this._klines
    }

    set klines(value: IchimokuKlines) {
        this._klines = value
    }
}

export const arbitraryKline = (overrides: Partial<IchimokuKline> = {}): IchimokuKline => ({
    openDate: new UTCDate('2000-01-01'),
    open: 0,
    close: 0,
    low: 0,
    high: 0,
    tenkan: 0,
    kijun: 0,
    ssa: 0,
    ssb: 0,
    lagging: 0,
    ...overrides,
})

export type IchimokuKlines = Array<IchimokuKline>

export type IchimokuKline = {
    openDate: UTCDate
    open: number
    close: number
    low: number
    high: number
    tenkan: number
    kijun: number
    ssa: number
    ssb: number
    lagging: number
}

export type TradingAlarm = {
    date: UTCDate
    type: TradingAlarmType
    side: TradingSide
}

export type TradingAlarmType = 'ESTABLISHED_TREND'

export type TradingSide = 'LONG' | 'SHORT'

// describe('Training simulation', () => {
//     it('finds nearest alarm(s) after a given date', async () => {
//         const alarms = await sut.nearestAlarmsFrom({ date: new Date('2023-01-02') })
//
//         expect(alarms.length).toEqual(1)
//         expect(alarms[0]).toEqual({
//             id: 'an-alarm-id',
//             date: new Date('2023-01-02'),
//             type: 'ESTABLISHED_TREND',
//         })
//     })
//
//     it('retrieves alarm display data', async () => {
//         //alarm ticker date and a limit of 102
//     })
//
//     it('next ticker')
//
//     it('opens a position', () => {
//         //Requires date, price and SIDE
//     })
//
//     it('closes a position', () => {
//         //Requires date, price and openedPosition ID
//     })
// })
