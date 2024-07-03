import { AppState } from '../../../../../../../common/store/reduxStore.ts'

export const isLaunchingTrainingVM = (state: AppState) => state.training.isLoading
