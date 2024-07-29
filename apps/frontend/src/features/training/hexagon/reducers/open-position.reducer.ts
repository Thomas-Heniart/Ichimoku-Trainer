import { createSlice } from '@reduxjs/toolkit'

import { openAPosition } from '../use-cases/open-a-position/open-a-position.ts'
import { loadNextInterventionCandle } from '../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

export type TradingSide = 'LONG' | 'SHORT'

type State = {
    openedAt: null | number
    openingPrice: null | number
    side: null | TradingSide
    pnl: null | number
}

const openPositionSlice = createSlice({
    name: 'open/position',
    initialState: (): State => ({ openedAt: null, openingPrice: null, side: null, pnl: null }),
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(openAPosition.fulfilled, (_, { payload }) => {
            return { ...payload, pnl: 0 }
        })
        builder.addCase(loadNextInterventionCandle.fulfilled, (state, { payload }) => {
            const close = payload.candle.close
            const diff = close - state.openingPrice!
            const sign = state.side === 'SHORT' ? -1 : 1
            return {
                ...state,
                pnl: (diff / state.openingPrice!) * sign,
            }
        })
    },
})

export const openPositionReducer = openPositionSlice.reducer
