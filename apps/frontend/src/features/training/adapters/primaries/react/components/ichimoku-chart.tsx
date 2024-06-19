import { useSelector } from 'react-redux'
import { ichimokuDrawVM } from '../view-model-generators/ichimoku-draw/ichimoku-draw-vm.selector.ts'
import { useEffect, useRef, useState } from 'react'
import { CandlestickData, ColorType, createChart, CrosshairMode, LineStyle, UTCTimestamp } from 'lightweight-charts'
import { WorkingUnit } from '../../../../hexagon/models/indicators.model.ts'
import { IchimokuCloudSeries } from '../../../../../ichimoku-cloud-plugin/series.ts'
import { useDebounce } from '../../../../../../common/react/use-debounce.tsx'

type CandleVM = null | { time: Date; open: number; close: number; low: number; high: number }

export const IchimokuChart = (props: {
    colors?:
        | {
              backgroundColor?: 'white' | undefined
              textColor?: 'black' | undefined
          }
        | undefined
}) => {
    const [workingUnit, setWorkingUnit] = useState<WorkingUnit>('horizon')
    const [currentCandle, setCurrentCandle] = useState<CandleVM>(null)
    const debouncedSetCurrentCandle = useDebounce(setCurrentCandle, 20)
    const data = useSelector(ichimokuDrawVM(workingUnit))
    const { colors: { backgroundColor = 'white', textColor = 'black' } = {} } = props
    const chartContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!data || !chartContainerRef.current) return

        const createdChart = createChart(chartContainerRef.current, {})
        createdChart.applyOptions({
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth! * 0.9,
            height: 750,
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
        createdChart.timeScale().fitContent()
        createdChart.timeScale().applyOptions({
            timeVisible: true,
        })

        const candlestickSeries = createdChart.addCandlestickSeries()
        const candleStickData = data.candles.close.map<CandlestickData>((close, i) => ({
            time: (data.timestamps[i] / 1000) as UTCTimestamp,
            open: data.candles.open[i],
            high: data.candles.high[i],
            low: data.candles.low[i],
            close,
        }))
        candlestickSeries.setData(candleStickData)

        const tenkanSeries = createdChart.addLineSeries({
            lineWidth: 1,
            color: '#e5eb34',
        })
        tenkanSeries.setData(
            data.tenkan.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )

        const kijunSeries = createdChart.addLineSeries({ lineWidth: 1, color: '#3d34eb' })
        kijunSeries.setData(
            data.kijun.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )

        const cloudSeriesView = new IchimokuCloudSeries()
        const cloudSeries = createdChart.addCustomSeries(cloudSeriesView)
        cloudSeries.setData(
            data.ssb.reduce(
                (acc, ssb, i) => {
                    if (!ssb) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, ssa: data.ssa[i], ssb }]
                },
                [] as Array<{ time: UTCTimestamp; ssa: number; ssb: number }>,
            ),
        )

        if (data.previousKijun.length) {
            const previousKijunSeries = createdChart.addLineSeries({ lineWidth: 1, color: '#02b72b' })
            previousKijunSeries.setData(
                data.previousKijun.reduce(
                    (acc, value, i) => {
                        if (!value) return acc
                        return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                    },
                    [] as Array<{ time: UTCTimestamp; value: number }>,
                ),
            )
        }

        if (data.previousSsb.length) {
            const previousCloudSeriesView = new IchimokuCloudSeries({ cloudColor: 'rgba(2,190,45, 0.5)' })
            const previousCloudSeries = createdChart.addCustomSeries(previousCloudSeriesView)
            previousCloudSeries.setData(
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
        }

        const laggingSpanSeries = createdChart.addLineSeries({
            lineWidth: 1,
            color: '#000000',
        })
        laggingSpanSeries.setData(
            data.lagging.reduce(
                (acc, value, i) => {
                    if (!value) return acc
                    return [...acc, { time: (data.timestamps[i] / 1000) as UTCTimestamp, value }]
                },
                [] as Array<{ time: UTCTimestamp; value: number }>,
            ),
        )

        // TODO how to fix the debounced always changing problem
        // createdChart.subscribeCrosshairMove((param) => {
        //     if (!param || !param.seriesData || param.seriesData.size === 0) {
        //         debouncedSetCurrentCandle(null)
        //         return
        //     }
        //     const data = param.seriesData.get(candlestickSeries) as BarData
        //     if (data) {
        //         debouncedSetCurrentCandle({
        //             time: new Date(data.time as UTCTimestamp),
        //             open: data.open,
        //             close: data.close,
        //             low: data.low,
        //             high: data.high,
        //         })
        //     }
        // })
        console.log('createdChart', { createdChart })

        const handleResize = () => {
            if (createdChart) createdChart.applyOptions({ width: chartContainerRef.current!.clientWidth! * 0.9 })
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)

            console.log('remove', { createdChart })
            createdChart.remove()
        }
    }, [backgroundColor, data, debouncedSetCurrentCandle, textColor])

    if (!data) return <></>

    return (
        <>
            <select
                name="select"
                aria-label="Select"
                required
                value={workingUnit}
                onChange={(e) => setWorkingUnit(e.target.value as WorkingUnit)}
            >
                <option value={'horizon'}>Horizon</option>
                <option value={'graphical'}>Graphical</option>
                <option value={'intervention'}>Intervention</option>
            </select>
            {currentCandle && (
                <div>
                    <span>
                        <strong>Date:</strong> {currentCandle.time.toString()}
                    </span>
                    <span>
                        <strong>Open:</strong> {currentCandle.open.toString()}
                    </span>
                    <span>
                        <strong>High:</strong> {currentCandle.high.toString()}
                    </span>
                    <span>
                        <strong>Low:</strong> {currentCandle.low.toString()}
                    </span>
                    <span>
                        <strong>Close:</strong> {currentCandle.close.toString()}
                    </span>
                </div>
            )}
            <div ref={chartContainerRef} />
        </>
    )
}
