import { StartTrainingButton } from './features/training/adapters/primaries/react/components/start-training-button.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'
import './App.css'
import { SelectWorkingUnit } from './features/training/adapters/primaries/react/components/select-working-unit.tsx'
import { IchimokuChart } from './features/training/adapters/primaries/react/components/ichimoku-chart.tsx'
import { LoadNextInterventionCandleButton } from './features/training/adapters/primaries/react/components/load-next-intervention-candle-button.tsx'
import { useSelector } from 'react-redux'
import { showChartVM } from './features/training/adapters/primaries/react/view-model-generators/show-chart.vm.ts'

export default function App() {
    const showChart = useSelector(showChartVM)

    return (
        <div className={'app'}>
            <StartTrainingButton />
            {showChart && (
                <div className={'chart-grid'}>
                    <IchimokuChart />
                    <div>
                        <CurrentAlarm />
                        <SelectWorkingUnit />
                        <LoadNextInterventionCandleButton />
                    </div>
                </div>
            )}
        </div>
    )
}
