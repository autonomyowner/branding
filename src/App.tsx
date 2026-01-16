import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"
import { DataProvider } from "./context/DataContext"
import { SubscriptionProvider, useSubscription } from "./context/SubscriptionContext"
import { UpgradeModal } from "./components/UpgradeModal"

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
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/roadmap1" element={<RoadmapPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <GlobalUpgradeModal />
    </>
  )
}

// Protected route wrapper - export for use with protected routes
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  )
}

function App() {
  // If Clerk is not configured, fall back to local-only mode
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <DataProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </DataProvider>
    )
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <DataProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </DataProvider>
    </ClerkProvider>
  )
}

export default App
