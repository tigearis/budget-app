"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Home,
  Car,
  User,
  CreditCard,
  Leaf,
  DollarSign,
  CalendarIcon,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import type { Loan, LoanType, PaymentFrequency, PaymentType } from "@/lib/types/loans"
import { LoanCalculator } from "@/lib/utils/loan-calculator"
import { format } from "date-fns"

interface LoanSetupWizardProps {
  onComplete: (loan: Omit<Loan, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

interface WizardStep {
  id: string
  title: string
  description: string
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "type",
    title: "Loan Type",
    description: "What type of loan are you adding?",
  },
  {
    id: "basic",
    title: "Basic Details",
    description: "Enter the loan amount and terms",
  },
  {
    id: "payment",
    title: "Payment Details",
    description: "Configure payment schedule and frequency",
  },
  {
    id: "features",
    title: "Loan Features",
    description: "Select available features and options",
  },
  {
    id: "review",
    title: "Review & Confirm",
    description: "Review your loan details before saving",
  },
]

const LOAN_TYPES = [
  {
    type: "mortgage" as LoanType,
    name: "Mortgage",
    description: "Home loan or investment property",
    icon: Home,
    color: "bg-blue-100 text-blue-700",
  },
  {
    type: "vehicle" as LoanType,
    name: "Vehicle Loan",
    description: "Car, motorcycle, or other vehicle",
    icon: Car,
    color: "bg-green-100 text-green-700",
  },
  {
    type: "personal" as LoanType,
    name: "Personal Loan",
    description: "Unsecured personal loan",
    icon: User,
    color: "bg-purple-100 text-purple-700",
  },
  {
    type: "credit_card" as LoanType,
    name: "Credit Card",
    description: "Credit card debt",
    icon: CreditCard,
    color: "bg-red-100 text-red-700",
  },
  {
    type: "green" as LoanType,
    name: "Green Loan",
    description: "Solar, energy efficiency, or eco-friendly",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    type: "line_of_credit" as LoanType,
    name: "Line of Credit",
    description: "Flexible credit facility",
    icon: DollarSign,
    color: "bg-orange-100 text-orange-700",
  },
]

export function LoanSetupWizard({ onComplete, onCancel }: LoanSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loanData, setLoanData] = useState<Partial<Loan>>({
    userId: "user1", // This would come from auth context
    status: "active",
    features: {
      hasRedraw: false,
      hasOffset: false,
      allowsExtraPayments: true,
      hasPaymentHoliday: false,
      isFixedRate: true,
      hasRateReview: false,
    },
    metadata: {},
  })

