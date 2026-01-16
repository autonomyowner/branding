import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react"
import { StatsCards } from "./StatsCards"
import { RecentPosts } from "./RecentPosts"
import { QuickActions } from "./QuickActions"
import { BrandSelector } from "./BrandSelector"
import { ContentCalendarPreview } from "./ContentCalendarPreview"
import { GenerateModal } from "./GenerateModal"
import { VideoToPostsModal } from "./VideoToPostsModal"
import { VoiceoverModal } from "./VoiceoverModal"
import { ImageGeneratorModal } from "./ImageGeneratorModal"
import { BrandModal } from "./BrandModal"
import { SettingsModal } from "./SettingsModal"
import { WelcomeModal } from "./WelcomeModal"
import { MobileNav } from "./MobileNav"
import { Link } from "react-router-dom"
import { useData } from "../../context/DataContext"
import { useSubscription } from "../../context/SubscriptionContext"
import { Logo } from "../ui/Logo"
import { Button } from "../ui/button"

export function Dashboard() {
  const { t } = useTranslation()
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false)
  const [isImageGeneratorModalOpen, setIsImageGeneratorModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const { user } = useData()
  const { subscription } = useSubscription()

  // Show welcome modal for first-time visitors
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(!subscription.hasSeenWelcome)

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-sm text-white font-medium">{t('nav.dashboard')}</Link>
              <Link to="/posts" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.posts')}</Link>
              <Link to="/calendar" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.calendar')}</Link>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-muted-foreground hover:text-white"
              title={t('common.settings')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">Sign In</Button>
              </SignInButton>
            </SignedOut>
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
          <h1 className="text-2xl font-bold mb-2">{t('dashboard.welcome')}, {userName}</h1>
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
          className="mt-8 mb-4 md:mb-0"
        >
          <QuickActions
            onGenerateContent={() => setIsGenerateModalOpen(true)}
            onAddBrand={() => setIsBrandModalOpen(true)}
            onRepurpose={() => setIsVideoModalOpen(true)}
            onVoiceover={() => setIsVoiceoverModalOpen(true)}
            onGenerateImage={() => setIsImageGeneratorModalOpen(true)}
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

        {/* Spacer for mobile bottom navigation */}
        <div className="h-40 md:hidden" />
      </main>

      {/* Modals */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
      <VideoToPostsModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
      <VoiceoverModal
        isOpen={isVoiceoverModalOpen}
        onClose={() => setIsVoiceoverModalOpen(false)}
      />
      <ImageGeneratorModal
        isOpen={isImageGeneratorModalOpen}
        onClose={() => setIsImageGeneratorModalOpen(false)}
      />
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Mobile Navigation - hide when any modal is open */}
      <MobileNav
        hideNav={
          isGenerateModalOpen ||
          isVideoModalOpen ||
          isVoiceoverModalOpen ||
          isImageGeneratorModalOpen ||
          isBrandModalOpen ||
          isSettingsModalOpen
        }
      />
    </div>
  )
}
