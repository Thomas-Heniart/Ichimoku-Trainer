import { Module } from '@nestjs/common'
import { TradingAlarmController } from './controllers/trading-alarm.controller'
import { nextAlarmFromProvider } from './next-alarm.provider'

@Module({
    controllers: [TradingAlarmController],
    providers: [nextAlarmFromProvider],
})
export class TrainingModule {}
