import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, DollarSign, CheckCircle, Star, Users, Zap } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-between w-full">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-green-100 transition-colors"
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

                <h2 className="text-4xl font-bold mb-6 leading-tight">Start your financial transformation today</h2>

                <p className="text-xl text-green-100 mb-12 leading-relaxed">
                  Join thousands of users who have taken control of their finances with our comprehensive budgeting and
                  loan tracking platform.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">10K+</div>
                    <div className="text-sm text-green-100">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">$2M+</div>
                    <div className="text-sm text-green-100">Money Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">4.9★</div>
                    <div className="text-sm text-green-100">User Rating</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-200" />
                <span className="text-green-100">Free forever with premium features</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-200" />
                <span className="text-green-100">Bank-level security and encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-200" />
                <span className="text-green-100">AI-powered financial insights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-200" />
                <span className="text-green-100">24/7 customer support</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-32 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Right Side - Sign Up Form */}
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">BudgetTracker Pro</h1>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-green-600 hover:text-green-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Features Preview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">What you'll get:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Smart budgeting</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Loan tracking</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Goal setting</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>AI insights</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <SignUp
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
                    formFieldInput: "border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg",
                    formButtonPrimary:
                      "bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow-sm",
                    footerActionLink: "text-green-600 hover:text-green-700 font-medium",
                    identityPreviewText: "text-gray-700",
                    identityPreviewEditButton: "text-green-600 hover:text-green-700",
                  },
                }}
                redirectUrl="/dashboard"
                signInUrl="/sign-in"
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-green-600 hover:text-green-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-green-600 hover:text-green-700">
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
