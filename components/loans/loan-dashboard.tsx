"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Calculator,
  BarChart3,
  Lightbulb,
  CreditCard,
  Home,
  Car,
  Leaf,
  User,
  ArrowRight,
} from "lucide-react"
import type { Loan, OptimizationStrategy } from "@/lib/types/loans"
import { LoanCalculator } from "@/lib/utils/loan-calculator"
import { format, differenceInMonths } from "date-fns"
import Link from "next/link"

interface LoanDashboardProps {
  loans: Loan[]
  optimizationStrategies: OptimizationStrategy[]
  onCreateLoan: () => void
}

export function LoanDashboard({ loans, optimizationStrategies, onCreateLoan }: LoanDashboardProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy | null>(null)

  const activeLoans = loans.filter((loan) => loan.status === "active")

  const totalDebt = activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0)
  const totalMonthlyPayments = activeLoans.reduce((sum, loan) => sum + loan.minimumPayment, 0)
  const weightedAverageRate =
    activeLoans.length > 0
      ? activeLoans.reduce((sum, loan) => sum + loan.interestRate * loan.currentBalance, 0) / totalDebt
      : 0

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case "mortgage":
        return <Home className="h-5 w-5" />
      case "vehicle":
        return <Car className="h-5 w-5" />
      case "green":
        return <Leaf className="h-5 w-5" />
      case "credit_card":
        return <CreditCard className="h-5 w-5" />
      case "personal":
        return <User className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getLoanTypeColor = (type: string) => {
    switch (type) {
      case "mortgage":
        return "bg-blue-100 text-blue-700"
      case "vehicle":
        return "bg-green-100 text-green-700"
      case "green":
        return "bg-emerald-100 text-emerald-700"
      case "credit_card":
        return "bg-red-100 text-red-700"
      case "personal":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const calculateProgress = (loan: Loan) => {
    const totalPaid = loan.principalAmount - loan.currentBalance
    return (totalPaid / loan.principalAmount) * 100
  }

  const getOptimalStrategy = () => {
    if (activeLoans.length === 0) return null
    return LoanCalculator.calculateOptimalPaymentStrategy(activeLoans)
  }

  const optimalStrategy = getOptimalStrategy()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Dashboard</h1>
          <p className="text-muted-foreground">Track and optimize your loans for maximum savings</p>
        </div>
        <Button onClick={onCreateLoan}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold">${totalDebt.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold">${totalMonthlyPayments.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rate</p>
                <p className="text-2xl font-bold">{weightedAverageRate.toFixed(2)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{activeLoans.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Strategies */}
      {optimizationStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Optimization Opportunities
            </CardTitle>
            <CardDescription>Smart strategies to save money and pay off loans faster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationStrategies.slice(0, 3).map((strategy) => (
                <div
                  key={strategy.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{strategy.description}</h4>
                      <Badge variant={strategy.difficulty === "easy" ? "secondary" : "outline"}>
                        {strategy.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Potential savings: ${strategy.potentialSavings.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimal Payment Strategy */}
      {optimalStrategy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Optimal Payment Strategy
            </CardTitle>
            <CardDescription>Recommended order to pay off your loans for maximum savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {optimalStrategy.strategy} Method
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Potential savings: ${optimalStrategy.totalSavings.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                {optimalStrategy.order.map((item, index) => {
                  const loan = loans.find((l) => l.id === item.loanId)
                  if (!loan) return null

                  return (
                    <div key={item.loanId} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {item.priority}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getLoanTypeColor(loan.type)}`}>
                          {getLoanTypeIcon(loan.type)}
                        </div>
                        <div>
                          <p className="font-medium">{loan.name}</p>
                          <p className="text-sm text-muted-foreground">{item.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${loan.currentBalance.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{loan.interestRate}% APR</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loans List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Loans ({activeLoans.length})</TabsTrigger>
          <TabsTrigger value="all">All Loans ({loans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeLoans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Loans</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first loan to start tracking and optimizing your debt
                </p>
                <Button onClick={onCreateLoan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Loan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeLoans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface LoanCardProps {
  loan: Loan
}

function LoanCard({ loan }: LoanCardProps) {
  const progress = ((loan.principalAmount - loan.currentBalance) / loan.principalAmount) * 100
  const remainingMonths = differenceInMonths(loan.maturityDate, new Date())

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case "mortgage":
        return <Home className="h-4 w-4" />
      case "vehicle":
        return <Car className="h-4 w-4" />
      case "green":
        return <Leaf className="h-4 w-4" />
      case "credit_card":
        return <CreditCard className="h-4 w-4" />
      case "personal":
        return <User className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getLoanTypeColor = (type: string) => {
    switch (type) {
      case "mortgage":
        return "bg-blue-100 text-blue-700"
      case "vehicle":
        return "bg-green-100 text-green-700"
      case "green":
        return "bg-emerald-100 text-emerald-700"
      case "credit_card":
        return "bg-red-100 text-red-700"
      case "personal":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getLoanTypeColor(loan.type)}`}>{getLoanTypeIcon(loan.type)}</div>
            <div>
              <h3 className="font-semibold text-lg">{loan.name}</h3>
              <p className="text-sm text-muted-foreground">{loan.lender}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={loan.status === "active" ? "secondary" : "outline"}>{loan.status.replace("_", " ")}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/loans/${loan.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/loans/${loan.id}/calculator`}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Make Payment</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="font-semibold">${loan.currentBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interest Rate</p>
            <p className="font-semibold">{loan.interestRate}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Payment</p>
            <p className="font-semibold">${loan.minimumPayment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining Term</p>
            <p className="font-semibold">{remainingMonths} months</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(1)}% paid off</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">Payoff date: {format(loan.maturityDate, "MMM yyyy")}</div>
          <Link href={`/dashboard/loans/${loan.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
