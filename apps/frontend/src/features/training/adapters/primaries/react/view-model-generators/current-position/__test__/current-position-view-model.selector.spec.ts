import { initReduxStore, ReduxStore } from '../../../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../../../../../hexagon/use-cases/launch-training/launch-training.ts'
import { arbitraryAlarm } from '../../../../../../hexagon/use-cases/change-working-unit/__test__/change-working-unit.spec.ts'
import { retrieveAlarmIndicators } from '../../../../../../hexagon/use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { neutralIndicatorsFinishingADay } from '../../../../../../../../common/__test__/candles-fixtures.ts'
import { openAPosition } from '../../../../../../hexagon/use-cases/open-a-position/open-a-position.ts'
import { getCurrentPositionVM } from '../get-current-position.vm.ts'
import { Candle } from '../../../../../../hexagon/models/candle.model.ts'
import { addMinutes } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { loadNextInterventionCandle } from '../../../../../../hexagon/use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

describe('Current position view models generators', () => {
    let store: ReduxStore

    beforeEach(() => {
        store = initReduxStore({})
    })

    it('should not get a view model until chart data has been retrieved', () => {
        expect(getCurrentPositionVM(store.getState())).toEqual(null)
    })

    describe('Chart data has been retrieved', () => {
        beforeEach(() => {
            trainingLaunched()
        })

        it('should be able to open a position', () => {
            expect(getCurrentPositionVM(store.getState())).toEqual<CurrentPositionVM>({
                status: 'OPENABLE',
                pnl: null,
            })
        })

        describe('A position has been opened', () => {
            beforeEach(() => {
                positionOpened()
            })

            it('should display PnL of current position', () => {
                expect(getCurrentPositionVM(store.getState())).toEqual<CurrentPositionVM>({
                    status: 'DISPLAY_PNL',
                    pnl: '0',
                })
            })

            it.each`
                close | pnl
                ${20} | ${'100'}
                ${5}  | ${'-50'}
            `('displays PnL in %', ({ close, pnl }: { close: number; pnl: string }) => {
                nextInterventionCandleRetrieved(close)

                expect(getCurrentPositionVM(store.getState())).toEqual<CurrentPositionVM>({
                    status: 'DISPLAY_PNL',
                    pnl,
                })
            })
        })

        const trainingLaunched = () => {
            store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm: arbitraryAlarm() } })
            store.dispatch({
                type: retrieveAlarmIndicators.fulfilled.type,
                payload: { indicators: neutralIndicatorsFinishingADay() },
            })
        }

        const positionOpened = () => {
            store.dispatch({
                type: openAPosition.fulfilled.type,
                payload: {
                    openedAt: 0,
                    openingPrice: 10,
                    side: 'LONG',
                },
            })
        }

        const nextInterventionCandleRetrieved = (close: number) => {
            const candle: Candle = {
                openTime: addMinutes(new UTCDate(0), 15).valueOf(),
                open: 10,
                high: 30,
                low: 10,
                close,
            }
            store.dispatch({ type: loadNextInterventionCandle.fulfilled.type, payload: { candle } })
        }
    })
})

export type CurrentPositionVM = {
    status: 'OPENABLE' | 'DISPLAY_PNL'
    pnl: string | null
}
