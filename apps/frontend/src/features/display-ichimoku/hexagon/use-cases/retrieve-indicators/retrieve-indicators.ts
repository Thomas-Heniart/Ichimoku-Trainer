import { TradingSymbol } from '../../models/trading-symbol.model.ts'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig } from '../../../../../common/store/reduxStore.ts'
import { indicatorsSlice } from '../../reducers/indicators.slice.ts'

import { TradingTimeUnit } from '../../models/trading-time-unit.model.ts'

export type IndicatorsQuery = {
    symbol: TradingSymbol
    timeUnit: TradingTimeUnit
    startDate: Date
}
export const retrieveIndicators = createAsyncThunk<void, IndicatorsQuery, AppAsyncThunkConfig>(
    'indicators/retrieve',
    async (query, { dispatch, extra: { indicatorGateway } }) => {
        const indicators = await indicatorGateway.retrieveIndicators(query)
        dispatch(indicatorsSlice.actions.indicatorsRetrieved({ indicators }))
    },
)
