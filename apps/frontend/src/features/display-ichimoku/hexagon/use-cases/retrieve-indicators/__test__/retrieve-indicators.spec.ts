import { addDays } from 'date-fns'
import { AppState, initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { IndicatorsQuery, retrieveIndicators } from '../retrieve-indicators.ts'
import { Indicators } from '../../../models/indicators.model.ts'
import { IndicatorGateway } from '../../../ports/indicator.gateway.ts'

describe('Retrieve indicators', () => {
    let store: ReduxStore
    let initialState: AppState
    let indicatorGateway: StubIndicatorGateway

    beforeEach(() => {
        indicatorGateway = new StubIndicatorGateway()
        store = initReduxStore({ indicatorGateway })
        initialState = store.getState()
    })

    it('has no indicators initially', () => {
        expect(store.getState()).toEqual({
            ...initialState,
            indicators: null,
        })
    })

    it('retrieves indicators related to symbol, timeUnit and startDate', async () => {
        const today = new Date()
        const yesterday = addDays(today, -1)
        indicatorGateway
            .feedWith(
                {
                    symbol: 'AAPL',
                    timeUnit: 'ST',
                    startDate: today,
                },
                AAPL_SHORT_TIME_TODAY_ARBITRARY_INDICATORS,
            )
            .feedWith(
                {
                    symbol: 'BTCUSD',
                    timeUnit: 'MT',
                    startDate: yesterday,
                },
                BTCUSD_MID_TERM_YESTERDAY_ARBITRARY_INDICATORS,
            )

        await store.dispatch(
            retrieveIndicators({
                symbol: 'AAPL',
                timeUnit: 'ST',
                startDate: today,
            }),
        )

        expect(store.getState()).toEqual({
            ...initialState,
            indicators: AAPL_SHORT_TIME_TODAY_ARBITRARY_INDICATORS,
        })
    })
})

class StubIndicatorGateway implements IndicatorGateway {
    private readonly _indicators: Array<{
        query: IndicatorsQuery
        indicators: Indicators
    }> = []

    async retrieveIndicators(query: IndicatorsQuery): Promise<Indicators> {
        return this._indicators.find(
            ({ query: q1 }) =>
                q1.symbol === query.symbol && q1.timeUnit === query.timeUnit && q1.startDate === query.startDate,
        )!.indicators
    }

    feedWith(query: IndicatorsQuery, indicators: Indicators) {
        this._indicators.push({ query, indicators })
        return this
    }
}

export const AAPL_SHORT_TIME_TODAY_ARBITRARY_INDICATORS: Indicators = {
    horizon: {
        timestamps: [1],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [2],
        kijun: [3],
        ssa: [4],
        ssb: [5],
        lagging: [6],
    },
    graphical: {
        timestamps: [7],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [8],
        kijun: [9],
        ssa: [10],
        ssb: [11],
        lagging: [12],
    },
    intervention: {
        timestamps: [13],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [14],
        kijun: [15],
        ssa: [16],
        ssb: [17],
        lagging: [18],
    },
}

const BTCUSD_MID_TERM_YESTERDAY_ARBITRARY_INDICATORS: Indicators = {
    horizon: {
        timestamps: [19],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [20],
        kijun: [21],
        ssa: [22],
        ssb: [23],
        lagging: [24],
    },
    graphical: {
        timestamps: [25],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [26],
        kijun: [27],
        ssa: [28],
        ssb: [29],
        lagging: [30],
    },
    intervention: {
        timestamps: [31],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [32],
        kijun: [33],
        ssa: [34],
        ssb: [35],
        lagging: [36],
    },
}
