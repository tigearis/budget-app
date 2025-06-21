"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Tag, DollarSign, Building, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import type { Transaction, TransactionCategory } from "@/lib/types/transactions"

interface BulkEditModalProps {
  transactionIds: string[]
  transactions: Transaction[]
  categories: TransactionCategory[]
  onClose: () => void
  onUpdate: (transactionIds: string[], updates: Partial<Transaction>) => void
}

interface BulkEditFields {
  categoryId?: string
  merchant?: string
  notes?: string
  tags?: string[]
  isReviewed?: boolean
  type?: "income" | "expense" | "transfer"
}

export function BulkEditModal({ transactionIds, transactions, categories, onClose, onUpdate }: BulkEditModalProps) {
  const [editFields, setEditFields] = useState<BulkEditFields>({})
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({})
  const [newTag, setNewTag] = useState("")

  const selectedTransactions = transactions.filter((t) => transactionIds.includes(t.id))

  const handleFieldToggle = (field: string, enabled: boolean) => {
    setEnabledFields((prev) => ({ ...prev, [field]: enabled }))
    if (!enabled) {
      // Remove the field from editFields when disabled
      const { [field]: removed, ...rest } = editFields
      setEditFields(rest)
    }
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return

    const currentTags = editFields.tags || []
    if (!currentTags.includes(newTag.trim())) {
      setEditFields((prev) => ({
        ...prev,
        tags: [...currentTags, newTag.trim()],
      }))
    }
    setNewTag("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditFields((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleApply = () => {
    const updates: Partial<Transaction> = {}

    // Only include enabled fields in the update
    Object.entries(editFields).forEach(([key, value]) => {
      if (enabledFields[key] && value !== undefined) {
        updates[key as keyof Transaction] = value as any
      }
    })

    // Always update the timestamp
    updates.updatedAt = new Date()

    onUpdate(transactionIds, updates)
    onClose()
  }

  const getFieldSummary = () => {
    const enabledCount = Object.values(enabledFields).filter(Boolean).length
    return enabledCount > 0 ? `${enabledCount} field(s) will be updated` : "No fields selected for update"
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Bulk Edit Transactions
          </DialogTitle>
          <DialogDescription>
            Edit multiple transactions at once. Only enabled fields will be updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Transactions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Transactions</CardTitle>
              <CardDescription>{transactionIds.length} transaction(s) selected for bulk editing</CardDescription>
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
                    <Badge variant="outline" className="ml-2">
                      {transaction.type}
                    </Badge>
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

          {/* Edit Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Fields</CardTitle>
              <CardDescription>Select which fields to update and provide new values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category-enabled"
                    checked={enabledFields.categoryId || false}
                    onCheckedChange={(checked) => handleFieldToggle("categoryId", checked as boolean)}
                  />
                  <Label htmlFor="category-enabled" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                </div>
                {enabledFields.categoryId && (
                  <Select
                    value={editFields.categoryId || ""}
                    onValueChange={(value) => setEditFields((prev) => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Uncategorized</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              {/* Merchant */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="merchant-enabled"
                    checked={enabledFields.merchant || false}
                    onCheckedChange={(checked) => handleFieldToggle("merchant", checked as boolean)}
                  />
                  <Label htmlFor="merchant-enabled" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Merchant
                  </Label>
                </div>
                {enabledFields.merchant && (
                  <Input
                    placeholder="Enter merchant name"
                    value={editFields.merchant || ""}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, merchant: e.target.value }))}
                  />
                )}
              </div>

              <Separator />

              {/* Transaction Type */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-enabled"
                    checked={enabledFields.type || false}
                    onCheckedChange={(checked) => handleFieldToggle("type", checked as boolean)}
                  />
                  <Label htmlFor="type-enabled" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Transaction Type
                  </Label>
                </div>
                {enabledFields.type && (
                  <Select
                    value={editFields.type || ""}
                    onValueChange={(value) => setEditFields((prev) => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tags-enabled"
                    checked={enabledFields.tags || false}
                    onCheckedChange={(checked) => handleFieldToggle("tags", checked as boolean)}
                  />
                  <Label htmlFor="tags-enabled" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </Label>
                </div>
                {enabledFields.tags && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} variant="outline">
                        Add
                      </Button>
                    </div>
                    {editFields.tags && editFields.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editFields.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notes-enabled"
                    checked={enabledFields.notes || false}
                    onCheckedChange={(checked) => handleFieldToggle("notes", checked as boolean)}
                  />
                  <Label htmlFor="notes-enabled" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                </div>
                {enabledFields.notes && (
                  <Textarea
                    placeholder="Add notes to all selected transactions"
                    value={editFields.notes || ""}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                )}
              </div>

              <Separator />

              {/* Review Status */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reviewed-enabled"
                    checked={enabledFields.isReviewed || false}
                    onCheckedChange={(checked) => handleFieldToggle("isReviewed", checked as boolean)}
                  />
                  <Label htmlFor="reviewed-enabled" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Mark as Reviewed
                  </Label>
                </div>
                {enabledFields.isReviewed && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-reviewed"
                      checked={editFields.isReviewed || false}
                      onCheckedChange={(checked) =>
                        setEditFields((prev) => ({ ...prev, isReviewed: checked as boolean }))
                      }
                    />
                    <Label htmlFor="is-reviewed">Mark all selected transactions as reviewed</Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getFieldSummary()}. This action will affect {transactionIds.length} transaction(s) and cannot be undone.
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={Object.values(enabledFields).every((enabled) => !enabled)}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
