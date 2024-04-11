import {
  initReduxStore,
  ReduxStore
} from "../../../../../../../store/reduxStore";
import { indicatorsSlice } from "../../../../../../hexagon/reducers/indicators.slice";
import {
  AAPL_SHORT_TIME_TODAY_ARBITRARY_INDICATORS
} from "../../../../../../hexagon/use-cases/retrieve-indicators/__test__/retrieve-indicators.spec";
import { WorkingUnitData } from "../../../../../../hexagon/models/indicators.model";
import { ichimokuDrawVM } from "./ichimoku-draw-vm.selector";

describe("Ichimoku draw view model generators", () => {
  let store: ReduxStore;

  beforeEach(() => {
    store = initReduxStore({});
  });

  test("does not have drawing data initially", () => {
    expect(ichimokuDrawVM()(store.getState())).toEqual(null);
  });

  it("draws the horizon working unit by default", () => {
    store.dispatch(
      indicatorsSlice.actions.indicatorsRetrieved({
        indicators: AAPL_SHORT_TIME_TODAY_ARBITRARY_INDICATORS
      })
    );

    expect(ichimokuDrawVM()(store.getState())).toEqual({
      ...AAPL_SHORT_TIME_TODAY_ARBITRARY_INDICATORS["horizon"],
      previousKijun: [],
      previousSsa: [],
      previousSsb: [],
      previousLagging: []
    });
  });

  it("draws the graphical working unit with horizon kijun, cloud and lagging span for a single timestamp", () => {
    const horizonTimestamps = [1000000000000];
    const graphicalTimestamps = [1000000000000];
    const interventionTimestamps = [1000000000000];
    const horizonData =
      arbitraryIndicatorsBasedOnTimestampsIndex(horizonTimestamps);
    const graphicalData =
      arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps);
    const interventionData = arbitraryIndicatorsBasedOnTimestampsIndex(
      interventionTimestamps
    );
    store.dispatch(
      indicatorsSlice.actions.indicatorsRetrieved({
        indicators: {
          horizon: horizonData,
          graphical: graphicalData,
          intervention: interventionData
        }
      })
    );

    expect(ichimokuDrawVM("graphical")(store.getState())).toEqual({
      ...arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps),
      previousKijun: horizonData.kijun,
      previousSsa: horizonData.ssa,
      previousSsb: horizonData.ssb,
      previousLagging: horizonData.lagging
    });
  });

  it("draws the graphical working unit with horizon kijun, cloud and lagging span for 1 horizon timestamp containing 2 graphical ones", () => {
    const horizonTimestamps = [1000000000000];
    const graphicalTimestamps = [1000000000000, 1100000000000];
    const interventionTimestamps = [1000000000000];
    const horizonData =
      arbitraryIndicatorsBasedOnTimestampsIndex(horizonTimestamps);
    const graphicalData =
      arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps);
    const interventionData = arbitraryIndicatorsBasedOnTimestampsIndex(
      interventionTimestamps
    );
    store.dispatch(
      indicatorsSlice.actions.indicatorsRetrieved({
        indicators: {
          horizon: horizonData,
          graphical: graphicalData,
          intervention: interventionData
        }
      })
    );

    expect(ichimokuDrawVM("graphical")(store.getState())).toEqual({
      ...arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps),
      previousKijun: [0, 0],
      previousSsa: [0, 0],
      previousSsb: [0, 0],
      previousLagging: [0, 0]
    });
  });

  it("zooms on horizon when selecting graphical working unit", () => {
    const horizonTimestamps = [1000000000000, 1200000000000];
    const graphicalTimestamps = [
      1000000000000, 1100000000000, 1200000000000, 1300000000000
    ];
    const interventionTimestamps = [1000000000000];
    const horizonData =
      arbitraryIndicatorsBasedOnTimestampsIndex(horizonTimestamps);
    const graphicalData =
      arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps);
    const interventionData = arbitraryIndicatorsBasedOnTimestampsIndex(
      interventionTimestamps
    );
    store.dispatch(
      indicatorsSlice.actions.indicatorsRetrieved({
        indicators: {
          horizon: horizonData,
          graphical: graphicalData,
          intervention: interventionData
        }
      })
    );

    expect(ichimokuDrawVM("graphical")(store.getState())).toEqual({
      ...arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps),
      previousKijun: [0, 0, 1, 1],
      previousSsa: [0, 0, 1, 1],
      previousSsb: [0, 0, 1, 1],
      previousLagging: [0, 0, 1, 1]
    });
  });

  it("draws the intervention working unit with graphical kijun, cloud and lagging span for a single timestamp", () => {
    const horizonTimestamps: Array<number> = [];
    const graphicalTimestamps = [1000000000000];
    const interventionTimestamps = [1000000000000];
    const horizonData =
      arbitraryIndicatorsBasedOnTimestampsIndex(horizonTimestamps);
    const graphicalData =
      arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps);
    const interventionData = arbitraryIndicatorsBasedOnTimestampsIndex(
      interventionTimestamps
    );
    store.dispatch(
      indicatorsSlice.actions.indicatorsRetrieved({
        indicators: {
          horizon: horizonData,
          graphical: graphicalData,
          intervention: interventionData
        }
      })
    );

    expect(ichimokuDrawVM("intervention")(store.getState())).toEqual({
      ...arbitraryIndicatorsBasedOnTimestampsIndex(graphicalTimestamps),
      previousKijun: graphicalData.kijun,
      previousSsa: graphicalData.ssa,
      previousSsb: graphicalData.ssb,
      previousLagging: graphicalData.lagging
    });
  });

  const arbitraryIndicatorsBasedOnTimestampsIndex = (
    timestamps: Array<number>
  ): WorkingUnitData => {
    return timestamps.reduce<WorkingUnitData>(
      (acc, current, i) => {
        return {
          timestamps: [...acc.timestamps, current],
          candles: {
            open: [...acc.candles.open, i],
            close: [...acc.candles.close, i],
            max: [...acc.candles.max, i],
            min: [...acc.candles.min, i]
          },
          tenkan: [...acc.tenkan, i],
          kijun: [...acc.kijun, i],
          ssa: [...acc.ssa, i],
          ssb: [...acc.ssb, i],
          lagging: [...acc.lagging, i]
        };
      },
      {
        timestamps: [],
        candles: {
          open: [],
          close: [],
          max: [],
          min: []
        },
        tenkan: [],
        kijun: [],
        ssa: [],
        ssb: [],
        lagging: []
      }
    );
  };
});
