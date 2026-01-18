import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useSubscription } from '../../context/SubscriptionContext'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { t } = useTranslation()
  const { captureEmail, markWelcomeSeen } = useSubscription()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = () => {
    if (email.trim() && !validateEmail(email)) {
      setError(t('welcome.invalidEmail') || 'Please enter a valid email')
      return
    }

    if (email.trim()) {
      captureEmail(email)
    }

    markWelcomeSeen()
    onClose()
  }

  const handleSkip = () => {
    markWelcomeSeen()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            <Card className="w-full max-w-md p-6 bg-card border-border">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t('welcome.title') || 'Welcome to ContentEngine!'}
                </h2>
                <p className="text-muted-foreground">
                  {t('welcome.subtitle') || 'Your AI-powered content automation platform'}
                </p>
              </div>

              {/* Features Preview */}
              <div className="space-y-3 mb-6">
                {[
                  { text: t('welcome.feature1') || 'Generate AI content for any platform', delay: 0.1 },
                  { text: t('welcome.feature2') || 'Manage multiple brands', delay: 0.15 },
                  { text: t('welcome.feature3') || 'Schedule posts in advance', delay: 0.2 }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + feature.delay }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {t('welcome.emailLabel') || 'Enter your email to save your progress'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder={t('welcome.emailPlaceholder') || 'you@example.com'}
                  className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:outline-none focus:border-primary ${
                    error ? 'border-red-500' : 'border-border'
                  }`}
                />
                {error && (
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                )}
              </div>

              {/* Free Plan Info */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H6.5a2.5 2.5 0 000 5H8a4 4 0 004-4zm0 0V5.5A2.5 2.5 0 0114.5 3H16a4 4 0 014 4v1h-5m-5 0h5" />
                  </svg>
                  <span className="text-foreground font-medium">
                    {t('welcome.freePlan') || 'Free plan: 2 brands, 20 posts/month'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={handleSubmit} className="w-full">
                  {t('welcome.getStarted') || 'Get Started'}
                </Button>
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('welcome.skip') || 'Skip for now'}
                </button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
