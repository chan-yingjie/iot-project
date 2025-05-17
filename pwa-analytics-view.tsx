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


 useEffect(() => {
   const fetchRecords = async () => {
     const snapshot = await getDocs(collection(db, "medicationRecords"))
     const data = snapshot.docs.map((doc) => doc.data()) as Record[]
     setRecords(data)
   }
   fetchRecords()
 }, [])


 const statusCount = records.reduce(
   (acc, rec) => {
     const key = rec.status.toLowerCase().replace(" ", "")
     if (acc[key] !== undefined) acc[key]++
     return acc
   },
   { ontime: 0, missed: 0, late: 0 }
 )


 const adherenceRate = records.length > 0
   ? Math.round((statusCount.ontime / records.length) * 100)
   : 0


 const doughnutData = {
   labels: ["On time", "Late", "Missed"],
   datasets: [
     {
       data: [statusCount.ontime, statusCount.late, statusCount.missed],
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


 const scatterData = {
   datasets: records.map((rec) => {
     const [hour, minute] = rec.time.split(":" ).map(Number)
     return {
       label: rec.name,
       data: [{ x: new Date(rec.date), y: hour + minute / 60 }],
       backgroundColor:
         rec.status === "On time" ? "#38a169" :
         rec.status === "Late" ? "#facc15" :
         "#e53e3e"
     }
   })
 }


 const scatterOptions = {
   scales: {
     x: {
       type: 'time',
       time: { unit: 'day' },
       title: { display: true, text: 'Date' }
     },
     y: {
       min: 0,
       max: 24,
       title: { display: true, text: 'Hour of Day' },
       ticks: {
         stepSize: 3,
         callback: (val: number) => `${val}:00`
       }
     }
   },
   plugins: {
     tooltip: {
       callbacks: {
         label: (ctx: any) => `${ctx.raw.x.toLocaleDateString()} - ${ctx.raw.y.toFixed(2)}h`
       }
     }
   }
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
   if (dayRecords.some(r => r.status === "Missed")) status = "missed"
   else if (dayRecords.some(r => r.status === "Late")) status = "late"
   else if (dayRecords.some(r => r.status === "On time")) status = "ontime"


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


 return (
   <div className="p-6 w-full max-w-4xl mx-auto space-y-6">
     <h1 className="text-2xl font-bold mb-4">Analytics Overview</h1>


     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="p-4 bg-white rounded-lg shadow">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-semibold">{new Date(year, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
           <select
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(Number(e.target.value))}
             className="border rounded px-2 py-1 text-sm"
           >
             {Array.from({ length: 12 }, (_, i) => (
               <option key={i} value={i}>
                 {new Date(0, i).toLocaleString("en-US", { month: "long" })}
               </option>
             ))}
           </select>
         </div>
         <div className="grid grid-cols-7 gap-1">
           {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
             <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">{day}</div>
           ))}
           {Array.from({ length: firstDayOfMonth }).map((_, i) => (
             <div key={`empty-${i}`} className="h-8" />
           ))}
           {calendarData.map((day) => (
             <div
               key={day.day}
               className={`relative h-8 flex items-center justify-center rounded ${
                 day.status === "ontime"
                   ? "bg-green-100"
                   : day.status === "late"
                   ? "bg-yellow-100"
                   : day.status === "missed"
                   ? "bg-red-100"
                   : "bg-gray-50"
               }`}
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
                     ? "font-bold text-red-800"
                     : day.status
                     ? "text-gray-800"
                     : "text-gray-400"
                 }`}
               >
                 {day.day}
               </span>
               {day.count > 0 && (
                 <span className="absolute bottom-0 right-0 text-[10px] px-0.5 rounded-full bg-gray-200">
                   {day.count}
                 </span>
               )}
             </div>
           ))}
         </div>
         <div className="flex justify-center mt-4 gap-4 text-sm">
           <div className="flex items-center gap-1">
             <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" /> On time
           </div>
           <div className="flex items-center gap-1">
             <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" /> Late
           </div>
           <div className="flex items-center gap-1">
             <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" /> Missed
           </div>
         </div>
       </div>


       <div className="p-4 bg-white rounded-lg shadow">
         <h2 className="text-lg font-semibold mb-2">Adherence Rate</h2>
         <div className="flex flex-col items-center">
           <div className="relative w-40 h-40">
             <Doughnut data={doughnutData} options={doughnutOptions} />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-3xl font-bold">{adherenceRate}%</span>
               <span className="text-sm text-gray-500">Adherence</span>
             </div>
           </div>
           <div className="mt-4 w-full space-y-2">
             <div className="flex justify-between">
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                 <span>On time</span>
               </div>
               <span className="font-medium">{statusCount.ontime}</span>
             </div>
             <div className="flex justify-between">
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                 <span>Late</span>
               </div>
               <span className="font-medium">{statusCount.late}</span>
             </div>
             <div className="flex justify-between">
               <div className="flex items-center">
                 <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                 <span>Missed</span>
               </div>
               <span className="font-medium">{statusCount.missed}</span>
             </div>
             <div className="flex justify-between pt-2 border-t">
               <span className="text-gray-600">Total records</span>
               <span className="font-medium">{records.length}</span>
             </div>
           </div>
         </div>
       </div>
     </div>


     <div className="p-4 bg-white rounded-lg shadow">
       <h2 className="text-lg font-semibold mb-4">Daily Medication Time Distribution</h2>
       <div className="h-80">
         <Scatter data={scatterData} options={scatterOptions} />
       </div>
     </div>
   </div>
 )
}
