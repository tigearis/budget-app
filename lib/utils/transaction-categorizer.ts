import type {
  Transaction,
  TransactionCategory,
  CategorySuggestion,
  TransactionLearning,
  MerchantMapping,
} from "@/lib/types/transactions"

export class TransactionCategorizer {
  private categories: TransactionCategory[]
  private learningData: TransactionLearning[]
  private merchantMappings: MerchantMapping[]

  constructor(
    categories: TransactionCategory[],
    learningData: TransactionLearning[] = [],
    merchantMappings: MerchantMapping[] = [],
  ) {
    this.categories = categories
    this.learningData = learningData
    this.merchantMappings = merchantMappings
  }

  categorizeTransaction(transaction: Transaction): CategorySuggestion[] {
    const suggestions: CategorySuggestion[] = []

    // 1. Check learning data first (highest priority)
    const learningSuggestion = this.checkLearningData(transaction)
    if (learningSuggestion) {
      suggestions.push(learningSuggestion)
    }

    // 2. Check merchant mappings
    const merchantSuggestion = this.checkMerchantMapping(transaction)
    if (merchantSuggestion) {
      suggestions.push(merchantSuggestion)
    }

    // 3. Apply rule-based categorization
    const ruleSuggestions = this.applyRules(transaction)
    suggestions.push(...ruleSuggestions)

    // 4. Apply keyword matching
    const keywordSuggestions = this.applyKeywordMatching(transaction)
    suggestions.push(...keywordSuggestions)

    // 5. Apply amount-based heuristics
    const amountSuggestions = this.applyAmountHeuristics(transaction)
    suggestions.push(...amountSuggestions)

    // Sort by confidence and remove duplicates
    return this.consolidateSuggestions(suggestions)
  }

  private checkLearningData(transaction: Transaction): CategorySuggestion | null {
    const merchant = this.standardizeMerchant(transaction.merchant || transaction.description)

    const learningMatch = this.learningData.find((learning) => {
      if (
        learning.transactionPattern.merchant &&
        merchant.includes(learning.transactionPattern.merchant.toLowerCase())
      ) {
        return true
      }

      if (
        learning.transactionPattern.description &&
        transaction.description.toLowerCase().includes(learning.transactionPattern.description.toLowerCase())
      ) {
        return true
      }

      if (learning.transactionPattern.amountRange) {
        const { min, max } = learning.transactionPattern.amountRange
        if (Math.abs(transaction.amount) >= min && Math.abs(transaction.amount) <= max) {
          return true
        }
      }

      return false
    })

    if (learningMatch) {
      const category = this.categories.find((c) => c.id === learningMatch.categoryId)
      if (category) {
        return {
          categoryId: category.id,
          confidence: Math.min(0.95, learningMatch.confidence + learningMatch.occurrences * 0.01),
          reason: `Learned from ${learningMatch.occurrences} similar transactions`,
          matchedRules: [],
          similarTransactions: [],
        }
      }
    }

    return null
  }

  private checkMerchantMapping(transaction: Transaction): CategorySuggestion | null {
    const merchant = transaction.merchant || this.extractMerchant(transaction.description)
    if (!merchant) return null

    const mapping = this.merchantMappings.find(
      (m) =>
        merchant.toLowerCase().includes(m.originalName.toLowerCase()) ||
        m.originalName.toLowerCase().includes(merchant.toLowerCase()),
    )

    if (mapping && mapping.categoryId) {
      const category = this.categories.find((c) => c.id === mapping.categoryId)
      if (category) {
        return {
          categoryId: category.id,
          confidence: mapping.confidence,
          reason: `Merchant "${mapping.standardizedName}" typically categorized as ${category.name}`,
          matchedRules: [],
          similarTransactions: [],
        }
      }
    }

    return null
  }

  private applyRules(transaction: Transaction): CategorySuggestion[] {
    const suggestions: CategorySuggestion[] = []

    for (const category of this.categories) {
      if (!category.isActive || category.rules.length === 0) continue

      let totalWeight = 0
      let matchedWeight = 0
      const matchedRules: any[] = []

      for (const rule of category.rules) {
        if (!rule.isActive) continue

        totalWeight += rule.weight

        if (this.evaluateRule(transaction, rule)) {
          matchedWeight += rule.weight
          matchedRules.push(rule)
        }
      }

      if (matchedRules.length > 0) {
        const confidence = matchedWeight / totalWeight
        suggestions.push({
          categoryId: category.id,
          confidence,
          reason: `Matched ${matchedRules.length} rule(s)`,
          matchedRules,
          similarTransactions: [],
        })
      }
    }

    return suggestions
  }

  private applyKeywordMatching(transaction: Transaction): CategorySuggestion[] {
    const suggestions: CategorySuggestion[] = []
    const searchText = `${transaction.description} ${transaction.merchant || ""}`.toLowerCase()

    for (const category of this.categories) {
      if (!category.isActive || category.keywords.length === 0) continue

      const matchedKeywords = category.keywords.filter((keyword) => searchText.includes(keyword.toLowerCase()))

      if (matchedKeywords.length > 0) {
        const confidence = Math.min(0.8, (matchedKeywords.length / category.keywords.length) * 0.7 + 0.3)
        suggestions.push({
          categoryId: category.id,
          confidence,
          reason: `Matched keywords: ${matchedKeywords.join(", ")}`,
          matchedRules: [],
          similarTransactions: [],
        })
      }
    }

    return suggestions
  }

