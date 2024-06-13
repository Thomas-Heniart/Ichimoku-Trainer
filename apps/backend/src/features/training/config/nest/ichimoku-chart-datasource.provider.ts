import { Provider } from '@nestjs/common'
import { BinanceIchimokuChartDatasource } from '../../adapters/secondaries/datasources/binance-ichimoku-chart.datasource'
import { Spot } from '@binance/connector-typescript'
import { BINANCE_BASE_API_URL } from '../../../../common/binance/config'

export const ICHIMOKU_CHART_DATASOURCE_TOKEN = 'ICHIMOKU_CHART_DATASOURCE_TOKEN'

export const ichimokuChartDatasourceProvider: Provider = {
    provide: ICHIMOKU_CHART_DATASOURCE_TOKEN,
    useFactory: () => new BinanceIchimokuChartDatasource(new Spot(null, null, { baseURL: BINANCE_BASE_API_URL })),
}
