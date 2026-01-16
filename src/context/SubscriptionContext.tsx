import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'

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

// Plan limits configuration (fallback if backend unavailable)
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
    maxBrands: 999,
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
  postsLimit: number
  brandsCount: number
  brandsLimit: number
  hasSeenWelcome: boolean
}

interface SubscriptionContextType {
  // Current subscription state
  subscription: SubscriptionState
  currentLimits: PlanLimits
  isLoading: boolean

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

  // Welcome modal
  markWelcomeSeen: () => void

  // Plan management
  upgradePlan: (plan: 'PRO' | 'BUSINESS') => Promise<void>
  openBillingPortal: () => Promise<void>

  // Refresh
  refreshSubscription: () => Promise<void>
  checkAndResetMonthly: () => void
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: 'free',
  postsThisMonth: 0,
  postsLimit: 20,
  brandsCount: 0,
  brandsLimit: 2,
  hasSeenWelcome: false
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION)
  const [isLoading, setIsLoading] = useState(true)

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<LimitType | null>(null)

  // Welcome seen state (local storage)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return localStorage.getItem('t21-welcome-seen') === 'true'
  })

  // Set up API token
  useEffect(() => {
    api.setTokenGetter(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])

  // Fetch subscription data from backend
  const refreshSubscription = useCallback(async () => {
    if (!isSignedIn) {
      setSubscription({ ...DEFAULT_SUBSCRIPTION, hasSeenWelcome })
      setIsLoading(false)
      return
    }

    try {
      const userData = await api.getMe()
      const planKey = userData.plan.toLowerCase() as PlanType

      setSubscription({
        plan: planKey,
        postsThisMonth: userData.usage.postsThisMonth,
        postsLimit: userData.usage.postsLimit,
        brandsCount: userData.usage.brands,
        brandsLimit: userData.usage.brandsLimit,
        hasSeenWelcome
      })
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
      // Fall back to defaults
      setSubscription({ ...DEFAULT_SUBSCRIPTION, hasSeenWelcome })
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, hasSeenWelcome])

  // Load subscription on mount
  useEffect(() => {
    if (isLoaded) {
      refreshSubscription()
    }
  }, [isLoaded, isSignedIn, refreshSubscription])

  // Get current plan limits
  const currentLimits = PLAN_LIMITS[subscription.plan]

  // Check if user can add a brand
  const canAddBrand = useCallback((currentBrandCount: number): boolean => {
    return currentBrandCount < subscription.brandsLimit
  }, [subscription.brandsLimit])

  // Check if user can create a post
  const canCreatePost = useCallback((): boolean => {
    return subscription.postsThisMonth < subscription.postsLimit
  }, [subscription.postsThisMonth, subscription.postsLimit])

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

  // Increment post count (optimistic update)
  const incrementPostCount = useCallback(() => {
    setSubscription(prev => ({
      ...prev,
      postsThisMonth: prev.postsThisMonth + 1
    }))
  }, [])

  // Get usage percentage for progress bars
  const getUsagePercentage = useCallback((type: 'brands' | 'posts', currentCount: number): number => {
    if (type === 'brands') {
      return Math.min(100, (currentCount / subscription.brandsLimit) * 100)
    }
    return Math.min(100, (subscription.postsThisMonth / subscription.postsLimit) * 100)
  }, [subscription])

  // Get remaining count
  const getRemainingCount = useCallback((type: 'brands' | 'posts', currentCount: number): number => {
    if (type === 'brands') {
      return Math.max(0, subscription.brandsLimit - currentCount)
    }
    return Math.max(0, subscription.postsLimit - subscription.postsThisMonth)
  }, [subscription])

  // Upgrade modal controls
  const openUpgradeModal = useCallback((trigger: LimitType) => {
    setUpgradeModalTrigger(trigger)
    setShowUpgradeModal(true)
  }, [])

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeModalTrigger(null)
  }, [])

  // Mark welcome as seen
  const markWelcomeSeen = useCallback(() => {
    setHasSeenWelcome(true)
    localStorage.setItem('t21-welcome-seen', 'true')
    setSubscription(prev => ({ ...prev, hasSeenWelcome: true }))
  }, [])

  // Upgrade plan via Stripe checkout
  const upgradePlan = useCallback(async (plan: 'PRO' | 'BUSINESS') => {
    try {
      const { url } = await api.createCheckout({
        plan,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?cancelled=true`
      })
      window.location.href = url
    } catch (err) {
      console.error('Failed to create checkout:', err)
      throw err
    }
  }, [])

  // Open billing portal
  const openBillingPortal = useCallback(async () => {
    try {
      const { url } = await api.createPortal(`${window.location.origin}/dashboard`)
      window.location.href = url
    } catch (err) {
      console.error('Failed to open billing portal:', err)
      throw err
    }
  }, [])

  // Check and reset monthly (handled by backend, just refresh)
  const checkAndResetMonthly = useCallback(() => {
    refreshSubscription()
  }, [refreshSubscription])

  return (
    <SubscriptionContext.Provider value={{
      subscription: { ...subscription, hasSeenWelcome },
      currentLimits,
      isLoading,
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
      markWelcomeSeen,
      upgradePlan,
      openBillingPortal,
      refreshSubscription,
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
