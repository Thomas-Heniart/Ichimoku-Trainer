import { initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { AllIndicators } from '../../../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../../retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { loadNextInterventionCandle } from '../load-next-intervention-candle.ts'
import { ichimokuCloud } from 'indicatorts'
import { CandleGateway } from '../../../ports/gateways/candle.gateway.ts'
import { Candle } from '../../../models/candle.model.ts'
import { FIFTEEN_MINUTES_IN_MS } from '../../../../constants.ts'
import { UTCDate } from '@date-fns/utc'
import { addMinutes } from 'date-fns'
import { NEUTRAL_VALUE, neutralIndicatorsFinishingADay } from '../../../../../../common/__test__/candles-fixtures.ts'

describe('Load next intervention candle', () => {
    let sut: SUT
    let initialIndicators: AllIndicators
    let lastTimestamp: UTCDate
    let lastClosedTimestamp: UTCDate

    beforeEach(() => {
        sut = new SUT()
        lastTimestamp = new UTCDate('2024-01-01')
        initialIndicators = neutralIndicatorsFinishingADay(lastTimestamp)
        lastClosedTimestamp = new UTCDate(
            initialIndicators.intervention.timestamps[initialIndicators.intervention.candles.close.length - 1],
        )
        sut.givenIndicators(neutralIndicatorsFinishingADay(lastTimestamp))
    })

    it('retrieves the next candle just after last closed candle', async () => {
        const nextCandle = {
            openTime: addMinutes(lastClosedTimestamp, 15).valueOf(),
            open: NEUTRAL_VALUE,
            close: 40,
            high: 50,
            low: 5,
        }
        sut.feedWithNextCandle({
            lastClosingTime: lastClosedTimestamp.valueOf(),
            candle: nextCandle,
        })

        await sut.loadNextInterventionCandle()

        assertCandleHasBeenRetrieved(nextCandle)
    })

    describe('With the next candle', () => {
        let nextCandle: Candle
        beforeEach(() => {
            nextCandle = {
                openTime: addMinutes(lastClosedTimestamp, 15).valueOf(),
                open: 10,
                close: 20,
                high: 30,
                low: 5,
            }
            sut.feedWithNextCandle({
                lastClosingTime: lastClosedTimestamp.valueOf(),
                candle: nextCandle,
            })
        })

        it('appends a new timestamp 15 minutes after the last one', async () => {
            await sut.loadNextInterventionCandle()

            assertInterventionLastTimestampIsFifteenMinutesAfterTheLastOne()
        })

        it('recalculates ichimoku indicators', async () => {
            await sut.loadNextInterventionCandle()

            assertIchimokuIndicatorsHaveBeenRecalculatedUsingNextCandle()
        })

        const assertIchimokuIndicatorsHaveBeenRecalculatedUsingNextCandle = () => {
            const recalculatedIndicators = ichimokuCloud(
                [...initialIndicators.intervention.candles.high, nextCandle.high],
                [...initialIndicators.intervention.candles.low, nextCandle.low],
                [...initialIndicators.intervention.candles.close, nextCandle.close],
            )
            expect(sut.interventionIndicators.tenkan).toEqual(recalculatedIndicators.tenkan)
            expect(sut.interventionIndicators.kijun).toEqual(recalculatedIndicators.kijun)
            expect(sut.interventionIndicators.ssa).toEqual(recalculatedIndicators.ssa)
            expect(sut.interventionIndicators.ssb).toEqual(recalculatedIndicators.ssb)
            expect(sut.interventionIndicators.lagging).toEqual(recalculatedIndicators.laggingSpan)
        }

        const assertInterventionLastTimestampIsFifteenMinutesAfterTheLastOne = () => {
            const expectedNewTimestamp =
                initialIndicators.intervention.timestamps[initialIndicators.intervention.timestamps.length - 1] +
                FIFTEEN_MINUTES_IN_MS
            expect(sut.interventionIndicators.timestamps).toEqual([
                ...initialIndicators.intervention.timestamps,
                expectedNewTimestamp,
            ])
        }
    })

    const assertCandleHasBeenRetrieved = (candle: Candle) => {
        expect(sut.interventionIndicators.candles.open).toEqual([
            ...initialIndicators.intervention.candles.open,
            candle.open,
        ])
        expect(sut.interventionIndicators.candles.high).toEqual([
            ...initialIndicators.intervention.candles.high,
            candle.high,
        ])
        expect(sut.interventionIndicators.candles.low).toEqual([
            ...initialIndicators.intervention.candles.low,
            candle.low,
        ])
        expect(sut.interventionIndicators.candles.close).toEqual([
            ...initialIndicators.intervention.candles.close,
            candle.close,
        ])
    }
})

class SUT {
    private readonly _store: ReduxStore
    private readonly _candleGateway: StubCandleGateway

    constructor() {
        this._candleGateway = new StubCandleGateway()
        this._store = initReduxStore({
            candleGateway: this._candleGateway,
        })
    }

    givenIndicators(indicators: AllIndicators) {
        this._store.dispatch({
            type: retrieveAlarmIndicators.fulfilled.type,
            payload: { indicators },
        })
        return this
    }

    feedWithNextCandle(stub: { candle: Candle; lastClosingTime: number }) {
        this._candleGateway.feedWith(stub)
    }

    async loadNextInterventionCandle() {
        await this._store.dispatch(loadNextInterventionCandle())
    }

    get interventionIndicators() {
        return this._store.getState().interventionIndicators
    }
}

class StubCandleGateway implements CandleGateway {
    private readonly _stubs: Array<{ candle: Candle; lastClosingTime: number }> = []

    async candleAfter(lastClosedCandleTimestamp: number): Promise<Candle> {
        const stub = this._stubs.find((s) => s.lastClosingTime === lastClosedCandleTimestamp)
        if (!stub) throw 'Should not happen'
        return stub.candle
    }

    feedWith(stub: { candle: Candle; lastClosingTime: number }) {
        this._stubs.push(stub)
    }
}
