"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Plus,
  AlertTriangle,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useUser()

  // Mock data - replace with real data from your GraphQL API
  const stats = {
    totalBudget: 5000,
    totalSpent: 3250,
    totalLoans: 25000,
    monthlyPayments: 850,
    savingsGoal: 10000,
    currentSavings: 6500,
  }

  const recentTransactions = [
    { id: 1, description: "Grocery Store", amount: -125.5, category: "Food", date: "2024-01-15" },
    { id: 2, description: "Salary Deposit", amount: 3500.0, category: "Income", date: "2024-01-15" },
    { id: 3, description: "Car Loan Payment", amount: -450.0, category: "Loan", date: "2024-01-14" },
    { id: 4, description: "Electric Bill", amount: -89.25, category: "Utilities", date: "2024-01-13" },
  ]

  const upcomingPayments = [
    { id: 1, name: "Car Loan", amount: 450.0, dueDate: "2024-02-01" },
    { id: 2, name: "Student Loan", amount: 275.0, dueDate: "2024-02-03" },
    { id: 3, name: "Credit Card", amount: 125.0, dueDate: "2024-02-05" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Here's an overview of your financial status</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">${stats.totalSpent.toLocaleString()} spent this month</p>
            <Progress value={(stats.totalSpent / stats.totalBudget) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">${stats.monthlyPayments} monthly payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.currentSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of ${stats.savingsGoal.toLocaleString()} goal</p>
            <Progress value={(stats.currentSavings / stats.savingsGoal) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.currentSavings - stats.totalLoans).toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.amount > 0
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Upcoming Payments
            </CardTitle>
            <CardDescription>Don't miss these due dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.name}</p>
                    <p className="text-sm text-muted-foreground">Due {payment.dueDate}</p>
                  </div>
                  <Badge variant="outline">${payment.amount.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
