import { TrainingHomepage } from './features/training/adapters/primaries/react/components/training-homepage.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'

export default function App() {
    return (
        <>
            <header>
                <h1>Ichimoku trainer</h1>
            </header>
            <main>
                <TrainingHomepage />
                <CurrentAlarm />
            </main>
        </>
    )
}
