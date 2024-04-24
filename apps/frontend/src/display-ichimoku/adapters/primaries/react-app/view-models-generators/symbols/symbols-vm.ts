import { AppState } from '../../../../../../store/reduxStore'
import { TradingSymbols } from '../../../../../hexagon/models/trading-symbol.model'

export const symbolsVM = (state: AppState): SymbolsVM => state.symbols.all || []

export type SymbolsVM = TradingSymbols
