export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  userId: string
  name: string
  totalAmount: number
  spentAmount: number
  remainingAmount: number
  category: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Loan {
  id: string
  userId: string
  lenderName: string
  principalAmount: number
  currentBalance: number
  interestRate: number
  monthlyPayment: number
  startDate: Date
  endDate: Date
  status: "active" | "paid_off" | "defaulted"
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  budgetId?: string
  loanId?: string
  amount: number
  description: string
  category: string
  type: "income" | "expense" | "loan_payment"
  date: Date
  createdAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  currency: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    budgetAlerts: boolean
    loanReminders: boolean
  }
  theme: "light" | "dark" | "system"
  createdAt: Date
  updatedAt: Date
}
