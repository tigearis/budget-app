"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, Smartphone, Calendar, Clock, Plus, Trash2, Settings, TestTube, CheckCircle } from "lucide-react"
import type { NotificationPreferences, ReminderTiming, GoogleCalendarConfig } from "@/lib/types/calendar"

interface NotificationSettingsProps {
  preferences: NotificationPreferences
  googleCalendarConfig: GoogleCalendarConfig
  onUpdatePreferences: (preferences: NotificationPreferences) => void
  onUpdateGoogleCalendar: (config: GoogleCalendarConfig) => void
  onTestNotification: (method: string) => void
}

export function NotificationSettings({
  preferences,
  googleCalendarConfig,
  onUpdatePreferences,
  onUpdateGoogleCalendar,
  onTestNotification,
}: NotificationSettingsProps) {
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(preferences)
  const [localGoogleConfig, setLocalGoogleConfig] = useState<GoogleCalendarConfig>(googleCalendarConfig)
  const [customReminders, setCustomReminders] = useState<ReminderTiming[]>([
    { value: 3, unit: "days", label: "3 days before" },
    { value: 1, unit: "days", label: "1 day before" },
    { value: 2, unit: "hours", label: "2 hours before" },
  ])

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...localPreferences, ...updates }
    setLocalPreferences(newPreferences)
    onUpdatePreferences(newPreferences)
  }

  const updateGoogleConfig = (updates: Partial<GoogleCalendarConfig>) => {
    const newConfig = { ...localGoogleConfig, ...updates }
    setLocalGoogleConfig(newConfig)
    onUpdateGoogleCalendar(newConfig)
  }

  const addCustomReminder = () => {
    const newReminder: ReminderTiming = {
      value: 1,
      unit: "days",
      label: "1 day before",
    }
    setCustomReminders([...customReminders, newReminder])
  }

  const updateCustomReminder = (index: number, updates: Partial<ReminderTiming>) => {
    const newReminders = [...customReminders]
    newReminders[index] = { ...newReminders[index], ...updates }

    // Update label automatically
    const { value, unit } = newReminders[index]
    newReminders[index].label = `${value} ${unit}${value !== 1 ? "s" : ""} before`

    setCustomReminders(newReminders)
  }

  const removeCustomReminder = (index: number) => {
    setCustomReminders(customReminders.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
        <p className="text-muted-foreground">Configure how and when you receive payment reminders</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="calendar">Google Calendar</TabsTrigger>
          <TabsTrigger value="reminders">Custom Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive payment reminders via email</p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={localPreferences.email.enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({
                      email: { ...localPreferences.email, enabled: checked },
                    })
                  }
                />
              </div>

              {localPreferences.email.enabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-address">Email Address</Label>
                      <Input
                        id="email-address"
                        type="email"
                        value={localPreferences.email.address}
                        onChange={(e) =>
                          updatePreferences({
                            email: { ...localPreferences.email, address: e.target.value },
                          })
                        }
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-frequency">Email Frequency</Label>
                      <Select
                        value={localPreferences.email.frequency}
                        onValueChange={(value: any) =>
                          updatePreferences({
                            email: { ...localPreferences.email, frequency: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily_digest">Daily Digest</SelectItem>
                          <SelectItem value="weekly_digest">Weekly Digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => onTestNotification("email")} className="w-fit">
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
              <CardDescription>Configure SMS notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive payment reminders via SMS</p>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={localPreferences.sms.enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({
                      sms: { ...localPreferences.sms, enabled: checked },
                    })
                  }
                />
              </div>

              {localPreferences.sms.enabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={localPreferences.sms.phoneNumber}
                        onChange={(e) =>
                          updatePreferences({
                            sms: { ...localPreferences.sms, phoneNumber: e.target.value },
                          })
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms-frequency">SMS Frequency</Label>
                      <Select
                        value={localPreferences.sms.frequency}
                        onValueChange={(value: any) =>
                          updatePreferences({
                            sms: { ...localPreferences.sms, frequency: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily_digest">Daily Digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => onTestNotification("sms")} className="w-fit">
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test SMS
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>Configure browser push notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive payment reminders as push notifications</p>
                </div>
                <Switch
                  id="push-enabled"
                  checked={localPreferences.push.enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({
                      push: { ...localPreferences.push, enabled: checked },
                    })
                  }
                />
              </div>

              {localPreferences.push.enabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="push-frequency">Push Frequency</Label>
                      <Select
                        value={localPreferences.push.frequency}
                        onValueChange={(value: any) =>
                          updatePreferences({
                            push: { ...localPreferences.push, frequency: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily_digest">Daily Digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => onTestNotification("push")} className="w-fit">
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Push
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Google Calendar Integration
              </CardTitle>
              <CardDescription>Sync payment events with your Google Calendar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="calendar-enabled">Enable Google Calendar Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically create calendar events for payments</p>
                </div>
                <Switch
                  id="calendar-enabled"
                  checked={localGoogleConfig.enabled}
                  onCheckedChange={(checked) => updateGoogleConfig({ enabled: checked })}
                />
              </div>

              {localGoogleConfig.enabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="calendar-id">Calendar ID</Label>
                      <Input
                        id="calendar-id"
                        value={localGoogleConfig.calendarId || ""}
                        onChange={(e) => updateGoogleConfig({ calendarId: e.target.value })}
                        placeholder="primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use "primary" for your main calendar or specify a calendar ID
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sync-direction">Sync Direction</Label>
                      <Select
                        value={localGoogleConfig.syncDirection}
                        onValueChange={(value: any) => updateGoogleConfig({ syncDirection: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_way">One Way (App → Calendar)</SelectItem>
                          <SelectItem value="two_way">Two Way (Bidirectional)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-prefix">Event Title Prefix</Label>
                      <Input
                        id="event-prefix"
                        value={localGoogleConfig.eventPrefix}
                        onChange={(e) => updateGoogleConfig({ eventPrefix: e.target.value })}
                        placeholder="💰 "
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color-id">Calendar Color</Label>
                      <Select
                        value={localGoogleConfig.colorId}
                        onValueChange={(value) => updateGoogleConfig({ colorId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Lavender</SelectItem>
                          <SelectItem value="2">Sage</SelectItem>
                          <SelectItem value="3">Grape</SelectItem>
                          <SelectItem value="4">Flamingo</SelectItem>
                          <SelectItem value="5">Banana</SelectItem>
                          <SelectItem value="6">Tangerine</SelectItem>
                          <SelectItem value="7">Peacock</SelectItem>
                          <SelectItem value="8">Graphite</SelectItem>
                          <SelectItem value="9">Blueberry</SelectItem>
                          <SelectItem value="10">Basil</SelectItem>
                          <SelectItem value="11">Tomato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" size="sm" className="w-fit">
                      <Settings className="h-4 w-4 mr-2" />
                      Connect Google Calendar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Custom Reminder Timings
              </CardTitle>
              <CardDescription>Set up custom reminder schedules for your payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {customReminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        value={reminder.value}
                        onChange={(e) => updateCustomReminder(index, { value: Number.parseInt(e.target.value) || 1 })}
                        className="w-20"
                        min="1"
                      />
                      <Select
                        value={reminder.unit}
                        onValueChange={(value: any) => updateCustomReminder(index, { unit: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">before payment due</span>
                    </div>
                    <Badge variant="outline">{reminder.label}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomReminder(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addCustomReminder} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Default Reminder Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>Apply common reminder schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() =>
                    setCustomReminders([
                      { value: 7, unit: "days", label: "1 week before" },
                      { value: 3, unit: "days", label: "3 days before" },
                      { value: 1, unit: "days", label: "1 day before" },
                    ])
                  }
                >
                  <span className="font-medium">Conservative</span>
                  <span className="text-sm text-muted-foreground">1 week, 3 days, 1 day before</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() =>
                    setCustomReminders([
                      { value: 3, unit: "days", label: "3 days before" },
                      { value: 1, unit: "days", label: "1 day before" },
                      { value: 2, unit: "hours", label: "2 hours before" },
                    ])
                  }
                >
                  <span className="font-medium">Balanced</span>
                  <span className="text-sm text-muted-foreground">3 days, 1 day, 2 hours before</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() =>
                    setCustomReminders([
                      { value: 1, unit: "days", label: "1 day before" },
                      { value: 2, unit: "hours", label: "2 hours before" },
                    ])
                  }
                >
                  <span className="font-medium">Minimal</span>
                  <span className="text-sm text-muted-foreground">1 day, 2 hours before</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() =>
                    setCustomReminders([
                      { value: 2, unit: "weeks", label: "2 weeks before" },
                      { value: 1, unit: "weeks", label: "1 week before" },
                      { value: 3, unit: "days", label: "3 days before" },
                      { value: 1, unit: "days", label: "1 day before" },
                    ])
                  }
                >
                  <span className="font-medium">Comprehensive</span>
                  <span className="text-sm text-muted-foreground">2 weeks, 1 week, 3 days, 1 day</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
