import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { useData } from "../../context/DataContext"

const platformColors: Record<string, string> = {
  Instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Twitter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  LinkedIn: "bg-blue-600/10 text-blue-300 border-blue-600/20",
  TikTok: "bg-white/10 text-white border-white/20",
  Facebook: "bg-blue-700/10 text-blue-400 border-blue-700/20"
}

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-500/10 text-yellow-400",
  draft: "bg-white/10 text-muted-foreground",
  published: "bg-green-500/10 text-green-400"
}

function formatScheduledTime(dateString?: string): string {
  if (!dateString) return 'Not scheduled'

  const date = new Date(dateString)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (isToday) return `Today, ${timeStr}`
  if (isTomorrow) return `Tomorrow, ${timeStr}`

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + `, ${timeStr}`
}

export function RecentPosts() {
  const { t } = useTranslation()
  const { posts, brands, deletePost, updatePost } = useData()

  // Get the 10 most recent posts
  const recentPosts = posts.slice(0, 10)

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown Brand'
  }

  const handlePublish = (postId: string) => {
    updatePost(postId, {
      status: 'published',
      publishedAt: Date.now()
    })
  }

  if (recentPosts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{t('dashboard.recentPosts')}</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">{t('dashboard.noPosts')}</p>
          <p className="text-sm text-muted-foreground">{t('dashboard.createFirst')}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{t('dashboard.recentPosts')}</h2>
        <span className="text-sm text-muted-foreground">{posts.length} total</span>
      </div>

      <div className="space-y-4">
        {recentPosts.map((post) => (
          <div
            key={post.id}
            className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
          >
            {/* Platform Color Bar */}
            <div
              className="w-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: post.platform === 'Instagram' ? '#ec4899' :
                  post.platform === 'Twitter' ? '#3b82f6' :
                  post.platform === 'LinkedIn' ? '#0077b5' :
                  post.platform === 'TikTok' ? '#fff' :
                  '#1877f2'
              }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`text-xs ${platformColors[post.platform]}`}>
                  {t(`posts.platform.${post.platform.toLowerCase()}`)}
                </Badge>
                <Badge variant="secondary" className={`text-xs ${statusColors[post.status]}`}>
                  {t(`posts.status.${post.status}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">{getBrandName(post.brandId)}</span>
              </div>
              <p className="text-sm text-foreground line-clamp-2 mb-1">
                {post.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {post.status === 'scheduled'
                  ? formatScheduledTime(post.scheduledFor)
                  : post.status === 'published'
                  ? `${t('posts.publishedOn')} ${new Date(post.publishedAt!).toLocaleDateString()}`
                  : t('posts.status.draft')
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {post.status === 'draft' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePublish(post.id)}
                >
                  Publish
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(post.content)}
              >
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => deletePost(post.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
