import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppState } from '../../../../../common/store/reduxStore.ts'
import { TradingSide } from '../../reducers/open-position.reducer.ts'

import { endOfInterventionCandleTimestamp, lastClosingPrice } from '../../models/indicators.model.ts'

export const openAPosition = createAsyncThunk(
    'position/open',
    async ({ side }: { side: TradingSide }, { getState }) => {
        const state = getState() as AppState
        const openedAt = endOfInterventionCandleTimestamp(state.interventionIndicators)
        return {
            openedAt,
            openingPrice: lastClosingPrice(state.interventionIndicators),
            side,
        }
    },
)
