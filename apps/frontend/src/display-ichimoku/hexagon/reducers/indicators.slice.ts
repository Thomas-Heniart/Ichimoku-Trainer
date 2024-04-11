import { createSlice } from "@reduxjs/toolkit";

import { Indicators } from "../models/indicators.model";

type IndicatorsState = Indicators | null;

const initialState = (): IndicatorsState => null;
export const indicatorsSlice = createSlice({
  name: "symbols",
  initialState,
  reducers: {
    indicatorsRetrieved: (
      _,
      { payload: { indicators } }: IndicatorsRetrievedPayload,
    ) => {
      return indicators;
    },
  },
  extraReducers: (builder) => builder,
});

type IndicatorsRetrievedPayload = {
  payload: {
    indicators: Indicators;
  };
};
