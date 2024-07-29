import { AppState, initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../launch-training/launch-training.ts'
import { arbitraryAlarm } from '../../change-working-unit/__test__/change-working-unit.spec.ts'
import { retrieveAlarmIndicators } from '../../retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { neutralIndicatorsFinishingADay } from '../../../../../../common/__test__/candles-fixtures.ts'
import { UTCDate } from '@date-fns/utc'
import { addMinutes, endOfDay } from 'date-fns'
import { openAPosition } from '../open-a-position.ts'
import { loadNextInterventionCandle } from '../../load-next-intervention-candle/load-next-intervention-candle.ts'
import { Candle } from '../../../models/candle.model.ts'
import { Indicators } from '../../../models/indicators.model.ts'
import { TradingSide } from '../../../reducers/open-position.reducer.ts'

describe('Feature: Open a position', () => {
    let store: ReduxStore
    let initialState: AppState

    beforeEach(() => {
        store = initReduxStore({})
        initialState = store.getState()
    })

    it('has no position opened initially', () => {
        expect(store.getState()).toEqual<AppState>({
            ...initialState,
            openPosition: {
                openedAt: null,
                openingPrice: null,
                side: null,
                pnl: null,
            },
        })
    })

    describe('A training session has been started', () => {
        let lastHorizonOpenTime: UTCDate
        let initialInterventionIndicators: Indicators

        beforeEach(() => {
            lastHorizonOpenTime = new UTCDate('2024-07-28')
            givenTrainingSessionStarted(lastHorizonOpenTime)
            initialInterventionIndicators = store.getState().interventionIndicators
        })

        describe('Open a position', () => {
            it('should open the position at close time of the last intervention candle', async () => {
                await openPosition()

                const openTime = endOfDay(lastHorizonOpenTime)
                expect(store.getState().openPosition.openedAt).toEqual(openTime.valueOf())
                expect(store.getState().openPosition.pnl).toEqual(0)
            })

            it('price should be last close value', async () => {
                givenNextClosePrice(50)

                await openPosition()

                expect(store.getState().openPosition.openingPrice).toEqual(50)
                expect(store.getState().openPosition.pnl).toEqual(0)
            })

            it.each`
                side
                ${'LONG'}
                ${'SHORT'}
            `('should open a position', async ({ side }: { side: TradingSide }) => {
                await openPosition(side)

                expect(store.getState().openPosition.side).toEqual(side)
                expect(store.getState().openPosition.pnl).toStrictEqual(0)
            })
        })

        describe('A position has been opened', () => {
            it.each`
                side       | openingPrice | nextClosePrice | pnl
                ${'LONG'}  | ${100}       | ${100}         | ${0}
                ${'LONG'}  | ${100}       | ${200}         | ${1}
                ${'LONG'}  | ${10}        | ${20}          | ${1}
                ${'LONG'}  | ${100}       | ${101}         | ${0.01}
                ${'LONG'}  | ${100}       | ${99}          | ${-0.01}
                ${'SHORT'} | ${100}       | ${99}          | ${0.01}
            `(
                'calculates PnL',
                ({
                    side,
                    openingPrice,
                    nextClosePrice,
                    pnl,
                }: {
                    side: TradingSide
                    openingPrice: number
                    nextClosePrice: number
                    pnl: number
                }) => {
                    givenAnOpenedPosition(side, openingPrice)
                    givenNextClosePrice(nextClosePrice)

                    expect(store.getState().openPosition.pnl).toEqual(pnl)
                },
            )
        })

        const givenNextClosePrice = (close: number) => {
            const open = last(initialInterventionIndicators.candles.close)
            const lastTimestamp =
                initialInterventionIndicators.timestamps[initialInterventionIndicators.candles.close.length - 1]
            const candle: Candle = {
                openTime: addMinutes(new UTCDate(lastTimestamp), 15).valueOf(),
                open,
                high: open < close ? close : open,
                low: open < close ? open : close,
                close,
            }
            store.dispatch({ type: loadNextInterventionCandle.fulfilled.type, payload: { candle } })
        }
    })

    const givenTrainingSessionStarted = (lastOpenTime: UTCDate) => {
        store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm: arbitraryAlarm() } })
        store.dispatch({
            type: retrieveAlarmIndicators.fulfilled.type,
            payload: { indicators: neutralIndicatorsFinishingADay(lastOpenTime) },
        })
    }

    const givenAnOpenedPosition = (side: TradingSide, openingPrice: number) => {
        store.dispatch({
            type: openAPosition.fulfilled.type,
            payload: {
                side,
                openedAt: new UTCDate('2024-01-01').valueOf(),
                openingPrice,
            },
        })
    }

    const openPosition = async (side: TradingSide = 'LONG') => {
        await store.dispatch(openAPosition({ side }))
    }
})

export const last = <A>(array: Array<A>) => array[array.length - 1]
