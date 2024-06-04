import { DetectTradingAlarm } from '../../../../../trading-alarm/hexagon/use-cases/detect-trading-alarm/detect-trading-alarm'
import { UTCDate } from '@date-fns/utc'
import { TradingAlarm, TradingHorizon } from '../../../../../trading-alarm/hexagon/models/trading-alarm'
import { isEqual } from 'date-fns'
import { nextAlarmFrom } from '../next-alarm-from'

describe('Next alarm', () => {
    let sut: SUT

    beforeEach(() => {
        sut = new SUT()
    })

    it('detects an alarm matching trading horizon', async () => {
        sut.feedWithAlarm(
            {
                date: new UTCDate('2024-01-01'),
                type: 'ESTABLISHED_TREND',
                side: 'SHORT',
            },
            'SHORT_TERM',
        ).feedWithAlarm(
            {
                date: new UTCDate('2024-01-01'),
                type: 'ESTABLISHED_TREND',
                side: 'LONG',
            },
            'MID_TERM',
        )
        expect(await sut.nextAlarmFrom(new UTCDate('2024-01-01'), 'SHORT_TERM')).toEqual({
            date: new UTCDate('2024-01-01'),
            type: 'ESTABLISHED_TREND',
            side: 'SHORT',
        })
        expect(await sut.nextAlarmFrom(new UTCDate('2024-01-01'), 'MID_TERM')).toEqual({
            date: new UTCDate('2024-01-01'),
            type: 'ESTABLISHED_TREND',
            side: 'LONG',
        })
    })

    it.each`
        alarmDate
        ${new UTCDate('2024-01-02')}
        ${new UTCDate('2024-01-03')}
    `('retries the next day until an alarm has been detected', async ({ alarmDate }: { alarmDate: UTCDate }) => {
        sut.feedWithAlarm({
            date: alarmDate,
            type: 'ESTABLISHED_TREND',
            side: 'SHORT',
        })

        expect(await sut.nextAlarmFrom(new UTCDate('2024-01-01'))).toEqual({
            date: alarmDate,
            type: 'ESTABLISHED_TREND',
            side: 'SHORT',
        })
    })

    it('stops after a certain number of attempts', async () => {
        sut.givenMaxRetries(5)
        sut.feedWithAlarm({
            date: new UTCDate('2024-01-07'),
            type: 'ESTABLISHED_TREND',
            side: 'SHORT',
        })

        expect(await sut.nextAlarmFrom(new UTCDate('2024-01-01'))).toEqual(null)
    })

    it.each`
        alarmDate                             | tradingHorizon
        ${new UTCDate('2024-01-02 00:00:00')} | ${'MID_TERM'}
        ${new UTCDate('2024-01-01 01:00:00')} | ${'SHOR_TERM'}
    `(
        'adds a certain amount of time between each attempt based on trading horizon',
        async ({ alarmDate, tradingHorizon }: { alarmDate: UTCDate; tradingHorizon: TradingHorizon }) => {
            sut.feedWithAlarm(
                {
                    date: alarmDate,
                    type: 'ESTABLISHED_TREND',
                    side: 'SHORT',
                },
                tradingHorizon,
            )

            expect(await sut.nextAlarmFrom(new UTCDate('2024-01-01 00:00:00'), tradingHorizon)).toEqual({
                date: alarmDate,
                type: 'ESTABLISHED_TREND',
                side: 'SHORT',
            })
        },
    )
})

class SUT {
    private readonly _stubbedAlarms: Array<{ alarm: TradingAlarm; horizon: TradingHorizon }> = []
    private _maxRetries: number = 10

    feedWithAlarm(alarm: TradingAlarm, horizon: TradingHorizon = 'MID_TERM') {
        this._stubbedAlarms.push({ alarm, horizon })
        return this
    }

    givenMaxRetries(maxRetries: number) {
        this._maxRetries = maxRetries
        return this
    }

    async nextAlarmFrom(from: UTCDate, tradingHorizon: TradingHorizon = 'MID_TERM'): Promise<TradingAlarm | null> {
        return nextAlarmFrom({ detectAlarm: detectAlarmStub(this._stubbedAlarms), maxRetries: this._maxRetries })({
            from,
            tradingHorizon,
        })
    }
}

const detectAlarmStub =
    (alarms: Array<{ alarm: TradingAlarm; horizon: TradingHorizon }>): DetectTradingAlarm =>
    async ({ date, tradingHorizon }) =>
        (
            alarms.find(({ alarm, horizon }) => isEqual(alarm.date, date) && horizon === tradingHorizon) || {
                alarm: null,
            }
        ).alarm
