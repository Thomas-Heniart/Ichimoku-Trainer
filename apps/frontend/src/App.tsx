import { StartTrainingButton } from './features/training/adapters/primaries/react/components/start-training-button.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'
import { IchimokuCharts } from './features/training/adapters/primaries/react/components/ichimoku-charts.tsx'
import './App.css'

export default function App() {
    return (
        <div className={'app'}>
            <StartTrainingButton />
            <div className={'chart-grid'}>
                <IchimokuCharts />
                <CurrentAlarm />
            </div>
        </div>
    )
}
