import { MouseEventHandler } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../../../hexagon/use-cases/launch-training/launch-training.ts'
import { retrieveAlarmIndicators } from '../../../../hexagon/use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import './css/training-homepage.css'
import { isLaunchingTrainingVM } from '../view-model-generators/start-training-button/start-training-button.vm.ts'

export const StartTrainingButton = () => {
    const dispatch = useDispatch<AppDispatch>()
    const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        dispatch(launchTraining()).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') return dispatch(retrieveAlarmIndicators())
        })
    }
    const isLoading = useSelector(isLaunchingTrainingVM)

    return (
        <button disabled={isLoading} onClick={onClick} id={'launch-training-button'}>
            {!isLoading && <span>Launch training</span>}
            {isLoading && <span className="loader"></span>}
        </button>
    )
}
