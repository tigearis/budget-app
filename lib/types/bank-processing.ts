export interface BankStatement {
  id: string
  userId: string
  bankId: string
  fileName: string
  fileType: "pdf" | "csv" | "ofx" | "qif"
  fileSize: number
  encryptedFilePath: string
  uploadDate: Date
  processingStatus: "pending" | "processing" | "completed" | "failed"
  processingError?: string
  transactionCount: number
  statementPeriod: {
    startDate: Date
    endDate: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface RawTransaction {
  id: string
  statementId: string
  userId: string
  rawData: Record<string, any>
  parsedData: {
    date: Date
    description: string
    amount: number
    balance?: number
    reference?: string
    category?: string
  }
  isDuplicate: boolean
  duplicateOf?: string
  processingStatus: "pending" | "processed" | "ignored"
  createdAt: Date
}

export interface BankMappingConfig {
  id: string
  bankId: string
  bankName: string
  fileType: "pdf" | "csv" | "ofx" | "qif"
  mappingRules: {
    dateField: string
    descriptionField: string
    amountField: string
    balanceField?: string
    referenceField?: string
    dateFormat: string
    amountFormat: "positive_negative" | "debit_credit" | "single_column"
    csvDelimiter?: string
    skipRows?: number
    headerRow?: number
  }
  ocrConfig?: {
    datePattern: RegExp
    amountPattern: RegExp
    descriptionPattern: RegExp
    tableDetection: boolean
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProcessingLog {
  id: string
  statementId: string
  userId: string
  step: "upload" | "parsing" | "ocr" | "mapping" | "deduplication" | "saving"
  status: "started" | "completed" | "failed"
  message: string
  details?: Record<string, any>
  timestamp: Date
}

export interface AustralianBank {
  id: string
  name: string
  code: string
  logo: string
  supportedFormats: ("pdf" | "csv" | "ofx" | "qif")[]
  defaultMappings: BankMappingConfig[]
}
