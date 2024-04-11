import {
  WorkingUnit,
  WorkingUnitData,
} from "../../../../../../hexagon/models/indicators.model";
import { AppState } from "../../../../../../../store/reduxStore";

export const ichimokuDrawVM =
  (workingUnit: WorkingUnit = "horizon") =>
  (state: AppState): IchimokuDrawVM => {
    if (!state.indicators) return null;
    const workingUnitData = state.indicators[workingUnit];
    const longerWorkingUnit = longerWorkingUnits[workingUnit];
    if (!longerWorkingUnit)
      return {
        ...workingUnitData,
        previousKijun: [],
        previousSsa: [],
        previousSsb: [],
        previousLagging: [],
      };
    const zoomedWorkingUnitData = state.indicators[longerWorkingUnit];
    return {
      ...workingUnitData,
      ...zoomIn(zoomedWorkingUnitData, workingUnitData.timestamps),
    };
  };

const longerWorkingUnits: Partial<Record<WorkingUnit, WorkingUnit>> = {
  graphical: "horizon",
  intervention: "graphical",
};

const zoomIn = (
  longerWorkingUnitData: WorkingUnitData,
  timestamps: WorkingUnitData["timestamps"],
) => {
  return timestamps.reduce<ZoomedWorkingUnitDataVM>(
    (acc, t) => {
      const i = leastSuperiorIndexForTimestamp(
        longerWorkingUnitData.timestamps,
        t,
      );
      return {
        previousKijun: [...acc.previousKijun, longerWorkingUnitData.kijun[i]],
        previousSsa: [...acc.previousSsa, longerWorkingUnitData.ssa[i]],
        previousSsb: [...acc.previousSsb, longerWorkingUnitData.ssb[i]],
        previousLagging: [
          ...acc.previousLagging,
          longerWorkingUnitData.lagging[i],
        ],
      };
    },
    {
      previousKijun: [],
      previousSsa: [],
      previousSsb: [],
      previousLagging: [],
    },
  );
};

const leastSuperiorIndexForTimestamp = (
  largerTimestamps: WorkingUnitData["timestamps"],
  t: number,
) => {
  const idx = largerTimestamps.findIndex((t1) => t1 > t) - 1;
  return idx > -1 ? idx : largerTimestamps.length - 1;
};

export type IchimokuDrawVM = null | (WorkingUnitData & ZoomedWorkingUnitDataVM);

export type ZoomedWorkingUnitDataVM = {
  previousKijun: Array<number>;
  previousSsa: Array<number>;
  previousSsb: Array<number>;
  previousLagging: Array<number>;
};
