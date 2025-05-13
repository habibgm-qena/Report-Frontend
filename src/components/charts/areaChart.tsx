'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface DataPoint {
  month: string
  score: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
  }>
}

interface CustomAxisTickProps {
  x?: number
  y?: number
  payload?: {
    value: string
  }
}

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: DataPoint
}

const chartData: DataPoint[] = [
  { month: 'Jan', score: 550 },
  { month: 'Feb', score: 700 },
  { month: 'Mar', score: 615 },
  { month: 'Apr', score: 900 },
  { month: 'May', score: 650 },
  { month: 'Jun', score: 850 },
]

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-md bg-zinc-800/90 px-3 py-1.5 text-xs text-white shadow-sm">
        Evaluated score: {payload[0].value}
      </div>
    )
  }
  return null
}

const CustomAxisTick: React.FC<CustomAxisTickProps> = ({ x = 0, y = 0, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={16} textAnchor="middle" fill="#6B7280" className="text-xs">
      {payload?.value}
    </text>
  </g>
)

const CustomDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
  if (payload?.month === 'Jun') {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#FFF"
        stroke="#000"
        strokeWidth={2}
      />
    )
  }
  return null
}

const AreaChartComponent: React.FC = () => {
  return (
    <div className="h-72 w-full p-0 mx-0 mt-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: -20, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(216, 238, 16, 0.22)" />
              <stop offset="75%" stopColor="rgba(234, 238, 16, 0.07)" />
              <stop offset="81%" stopColor="rgba(255, 56, 56, 0.05)" />
              <stop offset="100%" stopColor="rgba(243, 53, 27, 0)" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
            opacity={0.5}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={<CustomAxisTick />}
            interval={0}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[400, 1000]}
            axisLine={false}
            tickLine={false}
            tickCount={7}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: '#374151',
              strokeDasharray: '3 3',
              strokeWidth: 1,
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#374151"
            strokeWidth={1.5}
            fill="url(#areaGradient)"
            dot={<CustomDot />}
            yAxisId="right"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaChartComponent
