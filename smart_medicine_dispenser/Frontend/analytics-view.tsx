"use client"

import { useEffect, useState } from "react"
import { db } from "../lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Doughnut, Scatter } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PieChartIcon, 
  AlertTriangleIcon, 
  XCircleIcon,
  BarChartIcon 
} from "lucide-react"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Title
)

interface Record {
  name: string
  date: string
  time: string
  dose: string
  status: string
}

export default function AnalyticsView() {
  const [records, setRecords] = useState<Record[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      try {
        const snapshot = await getDocs(collection(db, "medicationRecords"))
        const data = snapshot.docs.map((doc) => doc.data()) as Record[]
        setRecords(data)
      } catch (error) {
        console.error("Error fetching records:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  const statusCount = records.reduce(
    (acc, rec) => {
      // 修正状态键名，将 "On time" 转换为 "ontime"
      const status = rec.status.toLowerCase().replace(/\s+/g, "")
      if (acc[status] !== undefined) acc[status]++
      return acc
    },
    { ontime: 0, missed: 0, late: 0, taken: 0 } // 添加 "taken" 以支持您可能有的其他状态
  )

  const adherenceRate = records.length > 0
    ? Math.round(((statusCount.ontime + statusCount.taken) / records.length) * 100)
    : 0

  const doughnutData = {
    labels: ["On Time", "Late", "Missed"],
    datasets: [
      {
        data: [
          statusCount.ontime + statusCount.taken, 
          statusCount.late, 
          statusCount.missed
        ],
        backgroundColor: ["#38a169", "#facc15", "#e53e3e"],
        borderWidth: 0
      }
    ]
  }

  const doughnutOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const value = context.raw
            const percentage = Math.round((value / total) * 100)
            return `${context.label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    cutout: "70%",
    maintainAspectRatio: false
  }

  // 修复 Scatter 图表中的色块问题
  const scatterData = {
    datasets: records.map((rec, index) => {
      const [hour, minute] = rec.time.split(":").map(Number)
      // 根据状态确定颜色
      let color
      const status = rec.status.toLowerCase().replace(/\s+/g, "")
      if (status === "ontime" || status === "taken") {
        color = "#38a169" // 绿色
      } else if (status === "late") {
        color = "#facc15" // 黄色
      } else if (status === "missed") {
        color = "#e53e3e" // 红色
      } else {
        color = "#94a3b8" // 默认灰色
      }

      return {
        label: rec.name,
        data: [{ x: new Date(rec.date), y: hour + minute / 60 }],
        backgroundColor: color,
        borderColor: color,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    })
  }

  const scatterOptions = {
    scales: {
      x: {
        type: 'time' as const,
        time: { unit: 'day' as const },
        title: { display: true, text: 'Date' }
      },
      y: {
        min: 0,
        max: 24,
        title: { display: true, text: 'Hour of Day' },
        ticks: {
          stepSize: 3,
          callback: (val: number) => `${Math.floor(val)}:${((val % 1) * 60).toFixed(0).padStart(2, '0')}`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (ctx: any) => {
            return `${ctx[0].raw.x.toLocaleDateString()}`
          },
          label: (ctx: any) => {
            const hour = Math.floor(ctx.raw.y)
            const minute = Math.round((ctx.raw.y % 1) * 60)
            return [
              `Medication: ${ctx.dataset.label}`,
              `Time: ${hour}:${minute.toString().padStart(2, '0')}`,
              `Status: ${records[ctx.datasetIndex].status}`
            ]
          }
        }
      }
    },
    maintainAspectRatio: false
  }

  const year = new Date().getFullYear()
  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, selectedMonth, 1).getDay()

  const calendarData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const localDate = `${year}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    const dayRecords = records.filter((r) => {
      const recordDate = new Date(r.date)
      const recordDateStr = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}-${recordDate.getDate().toString().padStart(2, '0')}`
      return recordDateStr === localDate
    })

    let status = null
    if (dayRecords.some(r => r.status.toLowerCase().includes("miss"))) status = "missed"
    else if (dayRecords.some(r => r.status.toLowerCase().includes("late"))) status = "late"
    else if (dayRecords.some(r => r.status.toLowerCase().includes("on") || r.status.toLowerCase().includes("taken"))) status = "ontime"

    return {
      date: localDate,
      day,
      status,
      count: dayRecords.length,
      details: dayRecords.map(r => ({
        name: r.name,
        time: r.time,
        status: r.status
      }))
    }
  })

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">
          📊 Medication Analytics
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your medication adherence and identify patterns over time
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-teal-100 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Adherence and Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Adherence Rate */}
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50 border-b py-4">
                <CardTitle className="text-lg font-medium text-slate-700 flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-teal-600" />
                  Adherence Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-44">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{adherenceRate}%</span>
                      <span className="text-sm text-gray-500">Adherence</span>
                    </div>
                  </div>
                  <div className="mt-6 w-full space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-md bg-green-50">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                        <span>On time</span>
                      </div>
                      <span className="font-medium">{statusCount.ontime + statusCount.taken}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-yellow-50">
                      <div className="flex items-center">
                        <AlertTriangleIcon className="w-4 h-4 text-yellow-600 mr-2" />
                        <span>Late</span>
                      </div>
                      <span className="font-medium">{statusCount.late}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-red-50">
                      <div className="flex items-center">
                        <XCircleIcon className="w-4 h-4 text-red-600 mr-2" />
                        <span>Missed</span>
                      </div>
                      <span className="font-medium">{statusCount.missed}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-t pt-3 mt-3">
                      <span className="text-gray-600">Total records</span>
                      <span className="font-semibold">{records.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50 border-b py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-slate-700 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-teal-600" />
                    Monthly Tracking
                  </CardTitle>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number(value))}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-9" />
                  ))}
                  {calendarData.map((day) => (
                    <div
                      key={day.day}
                      className={`relative h-9 flex items-center justify-center rounded-md border ${
                        day.status === "ontime"
                          ? "bg-green-50 border-green-200"
                          : day.status === "late"
                          ? "bg-yellow-50 border-yellow-200"
                          : day.status === "missed"
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      } hover:border-teal-300 transition-colors`}
                      title={
                        day.details?.length > 0
                          ? `${day.date}\n${day.details
                              .map((d) => `${d.name} at ${d.time} - ${d.status}`)
                              .join("\n")}`
                          : `${day.date} - No records`
                      }
                    >
                      <span
                        className={`text-sm ${
                          day.status === "missed"
                            ? "font-semibold text-red-800"
                            : day.status === "late"
                            ? "font-medium text-yellow-800"
                            : day.status === "ontime"
                            ? "font-medium text-green-800"
                            : "text-gray-400"
                        }`}
                      >
                        {day.day}
                      </span>
                      {day.count > 0 && (
                        <span className="absolute -top-1 -right-1 text-[10px] h-4 w-4 flex items-center justify-center rounded-full bg-teal-500 text-white font-bold">
                          {day.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm" /> On time
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-sm" /> Late
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm" /> Missed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Distribution Chart */}
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-lg font-medium text-slate-700 flex items-center">
                <BarChartIcon className="h-5 w-5 mr-2 text-teal-600" />
                Daily Medication Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {records.length > 0 ? (
                <div className="h-80">
                  <Scatter data={scatterData} options={scatterOptions} />
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-4">
                    <ClockIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium">No medication records</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your medication distribution chart will appear here when you have records.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
