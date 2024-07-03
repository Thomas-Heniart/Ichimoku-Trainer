import { useSelector } from 'react-redux'
import { AppState } from '../../../../../../common/store/reduxStore.ts'

export const CurrentAlarm = () => {
    const alarm = useSelector((state: AppState) => state.training.alarm)

    if (!alarm) return <></>
    return (
        <div>
            <h2>Alarm</h2>
            <p>
                Type: <strong>{alarm.type}</strong>
            </p>
            <p>
                Side: <strong>{alarm.side}</strong>
            </p>
            <p>
                Date: <strong>{new Date(alarm.date).toLocaleString()}</strong>
            </p>
        </div>
    )
}
