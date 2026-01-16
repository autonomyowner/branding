import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useClerk, useUser } from "@clerk/clerk-react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { useSubscription } from "../../context/SubscriptionContext"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { subscription, currentLimits, openBillingPortal } = useSubscription()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (!isOpen) return null

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      window.location.href = '/'
    } catch (err) {
      console.error('Sign out error:', err)
      setIsSigningOut(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      await openBillingPortal()
    } catch {
      // Stripe not configured - show message
      alert('Billing management is not available yet.')
    }
  }

  const planLabel = {
    free: 'Free',
    pro: 'Pro',
    business: 'Business'
  }[subscription.plan]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            X
          </button>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border border-white/10">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-lg font-medium">
                  {user?.firstName?.slice(0, 1) || user?.emailAddresses?.[0]?.emailAddress?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {user?.fullName || user?.firstName || 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Subscription</h3>
            <div className="p-4 bg-card/50 rounded-lg border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Plan</span>
                <span className="font-medium px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  {planLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Posts this month</span>
                <span className="font-medium">
                  {subscription.postsThisMonth} / {subscription.postsLimit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Brands</span>
                <span className="font-medium">
                  {subscription.brandsCount} / {subscription.brandsLimit}
                </span>
              </div>

              {/* Features */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-sm text-muted-foreground mb-2">Features</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={currentLimits.hasImageGeneration ? 'text-green-400' : 'text-muted-foreground'}>
                    {currentLimits.hasImageGeneration ? 'Y' : 'X'} Image Generation
                  </div>
                  <div className={currentLimits.hasVoiceover ? 'text-green-400' : 'text-muted-foreground'}>
                    {currentLimits.hasVoiceover ? 'Y' : 'X'} Voiceover
                  </div>
                  <div className={currentLimits.hasVideoRepurpose ? 'text-green-400' : 'text-muted-foreground'}>
                    {currentLimits.hasVideoRepurpose ? 'Y' : 'X'} Video Repurpose
                  </div>
                </div>
              </div>

              {subscription.plan !== 'business' && (
                <Button
                  onClick={handleManageBilling}
                  className="w-full mt-3"
                  variant="outline"
                >
                  Upgrade Plan
                </Button>
              )}

              {subscription.plan !== 'free' && (
                <Button
                  onClick={handleManageBilling}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  Manage Billing
                </Button>
              )}
            </div>
          </div>

          {/* Sign Out */}
          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="outline"
              className="w-full text-red-400 border-red-400/50 hover:bg-red-400/10"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
