import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ApolloWrapper } from "@/lib/apollo-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BudgetTracker Pro",
  description: "Professional budgeting and loan tracking application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get Clerk publishable key with fallback for build time
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder"

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ApolloWrapper>{children}</ApolloWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
