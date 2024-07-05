import { StartTrainingButton } from './features/training/adapters/primaries/react/components/start-training-button.tsx'
import { CurrentAlarm } from './features/training/adapters/primaries/react/components/current-alarm.tsx'
import './App.css'
import { SelectWorkingUnit } from './features/training/adapters/primaries/react/components/select-working-unit.tsx'
import { IchimokuChart } from './features/training/adapters/primaries/react/components/ichimoku-chart.tsx'
import { MouseEventHandler } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './common/store/reduxStore.ts'
import { loadNextInterventionCandle } from './features/training/hexagon/use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

export default function App() {
    const dispatch = useDispatch<AppDispatch>()

    const onNextInterventionCandleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        dispatch(loadNextInterventionCandle())
    }

    return (
        <div className={'app'}>
            <StartTrainingButton />
            <div className={'chart-grid'}>
                <IchimokuChart />
                <div>
                    <CurrentAlarm />
                    <SelectWorkingUnit />
                    <button type={'button'} onClick={onNextInterventionCandleClick}>
                        Next intervention candle
                    </button>
                </div>
            </div>
        </div>
    )
}
