"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Tag, FileText, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react"
import type { Transaction, TransactionCategory } from "@/lib/types/transactions"
import { format } from "date-fns"

interface TransactionDetailsModalProps {
  transaction: Transaction
  categories: TransactionCategory[]
  onClose: () => void
  onUpdate: (transaction: Transaction) => void
}

export function TransactionDetailsModal({ transaction, categories, onClose, onUpdate }: TransactionDetailsModalProps) {
  const [editedTransaction, setEditedTransaction] = useState<Transaction>({ ...transaction })
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onUpdate(editedTransaction)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTransaction({ ...transaction })
    setIsEditing(false)
  }

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case "income":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "expense":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <ArrowRightLeft className="h-5 w-5 text-blue-500" />
    }
  }

  const getAmountColor = () => {
    switch (transaction.type) {
      case "income":
        return "text-green-600"
      case "expense":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  const selectedCategory = categories.find((c) => c.id === editedTransaction.categoryId)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTransactionIcon()}
            Transaction Details
          </DialogTitle>
          <DialogDescription>View and edit transaction information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Input
                      id="description"
                      value={editedTransaction.description}
                      onChange={(e) =>
                        setEditedTransaction((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium">{transaction.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  {isEditing ? (
                    <Input
                      id="merchant"
                      value={editedTransaction.merchant || ""}
                      onChange={(e) =>
                        setEditedTransaction((prev) => ({
                          ...prev,
                          merchant: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {transaction.standardizedMerchant || transaction.merchant || "N/A"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={Math.abs(editedTransaction.amount)}
                      onChange={(e) =>
                        setEditedTransaction((prev) => ({
                          ...prev,
                          amount: Number.parseFloat(e.target.value) * (prev.type === "expense" ? -1 : 1),
                        }))
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getAmountColor()}`}>
                        {transaction.type === "expense" ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={format(new Date(editedTransaction.date), "yyyy-MM-dd")}
                      onChange={(e) =>
                        setEditedTransaction((prev) => ({
                          ...prev,
                          date: new Date(e.target.value),
                        }))
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(new Date(transaction.date), "EEEE, MMMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {transaction.reference && (
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{transaction.reference}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                {isEditing ? (
                  <Select
                    value={editedTransaction.categoryId || ""}
                    onValueChange={(value) =>
                      setEditedTransaction((prev) => ({
                        ...prev,
                        categoryId: value || undefined,
                      }))
                    }
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
                ) : (
                  <div>
                    {selectedCategory ? (
                      <Badge variant="secondary" className="gap-2">
                        <span>{selectedCategory.icon}</span>
                        {selectedCategory.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Uncategorized</Badge>
                    )}
                  </div>
                )}
              </div>

              {transaction.suggestedCategoryId && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Suggested Category</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {(() => {
                        const suggestedCategory = categories.find((c) => c.id === transaction.suggestedCategoryId)
                        return suggestedCategory ? (
                          <Badge variant="secondary" className="gap-2">
                            <span>{suggestedCategory.icon}</span>
                            {suggestedCategory.name}
                          </Badge>
                        ) : null
                      })()}
                      {transaction.categoryConfidence && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {Math.round(transaction.categoryConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditedTransaction((prev) => ({
                            ...prev,
                            categoryId: transaction.suggestedCategoryId,
                          }))
                        }
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                {transaction.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {transaction.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editedTransaction.notes || ""}
                    onChange={(e) =>
                      setEditedTransaction((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Add notes about this transaction..."
                  />
                ) : (
                  <p className="text-sm">{transaction.notes || "No notes"}</p>
                )}
              </div>

              {transaction.location && (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {transaction.location.address ||
                        `${transaction.location.latitude}, ${transaction.location.longitude}`}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{format(new Date(transaction.createdAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <p className="font-medium">{format(new Date(transaction.updatedAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    {transaction.isReviewed ? (
                      <Badge variant="secondary">Reviewed</Badge>
                    ) : (
                      <Badge variant="outline">Pending Review</Badge>
                    )}
                    {transaction.isRecurring && <Badge variant="secondary">Recurring</Badge>}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Balance:</span>
                  <p className="font-medium">{transaction.balance ? `$${transaction.balance.toFixed(2)}` : "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Transaction
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
