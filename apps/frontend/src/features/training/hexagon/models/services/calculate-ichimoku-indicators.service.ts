import { IchimokuCloudResult } from 'indicatorts'

export type CalculateIchimokuIndicatorsCommand = { highs: number[]; lows: number[]; closings: number[] }
export type CalculateIchimokuIndicators = (command: CalculateIchimokuIndicatorsCommand) => IchimokuCloudResult
