import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../../../common/store/reduxStore.ts'
import { MouseEventHandler } from 'react'
import { loadNextInterventionCandle } from '../../../../hexagon/use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

export const LoadNextInterventionCandleButton = () => {
    const dispatch = useDispatch<AppDispatch>()

    const onNextInterventionCandleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        dispatch(loadNextInterventionCandle())
    }

    return (
        <button type={'button'} onClick={onNextInterventionCandleClick}>
            Next intervention candle
        </button>
    )
}