  const currentStepData = WIZARD_STEPS[currentStep]
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (isFormValid()) {
      // Calculate derived fields
      const termMonths = loanData.termMonths || 0
      const startDate = loanData.startDate || new Date()
      const maturityDate = new Date(startDate)
      maturityDate.setMonth(maturityDate.getMonth() + termMonths)

      const monthlyPayment = LoanCalculator.calculatePayment(
        loanData.principalAmount || 0,
        loanData.interestRate || 0,
        termMonths,
        loanData.paymentFrequency || "monthly",
      )

      const completeLoan: Omit<Loan, "id" | "createdAt" | "updatedAt"> = {
        ...loanData,
        name: loanData.name || `${LOAN_TYPES.find((t) => t.type === loanData.type)?.name} - ${loanData.lender}`,
        currentBalance: loanData.principalAmount || 0,
        remainingMonths: termMonths,
        minimumPayment: monthlyPayment,
        maturityDate,
        isInterestOnly: loanData.paymentType === "interest_only",
      } as Omit<Loan, "id" | "createdAt" | "updatedAt">

      onComplete(completeLoan)
    }
  }

  const isFormValid = () => {
    return (
      loanData.type &&
      loanData.name &&
      loanData.lender &&
      loanData.principalAmount &&
      loanData.interestRate &&
      loanData.termMonths &&
      loanData.paymentFrequency &&
      loanData.paymentType &&
      loanData.startDate
    )
  }

  const updateLoanData = (updates: Partial<Loan>) => {
    setLoanData((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>
              <Badge variant="outline">
                Step {currentStep + 1} of {WIZARD_STEPS.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && <LoanTypeStep loanData={loanData} updateLoanData={updateLoanData} />}
          {currentStep === 1 && <BasicDetailsStep loanData={loanData} updateLoanData={updateLoanData} />}
          {currentStep === 2 && <PaymentDetailsStep loanData={loanData} updateLoanData={updateLoanData} />}
          {currentStep === 3 && <FeaturesStep loanData={loanData} updateLoanData={updateLoanData} />}
          {currentStep === 4 && <ReviewStep loanData={loanData} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {currentStep < WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={!isFormValid()}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Loan
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step Components
function LoanTypeStep({
  loanData,
  updateLoanData,
}: { loanData: Partial<Loan>; updateLoanData: (updates: Partial<Loan>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Loan Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOAN_TYPES.map((loanType) => (
            <div
              key={loanType.type}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                loanData.type === loanType.type
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => updateLoanData({ type: loanType.type })}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${loanType.color}`}>
                  <loanType.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{loanType.name}</h4>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{loanType.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BasicDetailsStep({
  loanData,
  updateLoanData,
}: { loanData: Partial<Loan>; updateLoanData: (updates: Partial<Loan>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Loan Name</Label>
            <Input
              id="name"
              value={loanData.name || ""}
              onChange={(e) => updateLoanData({ name: e.target.value })}
              placeholder="e.g., Home Loan - Main Residence"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lender">Lender</Label>
            <Input
              id="lender"
              value={loanData.lender || ""}
              onChange={(e) => updateLoanData({ lender: e.target.value })}
              placeholder="e.g., Commonwealth Bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="principalAmount">Loan Amount</Label>
            <Input
              id="principalAmount"
              type="number"
              value={loanData.principalAmount || ""}
              onChange={(e) => updateLoanData({ principalAmount: Number(e.target.value) })}
              placeholder="500000"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={loanData.interestRate || ""}
              onChange={(e) => updateLoanData({ interestRate: Number(e.target.value) })}
              placeholder="6.50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termMonths">Loan Term (Months)</Label>
            <Input
              id="termMonths"
              type="number"
              value={loanData.termMonths || ""}
              onChange={(e) => updateLoanData({ termMonths: Number(e.target.value) })}
              placeholder="360"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {loanData.startDate ? format(loanData.startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={loanData.startDate}
                  onSelect={(date) => updateLoanData({ startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentDetailsStep({
  loanData,
  updateLoanData,
}: { loanData: Partial<Loan>; updateLoanData: (updates: Partial<Loan>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select
              value={loanData.paymentFrequency || ""}
              onValueChange={(value: PaymentFrequency) => updateLoanData({ paymentFrequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select
              value={loanData.paymentType || ""}
              onValueChange={(value: PaymentType) => updateLoanData({ paymentType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principal_and_interest">Principal & Interest</SelectItem>
                <SelectItem value="interest_only">Interest Only</SelectItem>
                <SelectItem value="minimum_payment">Minimum Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loanData.paymentType === "interest_only" && (
            <div className="space-y-2">
              <Label htmlFor="interestOnlyPeriod">Interest Only Period (Months)</Label>
              <Input
                id="interestOnlyPeriod"
                type="number"
                value={loanData.interestOnlyPeriod || ""}
                onChange={(e) => updateLoanData({ interestOnlyPeriod: Number(e.target.value) })}
                placeholder="60"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Calculated Payment</h4>
            {loanData.principalAmount && loanData.interestRate && loanData.termMonths && loanData.paymentFrequency ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <span className="font-semibold">
                    $
                    {LoanCalculator.calculatePayment(
                      loanData.principalAmount,
                      loanData.interestRate,
                      loanData.termMonths,
                      loanData.paymentFrequency,
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Frequency:</span>
                  <span className="capitalize">{loanData.paymentFrequency}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete the basic details to see calculated payment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturesStep({
  loanData,
  updateLoanData,
}: { loanData: Partial<Loan>; updateLoanData: (updates: Partial<Loan>) => void }) {
  const updateFeatures = (featureUpdates: Partial<typeof loanData.features>) => {
    updateLoanData({
      features: { ...loanData.features, ...featureUpdates },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Loan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hasRedraw">Redraw Facility</Label>
                <p className="text-sm text-muted-foreground">Access to extra payments made</p>
              </div>
              <Switch
                id="hasRedraw"
                checked={loanData.features?.hasRedraw || false}
                onCheckedChange={(checked) => updateFeatures({ hasRedraw: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hasOffset">Offset Account</Label>
                <p className="text-sm text-muted-foreground">Savings account linked to loan</p>
              </div>
              <Switch
                id="hasOffset"
                checked={loanData.features?.hasOffset || false}
                onCheckedChange={(checked) => updateFeatures({ hasOffset: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowsExtraPayments">Extra Payments</Label>
                <p className="text-sm text-muted-foreground">Make additional payments</p>
              </div>
              <Switch
                id="allowsExtraPayments"
                checked={loanData.features?.allowsExtraPayments || false}
                onCheckedChange={(checked) => updateFeatures({ allowsExtraPayments: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hasPaymentHoliday">Payment Holiday</Label>
                <p className="text-sm text-muted-foreground">Option to pause payments</p>
              </div>
              <Switch
                id="hasPaymentHoliday"
                checked={loanData.features?.hasPaymentHoliday || false}
                onCheckedChange={(checked) => updateFeatures({ hasPaymentHoliday: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isFixedRate">Fixed Interest Rate</Label>
                <p className="text-sm text-muted-foreground">Rate is fixed for loan term</p>
              </div>
              <Switch
                id="isFixedRate"
                checked={loanData.features?.isFixedRate || false}
                onCheckedChange={(checked) => updateFeatures({ isFixedRate: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hasRateReview">Rate Review Option</Label>
                <p className="text-sm text-muted-foreground">Periodic rate reviews available</p>
              </div>
              <Switch
                id="hasRateReview"
                checked={loanData.features?.hasRateReview || false}
                onCheckedChange={(checked) => updateFeatures({ hasRateReview: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={loanData.metadata?.accountNumber || ""}
              onChange={(e) =>
                updateLoanData({
                  metadata: { ...loanData.metadata, accountNumber: e.target.value },
                })
              }
              placeholder="123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bsb">BSB</Label>
            <Input
              id="bsb"
              value={loanData.metadata?.bsb || ""}
              onChange={(e) =>
                updateLoanData({
                  metadata: { ...loanData.metadata, bsb: e.target.value },
                })
              }
              placeholder="123-456"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={loanData.metadata?.notes || ""}
            onChange={(e) =>
              updateLoanData({
                metadata: { ...loanData.metadata, notes: e.target.value },
              })
            }
            placeholder="Any additional notes about this loan..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

function ReviewStep({ loanData }: { loanData: Partial<Loan> }) {
  const loanType = LOAN_TYPES.find((t) => t.type === loanData.type)
  const monthlyPayment =
    loanData.principalAmount && loanData.interestRate && loanData.termMonths && loanData.paymentFrequency
      ? LoanCalculator.calculatePayment(
          loanData.principalAmount,
          loanData.interestRate,
          loanData.termMonths,
          loanData.paymentFrequency,
        )
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Type:</span>
                <div className="flex items-center gap-2">
                  {loanType && <loanType.icon className="h-4 w-4" />}
                  <span>{loanType?.name}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{loanData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lender:</span>
                <span>{loanData.lender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span>${loanData.principalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span>{loanData.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term:</span>
                <span>{loanData.termMonths} months</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount:</span>
                <span className="font-semibold">${monthlyPayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="capitalize">{loanData.paymentFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type:</span>
                <span className="capitalize">{loanData.paymentType?.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span>{loanData.startDate ? format(loanData.startDate, "PPP") : "Not set"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(loanData.features || {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
