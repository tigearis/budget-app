"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  Target,
  DollarSign,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Wrench,
  PiggyBank,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import type { FinancialGoal, GoalType } from "@/lib/types/financial-planning"
import { format, addMonths } from "date-fns"
import { cn } from "@/lib/utils"

interface GoalCreationWizardProps {
  onCreateGoal: (goal: Omit<FinancialGoal, "id" | "userId" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  monthlyExpenses?: number
}

const GOAL_TYPES: Array<{
  type: GoalType
  label: string
  description: string
  icon: React.ReactNode
  color: string
  defaultAmount?: number
  suggestedTimeframe?: number
}> = [
  {
    type: "emergency_fund",
    label: "Emergency Fund",
    description: "Build a safety net for unexpected expenses",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-red-100 text-red-700 border-red-200",
    suggestedTimeframe: 12,
  },
  {
    type: "vacation",
    label: "Vacation",
    description: "Save for your dream holiday",
    icon: <Plane className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    defaultAmount: 5000,
    suggestedTimeframe: 8,
  },
  {
    type: "house_deposit",
    label: "House Deposit",
    description: "Save for your first home or investment property",
    icon: <Home className="h-6 w-6" />,
    color: "bg-green-100 text-green-700 border-green-200",
    defaultAmount: 100000,
    suggestedTimeframe: 60,
  },
  {
    type: "car_purchase",
    label: "Car Purchase",
    description: "Save for a new or used vehicle",
    icon: <Car className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    defaultAmount: 25000,
    suggestedTimeframe: 24,
  },
  {
    type: "debt_elimination",
    label: "Debt Elimination",
    description: "Pay off credit cards, loans, or other debts",
    icon: <Target className="h-6 w-6" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    suggestedTimeframe: 36,
  },
  {
    type: "investment",
    label: "Investment Fund",
    description: "Build wealth through investments",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    defaultAmount: 10000,
    suggestedTimeframe: 24,
  },
  {
    type: "retirement",
    label: "Retirement",
    description: "Secure your financial future",
    icon: <PiggyBank className="h-6 w-6" />,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    defaultAmount: 500000,
    suggestedTimeframe: 360,
  },
  {
    type: "education",
    label: "Education",
    description: "Fund education or professional development",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    defaultAmount: 15000,
    suggestedTimeframe: 18,
  },
  {
    type: "wedding",
    label: "Wedding",
    description: "Plan your special day",
    icon: <Heart className="h-6 w-6" />,
    color: "bg-rose-100 text-rose-700 border-rose-200",
    defaultAmount: 30000,
    suggestedTimeframe: 18,
  },
  {
    type: "home_improvement",
    label: "Home Improvement",
    description: "Renovate or upgrade your home",
    icon: <Wrench className="h-6 w-6" />,
    color: "bg-teal-100 text-teal-700 border-teal-200",
    defaultAmount: 20000,
    suggestedTimeframe: 12,
  },
]

export function GoalCreationWizard({ onCreateGoal, onCancel, monthlyExpenses = 0 }: GoalCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState<GoalType | null>(null)
  const [goalData, setGoalData] = useState({
    name: "",
    description: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: addMonths(new Date(), 12),
    priority: "medium" as const,
    autoSaveAmount: 0,
    autoSaveFrequency: "monthly" as const,
    emergencyFundMonths: 6,
  })

  const totalSteps = 4
  const selectedGoalType = GOAL_TYPES.find((type) => type.type === selectedType)

  const handleTypeSelection = (type: GoalType) => {
    setSelectedType(type)
    const goalType = GOAL_TYPES.find((t) => t.type === type)

    setGoalData((prev) => ({
      ...prev,
      name: goalType?.label || "",
      targetAmount: type === "emergency_fund" ? monthlyExpenses * 6 : goalType?.defaultAmount || 0,
      targetDate: addMonths(new Date(), goalType?.suggestedTimeframe || 12),
    }))
  }

  const calculateProjection = () => {
    if (!goalData.autoSaveAmount) return null

    const remainingAmount = goalData.targetAmount - goalData.currentAmount
    const monthsToGoal = Math.ceil(remainingAmount / goalData.autoSaveAmount)
    const projectedDate = addMonths(new Date(), monthsToGoal)

    return {
      monthsToGoal,
      projectedDate,
      isOnTrack: projectedDate <= goalData.targetDate,
    }
  }

  const projection = calculateProjection()

  const handleSubmit = () => {
    if (!selectedType) return

    const goal: Omit<FinancialGoal, "id" | "userId" | "createdAt" | "updatedAt"> = {
      name: goalData.name,
      description: goalData.description,
      type: selectedType,
      targetAmount: goalData.targetAmount,
      currentAmount: goalData.currentAmount,
      targetDate: goalData.targetDate,
      priority: goalData.priority,
      status: "active",
      category: selectedGoalType?.label || "Other",
      autoSaveAmount: goalData.autoSaveAmount || undefined,
      autoSaveFrequency: goalData.autoSaveFrequency,
      milestones: [],
      metadata: {
        emergencyFundMonths: selectedType === "emergency_fund" ? goalData.emergencyFundMonths : undefined,
      },
    }

    onCreateGoal(goal)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">What's your financial goal?</h2>
              <p className="text-muted-foreground">Choose the type of goal you'd like to work towards</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOAL_TYPES.map((type) => (
                <Card
                  key={type.type}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedType === type.type ? "ring-2 ring-primary" : "",
                  )}
                  onClick={() => handleTypeSelection(type.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", type.color)}>{type.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        {type.defaultAmount && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Typical: ${type.defaultAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={cn("p-3 rounded-lg mx-auto w-fit mb-4", selectedGoalType?.color)}>
                {selectedGoalType?.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">Goal Details</h2>
              <p className="text-muted-foreground">Let's customize your {selectedGoalType?.label.toLowerCase()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={goalData.name}
                  onChange={(e) => setGoalData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Dream Vacation to Japan"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={goalData.description}
                  onChange={(e) => setGoalData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Add more details about your goal..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="targetAmount"
                      type="number"
                      value={goalData.targetAmount}
                      onChange={(e) => setGoalData((prev) => ({ ...prev, targetAmount: Number(e.target.value) }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentAmount"
                      type="number"
                      value={goalData.currentAmount}
                      onChange={(e) => setGoalData((prev) => ({ ...prev, currentAmount: Number(e.target.value) }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(goalData.targetDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={goalData.targetDate}
                      onSelect={(date) => date && setGoalData((prev) => ({ ...prev, targetDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={goalData.priority}
                  onValueChange={(value: any) => setGoalData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="critical">Critical Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType === "emergency_fund" && (
                <div>
                  <Label htmlFor="emergencyMonths">Months of Expenses</Label>
                  <Select
                    value={goalData.emergencyFundMonths.toString()}
                    onValueChange={(value) =>
                      setGoalData((prev) => ({
                        ...prev,
                        emergencyFundMonths: Number(value),
                        targetAmount: monthlyExpenses * Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months (Recommended)</SelectItem>
                      <SelectItem value="9">9 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Automatic Savings</h2>
              <p className="text-muted-foreground">Set up automatic contributions to reach your goal faster</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="autoSaveAmount">Monthly Contribution</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="autoSaveAmount"
                      type="number"
                      value={goalData.autoSaveAmount}
                      onChange={(e) => setGoalData((prev) => ({ ...prev, autoSaveAmount: Number(e.target.value) }))}
                      className="pl-10"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={goalData.autoSaveFrequency}
                    onValueChange={(value: any) => setGoalData((prev) => ({ ...prev, autoSaveFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="fortnightly">Fortnightly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {projection && (
                <Card
                  className={cn(
                    "p-4",
                    projection.isOnTrack ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200",
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Projection</span>
                      <Badge variant={projection.isOnTrack ? "secondary" : "destructive"}>
                        {projection.isOnTrack ? "On Track" : "Behind Schedule"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Time to goal:</span>
                        <span className="font-medium">{projection.monthsToGoal} months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Projected completion:</span>
                        <span className="font-medium">{format(projection.projectedDate, "MMM yyyy")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target date:</span>
                        <span className="font-medium">{format(goalData.targetDate, "MMM yyyy")}</span>
                      </div>
                    </div>

                    {!projection.isOnTrack && (
                      <div className="text-sm text-orange-700">
                        💡 Consider increasing your monthly contribution to stay on track
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{((goalData.currentAmount / goalData.targetAmount) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(goalData.currentAmount / goalData.targetAmount) * 100} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${goalData.currentAmount.toLocaleString()}</span>
                  <span>${goalData.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={cn("p-3 rounded-lg mx-auto w-fit mb-4", selectedGoalType?.color)}>
                {selectedGoalType?.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">Review Your Goal</h2>
              <p className="text-muted-foreground">Everything looks good? Let's make it happen!</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{goalData.name}</h3>
                    {goalData.description && <p className="text-sm text-muted-foreground">{goalData.description}</p>}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {goalData.priority} Priority
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="font-semibold">${goalData.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Amount</p>
                    <p className="font-semibold">${goalData.currentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Date</p>
                    <p className="font-semibold">{format(goalData.targetDate, "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Savings</p>
                    <p className="font-semibold">${goalData.autoSaveAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{((goalData.currentAmount / goalData.targetAmount) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(goalData.currentAmount / goalData.targetAmount) * 100} />
                </div>

                {projection && (
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      projection.isOnTrack ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800",
                    )}
                  >
                    <p className="text-sm font-medium">
                      {projection.isOnTrack
                        ? `🎉 You're on track to reach your goal by ${format(projection.projectedDate, "MMM yyyy")}!`
                        : `⚠️ At this rate, you'll reach your goal by ${format(projection.projectedDate, "MMM yyyy")}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Create Financial Goal</h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-8">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (currentStep === 1 ? onCancel() : setCurrentStep((prev) => prev - 1))}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? "Cancel" : "Previous"}
        </Button>

        <Button
          onClick={() => (currentStep === totalSteps ? handleSubmit() : setCurrentStep((prev) => prev + 1))}
          disabled={currentStep === 1 && !selectedType}
        >
          {currentStep === totalSteps ? "Create Goal" : "Next"}
          {currentStep !== totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
