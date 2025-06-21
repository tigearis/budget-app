export interface Loan {
  id: string
  userId: string
  name: string
  type: LoanType
  lender: string
  principalAmount: number
  currentBalance: number
  interestRate: number
  termMonths: number
  remainingMonths: number
  paymentType: PaymentType
  minimumPayment: number
  paymentFrequency: PaymentFrequency
  startDate: Date
  maturityDate: Date
  status: LoanStatus
  isInterestOnly: boolean
  interestOnlyPeriod?: number
  features: LoanFeatures
  metadata: LoanMetadata
  createdAt: Date
  updatedAt: Date
}

export type LoanType = "mortgage" | "personal" | "vehicle" | "green" | "credit_card" | "line_of_credit"

export type PaymentType = "principal_and_interest" | "interest_only" | "minimum_payment"

export type PaymentFrequency = "weekly" | "fortnightly" | "monthly" | "quarterly"

export type LoanStatus = "active" | "paid_off" | "defaulted" | "refinanced" | "closed"

export interface LoanFeatures {
  hasRedraw: boolean
  hasOffset: boolean
  allowsExtraPayments: boolean
  hasPaymentHoliday: boolean
  isFixedRate: boolean
  hasRateReview: boolean
}

export interface LoanMetadata {
  accountNumber?: string
  bsb?: string
  referenceNumber?: string
  brokerDetails?: string
  insuranceRequired?: boolean
  securityProperty?: string
  notes?: string
}

export interface PaymentSchedule {
  id: string
  loanId: string
  paymentNumber: number
  dueDate: Date
  principalAmount: number
  interestAmount: number
  totalPayment: number
  remainingBalance: number
  cumulativeInterest: number
  cumulativePrincipal: number
  isProjected: boolean
  createdAt: Date
}

export interface PaymentHistory {
  id: string
  loanId: string
  paymentDate: Date
  amount: number
  principalPortion: number
  interestPortion: number
  extraPayment: number
  paymentMethod: string
  reference?: string
  balanceAfter: number
  isLate: boolean
  lateFee?: number
  notes?: string
  createdAt: Date
}

export interface LoanScenario {
  id: string
  loanId: string
  userId: string
  name: string
  description: string
  scenarioType: ScenarioType
  parameters: ScenarioParameters
  results: ScenarioResults
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ScenarioType = "extra_payment" | "rate_change" | "refinance" | "early_payoff" | "payment_frequency"

export interface ScenarioParameters {
  extraPaymentAmount?: number
  extraPaymentFrequency?: PaymentFrequency
  newInterestRate?: number
  newTermMonths?: number
  targetPayoffDate?: Date
  oneOffPayment?: number
  paymentHolidayMonths?: number
}

export interface ScenarioResults {
  totalInterestSaved: number
  timeSavedMonths: number
  newPayoffDate: Date
  totalPayments: number
  monthlyPaymentChange: number
  breakEvenPoint?: number
  netBenefit: number
}

export interface LoanComparison {
  id: string
  userId: string
  name: string
  loans: LoanComparisonItem[]
  criteria: ComparisonCriteria
  recommendation: string
  createdAt: Date
}

export interface LoanComparisonItem {
  loanId?: string
  name: string
  lender: string
  interestRate: number
  fees: LoanFees
  features: LoanFeatures
  totalCost: number
  monthlyPayment: number
  rank: number
}

export interface LoanFees {
  applicationFee: number
  ongoingFee: number
  exitFee: number
  redrawFee: number
  extraPaymentFee: number
}

export interface ComparisonCriteria {
  loanAmount: number
  termYears: number
  prioritizeRate: boolean
  prioritizeFeatures: boolean
  prioritizeFees: boolean
}

export interface OptimizationStrategy {
  id: string
  userId: string
  strategyType: StrategyType
  priority: number
  description: string
  potentialSavings: number
  timeToImplement: string
  difficulty: "easy" | "medium" | "hard"
  loans: string[]
  actions: OptimizationAction[]
}

export type StrategyType =
  | "debt_avalanche"
  | "debt_snowball"
  | "refinance"
  | "consolidation"
  | "extra_payments"
  | "offset_account"

export interface OptimizationAction {
  action: string
  description: string
  impact: number
  timeline: string
}

export interface LoanCalculatorInput {
  loanAmount: number
  interestRate: number
  termYears: number
  paymentFrequency: PaymentFrequency
  extraPayment?: number
  startDate?: Date
}

export interface LoanCalculatorResult {
  monthlyPayment: number
  totalInterest: number
  totalPayments: number
  payoffDate: Date
  schedule: PaymentSchedule[]
}
