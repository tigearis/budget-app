import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, Smartphone, BarChart3, CreditCard, PiggyBank, Target } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBank className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">BudgetTracker Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Get Started</Button>
            </SignUpButton>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          🚀 New: Advanced Loan Tracking Features
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Master Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {" "}
            Financial Future
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Take control of your finances with our comprehensive budgeting and loan tracking platform. Monitor expenses,
          track loans, and achieve your financial goals with intelligent insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Free Trial
            </Button>
          </SignUpButton>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to help you manage your money like a pro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Smart Budgeting</CardTitle>
              <CardDescription>
                Create and manage budgets with intelligent categorization and spending insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Loan Tracking</CardTitle>
              <CardDescription>Monitor all your loans, track payments, and visualize payoff schedules</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>Get detailed insights into your spending patterns and financial health</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Goal Setting</CardTitle>
              <CardDescription>
                Set and track financial goals with milestone tracking and progress visualization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Bank-Level Security</CardTitle>
              <CardDescription>
                Your financial data is protected with enterprise-grade security and encryption
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Mobile Ready</CardTitle>
              <CardDescription>
                Access your financial dashboard anywhere with our responsive mobile design
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Finances?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have taken control of their financial future
            </p>
            <SignUpButton mode="modal">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Your Free Trial Today
              </Button>
            </SignUpButton>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <PiggyBank className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">BudgetTracker Pro</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">© 2024 BudgetTracker Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
