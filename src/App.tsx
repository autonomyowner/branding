import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { DataProvider } from "./context/DataContext"
import { SubscriptionProvider, useSubscription } from "./context/SubscriptionContext"
import { UpgradeModal } from "./components/UpgradeModal"

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

function App() {
  return (
    <DataProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </DataProvider>
  )
}

export default App
