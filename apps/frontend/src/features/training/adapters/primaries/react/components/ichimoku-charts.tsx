import { useDispatch, useSelector } from 'react-redux'
import { ichimokuDrawVM } from '../view-model-generators/ichimoku-draw/ichimoku-draw-vm.selector.ts'
import { ChangeEventHandler } from 'react'
import { WorkingUnit } from '../../../../hexagon/models/indicators.model.ts'
import { AppDispatch, AppState } from '../../../../../../common/store/reduxStore.ts'
import { IchimokuChart } from './ichimoku-chart.tsx'
import { changeWorkingUnit } from '../../../../hexagon/use-cases/change-working-unit/change-working-unit.ts'

// type CandleVM = null | { time: Date; open: number; close: number; low: number; high: number }

export const IchimokuCharts = () => {
    const dispatch = useDispatch<AppDispatch>()
    const workingUnit = useSelector((state: AppState) => state.training.workingUnit || 'horizon')
    const data = useSelector(ichimokuDrawVM(workingUnit))

    const onWorkingUnitChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        dispatch(changeWorkingUnit({ workingUnit: e.target.value as WorkingUnit }))
    }

    if (!data) return <></>

    return (
        <>
            <select name="select" aria-label="Select" required value={workingUnit} onChange={onWorkingUnitChange}>
                <option value={'horizon'}>Horizon (1d)</option>
                <option value={'graphical'}>Graphical (1h)</option>
                <option value={'intervention'}>Intervention (15m)</option>
            </select>
            <IchimokuChart data={data} />
        </>
    )
}