  private applyAmountHeuristics(transaction: Transaction): CategorySuggestion[] {
    const suggestions: CategorySuggestion[] = []
    const amount = Math.abs(transaction.amount)

    // Large amounts are likely rent/mortgage
    if (amount > 1000 && transaction.type === "expense") {
      const housingCategory = this.categories.find((c) => c.name === "Rent/Mortgage")
      if (housingCategory) {
        suggestions.push({
          categoryId: housingCategory.id,
          confidence: 0.4,
          reason: "Large expense amount suggests housing payment",
          matchedRules: [],
          similarTransactions: [],
        })
      }
    }

    // Regular small amounts might be subscriptions
    if (amount < 50 && transaction.type === "expense") {
      const streamingCategory = this.categories.find((c) => c.name === "Streaming Services")
      if (streamingCategory) {
        suggestions.push({
          categoryId: streamingCategory.id,
          confidence: 0.3,
          reason: "Small regular amount suggests subscription",
          matchedRules: [],
          similarTransactions: [],
        })
      }
    }

    return suggestions
  }

  private evaluateRule(transaction: Transaction, rule: any): boolean {
    let fieldValue: string | number = ""

    switch (rule.field) {
      case "description":
        fieldValue = transaction.description.toLowerCase()
        break
      case "merchant":
        fieldValue = (transaction.merchant || "").toLowerCase()
        break
      case "amount":
        fieldValue = Math.abs(transaction.amount)
        break
      case "reference":
        fieldValue = (transaction.reference || "").toLowerCase()
        break
      default:
        return false
    }

    switch (rule.operator) {
      case "contains":
        return typeof fieldValue === "string" && fieldValue.includes(rule.value.toLowerCase())
      case "equals":
        return fieldValue === rule.value
      case "starts_with":
        return typeof fieldValue === "string" && fieldValue.startsWith(rule.value.toLowerCase())
      case "ends_with":
        return typeof fieldValue === "string" && fieldValue.endsWith(rule.value.toLowerCase())
      case "regex":
        return typeof fieldValue === "string" && new RegExp(rule.value, "i").test(fieldValue)
      case "amount_range":
        if (typeof fieldValue === "number" && typeof rule.value === "object") {
          const { min, max } = rule.value
          return fieldValue >= min && fieldValue <= max
        }
        return false
      default:
        return false
    }
  }

  private consolidateSuggestions(suggestions: CategorySuggestion[]): CategorySuggestion[] {
    const consolidated = new Map<string, CategorySuggestion>()

    for (const suggestion of suggestions) {
      const existing = consolidated.get(suggestion.categoryId)
      if (existing) {
        // Combine confidences using weighted average
        const totalConfidence = (existing.confidence + suggestion.confidence) / 2
        existing.confidence = Math.min(0.99, totalConfidence)
        existing.reason += `, ${suggestion.reason}`
        existing.matchedRules.push(...suggestion.matchedRules)
      } else {
        consolidated.set(suggestion.categoryId, { ...suggestion })
      }
    }

    return Array.from(consolidated.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3) // Return top 3 suggestions
  }

  private standardizeMerchant(merchantName: string): string {
    // Remove common prefixes/suffixes and normalize
    return merchantName
      .toLowerCase()
      .replace(/^(eftpos|pos|paypal|sq|square)\s*/i, "")
      .replace(/\s*(pty ltd|ltd|inc|corp|llc)$/i, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
  }

  private extractMerchant(description: string): string {
    // Extract merchant name from transaction description
    const patterns = [
      /^eftpos\s+(.+?)(?:\s+\d|$)/i,
      /^pos\s+(.+?)(?:\s+\d|$)/i,
      /^paypal\s+(.+?)(?:\s+\d|$)/i,
      /^(.+?)(?:\s+\d{2}\/\d{2}|\s+\*\d+|$)/i,
    ]

    for (const pattern of patterns) {
      const match = description.match(pattern)
      if (match && match[1]) {
        return this.standardizeMerchant(match[1])
      }
    }

    return this.standardizeMerchant(description)
  }

  // Learning methods
  learnFromUserCorrection(transaction: Transaction, correctCategoryId: string): void {
    const merchant = this.standardizeMerchant(transaction.merchant || transaction.description)
    const pattern = {
      merchant: merchant,
      description: transaction.description.toLowerCase(),
      amountRange: {
        min: Math.abs(transaction.amount) * 0.9,
        max: Math.abs(transaction.amount) * 1.1,
      },
    }

    const existingLearning = this.learningData.find(
      (l) =>
        l.transactionPattern.merchant === pattern.merchant || l.transactionPattern.description === pattern.description,
    )

    if (existingLearning) {
      existingLearning.occurrences += 1
      existingLearning.confidence = Math.min(0.95, existingLearning.confidence + 0.05)
      existingLearning.lastSeen = new Date()
      existingLearning.categoryId = correctCategoryId
    } else {
      this.learningData.push({
        id: crypto.randomUUID(),
        userId: transaction.userId,
        transactionPattern: pattern,
        categoryId: correctCategoryId,
        confidence: 0.7,
        occurrences: 1,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Update merchant mapping
    this.updateMerchantMapping(merchant, correctCategoryId)
  }

  private updateMerchantMapping(merchant: string, categoryId: string): void {
    const existing = this.merchantMappings.find((m) => m.originalName === merchant)

    if (existing) {
      existing.occurrences += 1
      existing.confidence = Math.min(0.95, existing.confidence + 0.05)
      existing.categoryId = categoryId
    } else {
      this.merchantMappings.push({
        id: crypto.randomUUID(),
        originalName: merchant,
        standardizedName: merchant,
        categoryId,
        confidence: 0.7,
        occurrences: 1,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
}
