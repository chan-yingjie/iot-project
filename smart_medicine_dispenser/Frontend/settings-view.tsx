"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">⚙️ Reminder Settings</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-center">
              <div>
                <h3 className="text-base font-medium">Reminder Times</h3>
                <p className="text-sm text-muted-foreground">Set your preferred reminder times</p>
              </div>
              <Select defaultValue="both">
                <SelectTrigger>
                  <SelectValue placeholder="Select times" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (1:00 PM)</SelectItem>
                  <SelectItem value="evening">Evening (8:00 PM)</SelectItem>
                  <SelectItem value="both">Morning & Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-center">
              <div>
                <h3 className="text-base font-medium">Notification Method</h3>
                <p className="text-sm text-muted-foreground">How would you like to receive reminders?</p>
              </div>
              <Select defaultValue="both">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
