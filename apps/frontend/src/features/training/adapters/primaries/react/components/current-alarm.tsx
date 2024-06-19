import { useSelector } from 'react-redux'
import { AppState } from '../../../../../../common/store/reduxStore.ts'

export const CurrentAlarm = () => {
    const alarm = useSelector((state: AppState) => state.training.alarm)

    if (!alarm) return <></>
    return (
        <div>
            <strong>{alarm.date.toString()}</strong>&emsp;
            <strong>Type: {alarm.type}</strong>&emsp;
            <strong>Side: {alarm.side}</strong>
        </div>
    )
}
