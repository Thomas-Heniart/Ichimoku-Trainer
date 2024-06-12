import { Provider } from '@nestjs/common'
import { BinanceIchimokuChartDatasource } from '../../adapters/secondaries/datasources/binance-ichimoku-chart.datasource'
import { Spot } from '@binance/connector-typescript'

export const ICHIMOKU_CHART_DATASOURCE_TOKEN = 'ICHIMOKU_CHART_DATASOURCE_TOKEN'

export const ichimokuChartDatasourceProvider: Provider = {
    provide: ICHIMOKU_CHART_DATASOURCE_TOKEN,
    useFactory: () => new BinanceIchimokuChartDatasource(new Spot()),
}
