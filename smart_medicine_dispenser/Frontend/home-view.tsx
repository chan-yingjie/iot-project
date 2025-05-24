"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface HomeViewProps {
  onTabChange: (tab: string) => void
}

export default function HomeView({ onTabChange }: HomeViewProps) {
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-3 text-teal-600">
          Your Smart MedTrack
        </h1>
        <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
          Your personal smart medicine assistant – stay on track with your medication schedule.
        </p>
        <div className="inline-block bg-teal-50 text-teal-700 rounded-full px-4 py-2 text-sm font-medium">
          Select a function to get started 😊
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
      >
        <motion.div variants={item}>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-teal-400 h-full"
            onClick={() => onTabChange("reminders")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="text-4xl mb-4">💊</div>
              <h2 className="text-xl font-bold mb-3">Medication Reminders</h2>
              <p className="text-muted-foreground">View and manage your upcoming medication reminders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-teal-400 h-full"
            onClick={() => onTabChange("weekly")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="text-4xl mb-4">🗓️</div>
              <h2 className="text-xl font-bold mb-3">Weekly Plan</h2>
              <p className="text-muted-foreground">Set up your weekly medication schedule</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-teal-400 h-full"
            onClick={() => onTabChange("analytics")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-bold mb-3">Medication Analytics</h2>
              <p className="text-muted-foreground">Track your medication adherence and patterns</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
