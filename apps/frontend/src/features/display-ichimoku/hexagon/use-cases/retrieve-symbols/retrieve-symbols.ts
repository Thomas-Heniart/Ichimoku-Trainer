import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppAsyncThunkConfig } from '../../../../../common/store/reduxStore.ts'
import { symbolsSlice } from '../../reducers/symbols.slice.ts'

export const retrieveSymbols = createAsyncThunk<void, void, AppAsyncThunkConfig>(
    'symbols/all',
    async (_, { dispatch, extra: { symbolGateway } }) => {
        const symbols = await symbolGateway.retrieveAll()
        dispatch(symbolsSlice.actions.symbolsRetrieved({ symbols }))
    },
)
