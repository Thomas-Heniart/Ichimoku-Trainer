import { createSlice } from '@reduxjs/toolkit'

import { ClosedPosition } from '../models/closed-position.model.ts'
import { closeCurrentPosition } from '../use-cases/close-current-position/close-current-position.ts'

type State = {
    positions: null | Array<ClosedPosition>
}

const closedPositionsSlice = createSlice({
    name: 'closed-positions',
    initialState: (): State => ({ positions: null }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(closeCurrentPosition.fulfilled, (state, { payload }) => ({
            positions: [...(state.positions ?? []), payload],
        }))
    },
})

export const closedPositionsReducer = closedPositionsSlice.reducer
