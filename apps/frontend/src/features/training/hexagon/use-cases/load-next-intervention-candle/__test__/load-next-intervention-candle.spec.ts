import { initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { Indicators, WorkingUnit, WorkingUnitData } from '../../../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../../retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { loadNextInterventionCandle } from '../load-next-intervention-candle.ts'
import { ichimokuCloud } from 'indicatorts'
import { CandleGateway } from '../../../ports/gateways/candle.gateway.ts'
import { Candle } from '../../../models/candle.model.ts'
import { FIFTEEN_MINUTES_IN_MS } from '../../../../constants.ts'
import { changeWorkingUnit } from '../../change-working-unit/change-working-unit.ts'

describe('Load next intervention candle', () => {
    let sut: SUT
    let indicators: Indicators

    beforeEach(() => {
        sut = new SUT()
        indicators = arbitraryIndicator()
        sut.givenIndicators(indicators)
    })

    it('retrieves the next candle just after last closed candle', async () => {
        const nextCandle = {
            open: 10,
            close: 20,
            high: 30,
            low: 5,
        }
        sut.feedWithNextCandle({
            lastClosingTime: indicators.intervention.timestamps[indicators.intervention.candles.close.length - 1],
            candle: nextCandle,
        })

        await sut.loadNextInterventionCandle()

        assertCandleHasBeenRetrieved(nextCandle)
        assertOtherChartsRemainedTheSame()
    })

    describe('With the next candle', () => {
        let nextCandle: Candle
        beforeEach(() => {
            nextCandle = {
                open: 10,
                close: 20,
                high: 30,
                low: 5,
            }
            sut.feedWithNextCandle({
                lastClosingTime: indicators.intervention.timestamps[indicators.intervention.candles.close.length - 1],
                candle: nextCandle,
            })
        })

        it('appends a new timestamp 15 minutes after the last one', async () => {
            await sut.loadNextInterventionCandle()

            assertInterventionLastTimestampIsFifteenMinutesAfterTheLastOne()
            assertOtherChartsRemainedTheSame()
        })

        it('recalculates ichimoku indicators', async () => {
            await sut.loadNextInterventionCandle()

            assertIchimokuIndicatorsHaveBeenRecalculatedUsingNextCandle()
            assertOtherChartsRemainedTheSame()
        })

        const assertIchimokuIndicatorsHaveBeenRecalculatedUsingNextCandle = () => {
            const recalculatedIndicators = ichimokuCloud(
                [...indicators.intervention.candles.high, nextCandle.high],
                [...indicators.intervention.candles.low, nextCandle.low],
                [...indicators.intervention.candles.close, nextCandle.close],
            )
            expect(sut.indicators?.intervention.tenkan).toEqual(recalculatedIndicators.tenkan)
            expect(sut.indicators?.intervention.kijun).toEqual(recalculatedIndicators.kijun)
            expect(sut.indicators?.intervention.ssa).toEqual(recalculatedIndicators.ssa)
            expect(sut.indicators?.intervention.ssb).toEqual(recalculatedIndicators.ssb)
            expect(sut.indicators?.intervention.lagging).toEqual(recalculatedIndicators.laggingSpan)
        }

        it('should focus on intervention working unit', async () => {
            sut.setSelectedWorkingUnit('graphical')

            await sut.loadNextInterventionCandle()

            expect(sut.workingUnit).toEqual('intervention')
        })

        const assertInterventionLastTimestampIsFifteenMinutesAfterTheLastOne = () => {
            const expectedNewTimestamp =
                indicators.intervention.timestamps[indicators.intervention.timestamps.length - 1] +
                FIFTEEN_MINUTES_IN_MS
            expect(sut.indicators?.intervention.timestamps).toEqual([
                ...indicators.intervention.timestamps,
                expectedNewTimestamp,
            ])
        }
    })

    const assertCandleHasBeenRetrieved = (candle: Candle) => {
        expect(sut.indicators?.intervention.candles.open).toEqual([
            ...indicators.intervention.candles.open,
            candle.open,
        ])
        expect(sut.indicators?.intervention.candles.high).toEqual([
            ...indicators.intervention.candles.high,
            candle.high,
        ])
        expect(sut.indicators?.intervention.candles.low).toEqual([...indicators.intervention.candles.low, candle.low])
        expect(sut.indicators?.intervention.candles.close).toEqual([
            ...indicators.intervention.candles.close,
            candle.close,
        ])
    }

    const assertOtherChartsRemainedTheSame = () => {
        expect(sut.indicators?.horizon).toEqual(indicators.horizon)
        expect(sut.indicators?.graphical).toEqual(indicators.graphical)
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

    givenIndicators(indicators: Indicators) {
        this._store.dispatch({
            type: retrieveAlarmIndicators.fulfilled.type,
            payload: { indicators },
        })
        return this
    }

    feedWithNextCandle(stub: { candle: Candle; lastClosingTime: number }) {
        this._candleGateway.feedWith(stub)
    }

    setSelectedWorkingUnit(workingUnit: WorkingUnit) {
        this._store.dispatch({
            type: changeWorkingUnit.fulfilled.type,
            payload: { workingUnit },
        })
    }

    async loadNextInterventionCandle() {
        await this._store.dispatch(loadNextInterventionCandle())
    }

    get indicators() {
        return this._store.getState().training.indicators
    }

    get workingUnit() {
        return this._store.getState().training.workingUnit
    }
}

class StubCandleGateway implements CandleGateway {
    private readonly _stubs: Array<{ candle: Candle; lastClosingTime: number }> = []

    async candleAfter(lastClosedCandleTimestamp: number): Promise<Candle> {
        return this._stubs.find((s) => s.lastClosingTime === lastClosedCandleTimestamp)!.candle
    }

    feedWith(stub: { candle: Candle; lastClosingTime: number }) {
        this._stubs.push(stub)
    }
}

export const arbitraryIndicator = (): Indicators => ({
    horizon: arbitraryCandles(),
    graphical: arbitraryCandles(),
    intervention: arbitraryCandles(),
})

export const arbitraryCandles = (): WorkingUnitData => {
    const timestamps = new Array<number>(52 + 26).fill(0).map((_, i) => i * FIFTEEN_MINUTES_IN_MS)
    const open = new Array<number>(52).fill(20)
    const close = new Array<number>(52).fill(20)
    const high = new Array<number>(52).fill(20)
    const low = new Array<number>(52).fill(20)
    const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(high, low, close)
    return {
        timestamps,
        candles: {
            open,
            close,
            low,
            high,
        },
        tenkan,
        kijun,
        ssa,
        ssb,
        lagging: laggingSpan,
    }
}
