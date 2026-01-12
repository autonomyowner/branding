import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { DataProvider } from "./context/DataContext"

// Lazy load route components for better performance
const LandingPage = lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })))
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })))
const PostsPage = lazy(() => import("./pages/PostsPage").then(m => ({ default: m.PostsPage })))
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(m => ({ default: m.CalendarPage })))
const RoadmapPage = lazy(() => import("./pages/RoadmapPage").then(m => ({ default: m.RoadmapPage })))

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const currentLang = i18n.language
    const isRTL = currentLang === 'ar'

    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = currentLang
  }, [i18n.language])

  return (
    <DataProvider>
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
    </DataProvider>
  )
}

export default App
