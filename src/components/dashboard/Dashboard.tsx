import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { StatsCards } from "./StatsCards"
import { RecentPosts } from "./RecentPosts"
import { QuickActions } from "./QuickActions"
import { BrandSelector } from "./BrandSelector"
import { ContentCalendarPreview } from "./ContentCalendarPreview"
import { GenerateModal } from "./GenerateModal"
import { BrandModal } from "./BrandModal"
import { useData } from "../../context/DataContext"
import { Logo } from "../ui/Logo"

export function Dashboard() {
  const { t } = useTranslation()
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const { settings } = useData()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm text-white font-medium">{t('nav.dashboard')}</a>
              <a href="/posts" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.posts')}</a>
              <a href="/calendar" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.calendar')}</a>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                {t('dashboard.generate')}
              </button>
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                {t('dashboard.brands')}
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <BrandSelector onAddBrand={() => setIsBrandModalOpen(true)} />
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-medium">
              {settings.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">{t('dashboard.welcome')}, {settings.name}</h1>
          <p className="text-muted-foreground">{t('dashboard.overview')}</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCards />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <QuickActions
            onGenerateContent={() => setIsGenerateModalOpen(true)}
            onAddBrand={() => setIsBrandModalOpen(true)}
          />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Posts - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <RecentPosts />
          </motion.div>

          {/* Calendar Preview - Takes 1 column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ContentCalendarPreview onSchedulePost={() => setIsGenerateModalOpen(true)} />
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />
    </div>
  )
}
