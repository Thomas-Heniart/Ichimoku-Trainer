import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { TradingAlarm } from '../models/trading-alarm.ts'
import { Indicators, WorkingUnit, WorkingUnitData } from '../models/indicators.model.ts'
import { retrieveAlarmIndicators } from '../use-cases/retrieve-alarm-indicators/retrieve-alarm-indicators.ts'
import { launchTraining } from '../use-cases/launch-training/launch-training.ts'

import { changeWorkingUnit } from '../use-cases/change-working-unit/change-working-unit.ts'

import { loadNextInterventionCandle } from '../use-cases/load-next-intervention-candle/load-next-intervention-candle.ts'

import { FIFTEEN_MINUTES_IN_MS, ONE_HOUR_IN_MS } from '../../constants.ts'
import { ichimokuCloud } from 'indicatorts'
import { startOfHour } from 'date-fns'
import { UTCDate } from '@date-fns/utc'

type State = {
    alarm: TradingAlarm | null
    indicators: Indicators | null
    workingUnit: WorkingUnit | null
    isLoading: boolean
}
const initialState = (): State => ({
    alarm: null,
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
            state.alarm = null
            state.indicators = null
            state.isLoading = true
        })
        builder.addCase(launchTraining.fulfilled, (state, { payload }) => {
            state.alarm = payload.alarm
        })
        builder.addCase(retrieveAlarmIndicators.fulfilled, (state, { payload }) => {
            state.indicators = payload.indicators
            state.workingUnit = payload.indicators ? 'horizon' : null
            state.isLoading = false
        })
        builder.addCase(changeWorkingUnit.fulfilled, (state, { payload }) => {
            state.workingUnit = payload.workingUnit
        })
        builder.addCase(loadNextInterventionCandle.fulfilled, (state, { payload }) => {
            const lastTimestamp =
                state.indicators!.intervention.timestamps[state.indicators!.intervention.timestamps.length - 1]
            state.indicators!.intervention.timestamps.push(lastTimestamp + FIFTEEN_MINUTES_IN_MS)
            state.indicators!.intervention.candles.open.push(payload.candle.open)
            state.indicators!.intervention.candles.high.push(payload.candle.high)
            state.indicators!.intervention.candles.low.push(payload.candle.low)
            state.indicators!.intervention.candles.close.push(payload.candle.close)
            const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(
                state.indicators!.intervention.candles.high,
                state.indicators!.intervention.candles.low,
                state.indicators!.intervention.candles.close,
            )
            state.indicators!.intervention.tenkan = tenkan
            state.indicators!.intervention.kijun = kijun
            state.indicators!.intervention.ssa = ssa
            state.indicators!.intervention.ssb = ssb
            state.indicators!.intervention.lagging = laggingSpan
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
    },
})

const updateIchimokuIndicators = (workingUnitData: WorkingUnitData) => {
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
