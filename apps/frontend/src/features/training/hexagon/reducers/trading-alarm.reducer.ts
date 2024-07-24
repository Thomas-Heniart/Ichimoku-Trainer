import { TradingAlarm } from '../models/trading-alarm.ts'
import { createSlice } from '@reduxjs/toolkit'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

type State = {
    currentAlarm: TradingAlarm | null
}

const tradingAlarmSlice = createSlice({
    name: 'trading-alarm',
    initialState: (): State => ({ currentAlarm: null }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.pending, (state) => {
            state.currentAlarm = null
        })
        builder.addCase(launchTraining.fulfilled, (state, { payload }) => {
            state.currentAlarm = payload.alarm
        })
    },
})

export const tradingAlarmReducer = tradingAlarmSlice.reducer
