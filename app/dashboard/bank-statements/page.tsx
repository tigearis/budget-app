"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadDropzone } from "@/components/bank-statement/file-upload-dropzone"
import { BankSelector } from "@/components/bank-statement/bank-selector"
import { ProcessingStatus, DEFAULT_PROCESSING_STEPS } from "@/components/bank-statement/processing-status"
import { TransactionPreview } from "@/components/bank-statement/transaction-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, ArrowRight, History, Settings } from "lucide-react"
import type { AustralianBank, RawTransaction } from "@/lib/types/bank-processing"
import { parseCSVFile, parseOFXFile, parseQIFFile } from "@/lib/utils/file-parsers"
import { processPDFWithOCR, extractTransactionsFromOCRText } from "@/lib/utils/ocr-processor"
import { detectDuplicates } from "@/lib/utils/duplicate-detection"
import { encryptFile, generateSecureFileName } from "@/lib/utils/file-encryption"

interface ProcessingState {
  step: string
  progress: number
  isProcessing: boolean
  error?: string
  steps: typeof DEFAULT_PROCESSING_STEPS
}

export default function BankStatementsPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedBank, setSelectedBank] = useState<AustralianBank>()
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: "upload",
    progress: 0,
    isProcessing: false,
    steps: DEFAULT_PROCESSING_STEPS,
  })
  const [extractedTransactions, setExtractedTransactions] = useState<RawTransaction[]>([])
  const [processingComplete, setProcessingComplete] = useState(false)

  const updateProcessingStep = (stepId: string, status: "processing" | "completed" | "failed", error?: string) => {
    setProcessingState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId
          ? { ...step, status, error, duration: status === "completed" ? Date.now() : undefined }
          : step,
      ),
      step: stepId,
      error: status === "failed" ? error : undefined,
    }))
  }

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    if (files.length > 0) {
      // Auto-detect supported formats for bank selector
      const formats = files.map((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase()
        return extension || ""
      })
      setActiveTab("bank-selection")
    }
  }

  const handleBankSelected = (bank: AustralianBank) => {
    setSelectedBank(bank)
    setActiveTab("processing")
  }

  const processFiles = async () => {
    if (!selectedBank || selectedFiles.length === 0) return

    setProcessingState((prev) => ({ ...prev, isProcessing: true, progress: 0 }))

    try {
      // Step 1: Upload and encrypt files
      updateProcessingStep("upload", "processing")
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate upload

      for (const file of selectedFiles) {
        const buffer = await file.arrayBuffer()
        const { encryptedData, iv } = encryptFile(Buffer.from(buffer))
        const secureFileName = generateSecureFileName(file.name)
        // In real app, save to secure storage
      }

      updateProcessingStep("upload", "completed")
      setProcessingState((prev) => ({ ...prev, progress: 16 }))

      // Step 2: Parse files
      updateProcessingStep("parsing", "processing")
      let allTransactions: RawTransaction[] = []

      for (const file of selectedFiles) {
        const fileContent = await file.text()
        const fileExtension = file.name.split(".").pop()?.toLowerCase()

        let transactions: RawTransaction[] = []

        switch (fileExtension) {
          case "csv":
            const csvMapping = selectedBank.defaultMappings.find((m) => m.fileType === "csv")
            if (csvMapping) {
              transactions = await parseCSVFile(fileContent, csvMapping)
            }
            break
          case "ofx":
            transactions = await parseOFXFile(fileContent)
            break
          case "qif":
            transactions = await parseQIFFile(fileContent)
            break
          case "pdf":
            // Step 3: OCR Processing
            updateProcessingStep("ocr", "processing")
            const ocrResult = await processPDFWithOCR(Buffer.from(await file.arrayBuffer()))
            const ocrTransactions = extractTransactionsFromOCRText(ocrResult.text, selectedBank)

            // Convert OCR results to RawTransaction format
            transactions = ocrTransactions.map((txn) => ({
              id: crypto.randomUUID(),
              statementId: "",
              userId: "",
              rawData: txn,
              parsedData: {
                date: new Date(txn.date),
                description: txn.description,
                amount: Number.parseFloat(txn.amount.replace(/[$,]/g, "")),
                balance: txn.balance ? Number.parseFloat(txn.balance.replace(/[$,]/g, "")) : undefined,
              },
              isDuplicate: false,
              processingStatus: "pending",
              createdAt: new Date(),
            }))
            updateProcessingStep("ocr", "completed")
            break
        }

        allTransactions = [...allTransactions, ...transactions]
      }

      updateProcessingStep("parsing", "completed")
      setProcessingState((prev) => ({ ...prev, progress: 50 }))

      // Step 4: Data Mapping
      updateProcessingStep("mapping", "processing")
      await new Promise((resolve) => setTimeout(resolve, 800))
      updateProcessingStep("mapping", "completed")
      setProcessingState((prev) => ({ ...prev, progress: 66 }))

      // Step 5: Duplicate Detection
      updateProcessingStep("deduplication", "processing")
      const existingTransactions: RawTransaction[] = [] // In real app, fetch from database
      const transactionsWithDuplicates = detectDuplicates(allTransactions, existingTransactions)
      updateProcessingStep("deduplication", "completed")
      setProcessingState((prev) => ({ ...prev, progress: 83 }))

      // Step 6: Ready for review
      updateProcessingStep("saving", "processing")
      setExtractedTransactions(transactionsWithDuplicates)
      await new Promise((resolve) => setTimeout(resolve, 500))
      updateProcessingStep("saving", "completed")
      setProcessingState((prev) => ({ ...prev, progress: 100, isProcessing: false }))

      setProcessingComplete(true)
      setActiveTab("preview")
    } catch (error) {
      console.error("Processing error:", error)
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }))
    }
  }

  const handleSaveTransactions = async (transactions: RawTransaction[]) => {
    try {
      // In real app, save to database via GraphQL mutation
      console.log("Saving transactions:", transactions)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset state for next upload
      setSelectedFiles([])
      setSelectedBank(undefined)
      setExtractedTransactions([])
      setProcessingComplete(false)
      setProcessingState({
        step: "upload",
        progress: 0,
        isProcessing: false,
        steps: DEFAULT_PROCESSING_STEPS,
      })
      setActiveTab("upload")

      // Show success message
      alert(`Successfully imported ${transactions.length} transactions!`)
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save transactions. Please try again.")
    }
  }

  const getSupportedFormats = () => {
    if (selectedFiles.length === 0) return []
    return selectedFiles.map((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase()
      return extension || ""
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bank Statement Processing</h1>
        <p className="text-muted-foreground">
          Upload and process your bank statements to automatically import transactions
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${activeTab === "upload" ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedFiles.length > 0 ? "bg-green-100 text-green-600" : "bg-gray-100"
                  }`}
                >
                  {selectedFiles.length > 0 ? <CheckCircle className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                </div>
                <span className="font-medium">Upload</span>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400" />

              <div
                className={`flex items-center gap-2 ${activeTab === "bank-selection" ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedBank ? "bg-green-100 text-green-600" : "bg-gray-100"
                  }`}
                >
                  {selectedBank ? <CheckCircle className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                </div>
                <span className="font-medium">Bank Selection</span>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400" />

              <div
                className={`flex items-center gap-2 ${activeTab === "processing" ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    processingComplete ? "bg-green-100 text-green-600" : "bg-gray-100"
                  }`}
                >
                  {processingComplete ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <span className="font-medium">Processing</span>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400" />

              <div className={`flex items-center gap-2 ${activeTab === "preview" ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    extractedTransactions.length > 0 ? "bg-green-100 text-green-600" : "bg-gray-100"
                  }`}
                >
                  <History className="h-4 w-4" />
                </div>
                <span className="font-medium">Review</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="bank-selection" disabled={selectedFiles.length === 0}>
            Select Bank
          </TabsTrigger>
          <TabsTrigger value="processing" disabled={!selectedBank}>
            Process
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={extractedTransactions.length === 0}>
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <FileUploadDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            acceptedFormats={[".pdf", ".csv", ".ofx", ".qif"]}
            isProcessing={processingState.isProcessing}
          />

          {selectedFiles.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedFiles.length} file(s) selected. Click "Select Bank" to continue.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="bank-selection" className="space-y-4">
          <BankSelector
            selectedBank={selectedBank}
            onBankSelect={handleBankSelected}
            supportedFormats={getSupportedFormats()}
          />
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Processing Summary</CardTitle>
                <CardDescription>Files ready for processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Bank:</span>
                    <Badge variant="secondary">{selectedBank?.name}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Files to Process:</span>
                    <Badge variant="outline">{selectedFiles.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Size:</span>
                    <span>{(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>

                {!processingState.isProcessing && !processingComplete && (
                  <Button onClick={processFiles} className="w-full">
                    Start Processing
                  </Button>
                )}
              </CardContent>
            </Card>

            <ProcessingStatus
              currentStep={processingState.step}
              steps={processingState.steps}
              overallProgress={processingState.progress}
              isProcessing={processingState.isProcessing}
              error={processingState.error}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {extractedTransactions.length > 0 && (
            <TransactionPreview
              transactions={extractedTransactions}
              onTransactionsUpdate={setExtractedTransactions}
              onSaveTransactions={handleSaveTransactions}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
