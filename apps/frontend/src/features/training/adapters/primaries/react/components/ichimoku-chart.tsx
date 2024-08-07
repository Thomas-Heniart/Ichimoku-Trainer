import { ichimokuDrawVM } from '../view-model-generators/ichimoku-draw/ichimoku-draw-vm.selector.ts'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    AutoscaleInfo,
    BarData,
    CandlestickData,
    ColorType,
    createChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    LineStyle,
    MouseEventHandler,
    Time,
    UTCTimestamp,
} from 'lightweight-charts'
import { IchimokuCloudData, IchimokuCloudSeries } from '../../../../../ichimoku-cloud-plugin/series.ts'
import { useSelector } from 'react-redux'

type CandleVM = null | {
    time: Date
    open: number
    close: number
    low: number
    high: number
    ssa: number | null
    ssb: number | null
    cloudTime: Date | null
}

export const IchimokuChart = () => {
    const data = useSelector(ichimokuDrawVM)

    const chartContainerRef = useRef<HTMLDivElement | null>(null)
    const candlesticksRef = useRef<ISeriesApi<'Candlestick'>>()
    const tenkanRef = useRef<ISeriesApi<'Line'>>()
    const kijunRef = useRef<ISeriesApi<'Line'>>()
    const cloudRef = useRef<ISeriesApi<'Custom'>>()
    const laggingSpanRef = useRef<ISeriesApi<'Line'>>()
    const previousKijunRef = useRef<ISeriesApi<'Line'>>()
    const previousCloudRef = useRef<ISeriesApi<'Custom'>>()

    const [currentCandle, setCurrentCandle] = useState<CandleVM>(null)

    const [currentChart, setCurrentChart] = useState<IChartApi | null>(null)

    const onCrosshairMove = useCallback<MouseEventHandler<Time>>((param) => {
        if (!candlesticksRef.current) return
        if (!param || !param.seriesData || param.seriesData.size === 0) return setCurrentCandle(null)
        const candleData = param.seriesData.get(candlesticksRef.current) as BarData
        if (!candleData) return
        const cloudData = param.seriesData.get(cloudRef.current!) as IchimokuCloudData
        setCurrentCandle({
            time: new Date((candleData.time as UTCTimestamp) * 1000),
            open: candleData.open,
            close: candleData.close,
            low: candleData.low,
            high: candleData.high,
            ssa: cloudData ? cloudData.ssa : null,
            ssb: cloudData ? cloudData.ssb : null,
            cloudTime: cloudData ? new Date((cloudData.time as UTCTimestamp) * 1000) : null,
        })
    }, [])

    useEffect(() => {
        if (!chartContainerRef.current) return
        const chart = createChart(chartContainerRef.current, {})
        chart.applyOptions({
            layout: {
                background: { type: ColorType.Solid, color: '#222' },
                textColor: '#DDD',
            },
            grid: {
                vertLines: { color: '#444' },
                horzLines: { color: '#444' },
            },
            autoSize: true,
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 4,
                    color: '#C3BCDB44',
                    style: LineStyle.Solid,
                    labelBackgroundColor: '#9B7DFF',
                },
                horzLine: {
                    color: '#9B7DFF',
                    labelBackgroundColor: '#9B7DFF',
                },
            },
            leftPriceScale: {
                autoScale: true,
                visible: true,
            },
            rightPriceScale: {
                autoScale: true,
                visible: true,
            },
        })
        chart.timeScale().fitContent()
        chart.timeScale().applyOptions({
            timeVisible: true,
            borderColor: '#71649C',
        })
        candlesticksRef.current = chart.addCandlestickSeries({
            wickUpColor: 'rgb(70,217,54)',
            upColor: 'rgb(70,217,54)',
            wickDownColor: 'rgb(225, 50, 85)',
            downColor: 'rgb(225, 50, 85)',
            borderVisible: false,
            priceLineVisible: false,
        })
        tenkanRef.current = chart.addLineSeries({
            lineWidth: 1,
            color: 'rgb(217,195,54)',
            priceLineVisible: false,
        })
        kijunRef.current = chart.addLineSeries({ lineWidth: 1, color: 'rgb(54, 116, 217)', priceLineVisible: false })
        cloudRef.current = chart.addCustomSeries(new IchimokuCloudSeries())
        laggingSpanRef.current = chart.addLineSeries({
            lineWidth: 1,
            color: '#fff',
            priceLineVisible: false,
        })
        previousKijunRef.current = chart.addLineSeries({ lineWidth: 1, color: '#02b72b', priceLineVisible: false })
        previousCloudRef.current = chart.addCustomSeries(new IchimokuCloudSeries({ cloudColor: 'rgba(2,190,45, 0.5)' }))
        setCurrentChart(chart)

        chart.subscribeCrosshairMove(onCrosshairMove)
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    autoSize: true,
                })
            }
        }

        window.addEventListener('resize', handleResize)
        return () => {
            setCurrentChart(null)
            chart.unsubscribeCrosshairMove(onCrosshairMove)
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [onCrosshairMove])

    useEffect(() => {
        if (!currentChart || !data) return
        candlesticksRef.current!.setData(
            data.candles.close.map<CandlestickData>((close, i) => ({
                time: (data.timestamps[i] / 1000) as UTCTimestamp,
                open: data.candles.open[i],
                high: data.candles.high[i],
                low: data.candles.low[i],
                close,
            })),
        )
        tenkanRef.current!.setData(
            data.tenkan.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )

        kijunRef.current!.setData(
            data.kijun.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )

        cloudRef.current!.setData(
            data.ssb.reduce(
                (acc, ssb, i) => {
                    if (!ssb) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, ssa: data.ssa[i], ssb }]
                },
                [] as Array<{ time: UTCTimestamp; ssa: number; ssb: number }>,
            ),
        )
        {
            const allCloudValues = [...data.ssb, ...data.ssa].filter((v) => v > 0)
            const minValue = Math.min(...allCloudValues)
            const maxValue = Math.max(...allCloudValues)
            cloudRef.current!.applyOptions({
                autoscaleInfoProvider: (): AutoscaleInfo => {
                    return {
                        priceRange: {
                            minValue,
                            maxValue,
                        },
                    }
                },
            })
        }

        laggingSpanRef.current!.setData(
            data.lagging.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )

        previousKijunRef.current!.setData(
            data.previousKijun.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )
        previousCloudRef.current!.setData(
            data.previousSsb.reduce(
                (acc, ssb, i) => {
                    if (!ssb) return acc
                    return [
                        ...acc,
                        { time: (data.timestamps[i] / 1000) as UTCTimestamp, ssa: data.previousSsa[i], ssb },
                    ]
                },
                [] as Array<{ time: UTCTimestamp; ssa: number; ssb: number }>,
            ),
        )
        {
            const allCloudValues = [...data.previousSsb, ...data.previousSsb].filter((v) => v > 0)
            const minValue = Math.min(...allCloudValues)
            const maxValue = Math.max(...allCloudValues)
            previousCloudRef.current!.applyOptions({
                autoscaleInfoProvider: (): AutoscaleInfo => {
                    return {
                        priceRange: {
                            minValue,
                            maxValue,
                        },
                    }
                },
            })
        }
        currentChart.timeScale().scrollToRealTime()
    }, [currentChart, data])

    return (
        <div className={'chart-group'}>
            <div className={'chart-container'} ref={chartContainerRef}>
                <Legend legend={currentCandle} />
            </div>
        </div>
    )
}

const Legend = ({ legend }: { legend: CandleVM }) => {
    if (!legend) return <></>
    return (
        <div className={'chart-legend'}>
            <p>
                <span>
                    Open time: <strong>{legend.time.toLocaleString()}</strong>
                </span>
                <span>
                    Open: <strong>{legend.open}</strong>
                </span>
                <span>
                    High: <strong>{legend.high}</strong>
                </span>
                <span>
                    Low: <strong>{legend.low}</strong>
                </span>
                <span>
                    Close: <strong>{legend.close}</strong>
                </span>
            </p>
        </div>
    )
}
