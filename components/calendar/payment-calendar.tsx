"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CalendarDays,
  Clock,
  DollarSign,
  AlertTriangle,
  Plus,
  Filter,
  Bell,
  TrendingUp,
  CalendarIcon,
} from "lucide-react"
import type { PaymentEvent, PaymentCalendarView, PaymentAnomaly } from "@/lib/types/calendar"
import { PaymentScheduler } from "@/lib/utils/payment-scheduler"
import { format, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths } from "date-fns"

interface PaymentCalendarProps {
  paymentEvents: PaymentEvent[]
  anomalies: PaymentAnomaly[]
  onCreatePayment: () => void
  onEditPayment: (payment: PaymentEvent) => void
}

export function PaymentCalendar({ paymentEvents, anomalies, onCreatePayment, onEditPayment }: PaymentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [calendarView, setCalendarView] = useState<PaymentCalendarView[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentEvent | null>(null)

  useEffect(() => {
    const startDate = startOfMonth(currentMonth)
    const endDate = endOfMonth(currentMonth)
    const views = PaymentScheduler.generateCalendarView(paymentEvents, startDate, endDate)
    setCalendarView(views)
  }, [paymentEvents, currentMonth])

  const selectedDateEvents = calendarView.find((view) => isSameDay(view.date, selectedDate))?.events || []
  const upcomingPayments = paymentEvents
    .filter((event) => event.dueDate >= new Date() && event.status === "scheduled")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5)

  const overduePayments = paymentEvents.filter((event) => event.dueDate < new Date() && event.status === "scheduled")

  const totalUpcoming = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0)

  const getPaymentStatusColor = (status: PaymentEvent["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700"
      case "scheduled":
        return "bg-blue-100 text-blue-700"
      case "overdue":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPaymentTypeIcon = (type: PaymentEvent["type"]) => {
    switch (type) {
      case "loan_payment":
        return <DollarSign className="h-4 w-4" />
      case "subscription":
        return <CalendarIcon className="h-4 w-4" />
      case "utilities":
        return <Clock className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const hasPaymentsOnDate = (date: Date) => {
    return calendarView.some((view) => isSameDay(view.date, date) && view.events.length > 0)
  }

  const getDatePaymentInfo = (date: Date) => {
    const view = calendarView.find((view) => isSameDay(view.date, date))
    if (!view || view.events.length === 0) return null

    return {
      count: view.events.length,
      amount: view.totalAmount,
      hasOverdue: view.overdueCount > 0,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Calendar</h1>
          <p className="text-muted-foreground">Track and manage all your upcoming payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={onCreatePayment}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Payments</p>
                <p className="text-2xl font-bold">${totalUpcoming.toLocaleString()}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Payments</p>
                <p className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Reminders</p>
                <p className="text-2xl font-bold">{paymentEvents.filter((p) => p.reminderSettings.enabled).length}</p>
              </div>
              <Bell className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Anomalies Detected</p>
                <p className="text-2xl font-bold text-orange-600">{anomalies.filter((a) => !a.isResolved).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payment Calendar</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  Next
                </Button>
              </div>
            </CardTitle>
            <CardDescription>{format(currentMonth, "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                hasPayments: (date) => hasPaymentsOnDate(date),
                hasOverdue: (date) => {
                  const info = getDatePaymentInfo(date)
                  return info?.hasOverdue || false
                },
              }}
              modifiersStyles={{
                hasPayments: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                },
                hasOverdue: {
                  backgroundColor: "hsl(var(--destructive))",
                  color: "hsl(var(--destructive-foreground))",
                },
              }}
              components={{
                Day: ({ date, ...props }) => {
                  const info = getDatePaymentInfo(date)
                  return (
                    <div className="relative">
                      <button {...props} />
                      {info && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {info.count}
                        </div>
                      )}
                    </div>
                  )
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{format(selectedDate, "MMM dd, yyyy")}</CardTitle>
              <CardDescription>
                {selectedDateEvents.length} payment{selectedDateEvents.length !== 1 ? "s" : ""} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No payments scheduled</p>
                  ) : (
                    selectedDateEvents.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentTypeIcon(payment.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{payment.title}</p>
                            <p className="text-xs text-muted-foreground">${payment.amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Payments</CardTitle>
              <CardDescription>Next 5 scheduled payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => onEditPayment(payment)}
                  >
                    <div>
                      <p className="font-medium text-sm">{payment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(payment.dueDate, "MMM dd")} • ${payment.amount.toLocaleString()}
                      </p>
                    </div>
                    {payment.isRecurring && (
                      <Badge variant="secondary" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          {anomalies.filter((a) => !a.isResolved).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Payment Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies
                    .filter((a) => !a.isResolved)
                    .slice(0, 3)
                    .map((anomaly) => (
                      <div key={anomaly.id} className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              {anomaly.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-300">{anomaly.description}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              anomaly.severity === "critical"
                                ? "border-red-500 text-red-700"
                                : anomaly.severity === "high"
                                  ? "border-orange-500 text-orange-700"
                                  : "border-yellow-500 text-yellow-700"
                            }`}
                          >
                            {anomaly.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPayment?.title}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">${selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold">{format(selectedPayment.dueDate, "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getPaymentStatusColor(selectedPayment.status)}>{selectedPayment.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedPayment.type.replace("_", " ")}</p>
                </div>
              </div>

              {selectedPayment.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.isRecurring && selectedPayment.recurringPattern && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recurring Pattern</p>
                  <p className="text-sm capitalize">
                    {selectedPayment.recurringPattern.frequency.replace("_", " ")}
                    {selectedPayment.recurringPattern.interval > 1 &&
                      ` (every ${selectedPayment.recurringPattern.interval})`}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
                <Button onClick={() => onEditPayment(selectedPayment)}>Edit Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
