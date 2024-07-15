import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig, AppState } from '../../../../../common/store/reduxStore.ts'
import { Candle } from '../../models/candle.model.ts'

export const loadNextInterventionCandle = createAsyncThunk<{ candle: Candle }, void, AppAsyncThunkConfig>(
    'intervention/next-candle',
    async (_, { getState, extra: { candleGateway } }) => {
        const interventionData = (getState() as AppState).training.indicators!.intervention
        const lastClosedCandleTimestamp = interventionData.timestamps[interventionData.candles.close.length - 1]
        const candle = await candleGateway.candleAfter(lastClosedCandleTimestamp)
        return { candle }
    },
)
