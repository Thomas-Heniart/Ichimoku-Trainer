import { initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { ALARM_INDICATORS } from '../../retrieve-alarm-indicators/__test__/retrieve-alarm-indicators.spec.ts'
import { Indicators, WorkingUnit } from '../../../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../../retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { loadNextInterventionCandle } from '../load-next-intervention-candle.ts'
import { IchimokuCloudResult } from 'indicatorts'
import * as _ from 'lodash'
import { CandleGateway } from '../../../ports/gateways/candle.gateway.ts'
import { Candle } from '../../../models/candle.model.ts'
import { CalculateIchimokuIndicatorsCommand } from '../../../models/services/calculate-ichimoku-indicators.service.ts'
import { FIFTEEN_MINUTES_IN_MS } from '../../../../constants.ts'
import { changeWorkingUnit } from '../../change-working-unit/change-working-unit.ts'

describe('Load next intervention candle', () => {
    let sut: SUT

    beforeEach(() => {
        sut = new SUT()
        sut.givenIndicators(ALARM_INDICATORS)
    })

    it('retrieves the next candle just after last closed candle', async () => {
        const nextCandle = {
            open: 10,
            close: 20,
            high: 30,
            low: 5,
        }
        sut.feedWithNextCandle({
            lastClosingTime:
                ALARM_INDICATORS.intervention.timestamps[ALARM_INDICATORS.intervention.candles.close.length - 1],
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
                lastClosingTime:
                    ALARM_INDICATORS.intervention.timestamps[ALARM_INDICATORS.intervention.candles.close.length - 1],
                candle: nextCandle,
            })
        })

        it('appends a new timestamp 15 minutes after the last one', async () => {
            await sut.loadNextInterventionCandle()

            assertInterventionLastTimestampIsFifteenMinutesAfterTheLastOne()
            assertOtherChartsRemainedTheSame()
        })

        it('recalculates ichimoku indicators', async () => {
            const recalculatedIndicators = {
                tenkan: [1, 2],
                kijun: [2, 3],
                ssa: [0, 3, 4],
                ssb: [0, 4, 5],
                laggingSpan: [5, 6],
            }
            sut.mockNewIchimokuIndicators({
                input: {
                    highs: [...ALARM_INDICATORS.intervention.candles.high, nextCandle.high],
                    lows: [...ALARM_INDICATORS.intervention.candles.low, nextCandle.low],
                    closings: [...ALARM_INDICATORS.intervention.candles.close, nextCandle.close],
                },
                output: recalculatedIndicators,
            })

            await sut.loadNextInterventionCandle()

            expect(sut.indicators?.intervention.tenkan).toEqual(recalculatedIndicators.tenkan)
            expect(sut.indicators?.intervention.kijun).toEqual(recalculatedIndicators.kijun)
            expect(sut.indicators?.intervention.ssa).toEqual(recalculatedIndicators.ssa)
            expect(sut.indicators?.intervention.ssb).toEqual(recalculatedIndicators.ssb)
            expect(sut.indicators?.intervention.lagging).toEqual(recalculatedIndicators.laggingSpan)
            assertOtherChartsRemainedTheSame()
        })

        it('should focus on intervention working unit', async () => {
            sut.setSelectedWorkingUnit('graphical')

            await sut.loadNextInterventionCandle()

            expect(sut.workingUnit).toEqual('intervention')
        })

        const assertInterventionLastTimestampIsFifteenMinutesAfterTheLastOne = () => {
            const expectedNewTimestamp =
                ALARM_INDICATORS.intervention.timestamps[ALARM_INDICATORS.intervention.timestamps.length - 1] +
                FIFTEEN_MINUTES_IN_MS
            expect(sut.indicators?.intervention.timestamps).toEqual([
                ...ALARM_INDICATORS.intervention.timestamps,
                expectedNewTimestamp,
            ])
        }
    })

    const assertCandleHasBeenRetrieved = (candle: Candle) => {
        expect(sut.indicators?.intervention.candles.open).toEqual([
            ...ALARM_INDICATORS.intervention.candles.open,
            candle.open,
        ])
        expect(sut.indicators?.intervention.candles.high).toEqual([
            ...ALARM_INDICATORS.intervention.candles.high,
            candle.high,
        ])
        expect(sut.indicators?.intervention.candles.low).toEqual([
            ...ALARM_INDICATORS.intervention.candles.low,
            candle.low,
        ])
        expect(sut.indicators?.intervention.candles.close).toEqual([
            ...ALARM_INDICATORS.intervention.candles.close,
            candle.close,
        ])
    }

    const assertOtherChartsRemainedTheSame = () => {
        expect(sut.indicators?.horizon).toEqual(ALARM_INDICATORS.horizon)
        expect(sut.indicators?.graphical).toEqual(ALARM_INDICATORS.graphical)
    }
})

class SUT {
    private readonly _store: ReduxStore
    private readonly _candleGateway: StubCandleGateway
    private _ichimokuIndicators: (command: CalculateIchimokuIndicatorsCommand) => IchimokuCloudResult

    constructor() {
        this._candleGateway = new StubCandleGateway()
        this._ichimokuIndicators = () => ({
            tenkan: [],
            kijun: [],
            ssa: [],
            ssb: [],
            laggingSpan: [],
        })
        this._store = initReduxStore({
            candleGateway: this._candleGateway,
            calculateIchimokuIndicators: (command: CalculateIchimokuIndicatorsCommand) =>
                this._ichimokuIndicators(command),
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

    mockNewIchimokuIndicators(mock: { input: CalculateIchimokuIndicatorsCommand; output: IchimokuCloudResult }) {
        this._ichimokuIndicators = (command: CalculateIchimokuIndicatorsCommand) => {
            if (_.isEqual(command, mock.input)) return mock.output
            throw 'Did not comply with the mock'
        }
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
