import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react"
import { DataProvider } from "./context/DataContext"
import { SubscriptionProvider, useSubscription } from "./context/SubscriptionContext"
import { UpgradeModal } from "./components/UpgradeModal"
import { PageViewTracker } from "./components/PageViewTracker"

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY - Auth will not work')
}

// Lazy load route components for better performance
const LandingPage = lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })))
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })))
const PostsPage = lazy(() => import("./pages/PostsPage").then(m => ({ default: m.PostsPage })))
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(m => ({ default: m.CalendarPage })))
const RoadmapPage = lazy(() => import("./pages/RoadmapPage").then(m => ({ default: m.RoadmapPage })))
const SignInPage = lazy(() => import("./pages/SignInPage").then(m => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import("./pages/SignUpPage").then(m => ({ default: m.SignUpPage })))
const SSOCallback = lazy(() => import("./pages/SSOCallback").then(m => ({ default: m.SSOCallback })))
const AdminPage = lazy(() => import("./pages/AdminPage").then(m => ({ default: m.AdminPage })))

// Global upgrade modal component
function GlobalUpgradeModal() {
  const { showUpgradeModal, closeUpgradeModal, upgradeModalTrigger } = useSubscription()
  return (
    <UpgradeModal
      isOpen={showUpgradeModal}
      onClose={closeUpgradeModal}
      trigger={upgradeModalTrigger}
    />
  )
}

function AppContent() {
  const { i18n } = useTranslation()
  const { checkAndResetMonthly } = useSubscription()

  useEffect(() => {
    const currentLang = i18n.language
    const isRTL = currentLang === 'ar'

    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = currentLang
  }, [i18n.language])

  // Check and reset monthly counts on app load
  useEffect(() => {
    checkAndResetMonthly()
  }, [checkAndResetMonthly])

  return (
    <>
      <BrowserRouter>
        <PageViewTracker />
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/roadmap1" element={<RoadmapPage />} />

            {/* Auth routes */}
            <Route path="/sign-in" element={<AuthRoute><SignInPage /></AuthRoute>} />
            <Route path="/sign-in/sso-callback" element={<SSOCallback />} />
            <Route path="/sign-up" element={<AuthRoute><SignUpPage /></AuthRoute>} />
            <Route path="/sign-up/sso-callback" element={<SSOCallback />} />
            <Route path="/sso-callback" element={<SSOCallback />} />

            {/* Protected routes - require sign in */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/posts" element={
              <ProtectedRoute><PostsPage /></ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute><CalendarPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <GlobalUpgradeModal />
    </>
  )
}

// Protected route wrapper - redirects to sign-in if not authenticated
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
    </>
  )
}

// Auth route wrapper - redirects to dashboard if already signed in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Fallback content when Clerk is not configured
function NoAuthFallback() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/roadmap1" element={<RoadmapPage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center p-8">
                <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                <p className="text-muted-foreground mb-4">Please configure Clerk to access this page.</p>
                <a href="/" className="text-primary hover:underline">Go to Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function App() {
  // If Clerk is not configured, show limited functionality
  if (!CLERK_PUBLISHABLE_KEY) {
    return <NoAuthFallback />
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <DataProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </DataProvider>
    </ClerkProvider>
  )
}

export default App
