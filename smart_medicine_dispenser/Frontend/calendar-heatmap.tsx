"use client"

interface CalendarHeatmapProps {
  data: Array<{
    date: Date
    value: number
  }>
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  // This is a placeholder component
  // In a real implementation, you would use a library like recharts or build a custom calendar view
  return (
    <div className="p-4 border rounded-md bg-muted/20">
      <div className="grid grid-cols-7 gap-1">
        {data.slice(0, 28).map((day, i) => {
          let bgColor = "bg-red-200"
          if (day.value === 1) bgColor = "bg-yellow-200"
          if (day.value === 2) bgColor = "bg-green-200"

          return (
            <div key={i} className={`aspect-square rounded-sm ${bgColor} flex items-center justify-center text-xs`}>
              {day.date.getDate()}
            </div>
          )
        })}
      </div>
      <div className="flex justify-center mt-4 text-xs space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-200 rounded-sm mr-1"></div>
          <span>On time</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-200 rounded-sm mr-1"></div>
          <span>Late</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-200 rounded-sm mr-1"></div>
          <span>Missed</span>
        </div>
      </div>
    </div>
  )
}
