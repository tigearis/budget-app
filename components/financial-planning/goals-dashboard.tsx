"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Target, TrendingUp, Calendar, DollarSign, Clock, Sparkles, Trophy } from "lucide-react"
import type { FinancialGoal } from "@/lib/types/financial-planning"
import { FinancialCalculator } from "@/lib/utils/financial-calculator"
import { differenceInDays } from "date-fns"

interface GoalsDashboardProps {
  goals: FinancialGoal[]
  onCreateGoal: () => void
  onEditGoal: (goal: FinancialGoal) => void
  onDeleteGoal: (goalId: string) => void
}

interface GoalCardProps {
  goal: FinancialGoal
  onEdit: () => void
  onDelete: () => void
}

function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const projection = FinancialCalculator.calculateGoalProjection(goal)
  const daysToTarget = differenceInDays(goal.targetDate, new Date())

  const getMotivationalMessage = (goal: FinancialGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100

    if (progress >= 100) {
      return { message: "🎉 Goal completed! Amazing work!", type: "success" }
    } else if (progress >= 90) {
      return { message: "🔥 So close! You've got this!", type: "success" }
    } else if (progress >= 75) {
      return { message: "💪 Great progress! Keep it up!", type: "success" }
    } else if (progress >= 50) {
      return { message: "📈 Halfway there! Stay focused!", type: "info" }
    } else if (progress >= 25) {
      return { message: "🚀 Building momentum! Every dollar counts!", type: "info" }
    } else {
      return { message: "💡 Consider increasing your contributions", type: "warning" }
    }
  }

  const motivationalMessage = getMotivationalMessage(goal)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span>${goal.currentAmount.toLocaleString()}</span>
            <span>${goal.targetAmount.toLocaleString()}</span>
          </div>

          <div
            className={`text-sm p-2 rounded ${
              motivationalMessage.type === "success"
                ? "bg-green-50 text-green-700"
                : motivationalMessage.type === "info"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {motivationalMessage.message}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GoalsDashboard({ goals, onCreateGoal, onEditGoal, onDeleteGoal }: GoalsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("active")

  const activeGoals = goals.filter((goal) => goal.status === "active")
  const completedGoals = goals.filter((goal) => goal.status === "completed")
  const pausedGoals = goals.filter((goal) => goal.status === "paused")

  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  const getGoalIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      emergency_fund: <Target className="h-5 w-5" />,
      vacation: <Calendar className="h-5 w-5" />,
      house_deposit: <Target className="h-5 w-5" />,
      car_purchase: <Target className="h-5 w-5" />,
      debt_elimination: <TrendingUp className="h-5 w-5" />,
      investment: <TrendingUp className="h-5 w-5" />,
      retirement: <Target className="h-5 w-5" />,
      education: <Target className="h-5 w-5" />,
      wedding: <Target className="h-5 w-5" />,
      home_improvement: <Target className="h-5 w-5" />,
    }
    return icons[type] || <Target className="h-5 w-5" />
  }

  const getGoalStatusColor = (goal: FinancialGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const daysToTarget = differenceInDays(goal.targetDate, new Date())

    if (progress >= 100) return "text-green-600"
    if (daysToTarget < 30 && progress < 80) return "text-red-600"
    if (progress >= 75) return "text-green-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-gray-600"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getMotivationalMessageOld = (goal: FinancialGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const projection = FinancialCalculator.calculateGoalProjection(goal)

    if (progress >= 100) {
      return { message: "🎉 Goal completed! Amazing work!", type: "success" }
    } else if (progress >= 90) {
      return { message: "🔥 So close! You've got this!", type: "success" }
    } else if (progress >= 75) {
      return { message: "💪 Great progress! Keep it up!", type: "success" }
    } else if (progress >= 50) {
      return { message: "📈 Halfway there! Stay focused!", type: "info" }
    } else if (progress >= 25) {
      return { message: "🚀 Building momentum! Every dollar counts!", type: "info" }
    } else if (projection.isOnTrack) {
      return { message: "✨ You're on track! Consistency is key!", type: "info" }
    } else {
      return { message: "💡 Consider increasing your contributions", type: "warning" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">Track your progress and achieve your dreams</p>
        </div>
        <Button
          onClick={onCreateGoal}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Goals</p>
                <p className="text-2xl font-bold text-blue-900">{activeGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Progress</p>
                <p className="text-2xl font-bold text-green-900">{overallProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Saved</p>
                <p className="text-2xl font-bold text-purple-900">${totalCurrentAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Completed</p>
                <p className="text-2xl font-bold text-yellow-900">{completedGoals.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedGoals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
                <p className="text-muted-foreground mb-4">Start your financial journey by creating your first goal</p>
                <Button onClick={onCreateGoal} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => onEditGoal(goal)}
                  onDelete={() => onDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Completed Goals Yet</h3>
                <p className="text-muted-foreground">Your completed goals will appear here once you achieve them</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => onEditGoal(goal)}
                  onDelete={() => onDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {pausedGoals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Paused Goals</h3>
                <p className="text-muted-foreground">Goals you temporarily pause will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pausedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => onEditGoal(goal)}
                  onDelete={() => onDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
