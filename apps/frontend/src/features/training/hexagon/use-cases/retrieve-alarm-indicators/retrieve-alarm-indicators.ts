import { TradingSymbol } from '../../../../display-ichimoku/hexagon/models/trading-symbol.model.ts'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig, AppState } from '../../../../../common/store/reduxStore.ts'

import { TradingTimeUnit } from '../../../../display-ichimoku/hexagon/models/trading-time-unit.model.ts'
import { UTCDate } from '@date-fns/utc'
import { Indicators } from '../../../../display-ichimoku/hexagon/models/indicators.model.ts'

export type IndicatorsQuery = {
    symbol: TradingSymbol
    timeUnit: TradingTimeUnit
    startDate: Date
}
export const retrieveAlarmIndicators = createAsyncThunk<{ indicators: Indicators }, void, AppAsyncThunkConfig>(
    'training/retrieve-alarm-indicators',
    async (_, { getState, extra: { indicatorGateway } }) => {
        const state = getState() as AppState
        const indicators = await indicatorGateway.retrieveIndicators(new UTCDate(state.training.alarm!.date))
        return {
            indicators,
        }
    },
)
