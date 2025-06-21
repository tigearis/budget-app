"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, AlertTriangle, CheckCircle, X, Edit, Save, Filter } from "lucide-react"
import type { RawTransaction } from "@/lib/types/bank-processing"

interface TransactionPreviewProps {
  transactions: RawTransaction[]
  onTransactionsUpdate: (transactions: RawTransaction[]) => void
  onSaveTransactions: (transactions: RawTransaction[]) => void
  isLoading?: boolean
}

export function TransactionPreview({
  transactions,
  onTransactionsUpdate,
  onSaveTransactions,
  isLoading = false,
}: TransactionPreviewProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [showDuplicates, setShowDuplicates] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions.filter((txn) => {
    if (!showDuplicates && txn.isDuplicate) return false
    if (filterCategory !== "all" && txn.parsedData.category !== filterCategory) return false
    if (searchTerm && !txn.parsedData.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const duplicateCount = transactions.filter((txn) => txn.isDuplicate).length
  const validCount = transactions.filter((txn) => !txn.isDuplicate).length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(filteredTransactions.map((txn) => txn.id))
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

  const handleEditTransaction = (transactionId: string) => {
    setEditingTransaction(transactionId)
  }

  const handleSaveEdit = (transactionId: string, updatedData: Partial<RawTransaction["parsedData"]>) => {
    const updatedTransactions = transactions.map((txn) =>
      txn.id === transactionId ? { ...txn, parsedData: { ...txn.parsedData, ...updatedData } } : txn,
    )
    onTransactionsUpdate(updatedTransactions)
    setEditingTransaction(null)
  }

  const handleRemoveTransaction = (transactionId: string) => {
    const updatedTransactions = transactions.filter((txn) => txn.id !== transactionId)
    onTransactionsUpdate(updatedTransactions)
    setSelectedTransactions((prev) => prev.filter((id) => id !== transactionId))
  }

  const handleSaveSelected = () => {
    const selectedTxns = transactions.filter((txn) => selectedTransactions.includes(txn.id) && !txn.isDuplicate)
    onSaveTransactions(selectedTxns)
  }

  const categories = Array.from(new Set(transactions.map((txn) => txn.parsedData.category).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valid Transactions</p>
                <p className="text-2xl font-bold text-green-600">{validCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duplicates Found</p>
                <p className="text-2xl font-bold text-orange-600">{duplicateCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Alert */}
      {duplicateCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            We found {duplicateCount} potential duplicate transactions. Review them carefully before importing.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction Preview</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDuplicates(!showDuplicates)}>
                {showDuplicates ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showDuplicates ? "Hide" : "Show"} Duplicates
              </Button>
              <Button onClick={handleSaveSelected} disabled={selectedTransactions.length === 0 || isLoading}>
                Save Selected ({selectedTransactions.length})
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Review and edit transactions before importing them into your account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Transactions</Label>
              <Input
                id="search"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category || "uncategorized"}>
                      {category || "Uncategorized"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTransactions.length === filteredTransactions.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={transaction.isDuplicate ? "bg-orange-50 dark:bg-orange-950" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                        disabled={transaction.isDuplicate}
                      />
                    </TableCell>
                    <TableCell>
                      {editingTransaction === transaction.id ? (
                        <Input
                          type="date"
                          defaultValue={transaction.parsedData.date.toISOString().split("T")[0]}
                          className="w-32"
                        />
                      ) : (
                        transaction.parsedData.date.toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTransaction === transaction.id ? (
                        <Input defaultValue={transaction.parsedData.description} className="min-w-48" />
                      ) : (
                        <div className="max-w-xs truncate" title={transaction.parsedData.description}>
                          {transaction.parsedData.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTransaction === transaction.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          defaultValue={transaction.parsedData.amount}
                          className="w-24"
                        />
                      ) : (
                        <span className={transaction.parsedData.amount >= 0 ? "text-green-600" : "text-red-600"}>
                          ${Math.abs(transaction.parsedData.amount).toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTransaction === transaction.id ? (
                        <Select defaultValue={transaction.parsedData.category || "uncategorized"}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uncategorized">Uncategorized</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{transaction.parsedData.category || "Uncategorized"}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.isDuplicate ? (
                        <Badge variant="destructive">Duplicate</Badge>
                      ) : (
                        <Badge variant="secondary">Valid</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {editingTransaction === transaction.id ? (
                          <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(transaction.id, {})}>
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(transaction.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveTransaction(transaction.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions match your current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
