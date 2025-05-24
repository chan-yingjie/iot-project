"use client"

import "./globals.css"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HomeView from "@/components/home-view"
import RemindersView from "@/components/reminders-view"
import WeeklyPlanView from "@/components/weekly-plan-view"
import AnalyticsView from "@/components/analytics-view"

export default function Page() {
  const [tab, setTab] = useState("home")

  return (
    <>
      <style jsx global>{`
        .color-empty {
          fill: #ebedf0;
        }
        .color-scale-green {
          fill: #4ade80;
        }
        .color-scale-yellow {
          fill: #facc15;
        }
        .color-scale-red {
          fill: #f87171;
        }
      `}</style>

      <div className="w-full max-w-5xl mx-auto px-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="fixed bottom-0 inset-x-0 flex justify-around bg-white border-t z-10">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {tab === "home" && <HomeView onTabChange={setTab} />}
          {tab === "reminders" && <RemindersView />}
          {tab === "weekly" && <WeeklyPlanView />}
          {tab === "analytics" && <AnalyticsView />}
        </Tabs>
      </div>
    </>
  )
}
