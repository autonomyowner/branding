import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useData } from "../context/DataContext"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Logo } from "../components/ui/Logo"

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

type FilterStatus = 'all' | 'draft' | 'scheduled' | 'published'
type FilterPlatform = 'all' | 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'

export function PostsPage() {
  const { t } = useTranslation()
  const { posts, brands, deletePost, updatePost } = useData()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>('all')
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  const filteredPosts = posts.filter(post => {
    if (filterStatus !== 'all' && post.status !== filterStatus) return false
    if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false
    return true
  })

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown Brand'
  }

  const getBrandColor = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.color || '#8b5cf6'
  }

  const handlePublish = (postId: string) => {
    updatePost(postId, {
      status: 'published',
      publishedAt: Date.now()
    })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.dashboard')}</a>
              <a href="/posts" className="text-sm text-white font-medium">{t('nav.posts')}</a>
              <a href="/calendar" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.calendar')}</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">{t('posts.filter.all')}</h1>
          <p className="text-muted-foreground">View and manage all your generated content.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-1">
              {(['all', 'draft', 'scheduled', 'published'] as FilterStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    filterStatus === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {t(`posts.filter.${status}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Platform:</span>
            <div className="flex gap-1">
              {(['all', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook'] as FilterPlatform[]).map(platform => (
                <button
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    filterPlatform === platform
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {platform === 'all' ? t('posts.filter.all').replace(' Posts', '').replace(' المنشورات', '') : platform}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Posts Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredPosts.length} of {posts.length} posts
        </p>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-2">{t('posts.noPosts')}</p>
            <p className="text-sm text-muted-foreground">
              {posts.length === 0
                ? t('posts.createPost')
                : "Try adjusting your filters"
              }
            </p>
            {posts.length === 0 && (
              <Button asChild className="mt-4">
                <a href="/dashboard">{t('nav.dashboard')}</a>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="p-6 hover:border-white/20 transition-colors">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getBrandColor(post.brandId) }}
                      />
                      <span className="text-sm font-medium">{getBrandName(post.brandId)}</span>
                      <Badge variant="outline" className={platformColors[post.platform]}>
                        {post.platform}
                      </Badge>
                      <Badge variant="secondary" className={statusColors[post.status]}>
                        {t(`posts.status.${post.status}`)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div
                    className={`bg-background/50 rounded-lg p-4 mb-4 ${
                      expandedPost === post.id ? '' : 'max-h-32 overflow-hidden relative'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                    {expandedPost !== post.id && post.content.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/50 to-transparent" />
                    )}
                  </div>

                  {/* Expand/Collapse */}
                  {post.content.length > 200 && (
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-sm text-primary hover:underline mb-4"
                    >
                      {expandedPost === post.id ? 'Show less' : 'Show more'}
                    </button>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(post.content)}
                    >
                      Copy
                    </Button>
                    {post.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(post.id)}
                      >
                        Mark Published
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:border-red-400/50"
                      onClick={() => deletePost(post.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
