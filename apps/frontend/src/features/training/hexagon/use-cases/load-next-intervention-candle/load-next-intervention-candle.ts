import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig, AppState } from '../../../../../common/store/reduxStore.ts'
import { IchimokuCloudResult } from 'indicatorts'
import { Candle } from '../../models/candle.model.ts'

export const loadNextInterventionCandle = createAsyncThunk<
    { candle: Candle; ichimokuIndicators: IchimokuCloudResult },
    void,
    AppAsyncThunkConfig
>('intervention/next-candle', async (_, { getState, extra: { candleGateway, calculateIchimokuIndicators } }) => {
    const interventionData = (getState() as AppState).training.indicators!.intervention
    const lastClosedCandleTimestamp = interventionData.timestamps[interventionData.candles.close.length - 1]
    const candle = await candleGateway.candleAfter(lastClosedCandleTimestamp)
    const { highs, lows, closings } = {
        highs: [...interventionData.candles.high, candle.high],
        lows: [...interventionData.candles.low, candle.low],
        closings: [...interventionData.candles.close, candle.close],
    }
    return { candle, ichimokuIndicators: calculateIchimokuIndicators({ highs, lows, closings }) }
})
