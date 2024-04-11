import {
  Action,
  combineReducers,
  configureStore,
  Store,
  ThunkDispatch,
} from "@reduxjs/toolkit";

import { symbolsSlice } from "../display-ichimoku/hexagon/reducers/symbols.slice";

import { SymbolGateway } from "../display-ichimoku/hexagon/ports/symbol.gateway";
import { indicatorsSlice } from "../display-ichimoku/hexagon/reducers/indicators.slice";

import { IndicatorGateway } from "../display-ichimoku/hexagon/ports/indicator.gateway";
import { GetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";

export interface Dependencies {
  symbolGateway: SymbolGateway;
  indicatorGateway: IndicatorGateway;
}

const rootReducer = combineReducers({
  symbols: symbolsSlice.reducer,
  indicators: indicatorsSlice.reducer,
});
export const initReduxStore = (dependencies: Partial<Dependencies>) => {
  return configureStore({
    reducer: rootReducer,
    devTools: true,
    middleware: (getDefaultMiddleware: GetDefaultMiddleware<AppState>) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }),
  });
};

export type AppState = ReturnType<typeof rootReducer>;

export type ReduxStore = Store<AppState> & {
  dispatch: ThunkDispatch<AppState, Dependencies, Action>;
};

export type AppAsyncThunkConfig = BaseThunkAPI<AppState, Dependencies>;

export type AppDispatch = ThunkDispatch<AppState, Dependencies, Action>;
