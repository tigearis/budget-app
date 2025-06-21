import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, DollarSign, Shield, TrendingUp, PieChart } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-between w-full">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>

              <div className="mt-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-bold">BudgetTracker Pro</h1>
                </div>

                <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome back to your financial journey</h2>

                <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                  Continue managing your finances with confidence. Track expenses, monitor loans, and achieve your
                  financial goals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Bank-Level Security</h3>
                  <p className="text-sm text-blue-100">Your data is encrypted and protected</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Insights</h3>
                  <p className="text-sm text-blue-100">AI-powered financial recommendations</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <PieChart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Complete Overview</h3>
                  <p className="text-sm text-blue-100">All your finances in one place</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-32 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>

              <div className="flex items-center gap-3 mt-6 mb-8">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">BudgetTracker Pro</h1>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up for free
                </Link>
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm",
                    socialButtonsBlockButtonText: "font-medium",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500 text-sm",
                    formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-sm",
                    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                    identityPreviewText: "text-gray-700",
                    identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  },
                }}
                redirectUrl="/dashboard"
                signUpUrl="/sign-up"
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
