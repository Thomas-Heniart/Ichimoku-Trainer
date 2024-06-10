import { calculatePoints } from '../calculate-points.ts'

describe('Calculate ichimoku cloud points', () => {
    it('does not calculate anything initially', () => {
        expect(calculatePoints([])).toEqual([])
    })

    it('given a single point with ssaY < ssbY calculates 2 points at the same x coordinate starting with the lowest one', () => {
        expect(calculatePoints([{ x: 0, ssaY: 10, ssbY: 20 }])).toEqual([
            { x: 0, y: 10 },
            { x: 0, y: 20 },
        ])
    })

    it('given a single point with ssaY > ssbY calculates 2 points at the same x coordinate starting with the lowest one', () => {
        expect(calculatePoints([{ x: 0, ssaY: 15, ssbY: 5 }])).toEqual([
            { x: 0, y: 5 },
            { x: 0, y: 15 },
        ])
    })

    it('starts with points at the bottom then points at the top', async () => {
        expect(
            calculatePoints([
                { x: 0, ssaY: 15, ssbY: 5 },
                { x: 1, ssaY: 10, ssbY: 20 },
            ]),
        ).toEqual([
            { x: 0, y: 5 },
            { x: 1, y: 10 },
            { x: 1, y: 20 },
            { x: 0, y: 15 },
        ])
    })
})
