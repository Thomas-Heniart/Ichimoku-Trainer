import { Module } from '@nestjs/common'
import { IchimokuIndicatorsController } from './controllers/ichimoku-indicators.controller'
import { retrieveIndicatorsProvider } from './retrieve-indicators.provider'

@Module({
    imports: [],
    providers: [retrieveIndicatorsProvider, { provide: 'TEST', useValue: 'x' }],
    controllers: [IchimokuIndicatorsController],
})
export class IchimokuIndicatorsModule {}
