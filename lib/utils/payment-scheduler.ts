import type {
  PaymentEvent,
  RecurringPattern,
  PaymentAnomaly,
  CashFlowProjection,
  CashFlowEntry,
  PaymentScheduleRecommendation,
  RecurringPaymentDetection,
  PaymentCalendarView,
} from "@/lib/types/calendar"
import type { Transaction } from "@/lib/types/transactions"
import { addDays, addWeeks, addMonths, addYears, isSameDay, differenceInDays, format, startOfMonth } from "date-fns"

export class PaymentScheduler {
  static generateRecurringPayments(baseEvent: PaymentEvent, pattern: RecurringPattern, endDate: Date): PaymentEvent[] {
    const events: PaymentEvent[] = []
    let currentDate = new Date(baseEvent.dueDate)
    let occurrenceCount = 0

    while (currentDate <= endDate && (!pattern.occurrences || occurrenceCount < pattern.occurrences)) {
      if (occurrenceCount > 0) {
        // Don't include the base event
        events.push({
          ...baseEvent,
          id: `${baseEvent.id}-${occurrenceCount}`,
          dueDate: new Date(currentDate),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      currentDate = this.getNextOccurrence(currentDate, pattern)
      occurrenceCount++

      // Safety limit
      if (occurrenceCount > 1000) break
    }

    return events
  }

  private static getNextOccurrence(currentDate: Date, pattern: RecurringPattern): Date {
    const { frequency, interval = 1 } = pattern

    switch (frequency) {
      case "daily":
        return addDays(currentDate, interval)
      case "weekly":
        return addWeeks(currentDate, interval)
      case "fortnightly":
        return addWeeks(currentDate, 2 * interval)
      case "monthly":
        return addMonths(currentDate, interval)
      case "quarterly":
        return addMonths(currentDate, 3 * interval)
      case "semi_annually":
        return addMonths(currentDate, 6 * interval)
      case "annually":
        return addYears(currentDate, interval)
      default:
        return addMonths(currentDate, interval)
    }
  }

  static detectRecurringPayments(transactions: Transaction[]): RecurringPaymentDetection[] {
    const detections: RecurringPaymentDetection[] = []
    const merchantGroups = this.groupTransactionsByMerchant(transactions)

    for (const [merchant, merchantTransactions] of merchantGroups.entries()) {
      if (merchantTransactions.length < 3) continue // Need at least 3 transactions to detect pattern

      const patterns = this.analyzeTransactionPatterns(merchantTransactions)

      for (const pattern of patterns) {
        if (pattern.confidence > 0.7) {
          detections.push({
            id: crypto.randomUUID(),
            userId: merchantTransactions[0].userId,
            detectedPattern: pattern.recurringPattern,
            transactions: pattern.transactionIds,
            confidence: pattern.confidence,
            suggestedPaymentEvent: {
              userId: merchantTransactions[0].userId,
              title: `${merchant} - Recurring Payment`,
              amount: pattern.averageAmount,
              type: this.categorizePaymentType(merchant, merchantTransactions[0].category),
              category: merchantTransactions[0].category,
              isRecurring: true,
              recurringPattern: pattern.recurringPattern,
              status: "scheduled",
              reminderSettings: {
                enabled: true,
                methods: ["email", "push"],
                timings: [
                  { value: 3, unit: "days", label: "3 days before" },
                  { value: 1, unit: "days", label: "1 day before" },
                ],
              },
              metadata: {
                averageAmount: pattern.averageAmount,
                paymentHistory: merchantTransactions.map((t) => ({
                  date: t.date,
                  amount: Math.abs(t.amount),
                  status: "paid" as const,
                })),
              },
            },
            status: "pending_review",
            createdAt: new Date(),
          })
        }
      }
    }

    return detections
  }

  private static groupTransactionsByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>()

    for (const transaction of transactions) {
      if (transaction.amount >= 0) continue // Only consider expenses

      const merchant = transaction.merchant || transaction.description
      if (!merchant) continue

      if (!groups.has(merchant)) {
        groups.set(merchant, [])
      }
      groups.get(merchant)!.push(transaction)
    }

    return groups
  }

  private static analyzeTransactionPatterns(transactions: Transaction[]): Array<{
    recurringPattern: RecurringPattern
    confidence: number
    averageAmount: number
    transactionIds: string[]
  }> {
    const patterns: Array<{
      recurringPattern: RecurringPattern
      confidence: number
      averageAmount: number
      transactionIds: string[]
    }> = []

    // Sort transactions by date
    const sortedTransactions = transactions.sort((a, b) => a.date.getTime() - b.date.getTime())

    if (sortedTransactions.length < 3) return patterns

    // Analyze intervals between transactions
    const intervals: number[] = []
    for (let i = 1; i < sortedTransactions.length; i++) {
      const daysDiff = differenceInDays(sortedTransactions[i].date, sortedTransactions[i - 1].date)
      intervals.push(daysDiff)
    }

    // Find most common interval
    const intervalCounts = new Map<number, number>()
    intervals.forEach((interval) => {
      // Group similar intervals (±3 days tolerance)
      const roundedInterval = this.roundToCommonInterval(interval)
      intervalCounts.set(roundedInterval, (intervalCounts.get(roundedInterval) || 0) + 1)
    })

    const mostCommonInterval = Array.from(intervalCounts.entries()).sort((a, b) => b[1] - a[1])[0]

    if (mostCommonInterval && mostCommonInterval[1] >= 2) {
      const interval = mostCommonInterval[0]
      const frequency = this.intervalToFrequency(interval)
      const confidence = Math.min(mostCommonInterval[1] / (intervals.length - 1), 1)

      // Calculate average amount
      const amounts = sortedTransactions.map((t) => Math.abs(t.amount))
      const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length

      // Check amount consistency
      const amountVariance = this.calculateVariance(amounts)
      const amountConsistency = Math.max(0, 1 - amountVariance / (averageAmount * averageAmount))

      const finalConfidence = confidence * 0.7 + amountConsistency * 0.3

      patterns.push({
        recurringPattern: {
          frequency,
          interval: frequency === "custom" ? interval : 1,
        },
        confidence: finalConfidence,
        averageAmount,
        transactionIds: sortedTransactions.map((t) => t.id),
      })
    }

    return patterns
  }

  private static roundToCommonInterval(interval: number): number {
    const commonIntervals = [7, 14, 28, 30, 31, 90, 91, 92, 365, 366]

    for (const common of commonIntervals) {
      if (Math.abs(interval - common) <= 3) {
        return common
      }
    }

    return interval
  }

  private static intervalToFrequency(interval: number): RecurringPattern["frequency"] {
    if (interval <= 10) return "weekly"
    if (interval <= 17) return "fortnightly"
    if (interval <= 35) return "monthly"
    if (interval <= 95) return "quarterly"
    if (interval <= 370) return "annually"
    return "custom"
  }

  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
  }

  private static categorizePaymentType(merchant: string, category: string): PaymentEvent["type"] {
    const merchantLower = merchant.toLowerCase()
    const categoryLower = category.toLowerCase()

    if (
      merchantLower.includes("netflix") ||
      merchantLower.includes("spotify") ||
      categoryLower.includes("subscription")
    ) {
      return "subscription"
    }
    if (categoryLower.includes("utilities") || merchantLower.includes("electricity") || merchantLower.includes("gas")) {
      return "utilities"
    }
    if (categoryLower.includes("insurance")) {
      return "insurance"
    }
    if (categoryLower.includes("rent") || categoryLower.includes("mortgage")) {
      return "rent_mortgage"
    }
    if (categoryLower.includes("credit") || merchantLower.includes("credit card")) {
      return "credit_card"
    }

    return "bill_payment"
  }

  static detectAnomalies(paymentEvents: PaymentEvent[], transactions: Transaction[]): PaymentAnomaly[] {
    const anomalies: PaymentAnomaly[] = []

    for (const event of paymentEvents) {
      // Check for missed payments
      if (event.dueDate < new Date() && event.status === "scheduled") {
        anomalies.push({
          id: crypto.randomUUID(),
          userId: event.userId,
          paymentEventId: event.id,
          type: "missed_payment",
          severity: this.calculateMissedPaymentSeverity(event),
          description: `Payment for ${event.title} was due on ${format(event.dueDate, "MMM dd, yyyy")} but hasn't been recorded`,
          detectedAt: new Date(),
          isResolved: false,
          suggestedActions: [
            "Mark payment as completed if already paid",
            "Schedule immediate payment",
            "Update payment due date if incorrect",
          ],
          metadata: {
            daysPastDue: differenceInDays(new Date(), event.dueDate),
            amount: event.amount,
          },
        })
      }

      // Check for amount variances in recurring payments
      if (event.isRecurring && event.metadata.paymentHistory) {
        const recentPayments = event.metadata.paymentHistory.slice(-5)
        if (recentPayments.length >= 3) {
          const amounts = recentPayments.map((p) => p.amount)
          const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
          const variance = this.calculateVariance(amounts)
          const coefficientOfVariation = Math.sqrt(variance) / averageAmount

          if (coefficientOfVariation > 0.2) {
            anomalies.push({
              id: crypto.randomUUID(),
              userId: event.userId,
              paymentEventId: event.id,
              type: "amount_variance",
              severity: coefficientOfVariation > 0.5 ? "high" : "medium",
              description: `Payment amounts for ${event.title} have been varying significantly`,
              detectedAt: new Date(),
              isResolved: false,
              suggestedActions: [
                "Review recent payment amounts",
                "Check if payment terms have changed",
                "Update expected payment amount",
              ],
              metadata: {
                averageAmount,
                variance,
                coefficientOfVariation,
                recentAmounts: amounts,
              },
            })
          }
        }
      }
    }

    return anomalies
  }

  private static calculateMissedPaymentSeverity(event: PaymentEvent): PaymentAnomaly["severity"] {
    const daysPastDue = differenceInDays(new Date(), event.dueDate)

    if (daysPastDue <= 1) return "low"
    if (daysPastDue <= 7) return "medium"
    if (daysPastDue <= 30) return "high"
    return "critical"
  }

  static generateCashFlowProjection(
    paymentEvents: PaymentEvent[],
    transactions: Transaction[],
    timeframe: "week" | "month" | "quarter" | "year",
  ): CashFlowProjection {
    const projectionDate = new Date()
    const endDate = this.getProjectionEndDate(projectionDate, timeframe)

    // Analyze historical income patterns
    const incomeTransactions = transactions.filter((t) => t.amount > 0)
    const expenseTransactions = transactions.filter((t) => t.amount < 0)

    // Project income based on historical patterns
    const projectedIncome = this.projectIncome(incomeTransactions, projectionDate, endDate)

    // Project scheduled expenses
    const scheduledExpenses = this.projectScheduledExpenses(paymentEvents, projectionDate, endDate)

    // Project other expenses based on historical patterns
    const otherExpenses = this.projectOtherExpenses(expenseTransactions, projectionDate, endDate)

    const allProjections = [...projectedIncome, ...scheduledExpenses, ...otherExpenses].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )

    const totalIncome = projectedIncome.reduce((sum, entry) => sum + entry.amount, 0)
    const totalExpenses = [...scheduledExpenses, ...otherExpenses].reduce(
      (sum, entry) => sum + Math.abs(entry.amount),
      0,
    )

    return {
      id: crypto.randomUUID(),
      userId: paymentEvents[0]?.userId || "unknown",
      projectionDate,
      timeframe,
      projections: allProjections,
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      runningBalance: 0, // This would be calculated based on current account balance
      confidence: this.calculateProjectionConfidence(allProjections),
      assumptions: [
        "Income patterns based on last 6 months of data",
        "Scheduled payments occur as planned",
        "Other expenses follow historical averages",
        "No major life changes or unexpected expenses",
      ],
      createdAt: new Date(),
    }
  }

