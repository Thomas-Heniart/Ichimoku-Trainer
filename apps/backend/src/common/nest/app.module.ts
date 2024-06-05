import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { IchimokuIndicatorsModule } from '../../features/ichimoku-indicators/adapters/primaries/nest/ichimoku-indicators.module'
import { TradingAlarmModule } from '../../features/trading-alarm/adapters/primaries/nest/trading-alarm.module'
import { TrainingModule } from '../../features/training/adapters/primaries/nest/training.module'

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../..', 'frontend', 'dist'),
        }),
        IchimokuIndicatorsModule,
        TradingAlarmModule,
        TrainingModule,
    ],
})
export class AppModule {}
