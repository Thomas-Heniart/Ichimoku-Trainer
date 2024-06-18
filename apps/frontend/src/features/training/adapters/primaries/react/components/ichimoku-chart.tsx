import { useSelector } from 'react-redux'
import { ichimokuDrawVM } from '../view-model-generators/ichimoku-draw/ichimoku-draw-vm.selector.ts'
import { useEffect, useRef, useState } from 'react'
import { CandlestickData, ColorType, createChart, CrosshairMode, LineStyle, UTCTimestamp } from 'lightweight-charts'
import { WorkingUnit } from '../../../../hexagon/models/indicators.model.ts'
import { IchimokuCloudSeries } from '../../../../../ichimoku-cloud-plugin/series.ts'

export const IchimokuChart = (props: {
    colors?:
        | {
              backgroundColor?: 'white' | undefined
              lineColor?: '#2962FF' | undefined
              textColor?: 'black' | undefined
              areaTopColor?: '#2962FF' | undefined
              areaBottomColor?: 'rgba(41, 98, 255, 0.28)' | undefined
          }
        | undefined
}) => {
    const [workingUnit, setWorkingUnit] = useState<WorkingUnit>('horizon')
    const data = useSelector(ichimokuDrawVM(workingUnit))

    const {
        colors: {
            backgroundColor = 'white',
            // lineColor = "#2962FF",
            textColor = 'black',
            // areaTopColor = "#2962FF",
            // areaBottomColor = "rgba(41, 98, 255, 0.28)",
        } = {},
    } = props

    const chartContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!data) return

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth })
        }

        const chart = createChart(chartContainerRef.current!, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current?.clientWidth,
            height: 750,
        })
        chart.timeScale().fitContent()
        chart.timeScale().applyOptions({
            timeVisible: true,
        })

        const candlestickSeries = chart.addCandlestickSeries()
        const candleStickData = data.candles.close.map<CandlestickData>((close, i) => ({
            time: (data.timestamps[i] / 1000) as UTCTimestamp,
            open: data.candles.open[i],
            high: data.candles.high[i],
            low: data.candles.low[i],
            close,
        }))
        candlestickSeries.setData(candleStickData)

        const tenkanSeries = chart.addLineSeries({
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

        const kijunSeries = chart.addLineSeries({ lineWidth: 1, color: '#3d34eb' })
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
        const cloudSeries = chart.addCustomSeries(cloudSeriesView)
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
            const previousKijunSeries = chart.addLineSeries({ lineWidth: 1, color: '#02b72b' })
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
            const previousCloudSeries = chart.addCustomSeries(previousCloudSeriesView)
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

        const laggingSpanSeries = chart.addLineSeries({
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

        chart.applyOptions({
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

        window.addEventListener('resize', handleResize)

        chartContainerRef.current!.scrollIntoView()

        return () => {
            window.removeEventListener('resize', handleResize)

            chart.remove()
        }
    }, [backgroundColor, data, textColor])

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
            <div ref={chartContainerRef} />
        </>
    )
}
