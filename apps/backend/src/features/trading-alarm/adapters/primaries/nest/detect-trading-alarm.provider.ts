import { Provider } from '@nestjs/common'
import { IchimokuKlineDatasource } from '../../../hexagon/ports/ichimoku-kline.datasource'
import {
    detectTradingAlarm,
    DetectTradingAlarm,
} from '../../../hexagon/use-cases/detect-trading-alarm/detect-trading-alarm'

import { ICHIMOKU_KLINE_DATASOURCE_TOKEN } from './ichimoku-kline-datasource.provider'

export const DETECT_TRADING_ALARM_TOKEN = 'DETECT_TRADING_ALARM_TOKEN'
export const detectTradingAlarmProvider: Provider = {
    provide: DETECT_TRADING_ALARM_TOKEN,
    useFactory: (ichimokuKlineDatasource: IchimokuKlineDatasource): DetectTradingAlarm =>
        detectTradingAlarm({ ichimokuKlineDatasource }),
    inject: [ICHIMOKU_KLINE_DATASOURCE_TOKEN],
}
