import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { TradingAlarmModule } from '../../features/trading-alarm/adapters/primaries/nest/trading-alarm.module'
import { TrainingModule } from '../../features/training/adapters/primaries/nest/training.module'

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../../../../', 'frontend', 'dist'),
        }),
        TradingAlarmModule,
        TrainingModule,
    ],
})
export class AppModule {}
