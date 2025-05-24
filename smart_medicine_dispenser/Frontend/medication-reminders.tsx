"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import { CalendarIcon, PillIcon, ClockIcon } from "lucide-react"

export default function MedicationReminders() {
  const [allPlans, setAllPlans] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState("All")
  const [dateOptions, setDateOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const snapshot = await getDocs(collection(db, "weeklyPlans"))
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAllPlans(data)
        const uniqueDates = Array.from(new Set(data.map((plan) => plan.date)))
        setDateOptions(["All", ...uniqueDates])
      } catch (error) {
        console.error("❌ Error fetching plans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const filteredPlans =
    selectedDate === "All"
      ? allPlans
      : allPlans.filter((plan) => plan.date === selectedDate)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">
          💊 Medication Reminders
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View your upcoming medication schedule
        </p>
      </div>
      
      <div className="flex justify-end mb-6">
        <div className="w-full max-w-xs">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select date" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((date) => (
                <SelectItem key={date} value={date}>
                  {date === "All" ? "All Dates" : dayjs(date).format("YYYY-MM-DD")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b py-4">
          <CardTitle className="text-lg font-medium text-slate-700">Your Medication Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-teal-100 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Medication Name</TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                      <TableHead className="font-semibold">Dose</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow 
                        key={plan.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {dayjs(plan.date).format("YYYY-MM-DD")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <PillIcon className="mr-2 h-4 w-4 text-teal-500" />
                            {plan.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ClockIcon className="mr-2 h-4 w-4 text-teal-500" />
                            {plan.time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                            {plan.dose}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredPlans.length === 0 && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-500 mb-4">
                    ⚠️
                  </div>
                  <h3 className="text-lg font-medium">No medications found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDate !== "All" 
                      ? `No medication plans scheduled for ${selectedDate}.` 
                      : "Your medication schedule is empty."}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
