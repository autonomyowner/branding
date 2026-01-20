import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useClerk, useUser } from "@clerk/clerk-react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api as convexApi } from "../../../convex/_generated/api"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { useSubscription } from "../../context/SubscriptionContext"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface TelegramStatus {
  configured: boolean
  connected: boolean
  enabled: boolean
  linkedAt: string | null
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { signOut } = useClerk()
  const { user } = useUser()
  const clerkId = user?.id
  const { subscription, currentLimits, openBillingPortal } = useSubscription()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Convex hooks for Telegram
  const telegramStatus = useQuery(
    convexApi.telegram.getStatus,
    clerkId ? { clerkId } : "skip"
  )
  const connectTelegramAction = useAction(convexApi.telegram.connect)
  const disconnectTelegramMutation = useMutation(convexApi.telegram.disconnect)
  const toggleTelegramMutation = useMutation(convexApi.telegram.toggle)

  // Local loading/error state for telegram operations
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramError, setTelegramError] = useState<string | null>(null)

  const handleConnectTelegram = async () => {
    if (!clerkId) return
    setTelegramLoading(true)
    setTelegramError(null)
    try {
      const result = await connectTelegramAction({ clerkId })
      // Open the Telegram connect link in a new window
      window.open(result.connectLink, '_blank')
      // Polling not needed - Convex query is reactive
      // Just wait a bit then stop loading
      setTimeout(() => {
        setTelegramLoading(false)
      }, 5000)
    } catch (err) {
      setTelegramError('Failed to generate connect link')
      setTelegramLoading(false)
    }
  }

  const handleDisconnectTelegram = async () => {
    if (!clerkId) return
    setTelegramLoading(true)
    try {
      await disconnectTelegramMutation({ clerkId })
      setTelegramError(null)
    } catch (err) {
      setTelegramError('Failed to disconnect')
    } finally {
      setTelegramLoading(false)
    }
  }

  const handleToggleTelegram = async () => {
    if (!telegramStatus || !clerkId) return
    setTelegramLoading(true)
    try {
      await toggleTelegramMutation({ enabled: !telegramStatus.enabled, clerkId })
      setTelegramError(null)
    } catch (err) {
      setTelegramError('Failed to toggle notifications')
    } finally {
      setTelegramLoading(false)
    }
  }

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

          {/* Telegram Integration */}
          {telegramStatus?.configured && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Telegram Delivery</h3>
              <div className="p-4 bg-card/50 rounded-lg border border-white/10 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Receive your scheduled posts directly on Telegram when they're ready to publish.
                </p>

                {telegramError && (
                  <p className="text-sm text-red-400">{telegramError}</p>
                )}

                {!telegramStatus.connected ? (
                  <Button
                    onClick={handleConnectTelegram}
                    disabled={telegramLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {telegramLoading ? 'Connecting...' : 'Connect Telegram'}
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-green-400 text-sm">Connected</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Notifications</span>
                      <button
                        onClick={handleToggleTelegram}
                        disabled={telegramLoading}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          telegramStatus.enabled ? 'bg-primary' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            telegramStatus.enabled ? 'start-7' : 'start-1'
                          }`}
                        />
                      </button>
                    </div>

                    {telegramStatus.linkedAt && (
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(telegramStatus.linkedAt).toLocaleDateString()}
                      </p>
                    )}

                    <Button
                      onClick={handleDisconnectTelegram}
                      disabled={telegramLoading}
                      variant="ghost"
                      className="w-full text-sm text-red-400 hover:bg-red-400/10"
                    >
                      Disconnect Telegram
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

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
