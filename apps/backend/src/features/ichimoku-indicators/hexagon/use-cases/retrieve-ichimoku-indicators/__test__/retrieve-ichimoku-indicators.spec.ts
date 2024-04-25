import { UTCDate } from '@date-fns/utc'
import * as _ from 'lodash'
import { retrieveIndicators, RetrieveIndicatorsCommand } from '../retrieve-indicators'
import { IndicatorsGateway } from '../../../ports/gateways/indicators.gateway'
import { Indicators, IndicatorsQuery, TradingInterval, TradingTimeUnit } from '../../../models/indicators'

describe('Retrieve ichimoku indicators', () => {
    let sut: SUT

    beforeEach(() => {
        sut = new SUT()
    })

    it('does not retrieve any indicators initially', async () => {
        expect(
            await sut.retrieveIndicators({
                symbol: 'AAPL',
                date: new UTCDate(),
                timeUnit: 'ST',
            }),
        ).toEqual(emptyIndicators())
    })

    it.each`
        timeUnit | intervals
        ${'ST'}  | ${['1d', '1h', '15m']}
        ${'MT'}  | ${['1wk', '1d', '1h']}
    `(
        'retrieves indicators for intervals matching timeUnit',
        async ({ timeUnit, intervals }: { timeUnit: TradingTimeUnit; intervals: Array<TradingInterval> }) => {
            const now = new UTCDate()
            sut.feedWith(
                {
                    symbol: 'AAPL',
                    date: now,
                    intervals,
                },
                emptyIndicators(),
            ).feedWith(
                {
                    symbol: 'BTCUSD',
                    date: now,
                    intervals,
                },
                arbitraryIndicators(),
            )

            expect(
                await sut.retrieveIndicators({
                    symbol: 'BTCUSD',
                    date: now,
                    timeUnit,
                }),
            ).toEqual(arbitraryIndicators())
        },
    )
})

class SUT {
    private readonly _indicatorsGateway = new StubIndicatorsGateway()

    feedWith(query: IndicatorsQuery, indicators: Indicators) {
        this._indicatorsGateway.feedWith(query, indicators)
        return this
    }
    async retrieveIndicators(command: RetrieveIndicatorsCommand) {
        return retrieveIndicators({ indicatorsGateway: this._indicatorsGateway })(command)
    }
}

class StubIndicatorsGateway implements IndicatorsGateway {
    private readonly _indicators: Array<{ query: IndicatorsQuery; indicators: Indicators }> = []

    async retrieve(query: IndicatorsQuery): Promise<Indicators> {
        const { indicators } = this._indicators.find(({ query: q }) => _.isEqual(query, q)) || {
            indicators: emptyIndicators(),
        }
        return indicators
    }

    feedWith(query: IndicatorsQuery, indicators: Indicators) {
        this._indicators.push({ query, indicators })
    }
}

const emptyIndicators = (): Indicators => ({
    horizon: {
        timestamps: [],
        candles: {
            open: [],
            close: [],
            high: [],
            low: [],
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: [],
    },
    graphical: {
        timestamps: [],
        candles: {
            open: [],
            close: [],
            high: [],
            low: [],
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: [],
    },
    intervention: {
        timestamps: [],
        candles: {
            open: [],
            close: [],
            high: [],
            low: [],
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: [],
    },
})

const arbitraryIndicators = (): Indicators => ({
    horizon: {
        timestamps: [1],
        candles: {
            open: [1],
            close: [1],
            high: [1],
            low: [1],
        },
        tenkan: [1],
        kijun: [1],
        ssa: [1],
        ssb: [1],
        lagging: [1],
    },
    graphical: {
        timestamps: [1],
        candles: {
            open: [1],
            close: [1],
            high: [1],
            low: [1],
        },
        tenkan: [1],
        kijun: [1],
        ssa: [1],
        ssb: [1],
        lagging: [1],
    },
    intervention: {
        timestamps: [1],
        candles: {
            open: [1],
            close: [1],
            high: [1],
            low: [1],
        },
        tenkan: [1],
        kijun: [1],
        ssa: [1],
        ssb: [1],
        lagging: [1],
    },
})
