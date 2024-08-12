import { ClosedPosition } from '../../models/closed-position.model.ts'

export interface ClosedPositionRepository {
    save(position: ClosedPosition): Promise<void>
}
