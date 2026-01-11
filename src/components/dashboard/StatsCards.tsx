import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"
import { useData } from "../../context/DataContext"

export function StatsCards() {
  const { t } = useTranslation()
  const { getStats } = useData()
  const stats = getStats()

  const statItems = [
    {
      label: t('dashboard.stats.totalPosts'),
      value: stats.postsGenerated.toString(),
      change: stats.postsGenerated > 0 ? "Active" : "Get started",
      changeType: stats.postsGenerated > 0 ? "positive" as const : "neutral" as const,
      description: "Total AI-generated posts"
    },
    {
      label: t('dashboard.stats.scheduled'),
      value: stats.postsScheduled.toString(),
      change: stats.postsScheduled > 0 ? "Upcoming" : "None yet",
      changeType: "neutral" as const,
      description: "Ready to publish"
    },
    {
      label: "Brands Active",
      value: stats.brandsActive.toString(),
      change: `of ${stats.brandsActive} created`,
      changeType: "neutral" as const,
      description: "Trained brand profiles"
    },
    {
      label: "Credits Remaining",
      value: stats.creditsRemaining.toString(),
      change: "of 1000/month",
      changeType: stats.creditsRemaining < 100 ? "warning" as const : "neutral" as const,
      description: "Posts you can generate"
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
          <Card className="p-5 hover:border-white/20 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                stat.changeType === 'positive'
                  ? 'bg-green-500/10 text-green-400'
                  : stat.changeType === 'warning'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-white/5 text-muted-foreground'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
