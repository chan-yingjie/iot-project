"use client"

interface MedicationRingChartProps {
  value: number
}

export function MedicationRingChart({ value }: MedicationRingChartProps) {
  // This is a placeholder component
  // In a real implementation, you would use a library like recharts
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex justify-center">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 150 150">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeOpacity="0.2"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-green-500"
            transform="rotate(-90 75 75)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{value}%</span>
        </div>
      </div>
    </div>
  )
}
