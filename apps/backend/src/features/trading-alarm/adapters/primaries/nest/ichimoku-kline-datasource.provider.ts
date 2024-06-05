import { Provider } from '@nestjs/common'
import { BinanceIchimokuKlineDatasource } from '../../secondaries/datasource/binance-ichimoku-kline-datasource'
import { Spot } from '@binance/connector-typescript'

export const ICHIMOKU_KLINE_DATASOURCE_TOKEN = 'ICHIMOKU_KLINE_DATASOURCE_TOKEN'
export const ichimokuKlineDatasourceProvider: Provider = {
    provide: ICHIMOKU_KLINE_DATASOURCE_TOKEN,
    useFactory: () => new BinanceIchimokuKlineDatasource(new Spot()),
}
