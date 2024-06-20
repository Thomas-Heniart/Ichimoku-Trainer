import { useSelector } from 'react-redux'
import { ichimokuDrawVM } from '../view-model-generators/ichimoku-draw/ichimoku-draw-vm.selector.ts'
import { useEffect, useState } from 'react'
import { WorkingUnit } from '../../../../hexagon/models/indicators.model.ts'
import { AppState } from '../../../../../../common/store/reduxStore.ts'
import { IchimokuChart } from './ichimoku-chart.tsx'

// type CandleVM = null | { time: Date; open: number; close: number; low: number; high: number }

export const IchimokuCharts = () => {
    const [workingUnit, setWorkingUnit] = useState<WorkingUnit>('horizon')
    const data = useSelector(ichimokuDrawVM(workingUnit))
    const alarm = useSelector((state: AppState) => state.training.alarm)

    useEffect(() => {
        setWorkingUnit('horizon')
    }, [alarm])

    if (!data) return <></>

    return (
        <>
            <select
                name="select"
                aria-label="Select"
                required
                value={workingUnit}
                onChange={(e) => setWorkingUnit(e.target.value as WorkingUnit)}
            >
                <option value={'horizon'}>Horizon (1d)</option>
                <option value={'graphical'}>Graphical (1h)</option>
                <option value={'intervention'}>Intervention (15m)</option>
            </select>
            {/*{currentCandle && (*/}
            {/*    <div>*/}
            {/*        <span>*/}
            {/*            <strong>Date:</strong> {currentCandle.time.toString()}*/}
            {/*        </span>*/}
            {/*        <span>*/}
            {/*            <strong>Open:</strong> {currentCandle.open.toString()}*/}
            {/*        </span>*/}
            {/*        <span>*/}
            {/*            <strong>High:</strong> {currentCandle.high.toString()}*/}
            {/*        </span>*/}
            {/*        <span>*/}
            {/*            <strong>Low:</strong> {currentCandle.low.toString()}*/}
            {/*        </span>*/}
            {/*        <span>*/}
            {/*            <strong>Close:</strong> {currentCandle.close.toString()}*/}
            {/*        </span>*/}
            {/*    </div>*/}
            {/*)}*/}
            <IchimokuChart data={data} />
        </>
    )
}
