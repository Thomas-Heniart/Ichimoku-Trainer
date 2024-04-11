import {
  initReduxStore,
  ReduxStore,
} from "../../../../../../../store/reduxStore";
import { symbolsSlice } from "../../../../../../hexagon/reducers/symbols.slice";
import { symbolsVM } from "../symbols-vm";

describe("Symbols view model generators", () => {
  let store: ReduxStore;

  beforeEach(() => {
    store = initReduxStore({});
  });

  it("does not show any symbol initially", () => {
    expect(symbolsVM(store.getState())).toEqual([]);
  });

  it("displays retrieved symbols", () => {
    store.dispatch(
      symbolsSlice.actions.symbolsRetrieved({ symbols: ["AAPL", "GOLD"] }),
    );

    expect(symbolsVM(store.getState())).toEqual(["AAPL", "GOLD"]);
  });
});
