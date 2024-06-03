import { UTCDate } from '@date-fns/utc'
import { isBefore, isEqual } from 'date-fns'
import { detectTradingAlarm } from '../detect-trading-alarm'
import { IchimokuKline, IchimokuKlines } from '../../../models/ichimoku-klines'
import { TradingAlarm } from '../../../models/trading-alarm'
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
        feedWith(klines: IchimokuKlines) {
            this._ichimokuKlineDatasource.klines = klines
        }

        async detectAlarm(date: UTCDate) {
            return detectTradingAlarm({ ichimokuKlineDatasource: this._ichimokuKlineDatasource })({ date })
        }
    }
})

class StubIchimokuKlineDatasource implements IchimokuKlineDatasource {
    private _klines: IchimokuKlines

    async retrieveKlines(date: UTCDate) {
        return this._klines.filter((k) => isBefore(k.openDate, date) || isEqual(k.openDate, date))
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
