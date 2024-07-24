import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig, AppState } from '../../../../../common/store/reduxStore.ts'
import { UTCDate } from '@date-fns/utc'
import { AllIndicators } from '../../models/indicators.model.ts'

export const retrieveAlarmIndicators = createAsyncThunk<
    { indicators: AllIndicators | null },
    void,
    AppAsyncThunkConfig
>('training/retrieve-alarm-indicators', async (_, { getState, extra: { indicatorGateway } }) => {
    const state = getState() as AppState
    const currentAlarm = state.tradingAlarm.currentAlarm
    if (!currentAlarm) return { indicators: null }
    const indicators = await indicatorGateway.retrieveIndicators(new UTCDate(currentAlarm.date))
    return {
        indicators,
    }
})
