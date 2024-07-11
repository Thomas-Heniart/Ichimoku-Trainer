import { createSlice } from '@reduxjs/toolkit'

import { TradingAlarm } from '../models/trading-alarm.ts'
import { Indicators, WorkingUnit } from '../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

import { changeWorkingUnit } from '../use-cases/change-working-unit/change-working-unit.ts'

import { loadNextInterventionCandle } from '../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

import { FIFTEEN_MINUTES_IN_MS } from '../../constants.ts'

type State = {
    alarm: TradingAlarm | null
    indicators: Indicators | null
    workingUnit: WorkingUnit | null
    isLoading: boolean
}
const initialState = (): State => ({
    alarm: null,
    indicators: null,
    workingUnit: null,
    isLoading: false,
})

export const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.pending, (state) => {
            state.workingUnit = null
            state.alarm = null
            state.indicators = null
            state.isLoading = true
        })
        builder.addCase(launchTraining.fulfilled, (state, { payload }) => {
            state.alarm = payload.alarm
        })
        builder.addCase(retrieveAlarmIndicators.fulfilled, (state, { payload }) => {
            state.indicators = payload.indicators
            state.workingUnit = payload.indicators ? 'horizon' : null
            state.isLoading = false
        })
        builder.addCase(changeWorkingUnit.fulfilled, (state, { payload }) => {
            state.workingUnit = payload.workingUnit
        })
        builder.addCase(loadNextInterventionCandle.fulfilled, (state, { payload }) => {
            const lastTimestamp =
                state.indicators!.intervention.timestamps[state.indicators!.intervention.timestamps.length - 1]
            state.indicators!.intervention.timestamps.push(lastTimestamp + FIFTEEN_MINUTES_IN_MS)
            state.indicators!.intervention.candles.open.push(payload.candle.open)
            state.indicators!.intervention.candles.high.push(payload.candle.high)
            state.indicators!.intervention.candles.low.push(payload.candle.low)
            state.indicators!.intervention.candles.close.push(payload.candle.close)
            state.indicators!.intervention.tenkan = payload.ichimokuIndicators.tenkan
            state.indicators!.intervention.kijun = payload.ichimokuIndicators.kijun
            state.indicators!.intervention.ssa = payload.ichimokuIndicators.ssa
            state.indicators!.intervention.ssb = payload.ichimokuIndicators.ssb
            state.indicators!.intervention.lagging = payload.ichimokuIndicators.laggingSpan
            state.workingUnit = 'intervention'
        })
    },
})
