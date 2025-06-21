import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - BudgetTracker Pro",
  description: "Sign in or create your account to start managing your finances",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
