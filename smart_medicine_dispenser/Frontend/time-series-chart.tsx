"use client"

interface TimeSeriesChartProps {
  data: Array<{
    date: Date
    taken: number
    missed: number
  }>
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  // This is a placeholder component
  // In a real implementation, you would use a library like recharts
  const maxValue = Math.max(...data.map((d) => d.taken + d.missed))

  return (
    <div className="p-4 border rounded-md bg-muted/20">
      <div className="flex h-40 items-end space-x-2">
        {data.map((day, i) => {
          const takenHeight = (day.taken / maxValue) * 100
          const missedHeight = (day.missed / maxValue) * 100

          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col-reverse">
                <div className="w-full bg-green-500 rounded-t" style={{ height: `${takenHeight}%` }}></div>
                <div className="w-full bg-red-400 rounded-t" style={{ height: `${missedHeight}%` }}></div>
              </div>
              <div className="text-xs mt-1">{day.date.toLocaleDateString(undefined, { weekday: "short" })}</div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-center mt-4 text-xs space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
          <span>Taken</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-400 rounded-sm mr-1"></div>
          <span>Missed</span>
        </div>
      </div>
    </div>
  )
}
