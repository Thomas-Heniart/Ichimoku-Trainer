import { ColorType, createChart } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import { dailyData } from './data/data'
import { IchimokuCloudSeries } from './ichimoku-cloud-plugin/series'
import { TrainingConfigComponent } from './display-ichimoku/adapters/primaries/react-app/components/training-config.component'
import { IchimokuChartComponent } from './display-ichimoku/adapters/primaries/react-app/components/ichimoku-chart.component.tsx'

export const ChartComponent = (props: {
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
    const {
        colors: {
            backgroundColor = 'white',
            lineColor = '#2962FF',
            textColor = 'black',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props

    const chartContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
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

        const candlestickSeries = chart.addCandlestickSeries()
        candlestickSeries.setData(dailyData)

        const tenkanSeries = chart.addLineSeries({
            lineWidth: 1,
            color: '#e5eb34',
        })
        tenkanSeries.setData(dailyData.filter((d) => !!d.tenkan).map(({ time, tenkan }) => ({ time, value: tenkan })))

        const kijunSeries = chart.addLineSeries({ lineWidth: 1, color: '#3d34eb' })
        kijunSeries.setData(dailyData.filter((d) => !!d.kijun).map(({ time, kijun }) => ({ time, value: kijun })))

        const cloudSeriesView = new IchimokuCloudSeries()
        const cloudSeries = chart.addCustomSeries(cloudSeriesView)
        cloudSeries.setData(
            dailyData.filter((d) => !!d.ssa && !!d.ssb).map(({ time, ssa, ssb }) => ({ time, ssa, ssb })),
        )

        const chikouSeries = chart.addLineSeries({
            lineWidth: 1,
            color: '#000000',
        })
        chikouSeries.setData(dailyData.filter((d) => !!d.chikou).map(({ time, chikou }) => ({ time, value: chikou })))

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)

            chart.remove()
        }
    }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor])

    return <div ref={chartContainerRef} />
}

export default function App() {
    // return <ChartComponent {...props}></ChartComponent>;
    return (
        <>
            <header>
                <h1>Ichimoku trainer</h1>
            </header>
            <main>
                <TrainingConfigComponent />
                <IchimokuChartComponent />
            </main>
        </>
    )
}
