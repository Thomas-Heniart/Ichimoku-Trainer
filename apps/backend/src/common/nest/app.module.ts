import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { IchimokuIndicatorsModule } from '../../features/ichimoku-indicators/adapters/primaries/nest/ichimoku-indicators.module'

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../..', 'frontend', 'dist'),
        }),
        IchimokuIndicatorsModule,
    ],
})
export class AppModule {}
