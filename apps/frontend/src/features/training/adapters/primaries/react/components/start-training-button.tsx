import { MouseEventHandler } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../../../hexagon/use-cases/launch-training/launch-training.ts'
import { retrieveAlarmIndicators } from '../../../../hexagon/use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import './css/training-homepage.css'

export const StartTrainingButton = () => {
    const dispatch = useDispatch<AppDispatch>()
    const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        dispatch(launchTraining()).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') return dispatch(retrieveAlarmIndicators())
        })
    }

    return <button onClick={onClick}>Begin ichimoku training</button>
}
