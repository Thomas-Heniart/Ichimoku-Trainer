import { useSelector } from 'react-redux'
import { AppState } from '../../../../../../common/store/reduxStore.ts'

export const CurrentAlarm = () => {
    const alarm = useSelector((state: AppState) => state.training.alarm)

    if (!alarm) return <></>
    return (
        <div>
            <p>{alarm.date}</p>
            <p>{alarm.type}</p>
            <p>{alarm.side}</p>
        </div>
    )
}
