"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Target } from "lucide-react"
import type { CashFlowProjection, PaymentEvent } from "@/lib/types/calendar"
import type { Transaction } from "@/lib/types/transactions"
import { PaymentScheduler } from "@/lib/utils/payment-scheduler"
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

interface CashFlowTimelineProps {
  paymentEvents: PaymentEvent[]
  transactions: Transaction[]
  currentBalance: number
}

export function CashFlowTimeline({ paymentEvents, transactions, currentBalance }: CashFlowTimelineProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "quarter" | "year">("month")
  const [projection, setProjection] = useState<CashFlowProjection | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const newProjection = PaymentScheduler.generateCashFlowProjection(paymentEvents, transactions, timeframe)
    setProjection(newProjection)

    // Generate chart data
    const data = generateChartData(newProjection, currentBalance)
    setChartData(data)
  }, [paymentEvents, transactions, timeframe, currentBalance])

  const generateChartData = (projection: CashFlowProjection, startingBalance: number) => {
    if (!projection) return []

    const data: any[] = []
    let runningBalance = startingBalance
    const dailyEntries = new Map<string, { income: number; expenses: number }>()

    // Group entries by date
    projection.projections.forEach((entry) => {
      const dateKey = format(entry.date, "yyyy-MM-dd")
      if (!dailyEntries.has(dateKey)) {
        dailyEntries.set(dateKey, { income: 0, expenses: 0 })
      }

      const dayData = dailyEntries.get(dateKey)!
      if (entry.type === "income") {
        dayData.income += entry.amount
      } else {
        dayData.expenses += Math.abs(entry.amount)
      }
    })

    // Create chart data points
    const sortedDates = Array.from(dailyEntries.keys()).sort()
    sortedDates.forEach((dateKey) => {
      const dayData = dailyEntries.get(dateKey)!
      const netFlow = dayData.income - dayData.expenses
      runningBalance += netFlow

      data.push({
        date: dateKey,
        dateFormatted: format(new Date(dateKey), "MMM dd"),
        income: dayData.income,
        expenses: dayData.expenses,
        netFlow,
        balance: runningBalance,
        isPositive: netFlow >= 0,
      })
    })

    return data
  }

  const getTimeframeDates = () => {
    const now = new Date()
    switch (timeframe) {
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case "quarter":
        return { start: now, end: addDays(now, 90) }
      case "year":
        return { start: now, end: addDays(now, 365) }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const { start: periodStart, end: periodEnd } = getTimeframeDates()

  const upcomingPayments = paymentEvents.filter(
    (event) => event.dueDate >= periodStart && event.dueDate <= periodEnd && event.status === "scheduled",
  )

  const totalUpcomingPayments = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0)

  const projectedIncome =
    projection?.projections.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0) ||
    0

  const projectedExpenses =
    projection?.projections
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0) || 0

  const netCashFlow = projectedIncome - projectedExpenses
  const finalBalance = currentBalance + netCashFlow

  const lowBalanceWarnings = chartData.filter((point) => point.balance < 1000)
  const negativeBalanceWarnings = chartData.filter((point) => point.balance < 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cash Flow Timeline</h2>
          <p className="text-muted-foreground">Projected cash flow and balance over time</p>
        </div>
        <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Next Quarter</SelectItem>
            <SelectItem value="year">Next Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">${currentBalance.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Income</p>
                <p className="text-2xl font-bold text-green-600">${projectedIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Expenses</p>
                <p className="text-2xl font-bold text-red-600">${projectedExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Balance</p>
                <p className={`text-2xl font-bold ${finalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${finalBalance.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {(lowBalanceWarnings.length > 0 || negativeBalanceWarnings.length > 0) && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertCircle className="h-5 w-5" />
              Cash Flow Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {negativeBalanceWarnings.length > 0 && (
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Negative balance projected on {negativeBalanceWarnings.length} day(s)</span>
                </div>
              )}
              {lowBalanceWarnings.length > 0 && (
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Low balance (under $1,000) projected on {lowBalanceWarnings.length} day(s)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balance">Balance Timeline</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="breakdown">Income vs Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Account Balance Over Time</CardTitle>
              <CardDescription>Projected account balance based on scheduled payments and income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateFormatted" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Daily Cash Flow</CardTitle>
              <CardDescription>Net cash flow (income minus expenses) by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateFormatted" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Net Flow"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="netFlow" fill={(entry: any) => (entry.isPositive ? "#10b981" : "#ef4444")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Daily breakdown of projected income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateFormatted" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`,
                        name === "income" ? "Income" : "Expenses",
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Projection Details */}
      {projection && (
        <Card>
          <CardHeader>
            <CardTitle>Projection Details</CardTitle>
            <CardDescription>
              Confidence: {(projection.confidence * 100).toFixed(0)}% • Based on {projection.projections.length} data
              points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Key Assumptions</h4>
                <ul className="space-y-2">
                  {projection.assumptions.map((assumption, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Projected Income:</span>
                    <span className="font-medium text-green-600">${projection.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Projected Expenses:</span>
                    <span className="font-medium text-red-600">${projection.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Net Cash Flow:</span>
                    <span className={`font-bold ${projection.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${projection.netCashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
