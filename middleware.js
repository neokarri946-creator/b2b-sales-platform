import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/analysis/new",
  "/api/create-checkout"
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/analysis",  // Allow demo analysis without auth
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect specific routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};