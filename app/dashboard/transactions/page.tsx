"use client"

import { useState, useEffect } from "react"
import { TransactionList } from "@/components/transactions/transaction-list"
import { CategoryManagement } from "@/components/transactions/category-management"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Brain, RefreshCw, Lightbulb } from "lucide-react"
import type { Transaction, TransactionCategory } from "@/lib/types/transactions"
import { DEFAULT_CATEGORIES } from "@/lib/constants/default-categories"
import { TransactionCategorizer } from "@/lib/utils/transaction-categorizer"

// Mock data - replace with real data from your GraphQL API
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    userId: "user1",
    amount: -85.5,
    description: "EFTPOS Purchase - Woolworths",
    originalDescription: "EFTPOS Purchase - Woolworths",
    merchant: "Woolworths",
    standardizedMerchant: "Woolworths",
    categoryId: "groceries",
    type: "expense",
    date: new Date("2024-01-15"),
    tags: ["groceries", "food"],
    isRecurring: false,
    isReviewed: true,
    isHidden: false,
    attachments: [],
    metadata: {},
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    userId: "user1",
    amount: 3500.0,
    description: "Salary Credit",
    originalDescription: "Salary Credit",
    type: "income",
    date: new Date("2024-01-15"),
    tags: ["salary", "income"],
    isRecurring: true,
    isReviewed: true,
    isHidden: false,
    attachments: [],
    metadata: {},
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    userId: "user1",
    amount: -450.0,
    description: "Car Loan Payment",
    originalDescription: "Car Loan Payment",
    merchant: "Auto Finance Co",
    categoryId: "car-payments",
    type: "expense",
    date: new Date("2024-01-14"),
    tags: ["loan", "car"],
    isRecurring: true,
    isReviewed: false,
    isHidden: false,
    attachments: [],
    metadata: {},
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "4",
    userId: "user1",
    amount: -125.0,
    description: "Netflix Subscription",
    originalDescription: "Netflix Subscription",
    merchant: "Netflix",
    suggestedCategoryId: "streaming-services",
    categoryConfidence: 0.95,
    type: "expense",
    date: new Date("2024-01-13"),
    tags: ["entertainment", "subscription"],
    isRecurring: true,
    isReviewed: false,
    isHidden: false,
    attachments: [],
    metadata: {},
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uncategorizedCount, setUncategorizedCount] = useState(0)

  useEffect(() => {
    // Initialize categories with default categories
    const initialCategories: TransactionCategory[] = DEFAULT_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: cat.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    setCategories(initialCategories)

    // Count uncategorized transactions
    const uncategorized = transactions.filter((t) => !t.categoryId).length
    setUncategorizedCount(uncategorized)
  }, [transactions])

  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
  }

  const handleBulkUpdate = (transactionIds: string[], updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (transactionIds.includes(t.id) ? { ...t, ...updates } : t)))

    // Learn from user corrections if category was updated
    if (updates.categoryId) {
      const categorizer = new TransactionCategorizer(categories)
      transactionIds.forEach((id) => {
        const transaction = transactions.find((t) => t.id === id)
        if (transaction) {
          categorizer.learnFromUserCorrection(transaction, updates.categoryId!)
        }
      })
    }
  }

  const handleTransactionDelete = (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId))
  }

  const handleCategoryCreate = (categoryData: Omit<TransactionCategory, "id" | "createdAt" | "updatedAt">) => {
    const newCategory: TransactionCategory = {
      ...categoryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const handleCategoryUpdate = (categoryId: string, updates: Partial<TransactionCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updates, updatedAt: new Date() } : c)))
  }

  const handleCategoryDelete = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId))
    // Remove category from transactions
    setTransactions((prev) => prev.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: undefined } : t)))
  }

  const handleAutoCategorizeSuggestions = () => {
    setIsLoading(true)

    // Simulate AI categorization
    setTimeout(() => {
      const categorizer = new TransactionCategorizer(categories)

      const updatedTransactions = transactions.map((transaction) => {
        if (!transaction.categoryId) {
          const suggestions = categorizer.categorizeTransaction(transaction)
          if (suggestions.length > 0) {
            const bestSuggestion = suggestions[0]
            return {
              ...transaction,
              suggestedCategoryId: bestSuggestion.categoryId,
              categoryConfidence: bestSuggestion.confidence,
            }
          }
        }
        return transaction
      })

      setTransactions(updatedTransactions)
      setIsLoading(false)
    }, 2000)
  }

  const stats = {
    total: transactions.length,
    income: transactions.filter((t) => t.type === "income").length,
    expenses: transactions.filter((t) => t.type === "expense").length,
    uncategorized: uncategorizedCount,
    needsReview: transactions.filter((t) => !t.isReviewed).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction Management</h1>
        <p className="text-muted-foreground">
          Manage your transactions with intelligent categorization and bulk operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Income</p>
                <p className="text-2xl font-bold text-green-600">{stats.income}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold text-red-600">{stats.expenses}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uncategorized</p>
                <p className="text-2xl font-bold text-orange-600">{stats.uncategorized}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold text-purple-600">{stats.needsReview}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Alert */}
      {uncategorizedCount > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have {uncategorizedCount} uncategorized transactions. Use AI to automatically suggest categories.
            </span>
            <Button size="sm" onClick={handleAutoCategorizeSuggestions} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              {isLoading ? "Processing..." : "Auto-Categorize"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            Transactions
            {stats.needsReview > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.needsReview}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories
            <Badge variant="outline" className="ml-2">
              {categories.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionList
            transactions={transactions}
            categories={categories}
            onTransactionUpdate={handleTransactionUpdate}
            onBulkUpdate={handleBulkUpdate}
            onTransactionDelete={handleTransactionDelete}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement
            categories={categories}
            onCategoryCreate={handleCategoryCreate}
            onCategoryUpdate={handleCategoryUpdate}
            onCategoryDelete={handleCategoryDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
