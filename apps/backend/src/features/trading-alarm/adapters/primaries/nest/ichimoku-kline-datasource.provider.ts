import { Provider, Scope } from '@nestjs/common'
import { BinanceIchimokuKlineDatasource } from '../../secondaries/datasource/binance-ichimoku-kline-datasource'
import { Spot } from '@binance/connector-typescript'
import { MAX_RETRIES } from '../../../../training/config/constants'
import { BINANCE_BASE_API_URL } from '../../../../../common/binance/config'

export const ICHIMOKU_KLINE_DATASOURCE_TOKEN = 'ICHIMOKU_KLINE_DATASOURCE_TOKEN'
export const ichimokuKlineDatasourceProvider: Provider = {
    provide: ICHIMOKU_KLINE_DATASOURCE_TOKEN,
    useFactory: () =>
        new BinanceIchimokuKlineDatasource(new Spot(null, null, { baseURL: BINANCE_BASE_API_URL }), MAX_RETRIES),
    scope: Scope.REQUEST,
}
