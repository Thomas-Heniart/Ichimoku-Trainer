import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { Indicators, WorkingUnit, WorkingUnitData } from '../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

import { changeWorkingUnit } from '../use-cases/change-working-unit/change-working-unit.ts'

import { loadNextInterventionCandle } from '../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

import { ONE_DAY_IN_MS, ONE_HOUR_IN_MS } from '../../constants.ts'
import { ichimokuCloud } from 'indicatorts'
import { startOfDay, startOfHour } from 'date-fns'
import { UTCDate } from '@date-fns/utc'

type State = {
    indicators: Indicators | null
    workingUnit: WorkingUnit | null
    isLoading: boolean
}
const initialState = (): State => ({
    indicators: null,
    workingUnit: null,
    isLoading: false,
})

export const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(launchTraining.pending, (state) => {
            state.workingUnit = null
            state.indicators = null
            state.isLoading = true
        })
        builder.addCase(retrieveAlarmIndicators.fulfilled, (state, { payload }) => {
            state.indicators = payload.indicators
            state.workingUnit = payload.indicators ? 'horizon' : null
            state.isLoading = false
        })
        builder.addCase(changeWorkingUnit.fulfilled, (state, { payload }) => {
            state.workingUnit = payload.workingUnit
        })
        builder.addMatcher(isAnyOf(loadNextInterventionCandle.fulfilled), (state, { payload: { candle } }) => {
            const graphical = state.indicators!.graphical!
            const lastCandleIdx = graphical.candles.close.length - 1
            const lastCandleTimestamp = new UTCDate(graphical.timestamps[lastCandleIdx])
            const candleTimestampAsHour = startOfHour(new UTCDate(candle.openTime))
            if (lastCandleTimestamp.valueOf() < candleTimestampAsHour.valueOf()) {
                graphical.timestamps.push(graphical.timestamps[graphical.timestamps.length - 1] + ONE_HOUR_IN_MS)
                graphical.candles.open.push(candle.open)
                graphical.candles.high.push(candle.high)
                graphical.candles.low.push(candle.low)
                graphical.candles.close.push(candle.close)
                updateIchimokuIndicators(graphical)
                return
            }
            if (candle.high > graphical.candles.high[lastCandleIdx]) graphical.candles.high[lastCandleIdx] = candle.high
            if (candle.low < graphical.candles.low[lastCandleIdx]) graphical.candles.low[lastCandleIdx] = candle.low
            graphical.candles.close[lastCandleIdx] = candle.close
            updateIchimokuIndicators(graphical)
        })
        builder.addMatcher(isAnyOf(loadNextInterventionCandle.fulfilled), (state, { payload: { candle } }) => {
            const horizon = state.indicators!.horizon!
            const lastCandleIdx = horizon.candles.close.length - 1
            const lastCandleTimestamp = new UTCDate(horizon.timestamps[lastCandleIdx])
            const candleTimestampAsDay = startOfDay(new UTCDate(candle.openTime))
            if (lastCandleTimestamp.valueOf() < candleTimestampAsDay.valueOf()) {
                horizon.timestamps.push(horizon.timestamps[horizon.timestamps.length - 1] + ONE_DAY_IN_MS)
                horizon.candles.open.push(candle.open)
                horizon.candles.high.push(candle.high)
                horizon.candles.low.push(candle.low)
                horizon.candles.close.push(candle.close)
                updateIchimokuIndicators(horizon)
                return
            }
            if (candle.high > horizon.candles.high[lastCandleIdx]) horizon.candles.high[lastCandleIdx] = candle.high
            if (candle.low < horizon.candles.low[lastCandleIdx]) horizon.candles.low[lastCandleIdx] = candle.low
            horizon.candles.close[lastCandleIdx] = candle.close
            updateIchimokuIndicators(horizon)
        })
    },
})

export const updateIchimokuIndicators = (workingUnitData: WorkingUnitData) => {
    const result = ichimokuCloud(
        workingUnitData.candles.high,
        workingUnitData.candles.low,
        workingUnitData.candles.close,
    )
    workingUnitData.tenkan = result.tenkan
    workingUnitData.kijun = result.kijun
    workingUnitData.ssa = result.ssa
    workingUnitData.ssb = result.ssb
    workingUnitData.lagging = result.laggingSpan
}
