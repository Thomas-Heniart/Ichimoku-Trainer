import { WorkingUnit } from '../../../models/indicators.model.ts'
import { initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../launch-training/launch-training.ts'
import { TradingAlarm } from '../../../models/trading-alarm.ts'
import { changeWorkingUnit } from '../change-working-unit.ts'

describe('Change working unit', () => {
    let sut: SUT
    beforeEach(() => {
        sut = new SUT()
    })

    it('sets working unit', async () => {
        sut.givenLaunchedTraining()

        await sut.changeWorkingUnit('graphical')

        expect(sut.workingUnit).toEqual<WorkingUnit>('graphical')
    })

    it('resets working unit when launching a new training', () => {
        sut.givenWorkingUnit('graphical')

        sut.launchingNewTraining()

        expect(sut.workingUnit).toEqual(null)
    })
})

class SUT {
    private readonly _store: ReduxStore

    constructor() {
        this._store = initReduxStore({})
    }

    givenLaunchedTraining() {
        this._store.dispatch({
            type: launchTraining.fulfilled.type,
            payload: {
                alarm: arbitraryAlarm(),
            },
        })
    }

    givenWorkingUnit(workingUnit: WorkingUnit) {
        this._store.dispatch({
            type: changeWorkingUnit.fulfilled.type,
            payload: { workingUnit },
        })
    }

    async changeWorkingUnit(workingUnit: WorkingUnit) {
        await this._store.dispatch(changeWorkingUnit({ workingUnit }))
    }

    launchingNewTraining() {
        this._store.dispatch({
            type: launchTraining.pending.type,
        })
    }

    get workingUnit() {
        return this._store.getState().training.workingUnit
    }
}

export const arbitraryAlarm = (overrides: Partial<TradingAlarm> = {}): TradingAlarm => ({
    date: '1990-01-01 00:00:00',
    type: 'ESTABLISHED_TREND',
    side: 'LONG',
    ...overrides,
})
