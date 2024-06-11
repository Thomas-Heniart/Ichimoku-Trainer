import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig } from '../../../../../common/store/reduxStore.ts'
import { TradingAlarm } from '../../models/trading-alarm.ts'

export const launchTraining = createAsyncThunk<{ alarm: TradingAlarm | null }, void, AppAsyncThunkConfig>(
    'training/launch',
    async (_, { extra: { tradingAlarmGateway, randomTrainingStartDate } }) => {
        const from = randomTrainingStartDate()
        const alarm = await tradingAlarmGateway.nextAlarmFrom({ from })
        return {
            alarm,
        }
    },
)
