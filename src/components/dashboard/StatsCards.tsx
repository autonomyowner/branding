import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"
import { useData } from "../../context/DataContext"
import { useSubscription } from "../../context/SubscriptionContext"

export function StatsCards() {
  const { t } = useTranslation()
  const { getStats, brands } = useData()
  const { subscription, currentLimits, getUsagePercentage, getRemainingCount, openUpgradeModal } = useSubscription()
  const stats = getStats()

  // Calculate usage percentages
  const postsPercentage = getUsagePercentage('posts', 0)
  const brandsPercentage = getUsagePercentage('brands', brands.length)
  const postsRemaining = getRemainingCount('posts', 0)
  const brandsRemaining = getRemainingCount('brands', brands.length)

  // Get color class based on usage percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-primary'
  }

  const statItems = [
    {
      label: t('dashboard.stats.totalPosts') || 'Posts Used',
      value: `${subscription.postsThisMonth}`,
      subValue: `/${currentLimits.maxPostsPerMonth}`,
      change: postsRemaining > 0 ? `${postsRemaining} left` : 'Limit reached',
      changeType: postsPercentage >= 100 ? 'danger' : postsPercentage >= 80 ? 'warning' : 'neutral',
      description: 'Posts generated this month',
      showProgress: true,
      percentage: postsPercentage,
      limitType: 'post' as const
    },
    {
      label: 'Brands',
      value: `${brands.length}`,
      subValue: `/${currentLimits.maxBrands}`,
      change: brandsRemaining > 0 ? `${brandsRemaining} left` : 'Limit reached',
      changeType: brandsPercentage >= 100 ? 'danger' : brandsPercentage >= 80 ? 'warning' : 'neutral',
      description: 'Brand profiles created',
      showProgress: true,
      percentage: brandsPercentage,
      limitType: 'brand' as const
    },
    {
      label: t('dashboard.stats.scheduled') || 'Scheduled',
      value: stats.postsScheduled.toString(),
      change: stats.postsScheduled > 0 ? 'Upcoming' : 'None yet',
      changeType: 'neutral',
      description: 'Ready to publish',
      showProgress: false,
      percentage: 0,
      limitType: null
    },
    {
      label: 'Plan',
      value: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
      change: subscription.plan === 'free' ? 'Upgrade available' : 'Active',
      changeType: subscription.plan === 'free' ? 'upgrade' : 'positive',
      description: subscription.plan === 'free'
        ? 'Get more with Pro'
        : `${currentLimits.maxPostsPerMonth.toLocaleString()} posts/month`,
      showProgress: false,
      percentage: 0,
      limitType: null,
      isUpgradeCard: subscription.plan === 'free'
    }
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={`p-5 hover:border-white/20 transition-colors group ${
              stat.isUpgradeCard ? 'cursor-pointer hover:border-primary/50' : ''
            }`}
            onClick={stat.isUpgradeCard ? () => openUpgradeModal('post') : undefined}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                stat.changeType === 'positive'
                  ? 'bg-green-500/10 text-green-400'
                  : stat.changeType === 'danger'
                  ? 'bg-red-500/10 text-red-400'
                  : stat.changeType === 'warning'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : stat.changeType === 'upgrade'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-white/5 text-muted-foreground'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{stat.value}</span>
              {stat.subValue && (
                <span className="text-lg text-muted-foreground">{stat.subValue}</span>
              )}
            </div>

            {/* Progress bar for usage limits */}
            {stat.showProgress && (
              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${getProgressColor(stat.percentage)} ${
                      stat.percentage >= 90 ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>

            {/* Upgrade link for limit cards approaching max */}
            {stat.limitType && stat.percentage >= 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openUpgradeModal(stat.limitType!)
                }}
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Upgrade for more
              </button>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
