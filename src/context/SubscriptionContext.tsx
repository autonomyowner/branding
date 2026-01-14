import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

// Plan types
export type PlanType = 'free' | 'pro' | 'business'

// Plan limits type
export interface PlanLimits {
  maxBrands: number
  maxPostsPerMonth: number
  hasImageGeneration: boolean
  hasVoiceover: boolean
  hasVideoRepurpose: boolean
  hasApiAccess: boolean
  supportLevel: string
}

// Plan limits configuration
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxBrands: 2,
    maxPostsPerMonth: 20,
    hasImageGeneration: false,
    hasVoiceover: false,
    hasVideoRepurpose: false,
    hasApiAccess: false,
    supportLevel: 'community'
  },
  pro: {
    maxBrands: 5,
    maxPostsPerMonth: 1000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    hasApiAccess: false,
    supportLevel: 'priority'
  },
  business: {
    maxBrands: 999, // Effectively unlimited
    maxPostsPerMonth: 90000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    hasApiAccess: true,
    supportLevel: 'dedicated'
  }
}

// Limit types for upgrade modal context
export type LimitType = 'brand' | 'post' | 'image' | 'voiceover' | 'video_repurpose'

interface SubscriptionState {
  plan: PlanType
  postsThisMonth: number
  monthStartDate: number
  email: string | null
  hasSeenWelcome: boolean
}

interface SubscriptionContextType {
  // Current subscription state
  subscription: SubscriptionState
  currentLimits: PlanLimits

  // Limit checking functions
  canAddBrand: (currentBrandCount: number) => boolean
  canCreatePost: () => boolean
  canUseFeature: (feature: 'image' | 'voiceover' | 'video_repurpose') => boolean

  // Usage tracking
  incrementPostCount: () => void
  getUsagePercentage: (type: 'brands' | 'posts', currentCount: number) => number
  getRemainingCount: (type: 'brands' | 'posts', currentCount: number) => number

  // Upgrade modal state
  showUpgradeModal: boolean
  upgradeModalTrigger: LimitType | null
  openUpgradeModal: (trigger: LimitType) => void
  closeUpgradeModal: () => void

  // Email capture
  capturedEmails: string[]
  captureEmail: (email: string) => void

  // Welcome modal
  markWelcomeSeen: () => void

  // Plan management (for future Stripe integration)
  upgradePlan: (newPlan: PlanType) => void

  // Monthly reset check
  checkAndResetMonthly: () => void
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: 'free',
  postsThisMonth: 0,
  monthStartDate: Date.now(),
  email: null,
  hasSeenWelcome: false
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useLocalStorage<SubscriptionState>(
    'contentengine-subscription',
    DEFAULT_SUBSCRIPTION
  )
  const [capturedEmails, setCapturedEmails] = useLocalStorage<string[]>(
    'contentengine-captured-emails',
    []
  )

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<LimitType | null>(null)

  // Get current plan limits
  const currentLimits = PLAN_LIMITS[subscription.plan]

  // Check if user can add a brand
  const canAddBrand = useCallback((currentBrandCount: number): boolean => {
    return currentBrandCount < currentLimits.maxBrands
  }, [currentLimits.maxBrands])

  // Check if user can create a post
  const canCreatePost = useCallback((): boolean => {
    return subscription.postsThisMonth < currentLimits.maxPostsPerMonth
  }, [subscription.postsThisMonth, currentLimits.maxPostsPerMonth])

  // Check if user can use a premium feature
  const canUseFeature = useCallback((feature: 'image' | 'voiceover' | 'video_repurpose'): boolean => {
    switch (feature) {
      case 'image':
        return currentLimits.hasImageGeneration
      case 'voiceover':
        return currentLimits.hasVoiceover
      case 'video_repurpose':
        return currentLimits.hasVideoRepurpose
      default:
        return false
    }
  }, [currentLimits])

  // Increment post count
  const incrementPostCount = useCallback(() => {
    setSubscription(prev => ({
      ...prev,
      postsThisMonth: prev.postsThisMonth + 1
    }))
  }, [setSubscription])

  // Get usage percentage for progress bars
  const getUsagePercentage = useCallback((type: 'brands' | 'posts', currentCount: number): number => {
    const max = type === 'brands' ? currentLimits.maxBrands : currentLimits.maxPostsPerMonth
    const count = type === 'posts' ? subscription.postsThisMonth : currentCount
    return Math.min(100, (count / max) * 100)
  }, [currentLimits, subscription.postsThisMonth])

  // Get remaining count
  const getRemainingCount = useCallback((type: 'brands' | 'posts', currentCount: number): number => {
    if (type === 'brands') {
      return Math.max(0, currentLimits.maxBrands - currentCount)
    }
    return Math.max(0, currentLimits.maxPostsPerMonth - subscription.postsThisMonth)
  }, [currentLimits, subscription.postsThisMonth])

  // Upgrade modal controls
  const openUpgradeModal = useCallback((trigger: LimitType) => {
    setUpgradeModalTrigger(trigger)
    setShowUpgradeModal(true)
  }, [])

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeModalTrigger(null)
  }, [])

  // Email capture
  const captureEmail = useCallback((email: string) => {
    if (email && !capturedEmails.includes(email)) {
      setCapturedEmails(prev => [...prev, email])
      setSubscription(prev => ({ ...prev, email }))
    }
  }, [capturedEmails, setCapturedEmails, setSubscription])

  // Mark welcome as seen
  const markWelcomeSeen = useCallback(() => {
    setSubscription(prev => ({ ...prev, hasSeenWelcome: true }))
  }, [setSubscription])

  // Upgrade plan (for future Stripe integration)
  const upgradePlan = useCallback((newPlan: PlanType) => {
    setSubscription(prev => ({ ...prev, plan: newPlan }))
  }, [setSubscription])

  // Check and reset monthly counts
  const checkAndResetMonthly = useCallback(() => {
    const now = Date.now()
    const monthStart = new Date(subscription.monthStartDate)
    const currentMonth = new Date(now)

    // Reset if we're in a new month
    if (monthStart.getMonth() !== currentMonth.getMonth() ||
        monthStart.getFullYear() !== currentMonth.getFullYear()) {
      setSubscription(prev => ({
        ...prev,
        postsThisMonth: 0,
        monthStartDate: now
      }))
    }
  }, [subscription.monthStartDate, setSubscription])

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      currentLimits,
      canAddBrand,
      canCreatePost,
      canUseFeature,
      incrementPostCount,
      getUsagePercentage,
      getRemainingCount,
      showUpgradeModal,
      upgradeModalTrigger,
      openUpgradeModal,
      closeUpgradeModal,
      capturedEmails,
      captureEmail,
      markWelcomeSeen,
      upgradePlan,
      checkAndResetMonthly
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
