import { TradingSymbols } from "../models/trading-symbol.model";

export interface SymbolGateway {
  retrieveAll(): Promise<TradingSymbols>;
}
