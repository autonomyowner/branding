import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { LandingPage } from "./pages/LandingPage"
import { DashboardPage } from "./pages/DashboardPage"
import { PostsPage } from "./pages/PostsPage"
import { CalendarPage } from "./pages/CalendarPage"
import { RoadmapPage } from "./pages/RoadmapPage"
import { DataProvider } from "./context/DataContext"

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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/roadmap1" element={<RoadmapPage />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}

export default App
