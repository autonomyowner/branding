import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useData, type Post, type Platform } from "../context/DataContext"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Logo } from "../components/ui/Logo"

// Optimal posting times based on 2025 research
const OPTIMAL_TIMES: Record<Platform, { times: string[]; days: string[]; description: string }> = {
  Instagram: {
    times: ["7:00 AM", "12:00 PM", "5:00 PM", "7:00 PM"],
    days: ["Monday", "Tuesday", "Wednesday"],
    description: "Best: Tue-Wed, 7AM or 12PM. Avoid weekends for business."
  },
  Twitter: {
    times: ["8:00 AM", "12:00 PM", "5:00 PM", "9:00 PM"],
    days: ["Tuesday", "Wednesday", "Thursday"],
    description: "Best: Weekdays 8AM-10AM. High engagement during commute."
  },
  LinkedIn: {
    times: ["7:00 AM", "10:00 AM", "12:00 PM", "5:00 PM"],
    days: ["Tuesday", "Wednesday", "Thursday"],
    description: "Best: Tue-Thu, 10AM-12PM. Professionals check before meetings."
  },
  TikTok: {
    times: ["7:00 AM", "12:00 PM", "3:00 PM", "7:00 PM", "9:00 PM"],
    days: ["Tuesday", "Thursday", "Friday"],
    description: "Best: Thu 7PM, Fri 5PM. Evening content performs 2x better."
  },
  Facebook: {
    times: ["9:00 AM", "1:00 PM", "4:00 PM"],
    days: ["Wednesday", "Thursday", "Friday"],
    description: "Best: Wed-Thu 1-4PM. Weekend mornings good for lifestyle."
  }
}

const platformColors: Record<Platform, string> = {
  Instagram: "bg-pink-500",
  Twitter: "bg-blue-400",
  LinkedIn: "bg-blue-600",
  TikTok: "bg-white",
  Facebook: "bg-blue-700"
}

interface DayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
}

