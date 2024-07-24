import { initReduxStore, ReduxStore } from '../../../../../../common/store/reduxStore.ts'
import { retrieveAlarmIndicators } from '../retrieve-alarm-indicators.ts'
import { AllIndicators } from '../../../models/indicators.model.ts'
import { IndicatorGateway } from '../../../ports/gateways/indicator.gateway.ts'
import { launchTraining } from '../../launch-training/launch-training.ts'
import { TradingAlarm } from '../../../models/trading-alarm.ts'
import { UTCDate } from '@date-fns/utc'
import { addDays, isEqual } from 'date-fns'
import { emptyIndicators } from '../../../reducers/intervention-indicators.reducer.ts'

describe('Retrieve indicators', () => {
    let store: ReduxStore
    let indicatorGateway: StubIndicatorGateway

    beforeEach(() => {
        indicatorGateway = new StubIndicatorGateway()
        store = initReduxStore({ indicatorGateway })
    })

    it('has no indicators initially', () => {
        expect(store.getState().interventionIndicators).toEqual(emptyIndicators())
        expect(store.getState().graphicalIndicators).toEqual(emptyIndicators())
        expect(store.getState().horizonIndicators).toEqual(emptyIndicators())
    })

    it('retrieves indicators of current alarm', async () => {
        const alarm: TradingAlarm = {
            date: '2023-06-17T01:00:00.000Z',
            type: 'ESTABLISHED_TREND',
            side: 'LONG',
        }
        store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm } })
        const alarmDate = new UTCDate(alarm.date)
        indicatorGateway
            .feedWith(alarmDate, ALARM_INDICATORS)
            .feedWith(addDays(alarmDate, -1), ANOTHER_ALARM_INDICATORS)

        await store.dispatch(retrieveAlarmIndicators())

        expect(store.getState().interventionIndicators).toEqual(ALARM_INDICATORS.intervention)
        expect(store.getState().graphicalIndicators).toEqual(ALARM_INDICATORS.graphical)
        expect(store.getState().horizonIndicators).toEqual(ALARM_INDICATORS.horizon)
    })

    it('does not retrieve indicators when there is no alarm', async () => {
        store.dispatch({ type: launchTraining.fulfilled.type, payload: { alarm: null } })

        await store.dispatch(retrieveAlarmIndicators())

        expect(store.getState().training.workingUnit).toEqual(null)
        expect(store.getState().interventionIndicators).toEqual(emptyIndicators())
        expect(store.getState().graphicalIndicators).toEqual(emptyIndicators())
        expect(store.getState().interventionIndicators).toEqual(emptyIndicators())
    })
})

class StubIndicatorGateway implements IndicatorGateway {
    private readonly _indicators: Array<{
        date: UTCDate
        indicators: AllIndicators
    }> = []

    async retrieveIndicators(date: UTCDate): Promise<AllIndicators> {
        return this._indicators.find(({ date: d }) => isEqual(d, date))!.indicators
    }

    feedWith(date: UTCDate, indicators: AllIndicators) {
        this._indicators.push({ date, indicators })
        return this
    }
}

export const ALARM_INDICATORS: AllIndicators = {
    horizon: {
        timestamps: [1],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [2],
        kijun: [3],
        ssa: [4],
        ssb: [5],
        lagging: [6],
    },
    graphical: {
        timestamps: [7],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [8],
        kijun: [9],
        ssa: [10],
        ssb: [11],
        lagging: [12],
    },
    intervention: {
        timestamps: [13, 14],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [14],
        kijun: [15],
        ssa: [16, 17],
        ssb: [17, 18],
        lagging: [18],
    },
}

const ANOTHER_ALARM_INDICATORS: AllIndicators = {
    horizon: {
        timestamps: [19],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [20],
        kijun: [21],
        ssa: [22],
        ssb: [23],
        lagging: [24],
    },
    graphical: {
        timestamps: [25],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [26],
        kijun: [27],
        ssa: [28],
        ssb: [29],
        lagging: [30],
    },
    intervention: {
        timestamps: [31],
        candles: {
            open: [1],
            close: [2],
            high: [3],
            low: [4],
        },
        tenkan: [32],
        kijun: [33],
        ssa: [34],
        ssb: [35],
        lagging: [36],
    },
}
