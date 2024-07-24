import { createSlice } from '@reduxjs/toolkit'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { loadNextInterventionCandle } from '../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'
import { ONE_HOUR_IN_MS } from '../../constants.ts'
import { emptyIndicators } from './intervention-indicators.reducer.ts'
import { UTCDate } from '@date-fns/utc'
import { startOfHour } from 'date-fns'
import { updateIchimokuIndicators } from '../models/indicators.model.ts'

const graphicalIndicatorsSlice = createSlice({
    name: 'indicators/graphical',
    initialState: emptyIndicators,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.pending, emptyIndicators)
        builder.addCase(retrieveAlarmIndicators.fulfilled, (_, { payload: { indicators } }) => {
            if (indicators) return indicators.graphical
            return emptyIndicators()
        })
        builder.addCase(loadNextInterventionCandle.fulfilled, (state, { payload: { candle } }) => {
            const lastCandleIdx = state.candles.close.length - 1
            const lastCandleTimestamp = new UTCDate(state.timestamps[lastCandleIdx])
            const candleTimestampAsHour = startOfHour(new UTCDate(candle.openTime))
            if (lastCandleTimestamp.valueOf() < candleTimestampAsHour.valueOf()) {
                state.timestamps.push(state.timestamps[state.timestamps.length - 1] + ONE_HOUR_IN_MS)
                state.candles.open.push(candle.open)
                state.candles.high.push(candle.high)
                state.candles.low.push(candle.low)
                state.candles.close.push(candle.close)
                updateIchimokuIndicators(state)
                return
            }
            if (candle.high > state.candles.high[lastCandleIdx]) state.candles.high[lastCandleIdx] = candle.high
            if (candle.low < state.candles.low[lastCandleIdx]) state.candles.low[lastCandleIdx] = candle.low
            state.candles.close[lastCandleIdx] = candle.close
            updateIchimokuIndicators(state)
        })
    },
})

export const graphicalIndicatorsReducer = graphicalIndicatorsSlice.reducer
