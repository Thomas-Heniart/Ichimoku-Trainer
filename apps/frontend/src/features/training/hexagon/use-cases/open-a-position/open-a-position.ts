import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppState } from '../../../../../common/store/reduxStore.ts'
import { addMinutes, endOfMinute } from 'date-fns'
import { TradingSide } from '../../reducers/open-position.reducer.ts'

export const openAPosition = createAsyncThunk(
    'position/open',
    async ({ side }: { side: TradingSide }, { getState }) => {
        const state = getState() as AppState
        const openedAt = endOfMinute(
            addMinutes(
                state.interventionIndicators.timestamps[state.interventionIndicators.candles.close.length - 1],
                14,
            ),
        ).valueOf()
        return {
            openedAt,
            openingPrice:
                state.interventionIndicators.candles.close[state.interventionIndicators.candles.close.length - 1],
            side,
        }
    },
)
