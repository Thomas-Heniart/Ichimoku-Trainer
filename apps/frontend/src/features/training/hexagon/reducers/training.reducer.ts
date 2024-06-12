import { createSlice } from '@reduxjs/toolkit'

import { TradingAlarm } from '../models/trading-alarm.ts'
import { Indicators } from '../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

type State = {
    alarm: TradingAlarm | null
    indicators: Indicators | null
}
const initialState = (): State => ({
    alarm: null,
    indicators: null,
})

export const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.fulfilled, (state, { payload }) => {
            state.alarm = payload.alarm
        })
        builder.addCase(retrieveAlarmIndicators.fulfilled, (state, { payload }) => {
            state.indicators = payload.indicators
        })
    },
})
