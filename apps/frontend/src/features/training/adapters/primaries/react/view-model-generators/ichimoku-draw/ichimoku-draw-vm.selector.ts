import { Indicators, WorkingUnit } from '../../../../../hexagon/models/indicators.model.ts'
import { AppState } from '../../../../../../../common/store/reduxStore.ts'
import { createSelector } from '@reduxjs/toolkit'

const workingUnitVM = (state: AppState) => state.training.workingUnit
const longerWorkingUnitWorkingUnitVM = (state: AppState) => {
    if (!state.training.workingUnit) return null
    return longerWorkingUnits[state.training.workingUnit] || null
}

const interventionIndicatorsVM = (state: AppState) => state.interventionIndicators
const graphicalIndicatorsVM = (state: AppState) => state.graphicalIndicators
const horizonIndicatorsVM = (state: AppState) => state.horizonIndicators

const allIndicatorsVM = createSelector(
    [interventionIndicatorsVM, graphicalIndicatorsVM, horizonIndicatorsVM],
    (interventionIndicators, graphicalIndicators, horizonIndicators): Record<WorkingUnit, Indicators> => ({
        horizon: horizonIndicators,
        graphical: graphicalIndicators,
        intervention: interventionIndicators,
    }),
)

const workingUnitDataVM = createSelector(
    [workingUnitVM, allIndicatorsVM],
    (workingUnit, allIndicatorsVM): Indicators | null => {
        if (!workingUnit) return null
        return allIndicatorsVM[workingUnit]
    },
)

const zoomedInWorkingUnitDataVM = createSelector(
    [workingUnitVM, longerWorkingUnitWorkingUnitVM, allIndicatorsVM],
    (unit, longerUnit, indicators): ZoomedIndicatorsVM => {
        if (!unit || !longerUnit || !indicators)
            return { previousKijun: [], previousSsa: [], previousSsb: [], previousLagging: [] }
        const zoomedWorkingUnitData = indicators[longerUnit]
        return zoomIn(zoomedWorkingUnitData, indicators[unit].timestamps)
    },
)

export const ichimokuDrawVM = createSelector(
    [workingUnitDataVM, zoomedInWorkingUnitDataVM],
    (workingUnitData, zoomedInWorkingUnitData): IchimokuDrawVM => {
        if (!workingUnitData) return null
        return {
            ...workingUnitData,
            ...zoomedInWorkingUnitData,
        }
    },
)

const longerWorkingUnits: Partial<Record<WorkingUnit, WorkingUnit>> = {
    graphical: 'horizon',
    intervention: 'graphical',
}

const zoomIn = (longerWorkingUnitData: Indicators, timestamps: Indicators['timestamps']) => {
    return timestamps.reduce<ZoomedIndicatorsVM>(
        (acc, t) => {
            const i = leastSuperiorIndexForTimestamp(longerWorkingUnitData.timestamps, t)
            return {
                previousKijun: [...acc.previousKijun, longerWorkingUnitData.kijun[i]],
                previousSsa: [...acc.previousSsa, longerWorkingUnitData.ssa[i]],
                previousSsb: [...acc.previousSsb, longerWorkingUnitData.ssb[i]],
                previousLagging: [...acc.previousLagging, longerWorkingUnitData.lagging[i]],
            }
        },
        {
            previousKijun: [],
            previousSsa: [],
            previousSsb: [],
            previousLagging: [],
        },
    )
}

const leastSuperiorIndexForTimestamp = (largerTimestamps: Indicators['timestamps'], t: number) => {
    const idx = largerTimestamps.findIndex((t1) => t1 > t) - 1
    return idx > -1 ? idx : largerTimestamps.length - 1
}

export type IchimokuDrawVM = null | (Indicators & ZoomedIndicatorsVM)

export type ZoomedIndicatorsVM = {
    previousKijun: Array<number>
    previousSsa: Array<number>
    previousSsb: Array<number>
    previousLagging: Array<number>
}
