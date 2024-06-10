import { TradingSymbols } from '../models/trading-symbol.model.ts'

export interface SymbolGateway {
    retrieveAll(): Promise<TradingSymbols>
}
