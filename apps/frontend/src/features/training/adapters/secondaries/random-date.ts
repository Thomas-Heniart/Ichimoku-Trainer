import { UTCDate } from '@date-fns/utc'
import { addHours, fromUnixTime, startOfDay } from 'date-fns'
import { MAX_RETRIES } from 'backend/src/features/training/config/constants.ts'

const QUARTER_AN_HOUR_DIVISOR = 90000

const randomNumber = (min: number, max: number, divisor: number) => {
    const minDivisible = Math.ceil(min / divisor)
    const maxDivisible = Math.floor(max / divisor)
    const randomDivisible = Math.floor(Math.random() * (maxDivisible - minDivisible + 1)) + minDivisible
    return randomDivisible * divisor
}

export const randomBTCUSDTDate = (): UTCDate => {
    const max = startOfDay(addHours(new UTCDate(), -MAX_RETRIES))
    const min = new UTCDate('2020-01-01T00:00:00Z')
    const dateMs = randomNumber(min.valueOf(), max.valueOf(), QUARTER_AN_HOUR_DIVISOR)
    return new UTCDate(fromUnixTime(dateMs / 1000))
}
