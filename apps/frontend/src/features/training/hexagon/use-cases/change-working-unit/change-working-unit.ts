import { createAsyncThunk } from '@reduxjs/toolkit'
import { WorkingUnit } from '../../models/indicators.model.ts'
import { AppAsyncThunkConfig } from '../../../../../common/store/reduxStore.ts'

export const changeWorkingUnit = createAsyncThunk<
    { workingUnit: WorkingUnit },
    { workingUnit: WorkingUnit },
    AppAsyncThunkConfig
>('training/change-working-unit', async ({ workingUnit }) => {
    return { workingUnit }
})
