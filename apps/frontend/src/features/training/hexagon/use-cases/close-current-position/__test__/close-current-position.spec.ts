import { AppState, initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { UTCDate } from '@date-fns/utc'
import { launchTraining } from '../../launch-training/launch-training.ts'
import { arbitraryAlarm } from '../../change-working-unit/__test__/change-working-unit.spec.ts'
import { retrieveAlarmIndicators } from '../../retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { neutralIndicatorsFinishingADay } from '../../../../../../common/__test__/candles-fixtures.ts'
import { openAPosition } from '../../open-a-position/open-a-position.ts'
import { endOfInterventionCandleTimestamp, lastClosingPrice } from '../../../models/indicators.model.ts'
import { closeCurrentPosition } from '../close-current-position.ts'
import { ClosedPosition } from '../../../models/closed-position.model.ts'
import { Candle } from '../../../models/candle.model.ts'
import { addMinutes } from 'date-fns'
import { loadNextInterventionCandle } from '../../load-next-intervention-candle/load-next-intervention-candle.ts'
import { InMemoryClosedPositionRepository } from '../../../../adapters/secondaries/repositories/in-memory-closed-position.repository.ts'

describe('Feature: Close current position', () => {
    let store: ReduxStore
    let initialState: AppState
    let closedPositionRepository: InMemoryClosedPositionRepository

    beforeEach(() => {
        closedPositionRepository = new InMemoryClosedPositionRepository()
        store = initReduxStore({
            closedPositionRepository,
        })
        initialState = store.getState()
    })

    describe('Scenario: close current position', () => {
        it('has no closed positions initially', () => {
            expect(store.getState()).toEqual<AppState>({
                ...initialState,
                closedPositions: {
                    positions: null,
                },
            })
        })

        describe('With an opened position', () => {
            let openedPosition: AppState['openPosition']

            beforeEach(() => {
                givenPositionOpenedAt(new UTCDate('2024-08-12'))
                openedPosition = store.getState().openPosition
            })

            it('closes position just after it has been opened', async () => {
                await closePosition()

                expect(store.getState().closedPositions.positions!.length).toEqual(1)
                expect(store.getState().closedPositions.positions![0]).toEqual<ClosedPosition>({
                    openedAt: openedPosition.openedAt!,
                    closedAt: openedPosition.openedAt!,
                    pnl: 0,
                })
                expect(closedPositionRepository.closedPositions.length).toEqual(1)
                expect(closedPositionRepository.closedPositions[0]).toEqual<ClosedPosition>({
                    openedAt: openedPosition.openedAt!,
                    closedAt: openedPosition.openedAt!,
                    pnl: 0,
                })
            })

            it('resets current position', async () => {
                await closePosition()

                expect(store.getState().openPosition).toEqual<AppState['openPosition']>({
                    openedAt: null,
                    openingPrice: null,
                    side: null,
                    pnl: null,
                })
            })

            describe('Next intervention candle has been loaded', () => {
                it('closes current position', async () => {
                    nextInterventionCandleRetrieved(openedPosition.openingPrice! * 1.5)

                    await closePosition()

                    expect(store.getState().closedPositions.positions!.length).toEqual(1)
                    expect(store.getState().closedPositions.positions![0]).toEqual<ClosedPosition>({
                        openedAt: openedPosition.openedAt!,
                        closedAt: addMinutes(openedPosition.openedAt!, 15).valueOf(),
                        pnl: 0.5,
                    })
                    expect(closedPositionRepository.closedPositions.length).toEqual(1)
                    expect(closedPositionRepository.closedPositions[0]).toEqual<ClosedPosition>({
                        openedAt: openedPosition.openedAt!,
                        closedAt: addMinutes(openedPosition.openedAt!, 15).valueOf(),
                        pnl: 0.5,
                    })
                })

                const nextInterventionCandleRetrieved = (close: number) => {
                    const candle: Candle = {
                        openTime: addMinutes(new UTCDate(openedPosition.openedAt!), 15).valueOf(),
                        open: openedPosition.openingPrice!,
                        high: 30,
                        low: 10,
                        close,
                    }
                    store.dispatch({ type: loadNextInterventionCandle.fulfilled.type, payload: { candle } })
                }
            })
        })
    })

    describe('A previous position has been closed already', () => {
        let previousPosition: ClosedPosition
        let openedPosition: AppState['openPosition']

        beforeEach(() => {
            previousPosition = {
                openedAt: new UTCDate('1990-01-01').valueOf(),
                closedAt: new UTCDate('1990-01-02').valueOf(),
                pnl: 0.25,
            }
            givenAClosedPosition(previousPosition)
            givenPositionOpenedAt(new UTCDate('2024-08-12'))
            openedPosition = store.getState().openPosition
        })

        it('closes position just after it has been opened', async () => {
            await closePosition()

            expect(store.getState().closedPositions.positions!.length).toEqual(2)
            expect(store.getState().closedPositions.positions![0]).toEqual(previousPosition)
            expect(store.getState().closedPositions.positions![1]).toEqual<ClosedPosition>({
                openedAt: openedPosition.openedAt!,
                closedAt: openedPosition.openedAt!,
                pnl: 0,
            })
            expect(closedPositionRepository.closedPositions.length).toEqual(2)
            expect(closedPositionRepository.closedPositions[0]).toEqual(previousPosition)
            expect(closedPositionRepository.closedPositions[1]).toEqual<ClosedPosition>({
                openedAt: openedPosition.openedAt!,
                closedAt: openedPosition.openedAt!,
                pnl: 0,
            })
        })

        const givenAClosedPosition = (position: ClosedPosition) => {
            store.dispatch({
                type: closeCurrentPosition.fulfilled.type,
                payload: position,
            })
            closedPositionRepository.feedWith(position)
        }
    })

    const givenPositionOpenedAt = (lastOpenTime: UTCDate) => {
        const indicators = neutralIndicatorsFinishingADay(lastOpenTime)
        store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm: arbitraryAlarm() } })
        store.dispatch({
            type: retrieveAlarmIndicators.fulfilled.type,
            payload: { indicators },
        })

        store.dispatch({
            type: openAPosition.fulfilled.type,
            payload: {
                openedAt: endOfInterventionCandleTimestamp(indicators.intervention),
                openingPrice: lastClosingPrice(indicators.intervention),
                side: 'LONG',
            },
        })
    }

    const closePosition = async () => {
        await store.dispatch(closeCurrentPosition())
    }
})
