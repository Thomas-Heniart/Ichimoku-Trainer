import { AppState } from '../../../../../../../common/store/reduxStore.ts'
import { createSelector } from '@reduxjs/toolkit'

export type CurrentPositionVM = {
    status: 'OPENABLE' | 'NEUTRAL_PNL' | 'POSITIVE_PNL' | 'NEGATIVE_PNL'
    pnl: string | null
}

const hasNoChartSelector = (state: AppState) => !state.interventionIndicators.timestamps.length

const openPositionSelector = (state: AppState) => state.openPosition

const pnlToStatus = (pnl: number): CurrentPositionVM['status'] => {
    if (pnl === 0) return 'NEUTRAL_PNL'
    return pnl > 0 ? 'POSITIVE_PNL' : 'NEGATIVE_PNL'
}

export const getCurrentPositionVM = createSelector(
    [hasNoChartSelector, openPositionSelector],
    (hasNoChart, openPosition) => {
        if (hasNoChart) return null
        if (!openPosition.openingPrice) return { status: 'OPENABLE', pnl: null }
        const pnl = (openPosition.pnl! * 100).toFixed(2).toString()
        return {
            status: pnlToStatus(openPosition.pnl!),
            pnl,
        }
    },
)
