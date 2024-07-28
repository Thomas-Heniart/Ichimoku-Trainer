import { createSlice } from '@reduxjs/toolkit'

import { openAPosition } from '../use-cases/open-a-position/open-a.position.ts'

export type TradingSide = 'LONG' | 'SHORT'

type State = {
    openedAt: null | number
    openingPrice: null | number
    side: null | TradingSide
}

const openPositionSlice = createSlice({
    name: 'open/position',
    initialState: (): State => ({ openedAt: null, openingPrice: null, side: null }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(openAPosition.fulfilled, (_, { payload }) => {
            return payload
        })
    },
})

export const openPositionReducer = openPositionSlice.reducer
