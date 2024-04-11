export type Indicators = Record<WorkingUnit, WorkingUnitData>;

export type WorkingUnit = "horizon" | "graphical" | "intervention";
export type WorkingUnitData = {
  timestamps: Array<number>;
  candles: {
    open: Array<number>;
    close: Array<number>;
    max: Array<number>;
    min: Array<number>;
  };
  tenkan: Array<number>;
  kijun: Array<number>;
  ssa: Array<number>;
  ssb: Array<number>;
  lagging: Array<number>;
};
