import type { RawTransaction } from "@/lib/types/bank-processing"

export interface DuplicateDetectionConfig {
  dateThreshold: number // days
  amountThreshold: number // percentage
  descriptionSimilarity: number // percentage
}

export function detectDuplicates(
  newTransactions: RawTransaction[],
  existingTransactions: RawTransaction[],
  config: DuplicateDetectionConfig = {
    dateThreshold: 1,
    amountThreshold: 0.01,
    descriptionSimilarity: 0.8,
  },
): RawTransaction[] {
  return newTransactions.map((newTxn) => {
    const duplicate = existingTransactions.find((existingTxn) => {
      return isDuplicateTransaction(newTxn, existingTxn, config)
    })

    if (duplicate) {
      return {
        ...newTxn,
        isDuplicate: true,
        duplicateOf: duplicate.id,
      }
    }

    return newTxn
  })
}

function isDuplicateTransaction(txn1: RawTransaction, txn2: RawTransaction, config: DuplicateDetectionConfig): boolean {
  // Check date similarity
  const dateDiff = Math.abs(txn1.parsedData.date.getTime() - txn2.parsedData.date.getTime()) / (1000 * 60 * 60 * 24) // Convert to days

  if (dateDiff > config.dateThreshold) {
    return false
  }

  // Check amount similarity
  const amountDiff = Math.abs(txn1.parsedData.amount - txn2.parsedData.amount)
  const amountThreshold = Math.abs(txn1.parsedData.amount) * config.amountThreshold

  if (amountDiff > amountThreshold) {
    return false
  }

  // Check description similarity
  const similarity = calculateStringSimilarity(txn1.parsedData.description, txn2.parsedData.description)

  return similarity >= config.descriptionSimilarity
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) {
    return 1.0
  }

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}
