import { TrainingHomepage } from './features/training/adapters/primaries/react/components/training-homepage.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'
import { IchimokuCharts } from './features/training/adapters/primaries/react/components/ichimoku-charts.tsx'

export default function App() {
    return (
        <>
            <header>
                <h1>Ichimoku trainer</h1>
            </header>
            <main>
                <TrainingHomepage />
                <CurrentAlarm />
                <IchimokuCharts />
            </main>
        </>
    )
}
