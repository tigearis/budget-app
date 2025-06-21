"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, AlertCircle, FileText, Search, Database, Shield, Clock } from "lucide-react"

interface ProcessingStep {
  id: string
  name: string
  description: string
  status: "pending" | "processing" | "completed" | "failed"
  icon: React.ComponentType<any>
  duration?: number
  error?: string
}

interface ProcessingStatusProps {
  currentStep: string
  steps: ProcessingStep[]
  overallProgress: number
  isProcessing: boolean
  error?: string
}

export function ProcessingStatus({ currentStep, steps, overallProgress, isProcessing, error }: ProcessingStatusProps) {
  const getStepIcon = (step: ProcessingStep) => {
    const IconComponent = step.icon

    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <IconComponent className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadge = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Processing
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">{getStepIcon(step)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{step.name}</h4>
                  {getStepBadge(step.status)}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>

                {step.status === "processing" && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                )}

                {step.error && <p className="text-sm text-red-600 mt-1">{step.error}</p>}

                {step.duration && step.status === "completed" && (
                  <p className="text-xs text-gray-500 mt-1">Completed in {step.duration}ms</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm font-medium">Processing your bank statement...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Default processing steps
export const DEFAULT_PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: "upload",
    name: "File Upload",
    description: "Securely uploading and encrypting your bank statement",
    status: "pending",
    icon: Shield,
  },
  {
    id: "parsing",
    name: "File Parsing",
    description: "Reading and extracting data from your statement",
    status: "pending",
    icon: FileText,
  },
  {
    id: "ocr",
    name: "OCR Processing",
    description: "Converting PDF content to readable text (if applicable)",
    status: "pending",
    icon: Search,
  },
  {
    id: "mapping",
    name: "Data Mapping",
    description: "Applying bank-specific formatting rules",
    status: "pending",
    icon: Database,
  },
  {
    id: "deduplication",
    name: "Duplicate Detection",
    description: "Checking for duplicate transactions",
    status: "pending",
    icon: CheckCircle,
  },
  {
    id: "saving",
    name: "Saving Transactions",
    description: "Storing processed transactions in your account",
    status: "pending",
    icon: Database,
  },
]
