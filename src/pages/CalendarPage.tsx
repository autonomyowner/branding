import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useData, type Post, type Platform } from "../context/DataContext"
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

const platformStyles: Record<Platform, { bg: string; text: string; glow: string }> = {
  Instagram: { bg: "bg-gradient-to-br from-fuchsia-500 to-pink-600", text: "text-white", glow: "shadow-fuchsia-500/30" },
  Twitter: { bg: "bg-gradient-to-br from-sky-400 to-blue-500", text: "text-white", glow: "shadow-sky-500/30" },
  LinkedIn: { bg: "bg-gradient-to-br from-blue-600 to-blue-700", text: "text-white", glow: "shadow-blue-600/30" },
  TikTok: { bg: "bg-gradient-to-br from-zinc-100 to-white", text: "text-black", glow: "shadow-white/20" },
  Facebook: { bg: "bg-gradient-to-br from-blue-600 to-indigo-700", text: "text-white", glow: "shadow-blue-700/30" }
}

interface DayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1
    }
  }
}

const cellVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0
  })
}

export function CalendarPage() {
  const { t } = useTranslation()
  const { posts, brands, deletePost } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [direction, setDirection] = useState(0)

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

  const navigateMonth = (delta: number) => {
    setDirection(delta)
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + delta)
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

  // Weekly stats
  const weekStats = useMemo(() => {
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

    return { weekTotal, platformCounts }
  }, [posts])

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">{t('nav.dashboard')}</Link>
              <Link to="/posts" className="text-sm text-white/50 hover:text-white transition-colors">{t('nav.posts')}</Link>
              <Link to="/calendar" className="text-sm text-white font-medium relative">
                {t('nav.calendar')}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-amber-400 to-orange-500" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Content Calendar
          </h1>
          <p className="text-white/40 text-lg">Plan and visualize your content schedule</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Calendar - 3 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.h2
                        key={currentDate.toISOString()}
                        initial={{ opacity: 0, y: direction > 0 ? 20 : -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: direction > 0 ? -20 : 20 }}
                        transition={{ duration: 0.2 }}
                        className="font-display text-2xl md:text-3xl font-bold tracking-tight"
                      >
                        {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                        <span className="text-white/30 ml-2">{currentDate.getFullYear()}</span>
                      </motion.h2>
                    </AnimatePresence>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <span className="text-white/70">←</span>
                      </button>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <span className="text-white/70">→</span>
                      </button>
                      <button
                        onClick={() => {
                          setDirection(0)
                          setCurrentDate(new Date())
                        }}
                        className="ml-2 px-4 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-all"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Platform Filter */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedPlatform('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedPlatform === 'all'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {(Object.keys(OPTIMAL_TIMES) as Platform[]).map(platform => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedPlatform === platform
                            ? `${platformStyles[platform].bg} ${platformStyles[platform].text} shadow-lg ${platformStyles[platform].glow}`
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                {/* Day Names */}
                <div className="grid grid-cols-7 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-white/30 uppercase tracking-wider py-3">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={currentDate.toISOString()}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <motion.div
                      className="grid grid-cols-7 gap-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {calendarDays.map((day, index) => {
                        const isSelected = selectedDay?.getTime() === day.date.getTime()
                        const hasOptimalDay = selectedPlatform !== 'all' && isOptimalTime(selectedPlatform, day.date)

                        return (
                          <motion.button
                            key={index}
                            variants={cellVariants}
                            onClick={() => setSelectedDay(day.date)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              relative min-h-[90px] md:min-h-[100px] p-2 rounded-xl transition-all text-left group
                              ${day.isCurrentMonth
                                ? 'bg-white/[0.03] hover:bg-white/[0.06]'
                                : 'bg-transparent opacity-40 hover:opacity-60'}
                              ${day.isToday
                                ? 'ring-2 ring-amber-500/50 bg-amber-500/5'
                                : ''}
                              ${isSelected
                                ? 'ring-2 ring-white/30 bg-white/[0.08]'
                                : ''}
                              ${hasOptimalDay && day.isCurrentMonth
                                ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                                : ''}
                            `}
                          >
                            {/* Date Number */}
                            <div className={`
                              text-sm font-semibold mb-2 flex items-center gap-1.5
                              ${day.isToday
                                ? 'text-amber-400'
                                : day.isCurrentMonth
                                  ? 'text-white/80 group-hover:text-white'
                                  : 'text-white/30'}
                            `}>
                              <span className={`
                                ${day.isToday
                                  ? 'w-6 h-6 flex items-center justify-center rounded-full bg-amber-500 text-black text-xs'
                                  : ''}
                              `}>
                                {day.date.getDate()}
                              </span>
                              {hasOptimalDay && day.isCurrentMonth && (
                                <span className="text-[10px] text-emerald-400 font-medium">PRIME</span>
                              )}
                            </div>

                            {/* Post Indicators */}
                            {day.posts.length > 0 && (
                              <div className="space-y-1">
                                {day.posts.slice(0, 2).map((post) => (
                                  <div
                                    key={post.id}
                                    className={`
                                      text-[10px] md:text-xs px-2 py-1 rounded-md truncate font-medium
                                      ${platformStyles[post.platform].bg} ${platformStyles[post.platform].text}
                                      shadow-sm
                                    `}
                                  >
                                    {formatTime(post.scheduledFor!)}
                                  </div>
                                ))}
                                {day.posts.length > 2 && (
                                  <div className="text-[10px] text-white/40 font-medium px-1">
                                    +{day.posts.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex flex-wrap items-center gap-6 text-xs text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">PRIME</span>
                    <span>Optimal posting day</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {(Object.keys(platformStyles) as Platform[]).map(platform => (
                      <div key={platform} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${platformStyles[platform].bg}`} />
                        <span>{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Weekly Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-4 text-white/80">This Week</h3>

              <div className="mb-6">
                <div className="font-display text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {weekStats.weekTotal}
                </div>
                <div className="text-sm text-white/40 mt-1">posts scheduled</div>
              </div>

              {Object.entries(weekStats.platformCounts).length > 0 ? (
                <div className="space-y-3">
                  {(Object.entries(weekStats.platformCounts) as [Platform, number][]).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${platformStyles[platform].bg}`} />
                        <span className="text-sm text-white/70">{platform}</span>
                      </div>
                      <span className="text-sm font-semibold text-white/90">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/30">No posts scheduled</p>
              )}
            </motion.div>

            {/* Selected Day Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-1">
                {selectedDay
                  ? selectedDay.toLocaleDateString('en-US', { weekday: 'long' })
                  : 'Select a Day'}
              </h3>
              {selectedDay && (
                <p className="text-sm text-white/40 mb-4">
                  {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              )}

              {selectedDay && (
                <>
                  {selectedDayPosts.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {selectedDayPosts.map(post => {
                        const isExpanded = expandedPostId === post.id
                        const isCopied = copiedId === post.id

                        return (
                          <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden"
                          >
                            {/* Post Header */}
                            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={`${platformStyles[post.platform].bg} ${platformStyles[post.platform].text} text-[10px] font-semibold`}>
                                  {post.platform}
                                </Badge>
                                <span className="text-xs text-white/50 font-medium">
                                  {formatTime(post.scheduledFor!)}
                                </span>
                              </div>
                              <span className="text-[10px] text-white/30">{getBrandName(post.brandId)}</span>
                            </div>

                            {/* Post Content */}
                            <div className="px-4 py-3">
                              <div
                                className={`text-sm text-white/70 leading-relaxed whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}
                              >
                                {post.content}
                              </div>

                              {post.content.length > 150 && (
                                <button
                                  onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                                  className="text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium"
                                >
                                  {isExpanded ? '← Show less' : 'Read more →'}
                                </button>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs h-8"
                                onClick={() => handleCopy(post)}
                              >
                                {isCopied ? 'Copied' : 'Copy'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8 px-3"
                                onClick={() => deletePost(post.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/30 text-sm mb-4">No posts scheduled</p>
                    </div>
                  )}

                  <Button asChild className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold shadow-lg shadow-amber-500/20">
                    <Link to="/dashboard">Schedule Post</Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Optimal Times */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-4 text-white/80">Best Times to Post</h3>

              <div className="space-y-4">
                {(Object.entries(OPTIMAL_TIMES) as [Platform, typeof OPTIMAL_TIMES[Platform]][]).map(([platform, data]) => (
                  <div
                    key={platform}
                    className={`pb-4 border-b border-white/5 last:border-0 last:pb-0 transition-opacity ${
                      selectedPlatform !== 'all' && selectedPlatform !== platform ? 'opacity-30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-sm ${platformStyles[platform].bg}`} />
                      <span className="font-semibold text-sm text-white/90">{platform}</span>
                    </div>
                    <p className="text-xs text-white/40 mb-2 leading-relaxed">{data.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {data.times.map(time => (
                        <span
                          key={time}
                          className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-white/60 font-medium"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
