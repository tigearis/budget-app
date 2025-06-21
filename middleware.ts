import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"])

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/settings(.*)", "/profile(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // If user is not signed in and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If user is signed in and trying to access public route, redirect to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
