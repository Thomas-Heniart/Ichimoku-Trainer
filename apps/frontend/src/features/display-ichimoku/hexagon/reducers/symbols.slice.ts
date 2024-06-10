import { createSlice } from '@reduxjs/toolkit'

import { TradingSymbols } from '../models/trading-symbol.model.ts'

export type SymbolsState = {
    all: TradingSymbols
}
export const symbolsSlice = createSlice({
    name: 'symbols',
    initialState: () => ({}) as SymbolsState,
    reducers: {
        symbolsRetrieved: (state, { payload: { symbols } }: SymbolsRetrievedPayload) => {
            state.all = symbols
            return state
        },
    },
    extraReducers: (builder) => builder,
})

export type SymbolsRetrievedPayload = {
    payload: {
        symbols: TradingSymbols
    }
}
