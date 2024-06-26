import { createSlice } from '@reduxjs/toolkit'

import { TradingAlarm } from '../models/trading-alarm.ts'
import { Indicators, WorkingUnit } from '../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

import { changeWorkingUnit } from '../use-cases/change-working-unit/change-working-unit.ts'

type State = {
    alarm: TradingAlarm | null
    indicators: Indicators | null
    workingUnit: WorkingUnit | null
}
const initialState = (): State => ({
    alarm: null,
    indicators: null,
    workingUnit: null,
})

export const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.pending, (state) => {
            state.workingUnit = 'horizon'
        })
        builder.addCase(launchTraining.fulfilled, (state, { payload }) => {
            state.alarm = payload.alarm
        })
        builder.addCase(retrieveAlarmIndicators.fulfilled, (state, { payload }) => {
            state.indicators = payload.indicators
        })
        builder.addCase(changeWorkingUnit.fulfilled, (state, { payload }) => {
            state.workingUnit = payload.workingUnit
        })
    },
})
