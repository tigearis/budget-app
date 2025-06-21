"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Search,
  Filter,
} from "lucide-react"
import type { TransactionCategory } from "@/lib/types/transactions"

interface CategoryManagementProps {
  categories: TransactionCategory[]
  onCategoryCreate: (category: Omit<TransactionCategory, "id" | "createdAt" | "updatedAt">) => void
  onCategoryUpdate: (categoryId: string, updates: Partial<TransactionCategory>) => void
  onCategoryDelete: (categoryId: string) => void
}

export function CategoryManagement({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
}: CategoryManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "transfer">("all")

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || category.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "expense":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600 bg-green-50"
      case "expense":
        return "text-red-600 bg-red-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category Management</h2>
          <p className="text-muted-foreground">
            Manage transaction categories and their automatic classification rules
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <CategoryFormDialog
            onSave={(category) => {
              onCategoryCreate(category)
              setShowCreateDialog(false)
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.parentId && <p className="text-sm text-muted-foreground">Subcategory</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(category.type)}
                      <Badge variant="outline" className={getTypeColor(category.type)}>
                        {category.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {category.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {category.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{category.rules.filter((r) => r.isActive).length} active</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={(checked) => onCategoryUpdate(category.id, { isActive: checked })}
                        size="sm"
                      />
                      {category.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )}
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
                        <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!category.isSystem && (
                          <DropdownMenuItem className="text-red-600" onClick={() => onCategoryDelete(category.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground">Try adjusting your search or create a new category</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingCategory && (
        <Dialog open onOpenChange={() => setEditingCategory(null)}>
          <CategoryFormDialog
            category={editingCategory}
            onSave={(updates) => {
              onCategoryUpdate(editingCategory.id, updates)
              setEditingCategory(null)
            }}
            onCancel={() => setEditingCategory(null)}
          />
        </Dialog>
      )}
    </div>
  )
}

interface CategoryFormDialogProps {
  category?: TransactionCategory
  onSave: (category: Omit<TransactionCategory, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

function CategoryFormDialog({ category, onSave, onCancel }: CategoryFormDialogProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    icon: category?.icon || "📁",
    color: category?.color || "#3B82F6",
    type: category?.type || ("expense" as "income" | "expense" | "transfer"),
    keywords: category?.keywords.join(", ") || "",
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const categoryData = {
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      type: formData.type,
      keywords: formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      rules: category?.rules || [],
      isSystem: category?.isSystem || false,
      isActive: formData.isActive,
      parentId: category?.parentId,
    }

    onSave(categoryData)
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
        <DialogDescription>
          {category ? "Update category details" : "Create a new transaction category"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter category name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="📁"
              maxLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (comma-separated)</Label>
          <Textarea
            id="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
            placeholder="grocery, food, supermarket"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{category ? "Update" : "Create"} Category</Button>
        </div>
      </form>
    </DialogContent>
  )
}
