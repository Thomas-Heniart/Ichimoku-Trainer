import { IndicatorGateway } from '../../../hexagon/ports/indicator.gateway.ts'
import { IndicatorsQuery } from '../../../hexagon/use-cases/retrieve-indicators/retrieve-indicators.ts'
import { Indicators } from '../../../hexagon/models/indicators.model.ts'
import { demoIndicators } from '../../../config/dependencies/demo-indicators.ts'

export class DemoIndicatorGateway implements IndicatorGateway {
    async retrieveIndicators(query: IndicatorsQuery): Promise<Indicators> {
        if (query.symbol !== 'AAPL') return defaultData()
        return demoIndicators
    }
}

const defaultData = () => ({
    horizon: {
        timestamps: [],
        candles: {
            open: [],
            close: [],
            max: [],
            min: [],
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: [],
    },
    graphical: {
        timestamps: [],
        candles: {
            open: [],
            close: [],
            max: [],
            min: [],
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: [],
    },
    intervention: {
        timestamps: [],
        candles: {
            open: [],
            close: [],
            max: [],
            min: [],
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: [],
    },
})
