"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Tag, TrendingUp, Brain, CheckCircle, Lightbulb, Sparkles } from "lucide-react"
import type { Transaction, TransactionCategory, CategorySuggestion } from "@/lib/types/transactions"
import { TransactionCategorizer } from "@/lib/utils/transaction-categorizer"

interface CategoryAssignmentModalProps {
  transactionIds: string[]
  transactions: Transaction[]
  categories: TransactionCategory[]
  onClose: () => void
  onUpdate: (transactionIds: string[], updates: Partial<Transaction>) => void
}

export function CategoryAssignmentModal({
  transactionIds,
  transactions,
  categories,
  onClose,
  onUpdate,
}: CategoryAssignmentModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
  const [useAI, setUseAI] = useState(true)

  const selectedTransactions = transactions.filter((t) => transactionIds.includes(t.id))

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Generate AI suggestions for the first transaction as a sample
  const generateSuggestions = () => {
    if (selectedTransactions.length === 0) return

    const categorizer = new TransactionCategorizer(categories)
    const sampleTransaction = selectedTransactions[0]
    const aiSuggestions = categorizer.categorizeTransaction(sampleTransaction)
    setSuggestions(aiSuggestions)
  }

  const handleApply = () => {
    if (!selectedCategoryId) return

    onUpdate(transactionIds, {
      categoryId: selectedCategoryId,
      isReviewed: true,
      updatedAt: new Date(),
    })
    onClose()
  }

  const handleApplySuggestion = (suggestion: CategorySuggestion) => {
    setSelectedCategoryId(suggestion.categoryId)
  }

  const getCategoryById = (id: string) => categories.find((c) => c.id === id)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorize Transactions
          </DialogTitle>
          <DialogDescription>Assign categories to {transactionIds.length} selected transaction(s)</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Transactions Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Transactions</CardTitle>
              <CardDescription>Preview of transactions to be categorized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.merchant} • ${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {selectedTransactions.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ... and {selectedTransactions.length - 5} more transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
              <CardDescription>Smart categorization suggestions based on transaction patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-6">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Get AI-powered category suggestions for your transactions
                  </p>
                  <Button onClick={generateSuggestions} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => {
                    const category = getCategoryById(suggestion.categoryId)
                    if (!category) return null

                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCategoryId === suggestion.categoryId
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{category.icon}</span>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{Math.round(suggestion.confidence * 100)}% confidence</Badge>
                            {selectedCategoryId === suggestion.categoryId && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Manual Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Category Selection</CardTitle>
              <CardDescription>Browse and select from all available categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Grid */}
              <RadioGroup value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <Label
                      key={category.id}
                      htmlFor={category.id}
                      className={`
                        flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors
                        ${
                          selectedCategoryId === category.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <RadioGroupItem value={category.id} id={category.id} />
                      <span className="text-lg">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{category.type}</p>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>

              {filteredCategories.length === 0 && (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No categories found matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Notice */}
          {selectedCategoryId && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                This categorization will be remembered to improve future automatic suggestions for similar transactions.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selectedCategoryId}>
            Apply to {transactionIds.length} Transaction(s)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
