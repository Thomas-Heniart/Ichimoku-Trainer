import { Action, combineReducers, configureStore, Store, ThunkDispatch } from '@reduxjs/toolkit'

import { IndicatorGateway } from '../../features/training/hexagon/ports/gateways/indicator.gateway.ts'
import { GetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware'
import { BaseThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk'
import { UTCDate } from '@date-fns/utc'
import { trainingSlice } from '../../features/training/hexagon/reducers/training.reducer.ts'
import { TradingAlarmGateway } from '../../features/training/hexagon/ports/gateways/trading-alarm.gateway.ts'
import { CandleGateway } from '../../features/training/hexagon/ports/gateways/candle.gateway.ts'
import { CalculateIchimokuIndicators } from '../../features/training/hexagon/models/services/calculate-ichimoku-indicators.service.ts'

export interface Dependencies {
    indicatorGateway: IndicatorGateway
    tradingAlarmGateway: TradingAlarmGateway
    randomTrainingStartDate: () => UTCDate
    candleGateway: CandleGateway
    calculateIchimokuIndicators: CalculateIchimokuIndicators
}

const rootReducer = combineReducers({
    training: trainingSlice.reducer,
})
export const initReduxStore = (dependencies: Partial<Dependencies>) => {
    return configureStore({
        reducer: rootReducer,
        devTools: true,
        middleware: (getDefaultMiddleware: GetDefaultMiddleware<AppState>) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: dependencies,
                },
            }),
    })
}

export type AppState = ReturnType<typeof rootReducer>

export type ReduxStore = Store<AppState> & {
    dispatch: ThunkDispatch<AppState, Dependencies, Action>
}

export type AppAsyncThunkConfig = BaseThunkAPI<AppState, Dependencies>

export type AppDispatch = ThunkDispatch<AppState, Dependencies, Action>
