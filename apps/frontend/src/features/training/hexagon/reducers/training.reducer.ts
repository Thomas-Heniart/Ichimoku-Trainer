import { createSlice } from '@reduxjs/toolkit'
import { WorkingUnit } from '../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

import { changeWorkingUnit } from '../use-cases/change-working-unit/change-working-unit.ts'

type State = {
    workingUnit: WorkingUnit | null
    isLoading: boolean
}
const initialState = (): State => ({
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
            state.isLoading = true
        })
        builder.addCase(retrieveAlarmIndicators.fulfilled, (state, { payload }) => {
            state.workingUnit = payload.indicators ? 'horizon' : null
            state.isLoading = false
        })
        builder.addCase(changeWorkingUnit.fulfilled, (state, { payload }) => {
            state.workingUnit = payload.workingUnit
        })
    },
})
