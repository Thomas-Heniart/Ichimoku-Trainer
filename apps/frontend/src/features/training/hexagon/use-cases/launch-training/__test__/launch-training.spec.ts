import { initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { UTCDate } from '@date-fns/utc'
import { isEqual } from 'date-fns'

import { launchTraining } from '../launch-training.ts'
import { TradingAlarm } from '../../../models/trading-alarm.ts'
import { TradingAlarmGateway } from '../../../ports/gateways/trading-alarm.gateway.ts'

describe('Launch training', () => {
    let sut: SUT

    beforeEach(() => {
        sut = new SUT()
    })

    it('has no alarm initially', () => {
        expect(sut.getState().training.alarm).toEqual(null)
    })

    it('sicks for a trading alarm from a random date', async () => {
        const randomDate = new UTCDate('2023-06-17T01:00:00.000Z')
        sut.feedWith({
            from: randomDate,
            tradingAlarm: {
                type: 'ESTABLISHED_TREND',
                side: 'LONG',
                date: '2023-06-17T01:00:00.000Z',
            },
        }).setRandomDate(randomDate)

        await sut.launchTraining()

        expect(sut.tradingAlarm).toEqual({
            type: 'ESTABLISHED_TREND',
            side: 'LONG',
            date: '2023-06-17T01:00:00.000Z',
        })
    })
})

class SUT {
    private readonly _tradingAlarmGateway: StubTradingAlarmGateway
    private readonly _store: ReduxStore
    private _randomDate: UTCDate = new UTCDate('1970-01-01')

    constructor() {
        this._tradingAlarmGateway = new StubTradingAlarmGateway()
        this._store = initReduxStore({
            tradingAlarmGateway: this._tradingAlarmGateway,
            randomTrainingStartDate: () => this._randomDate,
        })
    }

    feedWith({ from, tradingAlarm }: { tradingAlarm: TradingAlarm; from: UTCDate }) {
        this._tradingAlarmGateway.feedWith({ from, tradingAlarm })
        return this
    }

    setRandomDate(randomDate: UTCDate) {
        this._randomDate = randomDate
    }

    async launchTraining() {
        await this._store.dispatch(launchTraining())
    }

    get tradingAlarm() {
        return this._store.getState().training.alarm
    }

    getState() {
        return this._store.getState()
    }
}

class StubTradingAlarmGateway implements TradingAlarmGateway {
    private readonly _alarms: Array<{ tradingAlarm: TradingAlarm; from: UTCDate }> = []

    async nextAlarmFrom({ from }: { from: UTCDate }): Promise<TradingAlarm | null> {
        return (this._alarms.find(({ from: f }) => isEqual(from, f)) || { tradingAlarm: null }).tradingAlarm
    }

    feedWith({ from, tradingAlarm }: { tradingAlarm: TradingAlarm; from: UTCDate }) {
        this._alarms.push({ from, tradingAlarm })
    }
}
