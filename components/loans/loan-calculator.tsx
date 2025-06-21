"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calculator, TrendingDown, Calendar, DollarSign, Target, Lightbulb } from "lucide-react"
import type { LoanCalculatorInput, PaymentFrequency } from "@/lib/types/loans"
import { LoanCalculator } from "@/lib/utils/loan-calculator"
import { format } from "date-fns"

export function LoanCalculatorComponent() {
  const [input, setInput] = useState<LoanCalculatorInput>({
    loanAmount: 500000,
    interestRate: 6.5,
    termYears: 30,
    paymentFrequency: "monthly",
    extraPayment: 0,
    startDate: new Date(),
  })

  const [showExtraPayments, setShowExtraPayments] = useState(false)
  const [comparisonScenarios, setComparisonScenarios] = useState<any[]>([])

  const result = LoanCalculator.generateAmortizationSchedule(input)

  const baseResult = LoanCalculator.generateAmortizationSchedule({
    ...input,
    extraPayment: 0,
  })

  const interestSavings =
    showExtraPayments && input.extraPayment > 0
      ? LoanCalculator.calculateInterestSavings(
          input.loanAmount,
          input.interestRate,
          input.termYears * 12,
          input.extraPayment,
          input.paymentFrequency,
        )
      : null

  useEffect(() => {
    // Generate comparison scenarios
    const scenarios = [
      {
        name: "Current",
        extraPayment: input.extraPayment,
        ...result,
      },
      {
        name: "+$100/month",
        extraPayment: input.extraPayment + 100,
        ...LoanCalculator.generateAmortizationSchedule({
          ...input,
          extraPayment: input.extraPayment + 100,
        }),
      },
      {
        name: "+$250/month",
        extraPayment: input.extraPayment + 250,
        ...LoanCalculator.generateAmortizationSchedule({
          ...input,
          extraPayment: input.extraPayment + 250,
        }),
      },
      {
        name: "+$500/month",
        extraPayment: input.extraPayment + 500,
        ...LoanCalculator.generateAmortizationSchedule({
          ...input,
          extraPayment: input.extraPayment + 500,
        }),
      },
    ]
    setComparisonScenarios(scenarios)
  }, [input, result])

  const chartData = result.schedule.slice(0, Math.min(result.schedule.length, 360)).map((payment, index) => ({
    month: index + 1,
    principal: payment.principalAmount,
    interest: payment.interestAmount,
    balance: payment.remainingBalance,
    cumulative: payment.cumulativeInterest,
  }))

  const handleInputChange = (field: keyof LoanCalculatorInput, value: any) => {
    setInput((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
        <p className="text-muted-foreground">Calculate payments, compare scenarios, and optimize your loan strategy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <Input
                id="loanAmount"
                type="number"
                value={input.loanAmount}
                onChange={(e) => handleInputChange("loanAmount", Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={input.interestRate}
                onChange={(e) => handleInputChange("interestRate", Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termYears">Loan Term (Years)</Label>
              <div className="space-y-2">
                <Slider
                  value={[input.termYears]}
                  onValueChange={([value]) => handleInputChange("termYears", value)}
                  max={40}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">{input.termYears} years</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select
                value={input.paymentFrequency}
                onValueChange={(value: PaymentFrequency) => handleInputChange("paymentFrequency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="extraPayments" checked={showExtraPayments} onCheckedChange={setShowExtraPayments} />
              <Label htmlFor="extraPayments">Include Extra Payments</Label>
            </div>

            {showExtraPayments && (
              <div className="space-y-2">
                <Label htmlFor="extraPayment">Extra Payment Amount</Label>
                <Input
                  id="extraPayment"
                  type="number"
                  value={input.extraPayment}
                  onChange={(e) => handleInputChange("extraPayment", Number(e.target.value))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment</p>
                    <p className="text-xl font-bold">${result.monthlyPayment.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Interest</p>
                    <p className="text-xl font-bold">${result.totalInterest.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payoff Date</p>
                    <p className="text-xl font-bold">{format(result.payoffDate, "MMM yyyy")}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                    <p className="text-xl font-bold">{result.totalPayments}</p>
                  </div>
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interest Savings */}
          {interestSavings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Extra Payment Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Interest Saved</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${interestSavings.interestSaved.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(interestSavings.timeSaved / 12)} years
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">New Payoff Date</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {format(interestSavings.newPayoffDate, "MMM yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts and Tables */}
          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">Payment Breakdown</TabsTrigger>
              <TabsTrigger value="balance">Balance Over Time</TabsTrigger>
              <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
              <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Principal vs Interest Over Time</CardTitle>
                  <CardDescription>See how your payments are split between principal and interest</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.filter((_, i) => i % 12 === 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                          labelFormatter={(label) => `Month ${label}`}
                        />
                        <Bar dataKey="principal" stackId="a" fill="#3b82f6" name="Principal" />
                        <Bar dataKey="interest" stackId="a" fill="#ef4444" name="Interest" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balance">
              <Card>
                <CardHeader>
                  <CardTitle>Remaining Balance</CardTitle>
                  <CardDescription>Track how your loan balance decreases over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.filter((_, i) => i % 6 === 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
                          labelFormatter={(label) => `Month ${label}`}
                        />
                        <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Extra Payment Scenarios</CardTitle>
                  <CardDescription>Compare the impact of different extra payment amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonScenarios.map((scenario, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant={index === 0 ? "default" : "secondary"}>{scenario.name}</Badge>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Payment</p>
                              <p className="font-medium">
                                ${(scenario.monthlyPayment + scenario.extraPayment).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Interest</p>
                              <p className="font-medium">${scenario.totalInterest.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payoff Date</p>
                              <p className="font-medium">{format(scenario.payoffDate, "MMM yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Savings vs Base</p>
                              <p className="font-medium text-green-600">
                                ${(baseResult.totalInterest - scenario.totalInterest).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                  <CardDescription>Detailed breakdown of each payment (showing first 24 payments)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.schedule.slice(0, 24).map((payment) => (
                          <TableRow key={payment.paymentNumber}>
                            <TableCell>{payment.paymentNumber}</TableCell>
                            <TableCell>{format(payment.dueDate, "MMM yyyy")}</TableCell>
                            <TableCell>${payment.totalPayment.toLocaleString()}</TableCell>
                            <TableCell>${payment.principalAmount.toLocaleString()}</TableCell>
                            <TableCell>${payment.interestAmount.toLocaleString()}</TableCell>
                            <TableCell>${payment.remainingBalance.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {result.schedule.length > 24 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Showing first 24 payments of {result.schedule.length} total payments
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
