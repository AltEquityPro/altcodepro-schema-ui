"use client";

import * as Recharts from "recharts";
import { cn, resolveBinding } from "@/src/lib/utils";
import type { AnyObj, ChartElement, SeriesSpec } from "@/src/types";

export function Chart({ element, state, t }: { element: ChartElement, state: AnyObj, t: (key: string) => string }) {

  const data = Array.isArray(element.data)
    ? element.data
    : (resolveBinding(element.data, state, t) as any[]) || []

  const {
    chartType: type,
    options = {},
  } = element

  const {
    xKey = element.options?.xKey || "name",
    yKey = element.options?.yKey || "value",
    valueKey = element.options?.valueKey || "value",
    openKey = element.options?.openKey || "open",
    highKey = element.options?.highKey || "high",
    lowKey = element.options?.lowKey || "low",
    closeKey = element.options?.closeKey || "close",

    series = element.options?.series || [],
    stacked = element.options?.stacked || false,

    colors = element.options?.colors || ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#059669"],
    donut = element.options?.donut || false,
    radius = element.options?.radius || undefined,

    legend = element.options?.legend || true,
    tooltip = element.options?.tooltip || true,
    responsive = element.options?.responsive || true,
    grid = element.options?.grid || true,

    xDomain = element.options?.xDomain || undefined,
    yDomain = element.options?.yDomain || undefined,
    syncId = element.options?.syncId || undefined,

    xFormatter = element.options?.xFormatter || undefined,
    yFormatter = element.options?.yFormatter || undefined,
    tooltipFormatter = element.options?.tooltipFormatter || undefined,

    lineStrokeWidth = element.options?.lineStrokeWidth || 2,
    lineDot = element.options?.lineDot || { r: 3 },
    areaOpacity = element.options?.areaOpacity || 0.6,

    animation = element.options?.animation || false,
    brush = element.options?.brush || false,
    referenceLines = element.options?.referenceLines || undefined,
    ariaLabel = element.options?.ariaLabel || undefined,
    description = element.options?.description || undefined,
  } = options

  const resolvedSeries: SeriesSpec[] =
    series.length > 0 ? series : [{ key: yKey, color: colors[0] }]

  // helpers
  const maybeGrid =
    grid === false
      ? null
      : (
        <Recharts.CartesianGrid
          strokeDasharray="3 3"
          {...(typeof grid === "object" ? grid : {})}
        />
      )

  const maybeLegend = legend ? <Recharts.Legend /> : null
  const maybeTooltip = tooltip ? (
    <Recharts.Tooltip formatter={tooltipFormatter as any} />
  ) : null

  const maybeBrush = brush ? (
    <Recharts.Brush dataKey={xKey} height={20} stroke="#8884d8" {...(typeof brush === "object" ? brush : {})} />
  ) : null

  const maybeReferenceLines = (
    <>
      {referenceLines?.x?.map((val, i) => (
        <Recharts.ReferenceLine key={`x-${i}`} x={val} stroke="red" />
      ))}
      {referenceLines?.y?.map((val, i) => (
        <Recharts.ReferenceLine key={`y-${i}`} y={val} stroke="red" />
      ))}
    </>
  )

  // X/Y axes
  const XAxis =
    type === "radar" || type === "radialBar" ? null : (
      <Recharts.XAxis
        dataKey={xKey}
        domain={xDomain}
        tickFormatter={xFormatter as any}
      />
    )

  const YAxis =
    type === "radar" || type === "radialBar" ? null : (
      <Recharts.YAxis
        domain={yDomain}
        tickFormatter={yFormatter as any}
      />
    )

  // candlestick custom shape
  const CandleShape = (p: any) => {
    const { x, width, payload, yAxis } = p
    const scale = yAxis?.scale as ((v: number) => number) | undefined
    const open = payload[openKey]
    const close = payload[closeKey]
    const high = payload[highKey]
    const low = payload[lowKey]
    const isBull = close >= open
    const color = isBull ? "#16a34a" : "#dc2626"

    const yOpen = scale ? scale(open) : open
    const yClose = scale ? scale(close) : close
    const yHigh = scale ? scale(high) : high
    const yLow = scale ? scale(low) : low

    const bodyY = Math.min(yOpen, yClose)
    const bodyH = Math.max(Math.abs(yClose - yOpen), 1)
    const cx = x + width / 2

    return (
      <g>
        <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} />
        <rect x={x} y={bodyY} width={width} height={bodyH} fill={color} />
      </g>
    )
  }

  // core render
  const chartCore =
    type === "bar" ? (
      <Recharts.BarChart data={data} syncId={syncId}>
        {maybeGrid}{XAxis}{YAxis}{maybeTooltip}{maybeLegend}{maybeBrush}{maybeReferenceLines}
        {resolvedSeries.map((s, i) => (
          <Recharts.Bar
            key={s.key}
            dataKey={s.key}
            stackId={stacked ? "stack" : s.stackId}
            fill={s.color || colors[i % colors.length]}
            name={s.label || s.key}
            isAnimationActive={!!animation}
          />
        ))}
      </Recharts.BarChart>
    ) : type === "line" ? (
      <Recharts.LineChart data={data} syncId={syncId} >
        {maybeGrid}{XAxis}{YAxis}{maybeTooltip}{maybeLegend}{maybeBrush}{maybeReferenceLines}
        {resolvedSeries.map((s, i) => (
          <Recharts.Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color || colors[i % colors.length]}
            strokeWidth={s.strokeWidth || lineStrokeWidth}
            dot={s.dot ?? lineDot}
            name={s.label || s.key}
            isAnimationActive={!!animation}
          />
        ))}
      </Recharts.LineChart>
    ) : type === "area" ? (
      <Recharts.AreaChart data={data} syncId={syncId} >
        {maybeGrid}{XAxis}{YAxis}{maybeTooltip}{maybeLegend}{maybeBrush}{maybeReferenceLines}
        {resolvedSeries.map((s, i) => (
          <Recharts.Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stackId={stacked ? "stack" : s.stackId}
            stroke={s.color || colors[i % colors.length]}
            fill={s.color || colors[i % colors.length]}
            fillOpacity={s.opacity ?? areaOpacity}
            name={s.label || s.key}
            isAnimationActive={!!animation}
          />
        ))}
      </Recharts.AreaChart>
    ) : type === "pie" ? (
      <Recharts.PieChart >
        {maybeTooltip}{maybeLegend}
        <Recharts.Pie
          data={data}
          dataKey={valueKey}
          nameKey={xKey}
          cx="50%" cy="50%"
          innerRadius={donut ? 60 : 0}
          outerRadius={radius || 100}
          label
        >
          {data.map((_: any, i) => (
            <Recharts.Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Recharts.Pie>
      </Recharts.PieChart>
    ) : type === "radar" ? (
      <Recharts.RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} >
        <Recharts.PolarGrid />
        <Recharts.PolarAngleAxis dataKey={xKey} />
        <Recharts.PolarRadiusAxis />
        {maybeTooltip}{maybeLegend}
        {resolvedSeries.map((s, i) => (
          <Recharts.Radar
            key={s.key}
            name={s.label || s.key}
            dataKey={s.key}
            stroke={s.color || colors[i % colors.length]}
            fill={s.color || colors[i % colors.length]}
            fillOpacity={s.opacity ?? areaOpacity}
            isAnimationActive={!!animation}
          />
        ))}
      </Recharts.RadarChart>
    ) : type === "radialBar" ? (
      <Recharts.RadialBarChart data={data} innerRadius={donut ? "40%" : "0%"} outerRadius={radius || "80%"} >
        {maybeLegend}
        <Recharts.RadialBar
          startAngle={90}
          endAngle={-270}
          background
          dataKey={valueKey}
          label
          fill={colors[0]}
          isAnimationActive={!!animation}
        />
        {maybeTooltip}
      </Recharts.RadialBarChart>
    ) : type === "scatter" ? (
      <Recharts.ScatterChart syncId={syncId} >
        {maybeGrid}{XAxis}{YAxis}{maybeTooltip}{maybeLegend}{maybeBrush}{maybeReferenceLines}
        {resolvedSeries.map((s, i) => (
          <Recharts.Scatter
            key={s.key}
            name={s.label || s.key}
            data={data}
            fill={s.color || colors[i % colors.length]}
            line
            shape="circle"
            isAnimationActive={!!animation}
          />
        ))}
      </Recharts.ScatterChart>
    ) : type === "candlestick" ? (
      <Recharts.ComposedChart data={data} syncId={syncId} >
        {maybeGrid}{XAxis}
        <Recharts.YAxis domain={yDomain || ["auto", "auto"]} tickFormatter={yFormatter as any} />
        {maybeTooltip}{maybeLegend}
        <Recharts.Line type="monotone" dataKey={highKey} stroke="transparent" dot={false} legendType="none" />
        <Recharts.Line type="monotone" dataKey={lowKey} stroke="transparent" dot={false} legendType="none" />
        <Recharts.Bar dataKey={closeKey} fill="transparent" shape={<CandleShape />} legendType="none" />
      </Recharts.ComposedChart>
    ) : (
      // default: composed
      <Recharts.ComposedChart data={data} syncId={syncId} >
        {maybeGrid}{XAxis}{YAxis}{maybeTooltip}{maybeLegend}{maybeBrush}{maybeReferenceLines}
        {resolvedSeries.map((s, i) => {
          const color = s.color || colors[i % colors.length]
          if (s.type === "bar")
            return <Recharts.Bar key={s.key} dataKey={s.key} fill={color} name={s.label || s.key} isAnimationActive={!!animation} />
          if (s.type === "area")
            return (
              <Recharts.Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={color}
                fill={color}
                fillOpacity={s.opacity ?? areaOpacity}
                name={s.label || s.key}
                isAnimationActive={!!animation}
              />
            )
          return (
            <Recharts.Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={color}
              strokeWidth={s.strokeWidth || lineStrokeWidth}
              dot={s.dot ?? lineDot}
              name={s.label || s.key}
              isAnimationActive={!!animation}
            />
          )
        })}
      </Recharts.ComposedChart>
    )

  return (
    <div
      data-slot="chart"
      aria-label={resolveBinding(ariaLabel, state, t)}
      aria-description={resolveBinding(description, state, t)}
      className={cn("flex aspect-video justify-center text-xs", element.styles?.className)}
    >
      {responsive ? (
        <Recharts.ResponsiveContainer width="100%" height="100%">
          {chartCore}
        </Recharts.ResponsiveContainer>
      ) : (
        chartCore
      )}
    </div>
  )
}
