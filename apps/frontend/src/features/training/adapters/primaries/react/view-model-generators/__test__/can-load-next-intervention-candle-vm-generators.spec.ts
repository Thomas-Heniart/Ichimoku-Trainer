import { initReduxStore, ReduxStore } from '../../../../../../../common/store/reduxStore.ts'
import { retrieveAlarmIndicators } from '../../../../../hexagon/use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { ALARM_INDICATORS } from '../../../../../hexagon/use-cases/retrieve-alarm-indicators/__test__/retrieve-alarm-indicators.spec.ts'
import { launchTraining } from '../../../../../hexagon/use-cases/launch-training/launch-training.ts'
import { arbitraryAlarm } from '../../../../../hexagon/use-cases/change-working-unit/__test__/change-working-unit.spec.ts'
import { showChartVM } from '../show-chart.vm.ts'

describe('Show chart view model generator', () => {
    let store: ReduxStore

    beforeEach(() => {
        store = initReduxStore({})
    })

    it('should not show initially', () => {
        expect(showChartVM(store.getState())).toEqual(false)
    })

    it('should show once indicators have been retrieved', () => {
        givenRetrievedIndicators()

        expect(showChartVM(store.getState())).toEqual(true)
    })

    it('should no show while launching a new training', () => {
        givenRetrievedIndicators()
        launchingANewTraining()

        expect(showChartVM(store.getState())).toEqual(false)
    })

    const givenRetrievedIndicators = () => {
        store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm: arbitraryAlarm() } })
        store.dispatch({ type: retrieveAlarmIndicators.fulfilled.type, payload: { indicators: ALARM_INDICATORS } })
    }

    const launchingANewTraining = () => {
        store.dispatch({ type: launchTraining.pending.type })
    }
})
