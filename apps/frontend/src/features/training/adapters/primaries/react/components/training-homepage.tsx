import { MouseEventHandler } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../../../common/store/reduxStore.ts'
import { launchTraining } from '../../../../hexagon/use-cases/launch-training/launch-training.ts'

export const TrainingHomepage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        dispatch(launchTraining())
    }

    return (
        <div>
            <button onClick={onClick}>Begin ichimoku training</button>
        </div>
    )
}
