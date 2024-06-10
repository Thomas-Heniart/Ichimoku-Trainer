import { TradingAlarmGateway } from '../../../hexagon/ports/gateways/trading-alarm.gateway.ts'
import { UTCDate } from '@date-fns/utc'
import { TradingAlarm } from '../../../hexagon/models/trading-alarm.ts'
import axios from 'axios'

export class HttpTradingAlarmGateway implements TradingAlarmGateway {
    async nextAlarmFrom({ from }: { from: UTCDate }): Promise<TradingAlarm | null> {
        const response = await axios.get<NextAlarmFromResponse>('/api/trading-alarms/from', {
            params: {
                date: from.valueOf(),
            },
            timeout: 3000,
            timeoutErrorMessage: 'Could not find a training',
        })
        return response.data.alarm
    }
}

type NextAlarmFromResponse = {
    alarm: null | TradingAlarm
}