  private static getProjectionEndDate(startDate: Date, timeframe: string): Date {
    switch (timeframe) {
      case "week":
        return addWeeks(startDate, 1)
      case "month":
        return addMonths(startDate, 1)
      case "quarter":
        return addMonths(startDate, 3)
      case "year":
        return addYears(startDate, 1)
      default:
        return addMonths(startDate, 1)
    }
  }

  private static projectIncome(incomeTransactions: Transaction[], startDate: Date, endDate: Date): CashFlowEntry[] {
    const entries: CashFlowEntry[] = []

    // Analyze salary patterns (regular, large income transactions)
    const salaryTransactions = incomeTransactions
      .filter((t) => t.amount > 1000) // Assume salary is > $1000
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 12) // Last 12 salary payments

    if (salaryTransactions.length >= 2) {
      const averageSalary = salaryTransactions.reduce((sum, t) => sum + t.amount, 0) / salaryTransactions.length
      const intervals = this.calculatePaymentIntervals(salaryTransactions.map((t) => t.date))
      const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length

      let currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        entries.push({
          date: new Date(currentDate),
          type: "income",
          category: "Salary",
          description: "Projected salary payment",
          amount: averageSalary,
          isProjected: true,
          confidence: 0.9,
          source: "historical",
        })
        currentDate = addDays(currentDate, averageInterval)
      }
    }

    return entries
  }

  private static projectScheduledExpenses(
    paymentEvents: PaymentEvent[],
    startDate: Date,
    endDate: Date,
  ): CashFlowEntry[] {
    const entries: CashFlowEntry[] = []

    for (const event of paymentEvents) {
      if (event.status !== "scheduled") continue

      if (event.isRecurring && event.recurringPattern) {
        const recurringPayments = this.generateRecurringPayments(event, event.recurringPattern, endDate)

        for (const payment of recurringPayments) {
          if (payment.dueDate >= startDate && payment.dueDate <= endDate) {
            entries.push({
              date: payment.dueDate,
              type: "expense",
              category: payment.category,
              description: payment.title,
              amount: -payment.amount,
              isProjected: true,
              confidence: 0.95,
              source: "scheduled",
            })
          }
        }
      } else if (event.dueDate >= startDate && event.dueDate <= endDate) {
        entries.push({
          date: event.dueDate,
          type: "expense",
          category: event.category,
          description: event.title,
          amount: -event.amount,
          isProjected: true,
          confidence: 0.95,
          source: "scheduled",
        })
      }
    }

    return entries
  }

  private static projectOtherExpenses(
    expenseTransactions: Transaction[],
    startDate: Date,
    endDate: Date,
  ): CashFlowEntry[] {
    const entries: CashFlowEntry[] = []

    // Group expenses by category and calculate monthly averages
    const categoryAverages = new Map<string, number>()
    const monthlyExpenses = new Map<string, Transaction[]>()

    for (const transaction of expenseTransactions) {
      const monthKey = format(transaction.date, "yyyy-MM")
      if (!monthlyExpenses.has(monthKey)) {
        monthlyExpenses.set(monthKey, [])
      }
      monthlyExpenses.get(monthKey)!.push(transaction)
    }

    // Calculate average monthly spending by category
    const categoryTotals = new Map<string, number[]>()
    for (const [month, transactions] of monthlyExpenses.entries()) {
      const categoryMonthTotals = new Map<string, number>()

      for (const transaction of transactions) {
        const category = transaction.category
        categoryMonthTotals.set(category, (categoryMonthTotals.get(category) || 0) + Math.abs(transaction.amount))
      }

      for (const [category, total] of categoryMonthTotals.entries()) {
        if (!categoryTotals.has(category)) {
          categoryTotals.set(category, [])
        }
        categoryTotals.get(category)!.push(total)
      }
    }

    for (const [category, totals] of categoryTotals.entries()) {
      const averageMonthly = totals.reduce((sum, total) => sum + total, 0) / totals.length
      categoryAverages.set(category, averageMonthly)
    }

    // Project monthly expenses
    let currentMonth = startOfMonth(startDate)
    while (currentMonth <= endDate) {
      for (const [category, averageAmount] of categoryAverages.entries()) {
        if (averageAmount > 50) {
          // Only project significant categories
          entries.push({
            date: new Date(currentMonth),
            type: "expense",
            category,
            description: `Projected ${category} expenses`,
            amount: -averageAmount,
            isProjected: true,
            confidence: 0.7,
            source: "predicted",
          })
        }
      }
      currentMonth = addMonths(currentMonth, 1)
    }

    return entries
  }

  private static calculatePaymentIntervals(dates: Date[]): number[] {
    const intervals: number[] = []
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime())

    for (let i = 1; i < sortedDates.length; i++) {
      intervals.push(differenceInDays(sortedDates[i], sortedDates[i - 1]))
    }

    return intervals
  }

  private static calculateProjectionConfidence(projections: CashFlowEntry[]): number {
    const totalEntries = projections.length
    if (totalEntries === 0) return 0

    const weightedConfidence = projections.reduce((sum, entry) => sum + entry.confidence, 0) / totalEntries
    return Math.round(weightedConfidence * 100) / 100
  }

  static generatePaymentRecommendations(
    paymentEvents: PaymentEvent[],
    cashFlowProjection: CashFlowProjection,
    transactions: Transaction[],
  ): PaymentScheduleRecommendation[] {
    const recommendations: PaymentScheduleRecommendation[] = []

    // Analyze cash flow patterns to suggest optimal payment timing
    const incomePattern = this.analyzeIncomePattern(transactions)

    // Recommendation 1: Align payment dates with income
    if (incomePattern.regularPaydays.length > 0) {
      const misalignedPayments = paymentEvents.filter((event) => {
        const dayOfMonth = event.dueDate.getDate()
        const closestPayday = incomePattern.regularPaydays.reduce((closest, payday) =>
          Math.abs(payday - dayOfMonth) < Math.abs(closest - dayOfMonth) ? payday : closest,
        )
        return Math.abs(dayOfMonth - closestPayday) > 5
      })

      if (misalignedPayments.length > 0) {
        recommendations.push({
          id: crypto.randomUUID(),
          userId: paymentEvents[0]?.userId || "unknown",
          type: "payment_timing_optimization",
          priority: 1,
          title: "Align Payment Dates with Income",
          description: `${misalignedPayments.length} payments could be better aligned with your income schedule`,
          potentialSavings: 0,
          implementationEffort: "low",
          suggestedActions: [
            {
              action: "Contact payment providers",
              description: "Request to change payment due dates",
              impact: "Improved cash flow management",
              timeline: "1-2 weeks",
            },
            {
              action: "Schedule payments after payday",
              description: "Ensure sufficient funds are available",
              impact: "Reduced overdraft risk",
              timeline: "Immediate",
            },
          ],
          affectedPayments: misalignedPayments.map((p) => p.id),
          validUntil: addMonths(new Date(), 3),
          createdAt: new Date(),
        })
      }
    }

    // Recommendation 2: Early payment opportunities
    const highInterestPayments = paymentEvents.filter(
      (event) => event.type === "credit_card" || event.type === "loan_payment",
    )

    if (highInterestPayments.length > 0 && cashFlowProjection.netCashFlow > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        userId: paymentEvents[0]?.userId || "unknown",
        type: "early_payment_opportunity",
        priority: 2,
        title: "Early Payment Opportunity",
        description: "Your positive cash flow allows for early payments on high-interest debt",
        potentialSavings: this.calculateEarlyPaymentSavings(highInterestPayments),
        implementationEffort: "low",
        suggestedActions: [
          {
            action: "Make early payments",
            description: "Pay high-interest debts before due date",
            impact: "Reduced interest charges",
            timeline: "Next payment cycle",
          },
        ],
        affectedPayments: highInterestPayments.map((p) => p.id),
        validUntil: addMonths(new Date(), 1),
        createdAt: new Date(),
      })
    }

    // Recommendation 3: Payment consolidation
    const frequentSmallPayments = paymentEvents.filter((event) => event.amount < 100 && event.isRecurring)

    if (frequentSmallPayments.length >= 3) {
      recommendations.push({
        id: crypto.randomUUID(),
        userId: paymentEvents[0]?.userId || "unknown",
        type: "payment_consolidation",
        priority: 3,
        title: "Consolidate Small Payments",
        description: `${frequentSmallPayments.length} small recurring payments could be consolidated`,
        implementationEffort: "medium",
        suggestedActions: [
          {
            action: "Review subscription services",
            description: "Consider bundling or annual payments",
            impact: "Simplified payment management",
            timeline: "1-2 weeks",
          },
        ],
        affectedPayments: frequentSmallPayments.map((p) => p.id),
        validUntil: addMonths(new Date(), 6),
        createdAt: new Date(),
      })
    }

    return recommendations.sort((a, b) => a.priority - b.priority)
  }

  private static analyzeIncomePattern(transactions: Transaction[]): {
    regularPaydays: number[]
    averageIncome: number
    incomeFrequency: "weekly" | "fortnightly" | "monthly" | "irregular"
  } {
    const incomeTransactions = transactions
      .filter((t) => t.amount > 1000) // Assume salary/regular income
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 12)

    const paydays = incomeTransactions.map((t) => t.date.getDate())
    const paydayFrequency = new Map<number, number>()

    paydays.forEach((day) => {
      paydayFrequency.set(day, (paydayFrequency.get(day) || 0) + 1)
    })

    const regularPaydays = Array.from(paydayFrequency.entries())
      .filter(([day, count]) => count >= 2)
      .map(([day]) => day)

    const averageIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length

    // Determine frequency based on intervals
    const intervals = this.calculatePaymentIntervals(incomeTransactions.map((t) => t.date))
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length

    let incomeFrequency: "weekly" | "fortnightly" | "monthly" | "irregular" = "irregular"
    if (averageInterval <= 10) incomeFrequency = "weekly"
    else if (averageInterval <= 17) incomeFrequency = "fortnightly"
    else if (averageInterval <= 35) incomeFrequency = "monthly"

    return {
      regularPaydays,
      averageIncome,
      incomeFrequency,
    }
  }

  private static calculateEarlyPaymentSavings(payments: PaymentEvent[]): number {
    // Simplified calculation - in reality would need interest rates
    return payments.reduce((sum, payment) => sum + payment.amount * 0.02, 0) // Assume 2% monthly interest savings
  }

  static generateCalendarView(paymentEvents: PaymentEvent[], startDate: Date, endDate: Date): PaymentCalendarView[] {
    const views: PaymentCalendarView[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayEvents = paymentEvents.filter((event) => isSameDay(event.dueDate, currentDate))

      const totalAmount = dayEvents.reduce((sum, event) => sum + event.amount, 0)
      const overdueCount = dayEvents.filter(
        (event) => event.status === "overdue" || (event.dueDate < new Date() && event.status === "scheduled"),
      ).length
      const upcomingCount = dayEvents.filter((event) => event.status === "scheduled").length

      views.push({
        date: new Date(currentDate),
        events: dayEvents,
        totalAmount,
        overdueCount,
        upcomingCount,
      })

      currentDate = addDays(currentDate, 1)
    }

    return views
  }
}
