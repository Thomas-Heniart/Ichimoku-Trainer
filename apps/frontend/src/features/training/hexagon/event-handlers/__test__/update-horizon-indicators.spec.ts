import { initReduxStore, ReduxStore } from '../../../../../common/store/reduxStore.ts'
import { UTCDate } from '@date-fns/utc'
import { NEUTRAL_VALUE, neutralIndicatorsFinishingADay } from '../../../../../common/__test__/candles-fixtures.ts'
import { retrieveAlarmIndicators } from '../../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { Indicators } from '../../models/indicators.model.ts'
import { Candle } from '../../models/candle.model.ts'
import { loadNextInterventionCandle } from '../../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'
import { FIFTEEN_MINUTES_IN_MS } from '../../../constants.ts'
import { addDays, addMinutes } from 'date-fns'
import { ichimokuCloud, IchimokuCloudResult } from 'indicatorts'

describe('Horizon indicators update', () => {
    let store: ReduxStore
    let lastTimestamp: UTCDate
    let initialIndicators: Indicators
    let lastInterventionCandleTimestamp: UTCDate
    let lastHorizonTimestamp: UTCDate

    beforeEach(() => {
        store = initReduxStore({})
        lastTimestamp = new UTCDate('2024-01-01')
        initialIndicators = neutralIndicatorsFinishingADay(lastTimestamp)
        lastInterventionCandleTimestamp = new UTCDate(
            initialIndicators.intervention.timestamps[initialIndicators.intervention.candles.close.length - 1],
        )
        lastHorizonTimestamp = new UTCDate(
            initialIndicators.horizon.timestamps[initialIndicators.horizon.timestamps.length - 1],
        )
        store.dispatch({
            type: retrieveAlarmIndicators.fulfilled.type,
            payload: { indicators: neutralIndicatorsFinishingADay(lastTimestamp) },
        })
    })

    describe('A new intervention candle has been retrieved starting a new horizon candle', () => {
        it('should append a new candle matching the retrieved candle values', () => {
            givenAnInterventionCandle({
                openTime: lastInterventionCandleTimestamp.valueOf() + FIFTEEN_MINUTES_IN_MS,
                open: NEUTRAL_VALUE,
                high: 30,
                low: 1,
                close: 5,
            })

            assertThatLastHorizonCandleIsEqualTo({
                open: NEUTRAL_VALUE,
                high: 30,
                low: 1,
                close: 5,
            })
        })

        it('should calculate next timestamp for the cloud', () => {
            givenAnInterventionCandle({
                openTime: lastInterventionCandleTimestamp.valueOf() + FIFTEEN_MINUTES_IN_MS,
                open: NEUTRAL_VALUE,
                high: 30,
                low: 1,
                close: 5,
            })

            assertThatLastHorizonTimestampIs(addDays(lastHorizonTimestamp, 1))
        })

        it('should recalculate ichimoku indicators', () => {
            givenAnInterventionCandle({
                openTime: lastInterventionCandleTimestamp.valueOf() + FIFTEEN_MINUTES_IN_MS,
                open: NEUTRAL_VALUE,
                high: 30,
                low: 1,
                close: 5,
            })

            assertIchimokuIndicatorsHaveBeenUpdated(
                ichimokuCloud(
                    [...initialIndicators.horizon.candles.high, 30],
                    [...initialIndicators.horizon.candles.low, 1],
                    [...initialIndicators.horizon.candles.close, 5],
                ),
            )
        })
    })

    describe('A new intervention candle has been retrieved already', () => {
        let previousCandle: Candle
        beforeEach(() => {
            lastInterventionCandleTimestamp = addMinutes(lastInterventionCandleTimestamp, 15)
            previousCandle = {
                openTime: lastInterventionCandleTimestamp.valueOf(),
                open: NEUTRAL_VALUE,
                high: 30,
                low: 10,
                close: 5,
            }
            givenAnInterventionCandle(previousCandle)
        })

        describe('A new intervention candle has been retrieved', () => {
            it('should update the last horizon candle high, low and close values', () => {
                givenAnInterventionCandle(
                    nextCandle({
                        high: 60,
                        low: 1,
                        close: 30,
                    }),
                )

                assertThatLastHorizonCandleIsEqualTo({
                    open: previousCandle.open,
                    high: 60,
                    low: 1,
                    close: 30,
                })
                assertThatLastHorizonTimestampIs(addDays(lastHorizonTimestamp, 1))
                assertIchimokuIndicatorsHaveBeenUpdated(
                    ichimokuCloud(
                        [...initialIndicators.graphical.candles.high, 60],
                        [...initialIndicators.graphical.candles.low, 1],
                        [...initialIndicators.graphical.candles.close, 30],
                    ),
                )
            })

            it('does not update low when higher than the existing one', () => {
                givenAnInterventionCandle(
                    nextCandle({
                        high: 60,
                        low: previousCandle.low + 1,
                        close: 30,
                    }),
                )

                assertThatLastHorizonCandleIsEqualTo({
                    open: previousCandle.open,
                    high: 60,
                    low: previousCandle.low,
                    close: 30,
                })
            })

            it('does not update high when lower than the existing one', () => {
                givenAnInterventionCandle(
                    nextCandle({
                        high: previousCandle.high - 1,
                        low: 1,
                        close: 30,
                    }),
                )

                assertThatLastHorizonCandleIsEqualTo({
                    open: previousCandle.open,
                    high: previousCandle.high,
                    low: 1,
                    close: 30,
                })
            })

            const nextCandle = ({ high, low, close }: { high: number; low: number; close: number }): Candle => ({
                openTime: lastInterventionCandleTimestamp.valueOf() + FIFTEEN_MINUTES_IN_MS,
                open: previousCandle.close,
                high,
                low,
                close,
            })
        })
    })

    const givenAnInterventionCandle = (candle: Candle) => {
        store.dispatch({
            type: loadNextInterventionCandle.fulfilled.type,
            payload: { candle },
        })
    }

    const assertThatLastHorizonCandleIsEqualTo = (candle: {
        open: number
        close: number
        high: number
        low: number
    }) => {
        const horizon = horizonState()
        expect(horizon.candles.open).toEqual([...initialIndicators.horizon.candles.open, candle.open])
        expect(horizon.candles.close).toEqual([...initialIndicators.horizon.candles.close, candle.close])
        expect(horizon.candles.high).toEqual([...initialIndicators.horizon.candles.high, candle.high])
        expect(horizon.candles.low).toEqual([...initialIndicators.horizon.candles.low, candle.low])
    }

    const assertThatLastHorizonTimestampIs = (date: UTCDate) => {
        const horizon = store.getState().training.indicators!.horizon
        expect(horizon.timestamps[horizon.timestamps.length - 1]).toEqual(date.valueOf())
    }

    const assertIchimokuIndicatorsHaveBeenUpdated = (ichimokuResult: IchimokuCloudResult) => {
        const { tenkan, kijun, ssa, ssb, lagging } = horizonState()
        expect(tenkan).toEqual(ichimokuResult.tenkan)
        expect(kijun).toEqual(ichimokuResult.kijun)
        expect(ssa).toEqual(ichimokuResult.ssa)
        expect(ssb).toEqual(ichimokuResult.ssb)
        expect(lagging).toEqual(ichimokuResult.laggingSpan)
    }

    const horizonState = () => store.getState().training.indicators!.horizon
})
