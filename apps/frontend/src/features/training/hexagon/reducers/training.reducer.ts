import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TradingAlarm } from '../models/trading-alarm.ts'

type State = {
    alarm: TradingAlarm | null
}
const initialState = (): State => ({
    alarm: null,
})
export const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {
        onTradingAlarmRetrieved: (state, { payload }: PayloadAction<{ tradingAlarm: TradingAlarm | null }>) => {
            state.alarm = payload.tradingAlarm
        },
    },
})
