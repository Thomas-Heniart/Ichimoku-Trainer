import { SymbolGateway } from '../../../hexagon/ports/symbol.gateway'
import { TradingSymbols } from '../../../hexagon/models/trading-symbol.model'

export class InMemorySymbolGateway implements SymbolGateway {
    private _symbols: TradingSymbols = []

    async retrieveAll(): Promise<TradingSymbols> {
        return this._symbols
    }

    set symbols(value: TradingSymbols) {
        this._symbols = value
    }
}
