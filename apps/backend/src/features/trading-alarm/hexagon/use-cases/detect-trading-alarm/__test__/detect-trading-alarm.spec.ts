import { UTCDate } from '@date-fns/utc'
import { isBefore, isEqual } from 'date-fns'
import { detectTradingAlarm } from '../detect-trading-alarm'
import { IchimokuKline, IchimokuKlines } from '../../../models/ichimoku-klines'
import { TradingAlarm, TradingHorizon } from '../../../models/trading-alarm'
import { IchimokuKlineDatasource } from '../../../ports/ichimoku-kline.datasource'

describe('Detect trading alarm', () => {
    let sut: SUT

    beforeEach(() => {
        sut = new SUT()
    })

    const noAlarm = null

    it('detects an alarm from a given date to the past', async () => {
        sut.feedWith([
            arbitraryKline({
                openDate: new UTCDate('2023-01-01'),
                close: 100,
                tenkan: 99,
                kijun: 100,
                ssa: 99,
                ssb: 98,
            }),
            arbitraryKline({
                openDate: new UTCDate('2023-01-02'),
                close: 100,
                tenkan: 101,
                kijun: 100,
                ssa: 99,
                ssb: 98,
            }),
            arbitraryKline({
                openDate: new UTCDate('2023-01-03'),
                close: 100,
                tenkan: 101,
                kijun: 100,
                ssa: 99,
                ssb: 98,
            }),
        ])

        expect(await sut.detectAlarm(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>({
            type: 'ESTABLISHED_TREND',
            side: 'LONG',
            date: new UTCDate('2023-01-02'),
        })
    })

    it('retrieves data based on given trading horizon', async () => {
        sut.feedWith(
            [
                arbitraryKline({
                    openDate: new UTCDate('2023-01-01'),
                    close: 100,
                    tenkan: 99,
                    kijun: 100,
                    ssa: 99,
                    ssb: 98,
                }),
                arbitraryKline({
                    openDate: new UTCDate('2023-01-02'),
                    close: 100,
                    tenkan: 101,
                    kijun: 100,
                    ssa: 99,
                    ssb: 98,
                }),
                arbitraryKline({
                    openDate: new UTCDate('2023-01-03'),
                    close: 100,
                    tenkan: 101,
                    kijun: 100,
                    ssa: 99,
                    ssb: 98,
                }),
            ],
            'MID_TERM',
        )

        expect(await sut.detectAlarm(new UTCDate('2023-01-02'), 'SHORT_TERM')).toEqual<TradingAlarm | null>(null)
    })

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

                expect(await sut.detectAlarm(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(expectedAlarm)
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

                expect(await sut.detectAlarm(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            },
        )

        it.each`
            previous                              | last
            ${{ kijun: 199, ssa: 200, ssb: 100 }} | ${{ kijun: 201, ssa: 200, ssb: 100 }}
            ${{ kijun: 201, ssa: 200, ssb: 100 }} | ${{ kijun: 199, ssa: 200, ssb: 100 }}
            ${{ kijun: 199, ssa: 100, ssb: 200 }} | ${{ kijun: 201, ssa: 100, ssb: 200 }}
            ${{ kijun: 201, ssa: 100, ssb: 200 }} | ${{ kijun: 199, ssa: 100, ssb: 200 }}
        `(
            'kijun must be above the cloud',
            async ({ previous, last }: { previous: Partial<IchimokuKline>; last: Partial<IchimokuKline> }) => {
                const previousKline = arbitraryKline({
                    openDate: new UTCDate('2023-01-01'),
                    kijun: previous.kijun,
                    ssa: previous.ssa,
                    ssb: previous.ssb,
                    close: 210,
                    tenkan: 210 - 1,
                })
                const lastKline = arbitraryKline({
                    openDate: new UTCDate('2023-01-02'),
                    kijun: last.kijun,
                    ssa: last.ssa,
                    ssb: last.ssb,
                    close: 210,
                    tenkan: 210 + 1,
                })
                sut.feedWith([previousKline, lastKline])

                expect(await sut.detectAlarm(new UTCDate('2023-01-02'))).toEqual<TradingAlarm | null>(noAlarm)
            },
        )
    })

    class SUT {
        private readonly _ichimokuKlineDatasource = new StubIchimokuKlineDatasource()
        feedWith(klines: IchimokuKlines, tradingHorizon: TradingHorizon = 'MID_TERM') {
            this._ichimokuKlineDatasource.klines[tradingHorizon] = klines
        }

        async detectAlarm(date: UTCDate, tradingHorizon: TradingHorizon = 'MID_TERM') {
            return detectTradingAlarm({ ichimokuKlineDatasource: this._ichimokuKlineDatasource })({
                date,
                tradingHorizon,
            })
        }
    }
})

class StubIchimokuKlineDatasource implements IchimokuKlineDatasource {
    public klines: Partial<Record<TradingHorizon, IchimokuKlines>> = {}

    async retrieveKlines(date: UTCDate, tradingHorizon: TradingHorizon) {
        return (this.klines[tradingHorizon] || []).filter(
            (k) => isBefore(k.openDate, date) || isEqual(k.openDate, date),
        )
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
