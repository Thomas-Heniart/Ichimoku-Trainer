import {
    CustomData,
    customSeriesDefaultOptions,
    CustomSeriesOptions,
    CustomSeriesPricePlotValues,
    CustomSeriesWhitespaceData,
    ICustomSeriesPaneRenderer,
    ICustomSeriesPaneView,
    PaneRendererCustomData,
    Time,
} from 'lightweight-charts'

import { IchimokuCloudSeriesRenderer } from './renderer'

export interface IchimokuCloudSeriesOptions extends CustomSeriesOptions, IchimokuCloudSeriesCustomOptions {}

export interface IchimokuCloudSeriesCustomOptions {
    cloudColor: string
}

export class IchimokuCloudSeries<TData extends IchimokuCloudData> implements ICustomSeriesPaneView<Time, TData> {
    private readonly _renderer: IchimokuCloudSeriesRenderer<IchimokuCloudData>
    private readonly _customOptions: IchimokuCloudSeriesCustomOptions

    constructor(customOptions: IchimokuCloudSeriesCustomOptions = { cloudColor: 'rgba(255, 165, 0, 0.5)' }) {
        this._renderer = new IchimokuCloudSeriesRenderer()
        this._customOptions = customOptions
    }

    defaultOptions(): IchimokuCloudSeriesOptions {
        return {
            ...customSeriesDefaultOptions,
            ...this._customOptions,
        }
    }

    isWhitespace(data: CustomSeriesWhitespaceData<Time> | TData): data is CustomSeriesWhitespaceData<Time> {
        return !(data as TData).ssa || !(data as TData).ssb
    }

    priceValueBuilder(): CustomSeriesPricePlotValues {
        return []
    }

    renderer(): ICustomSeriesPaneRenderer {
        return this._renderer
    }

    update(data: PaneRendererCustomData<Time, TData>, options: IchimokuCloudSeriesOptions): void {
        this._renderer.update(data, options)
    }
}

export interface IchimokuCloudData extends CustomData {
    ssa: number
    ssb: number
}
