import type {
  Loan,
  PaymentSchedule,
  LoanCalculatorInput,
  LoanCalculatorResult,
  ScenarioParameters,
  ScenarioResults,
  PaymentFrequency,
} from "@/lib/types/loans"

export class LoanCalculator {
  static calculatePayment(
    principal: number,
    annualRate: number,
    termMonths: number,
    frequency: PaymentFrequency = "monthly",
  ): number {
    const periodsPerYear = this.getPeriodsPerYear(frequency)
    const totalPeriods = (termMonths / 12) * periodsPerYear
    const periodRate = annualRate / 100 / periodsPerYear

    if (periodRate === 0) {
      return principal / totalPeriods
    }

    const payment =
      (principal * (periodRate * Math.pow(1 + periodRate, totalPeriods))) / (Math.pow(1 + periodRate, totalPeriods) - 1)

    return Math.round(payment * 100) / 100
  }

  static generateAmortizationSchedule(input: LoanCalculatorInput): LoanCalculatorResult {
    const { loanAmount, interestRate, termYears, paymentFrequency, extraPayment = 0, startDate = new Date() } = input

    const termMonths = termYears * 12
    const periodsPerYear = this.getPeriodsPerYear(paymentFrequency)
    const totalPeriods = termYears * periodsPerYear
    const periodRate = interestRate / 100 / periodsPerYear
    const daysBetweenPayments = this.getDaysBetweenPayments(paymentFrequency)

    const basePayment = this.calculatePayment(loanAmount, interestRate, termMonths, paymentFrequency)
    const totalPayment = basePayment + extraPayment

    const schedule: PaymentSchedule[] = []
    let remainingBalance = loanAmount
    let cumulativeInterest = 0
    let cumulativePrincipal = 0
    let paymentNumber = 1
    const currentDate = new Date(startDate)

    while (remainingBalance > 0.01 && paymentNumber <= totalPeriods * 2) {
      // Safety limit
      const interestPayment = remainingBalance * periodRate
      let principalPayment = Math.min(totalPayment - interestPayment, remainingBalance)

      // Ensure we don't overpay
      if (principalPayment + interestPayment > remainingBalance + interestPayment) {
        principalPayment = remainingBalance
      }

      const actualPayment = principalPayment + interestPayment
      remainingBalance -= principalPayment
      cumulativeInterest += interestPayment
      cumulativePrincipal += principalPayment

      schedule.push({
        id: `payment-${paymentNumber}`,
        loanId: "",
        paymentNumber,
        dueDate: new Date(currentDate),
        principalAmount: Math.round(principalPayment * 100) / 100,
        interestAmount: Math.round(interestPayment * 100) / 100,
        totalPayment: Math.round(actualPayment * 100) / 100,
        remainingBalance: Math.round(remainingBalance * 100) / 100,
        cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
        cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
        isProjected: true,
        createdAt: new Date(),
      })

      // Move to next payment date
      currentDate.setDate(currentDate.getDate() + daysBetweenPayments)
      paymentNumber++

      if (remainingBalance <= 0.01) break
    }

    const lastPayment = schedule[schedule.length - 1]
    const payoffDate = lastPayment ? lastPayment.dueDate : new Date()

    return {
      monthlyPayment: basePayment,
      totalInterest: Math.round(cumulativeInterest * 100) / 100,
      totalPayments: schedule.length,
      payoffDate,
      schedule,
    }
  }

  static calculateScenario(loan: Loan, parameters: ScenarioParameters): ScenarioResults {
    const baseSchedule = this.generateAmortizationSchedule({
      loanAmount: loan.currentBalance,
      interestRate: loan.interestRate,
      termYears: loan.remainingMonths / 12,
      paymentFrequency: loan.paymentFrequency,
    })

    let scenarioSchedule: LoanCalculatorResult

    switch (true) {
      case parameters.extraPaymentAmount !== undefined:
        scenarioSchedule = this.generateAmortizationSchedule({
          loanAmount: loan.currentBalance,
          interestRate: loan.interestRate,
          termYears: loan.remainingMonths / 12,
          paymentFrequency: loan.paymentFrequency,
          extraPayment: parameters.extraPaymentAmount,
        })
        break

      case parameters.newInterestRate !== undefined:
        scenarioSchedule = this.generateAmortizationSchedule({
          loanAmount: loan.currentBalance,
          interestRate: parameters.newInterestRate,
          termYears: loan.remainingMonths / 12,
          paymentFrequency: loan.paymentFrequency,
        })
        break

      case parameters.oneOffPayment !== undefined:
        const newBalance = loan.currentBalance - parameters.oneOffPayment
        scenarioSchedule = this.generateAmortizationSchedule({
          loanAmount: newBalance,
          interestRate: loan.interestRate,
          termYears: loan.remainingMonths / 12,
          paymentFrequency: loan.paymentFrequency,
        })
        break

      default:
        scenarioSchedule = baseSchedule
    }

    const interestSaved = baseSchedule.totalInterest - scenarioSchedule.totalInterest
    const timeSaved = baseSchedule.totalPayments - scenarioSchedule.totalPayments
    const timeSavedMonths = Math.round(timeSaved * (12 / this.getPeriodsPerYear(loan.paymentFrequency)))

    return {
      totalInterestSaved: Math.round(interestSaved * 100) / 100,
      timeSavedMonths,
      newPayoffDate: scenarioSchedule.payoffDate,
      totalPayments: scenarioSchedule.totalPayments,
      monthlyPaymentChange: scenarioSchedule.monthlyPayment - baseSchedule.monthlyPayment,
      netBenefit: interestSaved,
    }
  }

