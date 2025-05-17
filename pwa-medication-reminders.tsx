"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dayjs from "dayjs"

export default function MedicationReminders() {
  const [allPlans, setAllPlans] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState("All")
  const [dateOptions, setDateOptions] = useState<string[]>([])

  useEffect(() => {
    const fetchPlans = async () => {
      try {
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
      }
    }

    fetchPlans()
  }, [])

  const filteredPlans =
    selectedDate === "All"
      ? allPlans
      : allPlans.filter((plan) => plan.date === selectedDate)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">💊 Medication Reminders</h1>

      <div className="mb-4">
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map((date) => (
              <SelectItem key={date} value={date}>
                {date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Dose</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{dayjs(plan.date).format("YYYY-MM-DD")}</TableCell>
              <TableCell>{plan.name}</TableCell>
              <TableCell>{plan.time}</TableCell>
              <TableCell>{plan.dose}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredPlans.length === 0 && (
        <p className="text-sm text-muted-foreground">
          ⚠️ No medication plans found.
        </p>
      )}
    </div>
  )
}
