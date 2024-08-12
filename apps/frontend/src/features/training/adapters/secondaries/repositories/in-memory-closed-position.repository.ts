import { ClosedPositionRepository } from '../../../hexagon/ports/repositories/closed-position.repository.ts'
import { ClosedPosition } from '../../../hexagon/models/closed-position.model.ts'

export class InMemoryClosedPositionRepository implements ClosedPositionRepository {
    constructor(private readonly _closedPositions: Array<ClosedPosition> = []) {}

    async save(position: ClosedPosition): Promise<void> {
        this._closedPositions.push(position)
    }

    get closedPositions(): Array<ClosedPosition> {
        return this._closedPositions
    }

    feedWith(position: ClosedPosition) {
        this._closedPositions.push(position)
    }
}
