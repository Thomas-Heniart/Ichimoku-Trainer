import { TradingSymbol } from '../../models/trading-symbol.model'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig } from '../../../../store/reduxStore'
import { indicatorsSlice } from '../../reducers/indicators.slice'

import { TradingTimeUnit } from '../../models/trading-time-unit.model'

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
