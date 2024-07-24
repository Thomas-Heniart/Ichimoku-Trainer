import { createSlice } from '@reduxjs/toolkit'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { loadNextInterventionCandle } from '../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'
import { FIFTEEN_MINUTES_IN_MS } from '../../constants.ts'
import { updateIchimokuIndicators } from './training.reducer.ts'

export type IndicatorsState = {
    timestamps: Array<number>
    candles: {
        open: Array<number>
        high: Array<number>
        low: Array<number>
        close: Array<number>
    }
    tenkan: Array<number>
    kijun: Array<number>
    ssa: Array<number>
    ssb: Array<number>
    lagging: Array<number>
}

export const emptyIndicators = (): IndicatorsState => ({
    timestamps: [],
    candles: {
        open: [],
        high: [],
        low: [],
        close: [],
    },
    tenkan: [],
    kijun: [],
    ssa: [],
    ssb: [],
    lagging: [],
})

const interventionIndicatorsSlice = createSlice({
    name: 'indicators/intervention',
    initialState: emptyIndicators,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.pending, emptyIndicators)
        builder.addCase(retrieveAlarmIndicators.fulfilled, (_, { payload: { indicators } }) => {
            if (indicators) return indicators.intervention
            return emptyIndicators()
        })
        builder.addCase(loadNextInterventionCandle.fulfilled, (state, { payload }) => {
            const lastTimestamp = state.timestamps[state.timestamps.length - 1]
            state.timestamps.push(lastTimestamp + FIFTEEN_MINUTES_IN_MS)
            state.candles.open.push(payload.candle.open)
            state.candles.high.push(payload.candle.high)
            state.candles.low.push(payload.candle.low)
            state.candles.close.push(payload.candle.close)
            updateIchimokuIndicators(state)
        })
    },
})

export const interventionIndicatorsReducer = interventionIndicatorsSlice.reducer
