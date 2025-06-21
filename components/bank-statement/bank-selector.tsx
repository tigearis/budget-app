"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AUSTRALIAN_BANKS } from "@/lib/constants/australian-banks"
import type { AustralianBank } from "@/lib/types/bank-processing"
import { Building2, CheckCircle } from "lucide-react"
import Image from "next/image"

interface BankSelectorProps {
  selectedBank?: AustralianBank
  onBankSelect: (bank: AustralianBank) => void
  supportedFormats?: string[]
}

export function BankSelector({ selectedBank, onBankSelect, supportedFormats = [] }: BankSelectorProps) {
  const [selectedBankId, setSelectedBankId] = useState<string>(selectedBank?.id || "")

  const filteredBanks =
    supportedFormats.length > 0
      ? AUSTRALIAN_BANKS.filter((bank) => bank.supportedFormats.some((format) => supportedFormats.includes(format)))
      : AUSTRALIAN_BANKS

  const handleBankSelect = (bankId: string) => {
    setSelectedBankId(bankId)
    const bank = AUSTRALIAN_BANKS.find((b) => b.id === bankId)
    if (bank) {
      onBankSelect(bank)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Select Your Bank
        </CardTitle>
        <CardDescription>Choose your bank to apply the correct statement format mapping</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedBankId} onValueChange={handleBankSelect}>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBanks.map((bank) => (
              <div key={bank.id} className="relative">
                <Label
                  htmlFor={bank.id}
                  className={`
                    flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors
                    ${
                      selectedBankId === bank.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <RadioGroupItem value={bank.id} id={bank.id} />

                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image
                        src={bank.logo || "/placeholder.svg"}
                        alt={`${bank.name} logo`}
                        width={32}
                        height={32}
                        className="rounded"
                        onError={(e) => {
                          // Fallback to icon if logo fails to load
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-sm text-gray-500">Code: {bank.code}</div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {bank.supportedFormats.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedBankId === bank.id && <CheckCircle className="h-5 w-5 text-blue-500" />}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {selectedBank && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Bank Selected: {selectedBank.name}</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              We'll use the optimized parsing rules for {selectedBank.name} statements.
            </p>
          </div>
        )}

        {filteredBanks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No banks support the uploaded file format.</p>
            <p className="text-sm mt-1">Please check your file format and try again.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
