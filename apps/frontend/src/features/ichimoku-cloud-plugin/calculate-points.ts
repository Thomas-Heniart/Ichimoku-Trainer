import { IchimokuCloudPoints, Points } from './point.ts'

export const calculatePoints = (points: IchimokuCloudPoints) => {
    const bottomPoints: Points = []
    const topPoints: Points = []
    points.forEach((p) => {
        bottomPoints.push({ x: p.x, y: Math.min(p.ssaY, p.ssbY) })
        topPoints.unshift({ x: p.x, y: Math.max(p.ssaY, p.ssbY) })
    })
    return [...bottomPoints, ...topPoints]
}
