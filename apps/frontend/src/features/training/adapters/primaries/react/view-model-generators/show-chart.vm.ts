import { AppState } from '../../../../../../common/store/reduxStore.ts'

export const showChartVM = (state: AppState): boolean => !!state.interventionIndicators.timestamps.length
