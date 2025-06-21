export interface PaymentEvent {
  id: string
  userId: string
  loanId?: string
  transactionId?: string
  title: string
  description?: string
  amount: number
  dueDate: Date
  type: PaymentEventType
  status: PaymentStatus
  category: string
  isRecurring: boolean
  recurringPattern?: RecurringPattern
  reminderSettings: ReminderSettings
  googleCalendarEventId?: string
  metadata: PaymentEventMetadata
  createdAt: Date
  updatedAt: Date
}

export type PaymentEventType =
  | "loan_payment"
  | "bill_payment"
  | "subscription"
  | "insurance"
  | "utilities"
  | "rent_mortgage"
  | "credit_card"
  | "other"

export type PaymentStatus = "scheduled" | "paid" | "overdue" | "cancelled" | "pending"

export interface RecurringPattern {
  frequency: RecurringFrequency
  interval: number
  endDate?: Date
  occurrences?: number
  dayOfMonth?: number
  dayOfWeek?: number
  weekOfMonth?: number
  monthsOfYear?: number[]
  customPattern?: string
}

export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "quarterly"
  | "semi_annually"
  | "annually"
  | "custom"

export interface ReminderSettings {
  enabled: boolean
  methods: NotificationMethod[]
  timings: ReminderTiming[]
  customMessage?: string
}

export type NotificationMethod = "email" | "sms" | "push" | "calendar"

export interface ReminderTiming {
  value: number
  unit: "minutes" | "hours" | "days" | "weeks"
  label: string
}

export interface PaymentEventMetadata {
  accountNumber?: string
  referenceNumber?: string
  paymentMethod?: string
  automaticPayment?: boolean
  minimumAmount?: number
  lastPaidAmount?: number
  lastPaidDate?: Date
  averageAmount?: number
  paymentHistory?: PaymentHistoryEntry[]
}

export interface PaymentHistoryEntry {
  date: Date
  amount: number
  status: PaymentStatus
  method?: string
}

export interface PaymentAnomaly {
  id: string
  userId: string
  paymentEventId: string
  type: AnomalyType
  severity: "low" | "medium" | "high" | "critical"
  description: string
  detectedAt: Date
  resolvedAt?: Date
  isResolved: boolean
  suggestedActions: string[]
  metadata: Record<string, any>
}

export type AnomalyType =
  | "missed_payment"
  | "amount_variance"
  | "timing_variance"
  | "duplicate_payment"
  | "unusual_frequency"
  | "payment_method_change"

export interface CashFlowProjection {
  id: string
  userId: string
  projectionDate: Date
  timeframe: "week" | "month" | "quarter" | "year"
  projections: CashFlowEntry[]
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  runningBalance: number
  confidence: number
  assumptions: string[]
  createdAt: Date
}

export interface CashFlowEntry {
  date: Date
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  isProjected: boolean
  confidence: number
  source: "historical" | "scheduled" | "predicted"
}

export interface PaymentScheduleRecommendation {
  id: string
  userId: string
  type: RecommendationType
  priority: number
  title: string
  description: string
  potentialSavings?: number
  implementationEffort: "low" | "medium" | "high"
  suggestedActions: RecommendationAction[]
  affectedPayments: string[]
  validUntil: Date
  createdAt: Date
}

export type RecommendationType =
  | "payment_timing_optimization"
  | "payment_consolidation"
  | "cash_flow_improvement"
  | "early_payment_opportunity"
  | "payment_method_optimization"

export interface RecommendationAction {
  action: string
  description: string
  impact: string
  timeline: string
}

export interface GoogleCalendarConfig {
  enabled: boolean
  calendarId?: string
  syncDirection: "one_way" | "two_way"
  eventPrefix: string
  colorId: string
  reminderMinutes: number[]
}

export interface NotificationPreferences {
  email: {
    enabled: boolean
    address: string
    frequency: "immediate" | "daily_digest" | "weekly_digest"
  }
  sms: {
    enabled: boolean
    phoneNumber: string
    frequency: "immediate" | "daily_digest"
  }
  push: {
    enabled: boolean
    frequency: "immediate" | "daily_digest"
  }
  calendar: {
    enabled: boolean
    reminderMinutes: number[]
  }
}

export interface PaymentCalendarView {
  date: Date
  events: PaymentEvent[]
  totalAmount: number
  overdueCount: number
  upcomingCount: number
}

export interface RecurringPaymentDetection {
  id: string
  userId: string
  detectedPattern: RecurringPattern
  transactions: string[]
  confidence: number
  suggestedPaymentEvent: Partial<PaymentEvent>
  status: "pending_review" | "accepted" | "rejected"
  createdAt: Date
}
