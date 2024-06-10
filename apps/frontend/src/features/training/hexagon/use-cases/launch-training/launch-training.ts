import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig } from '../../../../../common/store/reduxStore.ts'
import { trainingSlice } from '../../reducers/training.reducer.ts'

export const launchTraining = createAsyncThunk<void, void, AppAsyncThunkConfig>(
    'training/launch',
    async (_, { extra: { tradingAlarmGateway, randomTrainingStartDate }, dispatch }) => {
        const from = randomTrainingStartDate()
        const tradingAlarm = await tradingAlarmGateway.nextAlarmFrom({ from })
        dispatch(trainingSlice.actions.onTradingAlarmRetrieved({ tradingAlarm }))
    },
)
