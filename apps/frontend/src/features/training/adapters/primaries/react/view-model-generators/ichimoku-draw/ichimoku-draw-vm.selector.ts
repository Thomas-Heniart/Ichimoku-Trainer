import { WorkingUnit, WorkingUnitData } from '../../../../../hexagon/models/indicators.model.ts'
import { AppState } from '../../../../../../../common/store/reduxStore.ts'
import { createSelector } from '@reduxjs/toolkit'

const workingUnitVM = (state: AppState) => state.training.workingUnit
const longerWorkingUnitWorkingUnitVM = (state: AppState) => {
    if (!state.training.workingUnit) return null
    return longerWorkingUnits[state.training.workingUnit] || null
}
const indicatorsVM = (state: AppState) => state.training.indicators

const workingUnitDataVM = createSelector(
    [workingUnitVM, indicatorsVM],
    (workingUnit, indicators): WorkingUnitData | null => {
        if (!workingUnit || !indicators) return null
        return indicators[workingUnit]
    },
)

const zoomedInWorkingUnitDataVM = createSelector(
    [workingUnitVM, longerWorkingUnitWorkingUnitVM, indicatorsVM],
    (unit, longerUnit, indicators): ZoomedWorkingUnitDataVM => {
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

// export const ichimokuDrawVM = (state: AppState): IchimokuDrawVM => {
//     if (!state.training.indicators || !state.training.workingUnit) return null
//     const workingUnit = state.training.workingUnit
//     const workingUnitData = state.training.indicators[workingUnit]
//     const longerWorkingUnit = longerWorkingUnits[workingUnit]
//     if (!longerWorkingUnit)
//         return {
//             ...workingUnitData,
//             previousKijun: [],
//             previousSsa: [],
//             previousSsb: [],
//             previousLagging: [],
//         }
//     const zoomedWorkingUnitData = state.training.indicators[longerWorkingUnit]
//     return {
//         ...workingUnitData,
//         ...zoomIn(zoomedWorkingUnitData, workingUnitData.timestamps),
//     }
// }

const longerWorkingUnits: Partial<Record<WorkingUnit, WorkingUnit>> = {
    graphical: 'horizon',
    intervention: 'graphical',
}

const zoomIn = (longerWorkingUnitData: WorkingUnitData, timestamps: WorkingUnitData['timestamps']) => {
    return timestamps.reduce<ZoomedWorkingUnitDataVM>(
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

const leastSuperiorIndexForTimestamp = (largerTimestamps: WorkingUnitData['timestamps'], t: number) => {
    const idx = largerTimestamps.findIndex((t1) => t1 > t) - 1
    return idx > -1 ? idx : largerTimestamps.length - 1
}

export type IchimokuDrawVM = null | (WorkingUnitData & ZoomedWorkingUnitDataVM)

export type ZoomedWorkingUnitDataVM = {
    previousKijun: Array<number>
    previousSsa: Array<number>
    previousSsb: Array<number>
    previousLagging: Array<number>
}
