"use client"

import { useState } from "react"
import { LoanDashboard } from "@/components/loans/loan-dashboard"
import { LoanSetupWizard } from "@/components/loans/loan-setup-wizard"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Loan, OptimizationStrategy } from "@/lib/types/loans"

// Mock data - replace with real data from your GraphQL API
const MOCK_LOANS: Loan[] = [
  {
    id: "1",
    userId: "user1",
    name: "Home Loan - Main Residence",
    type: "mortgage",
    lender: "Commonwealth Bank",
    principalAmount: 500000,
    currentBalance: 450000,
    interestRate: 6.5,
    termMonths: 360,
    remainingMonths: 324,
    paymentType: "principal_and_interest",
    minimumPayment: 3164,
    paymentFrequency: "monthly",
    startDate: new Date("2021-01-15"),
    maturityDate: new Date("2051-01-15"),
    status: "active",
    isInterestOnly: false,
    features: {
      hasRedraw: true,
      hasOffset: true,
      allowsExtraPayments: true,
      hasPaymentHoliday: false,
      isFixedRate: false,
      hasRateReview: true,
    },
    metadata: {
      accountNumber: "123456789",
      bsb: "062-001",
      notes: "Variable rate home loan with offset account",
    },
    createdAt: new Date("2021-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    userId: "user1",
    name: "Car Loan - Toyota Camry",
    type: "vehicle",
    lender: "ANZ Bank",
    principalAmount: 35000,
    currentBalance: 28000,
    interestRate: 7.2,
    termMonths: 60,
    remainingMonths: 48,
    paymentType: "principal_and_interest",
    minimumPayment: 694,
    paymentFrequency: "monthly",
    startDate: new Date("2023-01-01"),
    maturityDate: new Date("2028-01-01"),
    status: "active",
    isInterestOnly: false,
    features: {
      hasRedraw: false,
      hasOffset: false,
      allowsExtraPayments: true,
      hasPaymentHoliday: false,
      isFixedRate: true,
      hasRateReview: false,
    },
    metadata: {
      accountNumber: "987654321",
      notes: "Fixed rate car loan for 2022 Toyota Camry",
    },
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    userId: "user1",
    name: "Credit Card - Visa Platinum",
    type: "credit_card",
    lender: "Westpac",
    principalAmount: 15000,
    currentBalance: 8500,
    interestRate: 19.9,
    termMonths: 0, // Credit cards don't have fixed terms
    remainingMonths: 0,
    paymentType: "minimum_payment",
    minimumPayment: 255,
    paymentFrequency: "monthly",
    startDate: new Date("2022-06-01"),
    maturityDate: new Date("2030-06-01"), // Arbitrary future date
    status: "active",
    isInterestOnly: false,
    features: {
      hasRedraw: false,
      hasOffset: false,
      allowsExtraPayments: true,
      hasPaymentHoliday: false,
      isFixedRate: false,
      hasRateReview: false,
    },
    metadata: {
      accountNumber: "4532-****-****-1234",
      notes: "Platinum credit card with rewards program",
    },
    createdAt: new Date("2022-06-01"),
    updatedAt: new Date("2024-01-15"),
  },
]

const MOCK_OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    id: "1",
    userId: "user1",
    strategyType: "debt_avalanche",
    priority: 1,
    description: "Pay off credit card first (19.9% interest) to save $2,400 annually",
    potentialSavings: 2400,
    timeToImplement: "Immediate",
    difficulty: "easy",
    loans: ["3"],
    actions: [
      {
        action: "Increase credit card payments",
        description: "Pay an extra $200/month towards credit card",
        impact: 2400,
        timeline: "Start immediately",
      },
    ],
  },
  {
    id: "2",
    userId: "user1",
    strategyType: "extra_payments",
    priority: 2,
    description: "Add $500/month to mortgage to save $89,000 in interest",
    potentialSavings: 89000,
    timeToImplement: "Next month",
    difficulty: "medium",
    loans: ["1"],
    actions: [
      {
        action: "Increase mortgage payments",
        description: "Add $500 monthly to principal payments",
        impact: 89000,
        timeline: "Next payment cycle",
      },
    ],
  },
  {
    id: "3",
    userId: "user1",
    strategyType: "refinance",
    priority: 3,
    description: "Refinance mortgage to 5.8% rate to save $315/month",
    potentialSavings: 113400,
    timeToImplement: "2-3 months",
    difficulty: "hard",
    loans: ["1"],
    actions: [
      {
        action: "Research refinancing options",
        description: "Compare rates from multiple lenders",
        impact: 113400,
        timeline: "Start research immediately",
      },
    ],
  },
]

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [showSetupWizard, setShowSetupWizard] = useState(false)

  const handleCreateLoan = () => {
    setShowSetupWizard(true)
  }

  const handleLoanCreated = (newLoan: Omit<Loan, "id" | "createdAt" | "updatedAt">) => {
    const loan: Loan = {
      ...newLoan,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setLoans((prev) => [...prev, loan])
    setShowSetupWizard(false)
  }

  const handleCancelSetup = () => {
    setShowSetupWizard(false)
  }

  return (
    <div>
      <LoanDashboard
        loans={loans}
        optimizationStrategies={MOCK_OPTIMIZATION_STRATEGIES}
        onCreateLoan={handleCreateLoan}
      />

      <Dialog open={showSetupWizard} onOpenChange={setShowSetupWizard}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <LoanSetupWizard onComplete={handleLoanCreated} onCancel={handleCancelSetup} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
