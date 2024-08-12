import { createAsyncThunk } from '@reduxjs/toolkit'
import { ClosedPosition } from '../../models/closed-position.model.ts'
import { AppAsyncThunkConfig, AppState } from '../../../../../common/store/reduxStore.ts'
import { endOfInterventionCandleTimestamp } from '../../models/indicators.model.ts'

export const closeCurrentPosition = createAsyncThunk<ClosedPosition, void, AppAsyncThunkConfig>(
    'position/close',
    async (_, { getState, extra: { closedPositionRepository } }) => {
        const state = getState() as AppState
        const position = {
            openedAt: state.openPosition.openedAt!,
            closedAt: endOfInterventionCandleTimestamp(state.interventionIndicators),
            pnl: state.openPosition.pnl!,
        }
        await closedPositionRepository.save(position)
        return position
    },
)
