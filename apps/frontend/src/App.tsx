import { StartTrainingButton } from './features/training/adapters/primaries/react/components/start-training-button.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'
import './App.css'
import { SelectWorkingUnit } from './features/training/adapters/primaries/react/components/select-working-unit.tsx'
import { IchimokuChart } from './features/training/adapters/primaries/react/components/ichimoku-chart.tsx'

export default function App() {
    return (
        <div className={'app'}>
            <StartTrainingButton />
            <div className={'chart-grid'}>
                <IchimokuChart />
                <div>
                    <CurrentAlarm />
                    <SelectWorkingUnit />
                </div>
            </div>
        </div>
    )
}
