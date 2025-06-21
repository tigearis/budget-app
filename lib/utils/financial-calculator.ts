import type {
  FinancialGoal,
  Budget,
  NetWorthSnapshot,
  EmergencyFundCalculation,
  DebtPayoffStrategy,
  DebtPayoffOrder,
  SavingsRateAnalysis,
  GoalProjection,
  SavingsRecommendation,
} from "@/lib/types/financial-planning"
import type { Transaction } from "@/lib/types/transactions"
import type { Loan } from "@/lib/types/loans"
import { addMonths, differenceInMonths } from "date-fns"

export class FinancialCalculator {
  static calculateEmergencyFund(
    monthlyExpenses: number,
    currentAmount = 0,
    monthlyContribution = 0,
    targetMonths = 6,
  ): EmergencyFundCalculation {
    const targetAmount = monthlyExpenses * targetMonths
    const remainingAmount = Math.max(0, targetAmount - currentAmount)
    const progressPercentage = (currentAmount / targetAmount) * 100

    let timeToTarget = 0
    if (monthlyContribution > 0 && remainingAmount > 0) {
      timeToTarget = Math.ceil(remainingAmount / monthlyContribution)
    }

    return {
      monthlyExpenses,
      recommendedMonths: targetMonths,
      targetAmount,
      currentAmount,
      monthlyContribution,
      timeToTarget,
      progressPercentage: Math.min(100, progressPercentage),
    }
  }

  static calculateDebtPayoffStrategy(
    debts: Loan[],
    extraPayment = 0,
    strategy: "snowball" | "avalanche" = "avalanche",
  ): DebtPayoffStrategy {
    const activeDebts = debts.filter((debt) => debt.status === "active")

    if (activeDebts.length === 0) {
      return {
        strategy,
        totalDebt: 0,
        totalInterest: 0,
        payoffTime: 0,
        monthlyPayment: 0,
        debtOrder: [],
        totalSavings: 0,
        motivationScore: 0,
      }
    }

    const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.currentBalance, 0)
    const totalMinimumPayment = activeDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const totalPayment = totalMinimumPayment + extraPayment

    // Sort debts based on strategy
    const sortedDebts = [...activeDebts].sort((a, b) => {
      if (strategy === "snowball") {
        return a.currentBalance - b.currentBalance // Smallest balance first
      } else {
        return b.interestRate - a.interestRate // Highest interest rate first
      }
    })

    const debtOrder: DebtPayoffOrder[] = []
    let remainingExtraPayment = extraPayment
    let currentMonth = 0

    // Calculate payoff order and timeline
    sortedDebts.forEach((debt, index) => {
      const additionalPayment = index === 0 ? remainingExtraPayment : 0
      const monthlyPayment = debt.minimumPayment + additionalPayment
      const payoffMonths = Math.ceil(debt.currentBalance / monthlyPayment)
      const totalInterest = monthlyPayment * payoffMonths - debt.currentBalance

      debtOrder.push({
        debtId: debt.id,
        debtName: debt.name,
        balance: debt.currentBalance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment,
        priority: index + 1,
        payoffMonth: currentMonth + payoffMonths,
        totalInterest: Math.max(0, totalInterest),
        reasoning:
          strategy === "snowball"
            ? `Smallest balance ($${debt.currentBalance.toLocaleString()})`
            : `Highest interest rate (${debt.interestRate}%)`,
      })

      currentMonth += payoffMonths
      remainingExtraPayment += debt.minimumPayment // Snowball effect
    })

    const totalInterest = debtOrder.reduce((sum, debt) => sum + debt.totalInterest, 0)
    const payoffTime = Math.max(...debtOrder.map((debt) => debt.payoffMonth))

    // Calculate motivation score (higher for snowball due to quick wins)
    const motivationScore = strategy === "snowball" ? 85 : 75

    // Calculate savings compared to minimum payments only
    const minimumOnlyInterest = this.calculateMinimumOnlyInterest(activeDebts)
    const totalSavings = Math.max(0, minimumOnlyInterest - totalInterest)

