import { AppState } from '../../../../../../../common/store/reduxStore.ts'
import { createSelector } from '@reduxjs/toolkit'

const hasNoChartSelector = (state: AppState) => !state.interventionIndicators.timestamps.length

const openPositionSelector = (state: AppState) => state.openPosition!

export const getCurrentPositionVM = createSelector(
    [hasNoChartSelector, openPositionSelector],
    (hasNoChart, openPosition) => {
        if (hasNoChart) return null
        const status = openPosition.openingPrice ? 'DISPLAY_PNL' : 'OPENABLE'
        if (openPosition.pnl === null) return { status, pnl: null }
        const pnl = (openPosition.pnl * 100).toFixed(2).toString()
        return {
            status,
            pnl,
        }
    },
)
