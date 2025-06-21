"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  MoreHorizontal,
  Edit,
  Tag,
  Trash2,
  Eye,
  CalendarIcon,
  ArrowUpDown,
  Download,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import type { Transaction, TransactionFilter, TransactionCategory } from "@/lib/types/transactions"
import { TransactionDetailsModal } from "./transaction-details-modal"
import { BulkEditModal } from "./bulk-edit-modal"
import { CategoryAssignmentModal } from "./category-assignment-modal"
import { format } from "date-fns"

interface TransactionListProps {
  transactions: Transaction[]
  categories: TransactionCategory[]
  onTransactionUpdate: (transaction: Transaction) => void
  onBulkUpdate: (transactionIds: string[], updates: Partial<Transaction>) => void
  onTransactionDelete: (transactionId: string) => void
  isLoading?: boolean
}

export function TransactionList({
  transactions,
  categories,
  onTransactionUpdate,
  onBulkUpdate,
  onTransactionDelete,
  isLoading = false,
}: TransactionListProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [filter, setFilter] = useState<TransactionFilter>({})
  const [sortBy, setSortBy] = useState<"date" | "amount" | "merchant">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [showCategoryAssignment, setShowCategoryAssignment] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      // Date range filter
      if (filter.dateRange) {
        const transactionDate = new Date(transaction.date)
        if (transactionDate < filter.dateRange.start || transactionDate > filter.dateRange.end) {
          return false
        }
      }

      // Category filter
      if (filter.categories && filter.categories.length > 0) {
        if (!transaction.categoryId || !filter.categories.includes(transaction.categoryId)) {
          return false
        }
      }

      // Amount range filter
      if (filter.amountRange) {
        const amount = Math.abs(transaction.amount)
        if (amount < filter.amountRange.min || amount > filter.amountRange.max) {
          return false
        }
      }

      // Type filter
      if (filter.type && transaction.type !== filter.type) {
        return false
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const searchableText =
          `${transaction.description} ${transaction.merchant || ""} ${transaction.reference || ""}`.toLowerCase()
        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some((tag) => transaction.tags.includes(tag))) {
          return false
        }
      }

      // Review status filter
      if (filter.isReviewed !== undefined && transaction.isReviewed !== filter.isReviewed) {
        return false
      }

      return true
    })

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "amount":
          comparison = Math.abs(a.amount) - Math.abs(b.amount)
          break
        case "merchant":
          comparison = (a.merchant || a.description).localeCompare(b.merchant || b.description)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [transactions, filter, sortBy, sortOrder])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(filteredAndSortedTransactions.map((t) => t.id))
    } else {
      setSelectedTransactions([])
    }
  }

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, transactionId])
    } else {
      setSelectedTransactions((prev) => prev.filter((id) => id !== transactionId))
    }
  }

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return null
    return categories.find((c) => c.id === categoryId)
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "income") {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (transaction.type === "expense") {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else {
      return <DollarSign className="h-4 w-4 text-blue-500" />
    }
  }

  const getAmountColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case "income":
        return "text-green-600"
      case "expense":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  const handleBulkCategorize = () => {
    setShowCategoryAssignment(true)
  }

  const handleBulkEdit = () => {
    setShowBulkEdit(true)
  }

  const handleExport = () => {
    // Export filtered transactions to CSV
    const csvContent = [
      ["Date", "Description", "Merchant", "Amount", "Category", "Type"],
      ...filteredAndSortedTransactions.map((t) => [
        format(new Date(t.date), "yyyy-MM-dd"),
        t.description,
        t.merchant || "",
        t.amount.toString(),
        getCategoryInfo(t.categoryId)?.name || "Uncategorized",
        t.type,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTransactions.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleBulkCategorize}>
                <Tag className="h-4 w-4 mr-2" />
                Categorize ({selectedTransactions.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit ({selectedTransactions.length})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={filter.searchTerm || ""}
                  onChange={(e) => setFilter((prev) => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filter.categories?.[0] || "all"}
                onValueChange={(value) =>
                  setFilter((prev) => ({
                    ...prev,
                    categories: value === "all" ? undefined : [value],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filter.type || "all"}
                onValueChange={(value) =>
                  setFilter((prev) => ({
                    ...prev,
                    type: value === "all" ? undefined : (value as any),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.dateRange
                      ? `${format(filter.dateRange.start, "MMM dd")} - ${format(filter.dateRange.end, "MMM dd")}`
                      : "Select dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={
                      filter.dateRange
                        ? {
                            from: filter.dateRange.start,
                            to: filter.dateRange.end,
                          }
                        : undefined
                    }
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setFilter((prev) => ({
                          ...prev,
                          dateRange: { start: range.from!, end: range.to! },
                        }))
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear Filters */}
          {(filter.searchTerm || filter.categories || filter.type || filter.dateRange) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setFilter({})}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTransactions.length === filteredAndSortedTransactions.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy("date")
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }}
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy("amount")
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }}
                    >
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTransactions.map((transaction) => {
                  const category = getCategoryInfo(transaction.categoryId)

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction)}
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{transaction.description}</p>
                          {transaction.reference && (
                            <p className="text-sm text-muted-foreground truncate">Ref: {transaction.reference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {transaction.standardizedMerchant || transaction.merchant || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getAmountColor(transaction)}`}>
                          {transaction.type === "expense" ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="secondary" className="gap-1">
                            <span>{category.icon}</span>
                            {category.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Uncategorized</Badge>
                        )}
                        {transaction.suggestedCategoryId && !transaction.categoryId && (
                          <Badge variant="secondary" className="ml-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Suggested
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {transaction.isReviewed ? (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reviewed
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {transaction.isRecurring && <Badge variant="secondary">Recurring</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="h-4 w-4 mr-2" />
                              Categorize
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => onTransactionDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedTransactions.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          categories={categories}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={onTransactionUpdate}
        />
      )}

      {showBulkEdit && (
        <BulkEditModal
          transactionIds={selectedTransactions}
          transactions={transactions}
          categories={categories}
          onClose={() => setShowBulkEdit(false)}
          onUpdate={onBulkUpdate}
        />
      )}

      {showCategoryAssignment && (
        <CategoryAssignmentModal
          transactionIds={selectedTransactions}
          transactions={transactions}
          categories={categories}
          onClose={() => setShowCategoryAssignment(false)}
          onUpdate={onBulkUpdate}
        />
      )}
    </div>
  )
}
