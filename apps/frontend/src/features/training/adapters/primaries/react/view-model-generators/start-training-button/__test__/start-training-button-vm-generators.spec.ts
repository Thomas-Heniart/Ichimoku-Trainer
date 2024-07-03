import { initReduxStore, ReduxStore } from '../../../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../../../../../hexagon/use-cases/launch-training/launch-training.ts'
import { arbitraryAlarm } from '../../../../../../hexagon/use-cases/change-working-unit/__test__/change-working-unit.spec.ts'
import { isLaunchingTrainingVM } from '../start-training-button.vm.ts'
import { retrieveAlarmIndicators } from '../../../../../../hexagon/use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { ALARM_INDICATORS } from '../../../../../../hexagon/use-cases/retrieve-alarm-indicators/__test__/retrieve-alarm-indicators.spec.ts'

describe('Start training button VM generators', () => {
    let store: ReduxStore

    beforeEach(() => {
        store = initReduxStore({})
    })

    it('is not loading initially', () => {
        expect(isLaunchingTrainingVM(store.getState())).toEqual(false)
    })

    describe('Launching a training', () => {
        beforeEach(() => {
            launchingTraining()
        })
        it('should be loading', () => {
            expect(isLaunchingTrainingVM(store.getState())).toEqual(true)
        })

        describe('Training launched', () => {
            beforeEach(() => {
                trainingLaunched()
            })

            it('should be loading while retrieving indicators', () => {
                store.dispatch({ type: retrieveAlarmIndicators.pending.type })

                expect(isLaunchingTrainingVM(store.getState())).toEqual(true)
            })

            it('should stop loading after indicators have been retrieved', () => {
                store.dispatch({
                    type: retrieveAlarmIndicators.fulfilled.type,
                    payload: {
                        indicators: ALARM_INDICATORS,
                    },
                })

                expect(isLaunchingTrainingVM(store.getState())).toEqual(false)
            })
        })
    })

    it('should be loading while retrieving indicator', () => {})

    const launchingTraining = () => {
        store.dispatch({ type: launchTraining.pending.type })
    }

    const trainingLaunched = () => {
        store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm: arbitraryAlarm() } })
    }
})