export function CalendarPage() {
  const { t } = useTranslation()
  const { posts, brands, deletePost } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)

    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayPosts = posts.filter(p => {
        if (p.status !== 'scheduled' || !p.scheduledFor) return false
        if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) return false
        const postDate = new Date(p.scheduledFor)
        return postDate >= dayStart && postDate <= dayEnd
      })

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        posts: dayPosts
      })
    }

    return days
  }, [currentDate, posts, selectedPlatform])

  // Get posts for selected day
  const selectedDayPosts = useMemo(() => {
    if (!selectedDay) return []
    const dayStart = new Date(selectedDay)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDay)
    dayEnd.setHours(23, 59, 59, 999)

    return posts.filter(p => {
      if (p.status !== 'scheduled' || !p.scheduledFor) return false
      const postDate = new Date(p.scheduledFor)
      return postDate >= dayStart && postDate <= dayEnd
    }).sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
  }, [selectedDay, posts])

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown'
  }

  const handleCopy = async (post: Post) => {
    await navigator.clipboard.writeText(post.content)
    setCopiedId(post.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isOptimalTime = (platform: Platform, date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return OPTIMAL_TIMES[platform].days.includes(dayName)
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
              <a href="/posts" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.posts')}</a>
              <a href="/calendar" className="text-sm text-white font-medium">{t('nav.calendar')}</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Calendar - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h1>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      className="ml-2"
                    >
                      {t('calendar.today')}
                    </Button>
                  </div>
                </div>

                {/* Platform Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      selectedPlatform === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {t('posts.filter.all').replace(' Posts', '').replace(' المنشورات', '')}
                  </button>
                  {(Object.keys(OPTIMAL_TIMES) as Platform[]).map(platform => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        selectedPlatform === platform ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isSelected = selectedDay?.getTime() === day.date.getTime()
                  const hasOptimalDay = selectedPlatform !== 'all' && isOptimalTime(selectedPlatform, day.date)

                  return (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDay(day.date)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative min-h-[100px] p-2 rounded-lg border transition-colors text-left
                        ${day.isCurrentMonth ? 'bg-card' : 'bg-card/30'}
                        ${day.isToday ? 'border-primary' : 'border-border'}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                        ${hasOptimalDay && day.isCurrentMonth ? 'bg-green-500/5' : ''}
                        hover:border-white/30
                      `}
                    >
                      {/* Date Number */}
                      <div className={`text-sm font-medium mb-1 ${
                        day.isToday ? 'text-primary' :
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}>
                        {day.date.getDate()}
                        {hasOptimalDay && day.isCurrentMonth && (
                          <span className="ml-1 text-xs text-green-400">*</span>
                        )}
                      </div>

                      {/* Post Indicators */}
                      {day.posts.length > 0 && (
                        <div className="space-y-1">
                          {day.posts.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${platformColors[post.platform]} ${
                                post.platform === 'TikTok' ? 'text-black' : 'text-white'
                              }`}
                            >
                              {formatTime(post.scheduledFor!)}
                            </div>
                          ))}
                          {day.posts.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{day.posts.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">*</span>
                  <span>Optimal posting day for selected platform</span>
                </div>
                <div className="flex items-center gap-4">
                  {(Object.keys(platformColors) as Platform[]).map(platform => (
                    <div key={platform} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded ${platformColors[platform]}`} />
                      <span>{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Selected Day Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedDay
                  ? selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  : t('calendar.day')
                }
              </h2>

              {selectedDay && (
                <>
                  {selectedDayPosts.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDayPosts.map(post => {
                        const isExpanded = expandedPostId === post.id
                        const isCopied = copiedId === post.id

                        return (
                          <motion.div
                            key={post.id}
                            layout
                            className="rounded-lg bg-background border border-border overflow-hidden"
                          >
                            {/* Post Header */}
                            <div className="p-3 border-b border-border flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={`${platformColors[post.platform]} ${post.platform === 'TikTok' ? 'text-black' : 'text-white'}`}>
                                  {post.platform}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatTime(post.scheduledFor!)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">{getBrandName(post.brandId)}</span>
                            </div>

                            {/* Post Content */}
                            <div className="p-3">
                              <div
                                className={`text-sm whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}
                              >
                                {post.content}
                              </div>

                              {post.content.length > 150 && (
                                <button
                                  onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                                  className="text-xs text-primary hover:underline mt-2"
                                >
                                  {isExpanded ? 'Show less' : 'Read full content'}
                                </button>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="p-3 border-t border-border flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleCopy(post)}
                              >
                                {isCopied ? (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                  </span>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => deletePost(post.id)}
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">{t('calendar.noEvents')}</p>
                  )}

                  <Button asChild className="w-full mt-4">
                    <a href="/dashboard">Schedule Post</a>
                  </Button>
                </>
              )}
            </Card>

            {/* Optimal Times */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Best Times to Post</h2>

              <div className="space-y-4">
                {(Object.entries(OPTIMAL_TIMES) as [Platform, typeof OPTIMAL_TIMES[Platform]][]).map(([platform, data]) => (
                  <div key={platform} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded ${platformColors[platform]}`} />
                      <span className="font-medium">{platform}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {data.times.map(time => (
                        <span key={time} className="text-xs px-2 py-1 rounded bg-white/5">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weekly Overview */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">This Week</h2>

              {(() => {
                const today = new Date()
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - today.getDay())

                let weekTotal = 0
                const platformCounts: Partial<Record<Platform, number>> = {}

                for (let i = 0; i < 7; i++) {
                  const date = new Date(weekStart)
                  date.setDate(weekStart.getDate() + i)
                  const dayStart = new Date(date)
                  dayStart.setHours(0, 0, 0, 0)
                  const dayEnd = new Date(date)
                  dayEnd.setHours(23, 59, 59, 999)

                  posts.forEach(p => {
                    if (p.status !== 'scheduled' || !p.scheduledFor) return
                    const postDate = new Date(p.scheduledFor)
                    if (postDate >= dayStart && postDate <= dayEnd) {
                      weekTotal++
                      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1
                    }
                  })
                }

                return (
                  <div>
                    <div className="text-3xl font-bold mb-1">{weekTotal}</div>
                    <div className="text-sm text-muted-foreground mb-4">posts scheduled</div>

                    {Object.entries(platformCounts).length > 0 ? (
                      <div className="space-y-2">
                        {(Object.entries(platformCounts) as [Platform, number][]).map(([platform, count]) => (
                          <div key={platform} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded ${platformColors[platform]}`} />
                              <span className="text-sm">{platform}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No posts scheduled this week</p>
                    )}
                  </div>
                )
              })()}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
