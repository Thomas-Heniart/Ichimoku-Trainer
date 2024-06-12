import { Module } from '@nestjs/common'
import { TradingAlarmController } from './controllers/trading-alarm.controller'
import { nextAlarmFromProvider } from '../../../config/nest/next-alarm.provider'
import { ichimokuChartDatasourceProvider } from '../../../config/nest/ichimoku-chart-datasource.provider'

@Module({
    controllers: [TradingAlarmController],
    providers: [nextAlarmFromProvider, ichimokuChartDatasourceProvider],
})
export class TrainingModule {}
