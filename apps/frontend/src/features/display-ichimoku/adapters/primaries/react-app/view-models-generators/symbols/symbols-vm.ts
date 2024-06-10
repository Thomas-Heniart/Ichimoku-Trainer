import { AppState } from '../../../../../../../common/store/reduxStore.ts'
import { TradingSymbols } from '../../../../../hexagon/models/trading-symbol.model.ts'

export const symbolsVM = (state: AppState): SymbolsVM => state.symbols.all || []

export type SymbolsVM = TradingSymbols
