import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../../../../../../common/store/reduxStore.ts'
import { ChangeEventHandler } from 'react'
import { changeWorkingUnit } from '../../../../hexagon/use-cases/change-working-unit/change-working-unit.ts'
import { WorkingUnit } from '../../../../hexagon/models/indicators.model.ts'

export const SelectWorkingUnit = () => {
    const dispatch = useDispatch<AppDispatch>()
    const workingUnit = useSelector((state: AppState) => state.training.workingUnit)

    const onWorkingUnitChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        dispatch(changeWorkingUnit({ workingUnit: e.target.value as WorkingUnit }))
    }

    return (
        <>
            {workingUnit && (
                <select name="select" aria-label="Select" value={workingUnit} onChange={onWorkingUnitChange}>
                    <option value={'horizon'}>Horizon (1d)</option>
                    <option value={'graphical'}>Graphical (1h)</option>
                    <option value={'intervention'}>Intervention (15m)</option>
                </select>
            )}
        </>
    )
}
