import type { BankMappingConfig, RawTransaction } from "@/lib/types/bank-processing"

export async function parseCSVFile(fileContent: string, mapping: BankMappingConfig): Promise<RawTransaction[]> {
  const lines = fileContent.split("\n")
  const { mappingRules } = mapping

  // Skip header rows
  const dataLines = lines.slice(mappingRules.skipRows || 0)
  const headers = dataLines[0]?.split(mappingRules.csvDelimiter || ",") || []

  const transactions: RawTransaction[] = []

  for (let i = 1; i < dataLines.length; i++) {
    const line = dataLines[i].trim()
    if (!line) continue

    const values = line.split(mappingRules.csvDelimiter || ",")
    const rawData: Record<string, any> = {}

    headers.forEach((header, index) => {
      rawData[header.trim()] = values[index]?.trim() || ""
    })

    try {
      const parsedData = {
        date: parseDate(rawData[mappingRules.dateField], mappingRules.dateFormat),
        description: rawData[mappingRules.descriptionField] || "",
        amount: parseAmount(rawData, mappingRules),
        balance: mappingRules.balanceField ? Number.parseFloat(rawData[mappingRules.balanceField]) : undefined,
        reference: mappingRules.referenceField ? rawData[mappingRules.referenceField] : undefined,
      }

      transactions.push({
        id: crypto.randomUUID(),
        statementId: "",
        userId: "",
        rawData,
        parsedData,
        isDuplicate: false,
        processingStatus: "pending",
        createdAt: new Date(),
      })
    } catch (error) {
      console.error("Error parsing transaction:", error, rawData)
    }
  }

  return transactions
}

export async function parseOFXFile(fileContent: string): Promise<RawTransaction[]> {
  // Basic OFX parsing - you might want to use a dedicated library
  const transactions: RawTransaction[] = []
  const stmtTrnRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs
  const matches = fileContent.match(stmtTrnRegex)

  if (matches) {
    matches.forEach((match) => {
      const dtposted = match.match(/<DTPOSTED>(\d+)/)?.[1]
      const trnamt = match.match(/<TRNAMT>([-\d.]+)/)?.[1]
      const name = match.match(/<NAME>(.*?)<\/NAME>/)?.[1]
      const memo = match.match(/<MEMO>(.*?)<\/MEMO>/)?.[1]

      if (dtposted && trnamt) {
        transactions.push({
          id: crypto.randomUUID(),
          statementId: "",
          userId: "",
          rawData: { dtposted, trnamt, name, memo },
          parsedData: {
            date: parseOFXDate(dtposted),
            description: name || memo || "",
            amount: Number.parseFloat(trnamt),
          },
          isDuplicate: false,
          processingStatus: "pending",
          createdAt: new Date(),
        })
      }
    })
  }

  return transactions
}

export async function parseQIFFile(fileContent: string): Promise<RawTransaction[]> {
  const transactions: RawTransaction[] = []
  const lines = fileContent.split("\n")
  let currentTransaction: any = {}

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    const code = trimmedLine.charAt(0)
    const value = trimmedLine.substring(1)

    switch (code) {
      case "D": // Date
        currentTransaction.date = parseQIFDate(value)
        break
      case "T": // Amount
        currentTransaction.amount = Number.parseFloat(value)
        break
      case "P": // Payee
        currentTransaction.description = value
        break
      case "M": // Memo
        currentTransaction.memo = value
        break
      case "^": // End of transaction
        if (currentTransaction.date && currentTransaction.amount !== undefined) {
          transactions.push({
            id: crypto.randomUUID(),
            statementId: "",
            userId: "",
            rawData: { ...currentTransaction },
            parsedData: {
              date: currentTransaction.date,
              description: currentTransaction.description || currentTransaction.memo || "",
              amount: currentTransaction.amount,
            },
            isDuplicate: false,
            processingStatus: "pending",
            createdAt: new Date(),
          })
        }
        currentTransaction = {}
        break
    }
  }

  return transactions
}

function parseDate(dateString: string, format: string): Date {
  // Simple date parsing - you might want to use a library like date-fns
  const cleanDate = dateString.replace(/['"]/g, "").trim()

  switch (format) {
    case "DD/MM/YYYY":
      const [day, month, year] = cleanDate.split("/")
      return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    case "YYYY-MM-DD":
      return new Date(cleanDate)
    case "DD MMM YYYY":
      return new Date(cleanDate)
    default:
      return new Date(cleanDate)
  }
}

function parseAmount(rawData: Record<string, any>, mappingRules: BankMappingConfig["mappingRules"]): number {
  switch (mappingRules.amountFormat) {
    case "positive_negative":
      return Number.parseFloat(rawData[mappingRules.amountField]) || 0
    case "debit_credit":
      const debit = Number.parseFloat(rawData["Debit Amount"] || rawData[mappingRules.amountField]) || 0
      const credit = Number.parseFloat(rawData["Credit Amount"] || rawData[mappingRules.amountField]) || 0
      return credit - debit
    default:
      return Number.parseFloat(rawData[mappingRules.amountField]) || 0
  }
}

function parseOFXDate(dateString: string): Date {
  // OFX date format: YYYYMMDDHHMMSS
  const year = Number.parseInt(dateString.substring(0, 4))
  const month = Number.parseInt(dateString.substring(4, 6)) - 1
  const day = Number.parseInt(dateString.substring(6, 8))
  return new Date(year, month, day)
}

function parseQIFDate(dateString: string): Date {
  // QIF date format can vary, common formats: MM/DD/YYYY, DD/MM/YYYY
  const parts = dateString.split("/")
  if (parts.length === 3) {
    // Assume MM/DD/YYYY for now
    return new Date(Number.parseInt(parts[2]), Number.parseInt(parts[0]) - 1, Number.parseInt(parts[1]))
  }
  return new Date(dateString)
}
