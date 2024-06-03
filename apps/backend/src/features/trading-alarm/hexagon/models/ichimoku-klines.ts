import { UTCDate } from '@date-fns/utc'

export type IchimokuKlines = Array<IchimokuKline>
export type IchimokuKline = {
    openDate: UTCDate
    open: number
    close: number
    low: number
    high: number
    tenkan: number
    kijun: number
    ssa: number
    ssb: number
    lagging: number
}
