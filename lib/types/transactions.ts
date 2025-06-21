export interface TransactionCategory {
  id: string
  name: string
  parentId?: string
  color: string
  icon: string
  type: "income" | "expense" | "transfer"
  keywords: string[]
  rules: CategoryRule[]
  isSystem: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CategoryRule {
  id: string
  field: "description" | "merchant" | "amount" | "reference"
  operator: "contains" | "equals" | "starts_with" | "ends_with" | "regex" | "amount_range"
  value: string | number
  weight: number
  isActive: boolean
}

export interface Transaction {
  id: string
  userId: string
  accountId?: string
  budgetId?: string
  amount: number
  description: string
  originalDescription: string
  merchant?: string
  standardizedMerchant?: string
  categoryId?: string
  suggestedCategoryId?: string
  categoryConfidence?: number
  type: "income" | "expense" | "transfer"
  date: Date
  reference?: string
  balance?: number
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  tags: string[]
  notes?: string
  isRecurring: boolean
  recurringGroupId?: string
  isReviewed: boolean
  isHidden: boolean
  attachments: string[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface CategorySuggestion {
  categoryId: string
  confidence: number
  reason: string
  matchedRules: CategoryRule[]
  similarTransactions: Transaction[]
}

export interface TransactionLearning {
  id: string
  userId: string
  transactionPattern: {
    merchant?: string
    description: string
    amountRange?: { min: number; max: number }
  }
  categoryId: string
  confidence: number
  occurrences: number
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export interface MerchantMapping {
  id: string
  originalName: string
  standardizedName: string
  categoryId?: string
  confidence: number
  occurrences: number
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TransactionFilter {
  dateRange?: { start: Date; end: Date }
  categories?: string[]
  merchants?: string[]
  amountRange?: { min: number; max: number }
  type?: "income" | "expense" | "transfer"
  searchTerm?: string
  tags?: string[]
  isReviewed?: boolean
  isRecurring?: boolean
}

export interface BulkOperation {
  type: "categorize" | "tag" | "delete" | "hide" | "merge"
  transactionIds: string[]
  data: Record<string, any>
}
