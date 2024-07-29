import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../../../../../common/store/reduxStore.ts'
import { TradingSide } from '../../../../hexagon/reducers/open-position.reducer.ts'
import { MouseEventHandler } from 'react'
import { openAPosition } from '../../../../hexagon/use-cases/open-a-position/open-a-position.ts'
import { getCurrentPositionVM } from '../view-model-generators/current-position/get-current-position.vm.ts'

export const CurrentPosition = () => {
    const currentPositionVM = useSelector(getCurrentPositionVM)

    if (!currentPositionVM) return <></>
    if (currentPositionVM.status === 'OPENABLE') return <OpenPositionButtons />
    return <div>Current position PnL: {currentPositionVM.pnl}%</div>
}

const OpenPositionButtons = () => {
    const dispatch = useDispatch<AppDispatch>()

    const onOpenAPosition =
        (side: TradingSide): MouseEventHandler<HTMLButtonElement> =>
        (e) => {
            e.preventDefault()
            dispatch(openAPosition({ side }))
        }

    return (
        <div>
            Open a position
            <button onClick={onOpenAPosition('LONG')}>LONG</button>/
            <button onClick={onOpenAPosition('SHORT')}>SHORT</button>
        </div>
    )
}
