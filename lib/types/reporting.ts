export interface FinancialReport {
  id: string
  userId: string
  name: string
  type: ReportType
  period: ReportPeriod
  dateRange: {
    start: Date
    end: Date
  }
  filters: ReportFilters
  data: ReportData
  metadata: {
    generatedAt: Date
    version: string
    totalRecords: number
    processingTime: number
  }
  format: "json" | "csv" | "pdf" | "excel"
  status: "generating" | "completed" | "failed"
}

export type ReportType =
  | "income_statement"
  | "spending_analysis"
  | "budget_variance"
  | "loan_progress"
  | "net_worth"
  | "tax_summary"
  | "cash_flow"
  | "goal_progress"
  | "custom"

export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom"

export interface ReportFilters {
  categories?: string[]
  accounts?: string[]
  merchants?: string[]
  amountRange?: { min: number; max: number }
  transactionTypes?: string[]
  tags?: string[]
  goals?: string[]
  loans?: string[]
}

export interface ReportData {
  summary: ReportSummary
  details: ReportDetail[]
  charts: ChartData[]
  insights: ReportInsight[]
}

export interface ReportSummary {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number
  budgetVariance: number
  goalProgress: number
  debtReduction: number
  netWorthChange: number
}

export interface ReportDetail {
  id: string
  date: Date
  description: string
  category: string
  amount: number
  type: "income" | "expense" | "transfer"
  account?: string
  merchant?: string
  tags: string[]
  metadata: Record<string, any>
}

export interface ChartData {
  id: string
  type: "line" | "bar" | "pie" | "area" | "scatter"
  title: string
  data: ChartDataPoint[]
  config: ChartConfig
}

export interface ChartDataPoint {
  label: string
  value: number
  date?: Date
  category?: string
  color?: string
}

export interface ChartConfig {
  xAxis?: string
  yAxis?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  currency?: boolean
}

export interface ReportInsight {
  id: string
  type: "trend" | "anomaly" | "opportunity" | "warning"
  title: string
  description: string
  impact: "low" | "medium" | "high"
  actionable: boolean
  recommendations?: string[]
  data?: Record<string, any>
}

export interface CustomReportBuilder {
  id: string
  name: string
  description?: string
  dataSource: string[]
  columns: ReportColumn[]
  filters: ReportFilters
  groupBy?: string[]
  sortBy?: { column: string; direction: "asc" | "desc" }[]
  aggregations?: ReportAggregation[]
  visualizations?: ChartConfig[]
}

export interface ReportColumn {
  id: string
  name: string
  dataType: "string" | "number" | "date" | "boolean" | "currency"
  source: string
  transform?: string
  format?: string
  visible: boolean
  sortable: boolean
  filterable: boolean
}

export interface ReportAggregation {
  column: string
  function: "sum" | "avg" | "count" | "min" | "max" | "median"
  groupBy?: string
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf" | "json"
  includeCharts: boolean
  includeInsights: boolean
  compression: boolean
  encryption: boolean
  password?: string
  emailDelivery?: {
    enabled: boolean
    recipients: string[]
    subject?: string
    message?: string
  }
}

export interface TaxReport {
  id: string
  userId: string
  taxYear: number
  jurisdiction: string
  categories: TaxCategory[]
  deductions: TaxDeduction[]
  summary: TaxSummary
  generatedAt: Date
}

export interface TaxCategory {
  id: string
  name: string
  description: string
  totalAmount: number
  transactions: string[]
  isDeductible: boolean
  taxCode?: string
}

export interface TaxDeduction {
  id: string
  category: string
  description: string
  amount: number
  supportingDocuments: string[]
  confidence: number
}

export interface TaxSummary {
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  estimatedTax: number
  refundAmount?: number
}
