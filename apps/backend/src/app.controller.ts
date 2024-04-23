import { Controller, Get, Query } from '@nestjs/common';
import yahooFinance from 'yahoo-finance2';
import { ChartOptionsWithReturnArray } from 'yahoo-finance2/dist/esm/src/modules/chart';
import { addBusinessDays, endOfDay, startOfDay } from 'date-fns';
import { ichimokuCloud } from 'indicatorts';
import { UTCDate } from '@date-fns/utc';

@Controller()
export class AppController {
  constructor() {}

  @Get('')
  public async poc(@Query('symbol') symbol: string = 'AAPL') {
    const [horizon, graphical, intervention] = await Promise.all([
      horizonData(symbol),
      graphicalData(symbol),
      interventionData(symbol),
    ]);
    return { horizon, graphical, intervention };
  }
}

const horizonData = async (symbol: string) => {
  const today = endOfDay(addBusinessDays(new UTCDate(), -1));
  const todayMinus130Periods = startOfDay(addBusinessDays(today, -130));
  const queryOptions: ChartOptionsWithReturnArray = {
    period1: todayMinus130Periods,
    period2: today,
    interval: '1d',
  };
  const response = await yahooFinance.chart(symbol, queryOptions);
  const data = response.quotes;
  const { timestamps, openings, closings, highs, lows } = data.reduce(
    (acc, current) => ({
      timestamps: [...acc.timestamps, current.date],
      openings: [...acc.openings, current.open],
      closings: [...acc.closings, current.close],
      highs: [...acc.highs, current.high],
      lows: [...acc.lows, current.low],
    }),
    {
      timestamps: [] as Date[],
      openings: [] as number[],
      closings: [] as number[],
      highs: [] as number[],
      lows: [] as number[],
    },
  );
  for (let i = 0; i < 26; i++)
    timestamps.push(addBusinessDays(timestamps[timestamps.length - 1], 1));
  const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(
    highs,
    lows,
    closings,
  );
  return {
    timestamps: timestamps.map((t) => t.valueOf()),
    candles: {
      open: openings,
      close: closings,
      max: highs,
      min: lows,
    },
    tenkan,
    kijun,
    ssa,
    ssb,
    lagging: laggingSpan,
  };
};

const graphicalData = async (symbol: string) => {
  const today = endOfDay(addBusinessDays(new UTCDate(), -1));
  const todayMinus130Periods = startOfDay(addBusinessDays(today, -7));
  const queryOptions: ChartOptionsWithReturnArray = {
    period1: todayMinus130Periods,
    period2: today,
    interval: '1h',
  };
  const response = await yahooFinance.chart(symbol, queryOptions);
  const data = response.quotes;
  const { timestamps, openings, closings, highs, lows } = data.reduce(
    (acc, current) => ({
      timestamps: [...acc.timestamps, current.date],
      openings: [...acc.openings, current.open],
      closings: [...acc.closings, current.close],
      highs: [...acc.highs, current.high],
      lows: [...acc.lows, current.low],
    }),
    {
      timestamps: [] as Date[],
      openings: [] as number[],
      closings: [] as number[],
      highs: [] as number[],
      lows: [] as number[],
    },
  );
  for (let i = 0; i < 26; i++)
    timestamps.push(addBusinessDays(timestamps[timestamps.length - 1], 1));
  const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(
    highs,
    lows,
    closings,
  );
  return {
    timestamps: timestamps.map((t) => t.valueOf()),
    candles: {
      open: openings,
      close: closings,
      max: highs,
      min: lows,
    },
    tenkan,
    kijun,
    ssa,
    ssb,
    lagging: laggingSpan,
  };
};

const interventionData = async (symbol: string) => {
  const today = endOfDay(addBusinessDays(new UTCDate(), -1));
  const todayMinus130Periods = startOfDay(addBusinessDays(today, -2));
  const queryOptions: ChartOptionsWithReturnArray = {
    period1: todayMinus130Periods,
    period2: today,
    interval: '15m',
  };
  const response = await yahooFinance.chart(symbol, queryOptions);
  const data = response.quotes;
  const { timestamps, openings, closings, highs, lows } = data.reduce(
    (acc, current) => ({
      timestamps: [...acc.timestamps, current.date],
      openings: [...acc.openings, current.open],
      closings: [...acc.closings, current.close],
      highs: [...acc.highs, current.high],
      lows: [...acc.lows, current.low],
    }),
    {
      timestamps: [] as Date[],
      openings: [] as number[],
      closings: [] as number[],
      highs: [] as number[],
      lows: [] as number[],
    },
  );
  for (let i = 0; i < 26; i++)
    timestamps.push(addBusinessDays(timestamps[timestamps.length - 1], 1));
  const { tenkan, kijun, ssa, ssb, laggingSpan } = ichimokuCloud(
    highs,
    lows,
    closings,
  );
  return {
    timestamps: timestamps.map((t) => t.valueOf()),
    candles: {
      open: openings,
      close: closings,
      max: highs,
      min: lows,
    },
    tenkan,
    kijun,
    ssa,
    ssb,
    lagging: laggingSpan,
  };
};