    return {
      strategy,
      totalDebt,
      totalInterest,
      payoffTime,
      monthlyPayment: totalPayment,
      debtOrder,
      totalSavings,
      motivationScore,
    }
  }

  private static calculateMinimumOnlyInterest(debts: Loan[]): number {
    // Simplified calculation - in reality would need more complex amortization
    return debts.reduce((sum, debt) => {
      const monthsToPayoff = debt.currentBalance / debt.minimumPayment
      const totalInterest = debt.minimumPayment * monthsToPayoff - debt.currentBalance
      return sum + Math.max(0, totalInterest)
    }, 0)
  }

  static calculateSavingsRate(
    monthlyIncome: number,
    monthlyExpenses: number,
    transactions: Transaction[],
  ): SavingsRateAnalysis {
    const monthlySavings = monthlyIncome - monthlyExpenses
    const currentSavingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0

    // Recommended savings rate based on age and income
    let recommendedSavingsRate = 20 // Default 20%
    if (monthlyIncome < 3000) recommendedSavingsRate = 10
    else if (monthlyIncome < 5000) recommendedSavingsRate = 15
    else if (monthlyIncome > 10000) recommendedSavingsRate = 25

    const improvementOpportunities: string[] = []

    // Analyze spending patterns for opportunities
    const categorySpending = this.analyzeCategorySpending(transactions)

    if (categorySpending.dining > monthlyIncome * 0.15) {
      improvementOpportunities.push("Reduce dining out expenses")
    }
    if (categorySpending.entertainment > monthlyIncome * 0.1) {
      improvementOpportunities.push("Optimize entertainment spending")
    }
    if (categorySpending.subscriptions > monthlyIncome * 0.05) {
      improvementOpportunities.push("Review and cancel unused subscriptions")
    }

    // Project wealth growth over 10 years
    const projectedWealth = this.calculateWealthProjection(
      monthlySavings,
      120, // 10 years
      0.07, // 7% annual return
    )

    return {
      currentSavingsRate,
      recommendedSavingsRate,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      improvementOpportunities,
      projectedWealth,
    }
  }

  private static analyzeCategorySpending(transactions: Transaction[]): Record<string, number> {
    const categoryTotals: Record<string, number> = {}

    transactions
      .filter((t) => t.amount < 0) // Only expenses
      .forEach((transaction) => {
        const category = transaction.category.toLowerCase()
        const amount = Math.abs(transaction.amount)

        if (category.includes("dining") || category.includes("restaurant")) {
          categoryTotals.dining = (categoryTotals.dining || 0) + amount
        } else if (category.includes("entertainment") || category.includes("movie")) {
          categoryTotals.entertainment = (categoryTotals.entertainment || 0) + amount
        } else if (category.includes("subscription") || category.includes("streaming")) {
          categoryTotals.subscriptions = (categoryTotals.subscriptions || 0) + amount
        }
      })

    return categoryTotals
  }

  private static calculateWealthProjection(monthlySavings: number, months: number, annualReturn: number): number {
    const monthlyReturn = annualReturn / 12
    let wealth = 0

    for (let i = 0; i < months; i++) {
      wealth = (wealth + monthlySavings) * (1 + monthlyReturn)
    }

    return wealth
  }

  static calculateGoalProjection(goal: FinancialGoal): GoalProjection {
    const remainingAmount = goal.targetAmount - goal.currentAmount
    const monthlyContribution = goal.autoSaveAmount || 0

    let monthsToCompletion = 0
    let projectedCompletionDate = new Date()

    if (monthlyContribution > 0 && remainingAmount > 0) {
      monthsToCompletion = Math.ceil(remainingAmount / monthlyContribution)
      projectedCompletionDate = addMonths(new Date(), monthsToCompletion)
    }

    const targetMonths = differenceInMonths(goal.targetDate, new Date())
    const isOnTrack = monthsToCompletion <= targetMonths

    let recommendedAdjustment: number | undefined
    if (!isOnTrack && targetMonths > 0) {
      recommendedAdjustment = Math.ceil(remainingAmount / targetMonths)
    }

    return {
      goalId: goal.id,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      monthlyContribution,
      projectedCompletionDate,
      monthsToCompletion,
      totalContributionsNeeded: remainingAmount,
      isOnTrack,
      recommendedAdjustment,
    }
  }

  static calculateBudgetVariance(budget: Budget, transactions: Transaction[]): Budget {
    const updatedCategories = budget.categories.map((category) => {
      // Calculate actual spending for this category
      const categoryTransactions = transactions.filter(
        (t) => t.category.toLowerCase() === category.name.toLowerCase() && t.amount < 0, // Only expenses
      )

      const actualAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const variance = category.budgetedAmount - actualAmount
      const variancePercentage = category.budgetedAmount > 0 ? (variance / category.budgetedAmount) * 100 : 0

      return {
        ...category,
        actualAmount,
        variance,
        variancePercentage,
      }
    })

    const totalActual = updatedCategories.reduce((sum, cat) => sum + cat.actualAmount, 0)
    const totalBudgeted = updatedCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0)
    const totalVariance = totalBudgeted - totalActual

    return {
      ...budget,
      categories: updatedCategories,
      actualSpending: totalActual,
      variance: totalVariance,
    }
  }

  static generateSavingsRecommendations(
    goals: FinancialGoal[],
    budget: Budget,
    transactions: Transaction[],
    netWorth: NetWorthSnapshot,
  ): SavingsRecommendation[] {
    const recommendations: SavingsRecommendation[] = []

    // Emergency fund recommendation
    const monthlyExpenses = budget.categories
      .filter((cat) => cat.isEssential)
      .reduce((sum, cat) => sum + cat.actualAmount, 0)

    const emergencyFundGoal = goals.find((g) => g.type === "emergency_fund")
    const emergencyFundCalc = this.calculateEmergencyFund(monthlyExpenses, emergencyFundGoal?.currentAmount || 0)

    if (emergencyFundCalc.progressPercentage < 100) {
      recommendations.push({
        id: crypto.randomUUID(),
        userId: budget.userId,
        type: "emergency_fund",
        title: "Build Your Emergency Fund",
        description: `You need $${(emergencyFundCalc.targetAmount - emergencyFundCalc.currentAmount).toLocaleString()} more to reach your 6-month emergency fund goal.`,
        priority: "high",
        potentialSavings: 0,
        timeToImplement: "Ongoing",
        difficulty: "medium",
        actions: [
          {
            id: crypto.randomUUID(),
            description: "Set up automatic transfer to emergency fund",
            impact: "Consistent progress toward financial security",
            timeline: "1 week",
            isCompleted: false,
          },
          {
            id: crypto.randomUUID(),
            description: `Save $${Math.ceil((emergencyFundCalc.targetAmount - emergencyFundCalc.currentAmount) / 12)} per month`,
            impact: "Complete emergency fund in 12 months",
            timeline: "12 months",
            isCompleted: false,
          },
        ],
        category: "Security",
        isImplemented: false,
        createdAt: new Date(),
      })
    }

    // Budget optimization recommendations
    const overspentCategories = budget.categories.filter((cat) => cat.variance < -50)
    if (overspentCategories.length > 0) {
      const totalOverspend = overspentCategories.reduce((sum, cat) => sum + Math.abs(cat.variance), 0)

      recommendations.push({
        id: crypto.randomUUID(),
        userId: budget.userId,
        type: "budget_optimization",
        title: "Optimize Budget Categories",
        description: `You overspent by $${totalOverspend.toLocaleString()} in ${overspentCategories.length} categories this month.`,
        priority: "medium",
        potentialSavings: totalOverspend * 0.5, // Assume 50% can be saved
        timeToImplement: "2 weeks",
        difficulty: "easy",
        actions: overspentCategories.map((cat) => ({
          id: crypto.randomUUID(),
          description: `Reduce ${cat.name} spending by $${Math.abs(cat.variance).toLocaleString()}`,
          impact: `Save $${Math.abs(cat.variance).toLocaleString()} monthly`,
          timeline: "Next month",
          isCompleted: false,
        })),
        category: "Budgeting",
        isImplemented: false,
        createdAt: new Date(),
      })
    }

    // Savings rate improvement
    const savingsAnalysis = this.calculateSavingsRate(budget.totalIncome, budget.actualSpending || 0, transactions)
    if (savingsAnalysis.currentSavingsRate < savingsAnalysis.recommendedSavingsRate) {
      const improvementNeeded = savingsAnalysis.recommendedSavingsRate - savingsAnalysis.currentSavingsRate
      const additionalSavings = (budget.totalIncome * improvementNeeded) / 100

      recommendations.push({
        id: crypto.randomUUID(),
        userId: budget.userId,
        type: "savings_rate",
        title: "Increase Your Savings Rate",
        description: `Your current savings rate is ${savingsAnalysis.currentSavingsRate.toFixed(1)}%. Aim for ${savingsAnalysis.recommendedSavingsRate}% to build wealth faster.`,
        priority: "medium",
        potentialSavings: additionalSavings * 12, // Annual savings
        timeToImplement: "1 month",
        difficulty: "medium",
        actions: [
          {
            id: crypto.randomUUID(),
            description: `Increase monthly savings by $${additionalSavings.toLocaleString()}`,
            impact: `Reach recommended ${savingsAnalysis.recommendedSavingsRate}% savings rate`,
            timeline: "Next month",
            isCompleted: false,
          },
          ...savingsAnalysis.improvementOpportunities.map((opp) => ({
            id: crypto.randomUUID(),
            description: opp,
            impact: "Reduce expenses and increase savings",
            timeline: "2-4 weeks",
            isCompleted: false,
          })),
        ],
        category: "Savings",
        isImplemented: false,
        createdAt: new Date(),
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  static calculateNetWorthGrowth(snapshots: NetWorthSnapshot[]): {
    monthlyGrowthRate: number
    yearlyGrowthRate: number
    projectedNetWorth: number
    growthTrend: "positive" | "negative" | "stable"
  } {
    if (snapshots.length < 2) {
      return {
        monthlyGrowthRate: 0,
        yearlyGrowthRate: 0,
        projectedNetWorth: snapshots[0]?.netWorth || 0,
        growthTrend: "stable",
      }
    }

    const sortedSnapshots = snapshots.sort((a, b) => a.date.getTime() - b.date.getTime())
    const latest = sortedSnapshots[sortedSnapshots.length - 1]
    const previous = sortedSnapshots[sortedSnapshots.length - 2]

    const monthlyChange = latest.netWorth - previous.netWorth
    const monthlyGrowthRate = previous.netWorth !== 0 ? (monthlyChange / Math.abs(previous.netWorth)) * 100 : 0
    const yearlyGrowthRate = monthlyGrowthRate * 12

    // Project net worth 12 months ahead
    const projectedNetWorth = latest.netWorth * Math.pow(1 + monthlyGrowthRate / 100, 12)

    let growthTrend: "positive" | "negative" | "stable" = "stable"
    if (monthlyGrowthRate > 1) growthTrend = "positive"
    else if (monthlyGrowthRate < -1) growthTrend = "negative"

    return {
      monthlyGrowthRate,
      yearlyGrowthRate,
      projectedNetWorth,
      growthTrend,
    }
  }
}
