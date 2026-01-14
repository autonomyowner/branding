import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useSubscription, PLAN_LIMITS, type LimitType } from '../context/SubscriptionContext'
import { useData } from '../context/DataContext'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger: LimitType | null
}

// Content configuration based on trigger type
const TRIGGER_CONTENT = {
  brand: {
    titleKey: 'upgrade.brandLimit.title',
    descriptionKey: 'upgrade.brandLimit.description',
    defaultTitle: "You've reached your brand limit!",
    defaultDescription: 'Upgrade to manage more brands and grow your business.'
  },
  post: {
    titleKey: 'upgrade.postLimit.title',
    descriptionKey: 'upgrade.postLimit.description',
    defaultTitle: "You've used all your posts this month!",
    defaultDescription: 'Upgrade to create more content and keep your audience engaged.'
  },
  image: {
    titleKey: 'upgrade.imageLimit.title',
    descriptionKey: 'upgrade.imageLimit.description',
    defaultTitle: 'AI Image Generation is a Pro feature',
    defaultDescription: 'Upgrade to create stunning AI-generated images for your posts.'
  },
  voiceover: {
    titleKey: 'upgrade.voiceoverLimit.title',
    descriptionKey: 'upgrade.voiceoverLimit.description',
    defaultTitle: 'Voiceover is a Pro feature',
    defaultDescription: 'Upgrade to create professional AI voiceovers for your content.'
  },
  video_repurpose: {
    titleKey: 'upgrade.videoLimit.title',
    descriptionKey: 'upgrade.videoLimit.description',
    defaultTitle: 'Video Repurposing is a Pro feature',
    defaultDescription: 'Upgrade to turn YouTube videos into multiple social posts.'
  }
}

export function UpgradeModal({ isOpen, onClose, trigger }: UpgradeModalProps) {
  const { t } = useTranslation()
  const { subscription, currentLimits } = useSubscription()
  const { brands } = useData()

  const content = trigger ? TRIGGER_CONTENT[trigger] : TRIGGER_CONTENT.post
  const proLimits = PLAN_LIMITS.pro

  // Calculate progress for visual display
  const getProgress = () => {
    if (trigger === 'brand') {
      return {
        used: brands.length,
        max: currentLimits.maxBrands,
        percentage: Math.min(100, (brands.length / currentLimits.maxBrands) * 100)
      }
    }
    return {
      used: subscription.postsThisMonth,
      max: currentLimits.maxPostsPerMonth,
      percentage: Math.min(100, (subscription.postsThisMonth / currentLimits.maxPostsPerMonth) * 100)
    }
  }

  const progress = getProgress()

  // Benefits based on trigger type
  const getBenefits = () => {
    const baseBenefits = [
      { text: `${proLimits.maxPostsPerMonth.toLocaleString()} posts/month`, highlight: trigger === 'post' },
      { text: `${proLimits.maxBrands} brand profiles`, highlight: trigger === 'brand' },
      { text: t('upgrade.benefits.images') || 'AI Image Generation', highlight: trigger === 'image' },
      { text: t('upgrade.benefits.voiceover') || 'AI Voiceover Creation', highlight: trigger === 'voiceover' },
      { text: t('upgrade.benefits.video') || 'YouTube to Posts', highlight: trigger === 'video_repurpose' },
      { text: t('upgrade.benefits.support') || 'Priority Support', highlight: false }
    ]
    return baseBenefits
  }

  const handleViewPlans = () => {
    onClose()
    // Scroll to pricing section on landing page or navigate
    const pricingSection = document.getElementById('pricing')
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#pricing'
    }
  }

  const handleUpgrade = () => {
    onClose()
    window.location.href = '/#pricing'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md p-6 bg-card border-border">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Title */}
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t(content.titleKey) || content.defaultTitle}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {t(content.descriptionKey) || content.defaultDescription}
              </p>

              {/* Progress bar (for brand/post limits) */}
              {(trigger === 'brand' || trigger === 'post') && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {trigger === 'brand' ? t('upgrade.brandsUsed') || 'Brands used' : t('upgrade.postsUsed') || 'Posts used'}
                    </span>
                    <span className="font-medium text-foreground">
                      {progress.used}/{progress.max}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        progress.percentage >= 100
                          ? 'bg-red-500'
                          : progress.percentage >= 80
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Benefits list */}
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">
                  {t('upgrade.proIncludes') || 'Upgrade to Pro and get:'}
                </p>
                <ul className="space-y-2">
                  {getBenefits().map((benefit, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-2 text-sm ${
                        benefit.highlight ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price anchor */}
              <div className="text-center mb-6 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-2xl font-bold text-foreground">
                  {t('upgrade.price') || '£9'}<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('upgrade.pricePerPost') || 'Less than £0.01 per post'}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleViewPlans}
                >
                  {t('upgrade.viewPlans') || 'View Plans'}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpgrade}
                >
                  {t('upgrade.upgradeToPro') || 'Upgrade to Pro'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
