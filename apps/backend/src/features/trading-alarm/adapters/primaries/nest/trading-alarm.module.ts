import { Global, Module } from '@nestjs/common'
import { detectTradingAlarmProvider } from './detect-trading-alarm.provider'
import { ichimokuKlineDatasourceProvider } from './ichimoku-kline-datasource.provider'

@Module({
    providers: [ichimokuKlineDatasourceProvider, detectTradingAlarmProvider],
    exports: [detectTradingAlarmProvider],
})
@Global()
export class TradingAlarmModule {}