  static calculateOptimalPaymentStrategy(loans: Loan[]): {
    strategy: "avalanche" | "snowball"
    order: { loanId: string; priority: number; reasoning: string }[]
    totalSavings: number
  } {
    // Debt Avalanche (highest interest rate first)
    const avalancheOrder = loans
      .filter((loan) => loan.status === "active")
      .sort((a, b) => b.interestRate - a.interestRate)
      .map((loan, index) => ({
        loanId: loan.id,
        priority: index + 1,
        reasoning: `${loan.interestRate}% interest rate`,
      }))

    // Debt Snowball (smallest balance first)
    const snowballOrder = loans
      .filter((loan) => loan.status === "active")
      .sort((a, b) => a.currentBalance - b.currentBalance)
      .map((loan, index) => ({
        loanId: loan.id,
        priority: index + 1,
        reasoning: `$${loan.currentBalance.toLocaleString()} balance`,
      }))

    // Calculate potential savings for avalanche method
    const totalInterestAvalanche = this.calculateTotalInterestWithStrategy(loans, "avalanche")
    const totalInterestSnowball = this.calculateTotalInterestWithStrategy(loans, "snowball")

    const strategy = totalInterestAvalanche < totalInterestSnowball ? "avalanche" : "snowball"
    const order = strategy === "avalanche" ? avalancheOrder : snowballOrder
    const totalSavings = Math.abs(totalInterestAvalanche - totalInterestSnowball)

    return {
      strategy,
      order,
      totalSavings,
    }
  }

  private static calculateTotalInterestWithStrategy(loans: Loan[], strategy: "avalanche" | "snowball"): number {
    // Simplified calculation - in reality this would be more complex
    return loans.reduce((total, loan) => {
      const schedule = this.generateAmortizationSchedule({
        loanAmount: loan.currentBalance,
        interestRate: loan.interestRate,
        termYears: loan.remainingMonths / 12,
        paymentFrequency: loan.paymentFrequency,
      })
      return total + schedule.totalInterest
    }, 0)
  }

  private static getPeriodsPerYear(frequency: PaymentFrequency): number {
    switch (frequency) {
      case "weekly":
        return 52
      case "fortnightly":
        return 26
      case "monthly":
        return 12
      case "quarterly":
        return 4
      default:
        return 12
    }
  }

  private static getDaysBetweenPayments(frequency: PaymentFrequency): number {
    switch (frequency) {
      case "weekly":
        return 7
      case "fortnightly":
        return 14
      case "monthly":
        return 30
      case "quarterly":
        return 90
      default:
        return 30
    }
  }

  static calculateInterestSavings(
    currentBalance: number,
    interestRate: number,
    termMonths: number,
    extraPayment: number,
    frequency: PaymentFrequency = "monthly",
  ): {
    timeSaved: number
    interestSaved: number
    newPayoffDate: Date
  } {
    const baseResult = this.generateAmortizationSchedule({
      loanAmount: currentBalance,
      interestRate,
      termYears: termMonths / 12,
      paymentFrequency: frequency,
    })

    const extraResult = this.generateAmortizationSchedule({
      loanAmount: currentBalance,
      interestRate,
      termYears: termMonths / 12,
      paymentFrequency: frequency,
      extraPayment,
    })

    const timeSaved = baseResult.totalPayments - extraResult.totalPayments
    const interestSaved = baseResult.totalInterest - extraResult.totalInterest

    return {
      timeSaved,
      interestSaved,
      newPayoffDate: extraResult.payoffDate,
    }
  }
}
