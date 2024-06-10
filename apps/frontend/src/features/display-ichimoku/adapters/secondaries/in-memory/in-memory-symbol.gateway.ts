import { SymbolGateway } from '../../../hexagon/ports/symbol.gateway.ts'
import { TradingSymbols } from '../../../hexagon/models/trading-symbol.model.ts'

export class InMemorySymbolGateway implements SymbolGateway {
    private _symbols: TradingSymbols = []

    async retrieveAll(): Promise<TradingSymbols> {
        return this._symbols
    }

    set symbols(value: TradingSymbols) {
        this._symbols = value
    }
}
