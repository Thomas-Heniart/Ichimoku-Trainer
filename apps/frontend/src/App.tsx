import { TrainingHomepage } from './features/training/adapters/primaries/react/components/training-homepage.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'
import { IchimokuCharts } from './features/training/adapters/primaries/react/components/ichimoku-charts.tsx'
import './App.css'

export default function App() {
    return (
        <div className={'app'}>
            <TrainingHomepage />
            <CurrentAlarm />
            <IchimokuCharts />
        </div>
    )
}
