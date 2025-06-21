export interface FinancialGoal {
  id: string
  userId: string
  name: string
  description?: string
  type: GoalType
  targetAmount: number
  currentAmount: number
  targetDate: Date
  priority: "low" | "medium" | "high" | "critical"
  status: "active" | "completed" | "paused" | "cancelled"
  category: string
  autoSaveAmount?: number
  autoSaveFrequency?: "weekly" | "fortnightly" | "monthly"
  linkedAccountId?: string
  milestones: GoalMilestone[]
  metadata: {
    emergencyFundMonths?: number
    debtPayoffStrategy?: "snowball" | "avalanche"
    investmentRiskLevel?: "conservative" | "moderate" | "aggressive"
    retirementAge?: number
    monthlyContribution?: number
    estimatedReturns?: number
  }
  createdAt: Date
  updatedAt: Date
}

export type GoalType =
  | "emergency_fund"
  | "vacation"
  | "house_deposit"
  | "car_purchase"
  | "debt_elimination"
  | "investment"
  | "retirement"
  | "education"
  | "wedding"
  | "home_improvement"
  | "other"

export interface GoalMilestone {
  id: string
  goalId: string
  name: string
  targetAmount: number
  targetDate: Date
  isCompleted: boolean
  completedAt?: Date
  reward?: string
  celebrationMessage?: string
}

export interface Budget {
  id: string
  userId: string
  name: string
  period: "weekly" | "monthly" | "yearly"
  startDate: Date
  endDate: Date
  totalIncome: number
  categories: BudgetCategory[]
  status: "active" | "completed" | "draft"
  actualSpending?: number
  variance?: number
  createdAt: Date
  updatedAt: Date
}

export interface BudgetCategory {
  id: string
  name: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  subcategories?: BudgetSubcategory[]
  isEssential: boolean
  notes?: string
}

export interface BudgetSubcategory {
  id: string
  name: string
  budgetedAmount: number
  actualAmount: number
  variance: number
}

export interface NetWorthSnapshot {
  id: string
  userId: string
  date: Date
  assets: AssetItem[]
  liabilities: LiabilityItem[]
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  monthOverMonthChange?: number
  yearOverYearChange?: number
  createdAt: Date
}

export interface AssetItem {
  id: string
  name: string
  type: "cash" | "investment" | "property" | "vehicle" | "other"
  value: number
  description?: string
}

export interface LiabilityItem {
  id: string
  name: string
  type: "mortgage" | "credit_card" | "personal_loan" | "student_loan" | "other"
  balance: number
  interestRate?: number
  minimumPayment?: number
  description?: string
}

export interface SavingsRecommendation {
  id: string
  userId: string
  type: "emergency_fund" | "debt_payoff" | "savings_rate" | "budget_optimization" | "investment"
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  potentialSavings: number
  timeToImplement: string
  difficulty: "easy" | "medium" | "hard"
  actions: RecommendationAction[]
  category: string
  validUntil?: Date
  isImplemented: boolean
  createdAt: Date
}

export interface RecommendationAction {
  id: string
  description: string
  impact: string
  timeline: string
  isCompleted: boolean
}

export interface FinancialMilestone {
  id: string
  userId: string
  type: "goal_completed" | "savings_milestone" | "debt_free" | "net_worth_milestone" | "budget_success"
  title: string
  description: string
  achievedAt: Date
  value?: number
  celebrationMessage: string
  shareableMessage: string
  badgeIcon: string
  badgeColor: string
}

export interface EmergencyFundCalculation {
  monthlyExpenses: number
  recommendedMonths: number
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  timeToTarget: number
  progressPercentage: number
}

export interface DebtPayoffStrategy {
  strategy: "snowball" | "avalanche"
  totalDebt: number
  totalInterest: number
  payoffTime: number
  monthlyPayment: number
  debtOrder: DebtPayoffOrder[]
  totalSavings: number
  motivationScore: number
}

export interface DebtPayoffOrder {
  debtId: string
  debtName: string
  balance: number
  interestRate: number
  minimumPayment: number
  priority: number
  payoffMonth: number
  totalInterest: number
  reasoning: string
}

export interface SavingsRateAnalysis {
  currentSavingsRate: number
  recommendedSavingsRate: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  improvementOpportunities: string[]
  projectedWealth: number
}

export interface GoalProjection {
  goalId: string
  currentAmount: number
  targetAmount: number
  monthlyContribution: number
  projectedCompletionDate: Date
  monthsToCompletion: number
  totalContributionsNeeded: number
  isOnTrack: boolean
  recommendedAdjustment?: number
}
