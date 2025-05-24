"use client"

import { useEffect, useState } from "react"
import { db } from "../lib/firebase"
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Edit, Plus, PlusCircle, Pill, Trash2, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

interface Plan {
  id: string
  name: string
  date: string
  time: string
  dose: string
  status: string
}

export default function WeeklyPlanView() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [newPlan, setNewPlan] = useState({
    name: "",
    date: "",
    time: "",
    dose: "",
  })
  const [editId, setEditId] = useState<string | null>(null)
  const [showPlans, setShowPlans] = useState(false)

  const fetchPlans = async () => {
    const snapshot = await getDocs(collection(db, "weeklyPlans"))
    const fetchedPlans = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Plan[]
    setPlans(fetchedPlans)
  }

  const handleAddOrUpdatePlan = async () => {
    if (!newPlan.name || !newPlan.date || !newPlan.time || !newPlan.dose) return

    if (editId) {
      await updateDoc(doc(db, "weeklyPlans", editId), {
        name: newPlan.name,
        date: newPlan.date,
        time: newPlan.time,
        dose: newPlan.dose,
      })
      setEditId(null)
    } else {
      const planToAdd = {
        name: newPlan.name,
        date: newPlan.date,
        time: newPlan.time,
        dose: newPlan.dose,
        status: "Scheduled",
      }
      await addDoc(collection(db, "weeklyPlans"), planToAdd)
    }

    setNewPlan({ name: "", date: "", time: "", dose: "" })
    fetchPlans()
  }

  const handleEdit = (plan: Plan) => {
    setNewPlan({
      name: plan.name,
      date: plan.date,
      time: plan.time,
      dose: plan.dose,
    })
    setEditId(plan.id)
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "weeklyPlans", id))
    fetchPlans()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Missed":
        return "bg-red-100 text-red-800"
      case "Delayed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">Weekly Medication Schedule</span>
          <Pill className="h-8 w-8 text-blue-500" />
        </h1>
        <Button 
          className={`flex items-center gap-2 ${showPlans ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={() => setShowPlans(!showPlans)}
        >
          {showPlans ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPlans ? "Hide Schedule" : "View Schedule"}
        </Button>
      </div>

      <AnimatePresence>
        {showPlans && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Medication Plans</h2>
            
            {plans.length === 0 ? (
              <Card className="bg-gray-50 border border-dashed border-gray-300">
                <CardContent className="p-6 text-center text-gray-500">
                  <p>No medication plans yet. Create your first plan below.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                          <Badge className={`${getStatusColor(plan.status)}`}>
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="font-medium text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(plan.date).toLocaleDateString('en-US', {
                            weekday: "short",
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      </div>
                      
                      <div className="mb-4 flex items-center text-gray-700">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="mr-3">{plan.time}</span>
                        <Pill className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{plan.dose}</span>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex items-center gap-1"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            {editId ? (
              <>
                <Edit className="h-5 w-5 mr-2 text-blue-500" />
                Edit Medication Plan
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 mr-2 text-blue-500" />
                Add New Medication Plan
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Pill className="h-4 w-4 text-blue-500" />
                Medication Name
              </label>
              <Input
                placeholder="Enter medication name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Pill className="h-4 w-4 text-blue-500" />
                Dose
              </label>
              <Input
                placeholder="e.g., 250mg, 1 tablet"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={newPlan.dose}
                onChange={(e) => setNewPlan({ ...newPlan, dose: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                Date
              </label>
              <Input
                type="date"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={newPlan.date}
                onChange={(e) => setNewPlan({ ...newPlan, date: e.target.value })}
                lang="en"
                placeholder="YYYY-MM-DD"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                Time
              </label>
              <Input
                type="time"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={newPlan.time}
                onChange={(e) => setNewPlan({ ...newPlan, time: e.target.value })}
              />
            </div>
          </div>
          
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
            onClick={handleAddOrUpdatePlan}
          >
            {editId ? (
              <>
                <Edit className="h-4 w-4" />
                Update Medication Plan
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Medication Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
