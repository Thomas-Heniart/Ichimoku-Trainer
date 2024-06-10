import {
    CustomBarItemData,
    ICustomSeriesPaneRenderer,
    PaneRendererCustomData,
    PriceToCoordinateConverter,
    Time,
} from 'lightweight-charts'
import { CanvasRenderingTarget2D } from 'fancy-canvas'
import { IchimokuCloudData, IchimokuCloudSeriesOptions } from './series.ts'
import { calculatePoints } from './calculate-points.ts'

import { Points } from './point.ts'

export class IchimokuCloudSeriesRenderer<TData extends IchimokuCloudData> implements ICustomSeriesPaneRenderer {
    private _data: PaneRendererCustomData<Time, TData> | null = null
    private _options: IchimokuCloudSeriesOptions | null = null

    draw(target: CanvasRenderingTarget2D, priceConverter: PriceToCoordinateConverter): void {
        target.useBitmapCoordinateSpace((scope) => {
            const cloudPoints = this.convertBarsToCloudPoints(priceConverter)
            // eslint-disable-next-line
      this.drawPolygon(scope.context, calculatePoints(cloudPoints!));
        })
    }

    update(data: PaneRendererCustomData<Time, TData>, options: IchimokuCloudSeriesOptions) {
        this._data = data
        this._options = options
    }

    private convertBarsToCloudPoints(priceConverter: PriceToCoordinateConverter) {
        return this._data?.bars.filter(this.isVisible).map(this.toCloudPoint(priceConverter))
    }

    // eslint-disable-next-line
  private isVisible = (_: unknown, i: number) => i >= this._data?.visibleRange?.from! && i <= this._data?.visibleRange?.to!;

    private toCloudPoint = (priceConverter: PriceToCoordinateConverter) => (bar: CustomBarItemData<Time, TData>) => ({
        x: bar.x,
        ssaY: priceConverter(bar.originalData.ssa) as number,
        ssbY: priceConverter(bar.originalData.ssb) as number,
    })

    private drawPolygon = (ctx: CanvasRenderingContext2D, points: Points) => {
        ctx.beginPath()

        points.forEach((p, i) => {
            if (i === 0) return ctx.moveTo(p.x, p.y)
            ctx.lineTo(p.x, p.y)
        })

        ctx.closePath()
        // eslint-disable-next-line
    ctx.fillStyle = this._options?.cloudColor!;
        ctx.fill()
    }
}
