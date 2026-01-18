import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useData, type Post, type Platform } from "../context/DataContext"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Logo } from "../components/ui/Logo"
import { MobileNav } from "../components/dashboard/MobileNav"

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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 pb-32 md:pb-10 mb-20 md:mb-0 relative">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-10"
        >
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-1 sm:mb-2">
            Content Calendar
          </h1>
          <p className="text-white/40 text-sm sm:text-lg">Plan and visualize your content schedule</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Calendar - 3 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="p-3 sm:p-6 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.h2
                        key={currentDate.toISOString()}
                        initial={{ opacity: 0, y: direction > 0 ? 20 : -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: direction > 0 ? -20 : 20 }}
                        transition={{ duration: 0.2 }}
                        className="font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight"
                      >
                        {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                        <span className="text-white/30 ml-1 sm:ml-2">{currentDate.getFullYear()}</span>
                      </motion.h2>
                    </AnimatePresence>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <span className="text-white/70 text-sm sm:text-base">←</span>
                      </button>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      >
                        <span className="text-white/70 text-sm sm:text-base">→</span>
                      </button>
                      <button
                        onClick={() => {
                          setDirection(0)
                          setCurrentDate(new Date())
                        }}
                        className="ml-1 sm:ml-2 px-2 sm:px-4 h-7 sm:h-9 rounded-lg bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-all"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Platform Filter */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    <button
                      onClick={() => setSelectedPlatform('all')}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
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
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
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

              <div className="p-2 sm:p-4 md:p-6 overflow-x-auto scrollbar-hide">
                <div className="min-w-[320px]">
                  {/* Day Names */}
                  <div className="grid grid-cols-7 mb-2 md:mb-3">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] md:text-xs font-semibold text-white/30 uppercase tracking-wider py-2 md:py-3">
                        <span className="md:hidden">{day}</span>
                        <span className="hidden md:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
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
                        className="grid grid-cols-7 gap-1 md:gap-2"
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
                              relative min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all text-left group
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
                              text-[11px] sm:text-xs md:text-sm font-semibold mb-1 md:mb-2 flex items-center gap-1
                              ${day.isToday
                                ? 'text-amber-400'
                                : day.isCurrentMonth
                                  ? 'text-white/80 group-hover:text-white'
                                  : 'text-white/30'}
                            `}>
                              <span className={`
                                ${day.isToday
                                  ? 'w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-amber-500 text-black text-[10px] md:text-xs'
                                  : ''}
                              `}>
                                {day.date.getDate()}
                              </span>
                              {hasOptimalDay && day.isCurrentMonth && (
                                <span className="hidden sm:inline text-[8px] md:text-[10px] text-emerald-400 font-medium">PRIME</span>
                              )}
                            </div>

                            {/* Post Indicators */}
                            {day.posts.length > 0 && (
                              <div className="space-y-0.5 md:space-y-1">
                                {/* Mobile: show count badge only */}
                                <div className="sm:hidden">
                                  <div
                                    className={`
                                      text-[8px] px-1.5 py-0.5 rounded font-semibold inline-block
                                      ${platformStyles[day.posts[0].platform].bg} ${platformStyles[day.posts[0].platform].text}
                                    `}
                                  >
                                    {day.posts.length}
                                  </div>
                                </div>
                                {/* Desktop: show times */}
                                <div className="hidden sm:block space-y-1">
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
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                </div>
              </div>

              {/* Legend - hidden on mobile */}
              <div className="hidden sm:block px-4 md:px-6 py-3 md:py-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[10px] md:text-xs text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">PRIME</span>
                    <span>Optimal posting day</span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    {(Object.keys(platformStyles) as Platform[]).map(platform => (
                      <div key={platform} className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm ${platformStyles[platform].bg}`} />
                        <span>{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar - 1 column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Weekly Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-3 sm:p-6"
            >
              <div className="flex items-center justify-between sm:block">
                <h3 className="font-display text-sm sm:text-lg font-semibold sm:mb-4 text-white/80">This Week</h3>
                <div className="flex items-baseline gap-1 sm:block sm:mb-6">
                  <div className="font-display text-2xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {weekStats.weekTotal}
                  </div>
                  <div className="text-[10px] sm:text-sm text-white/40 sm:mt-1">scheduled</div>
                </div>
              </div>

              {Object.entries(weekStats.platformCounts).length > 0 ? (
                <div className="hidden sm:block space-y-3">
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
                <p className="hidden sm:block text-sm text-white/30">No posts scheduled</p>
              )}
            </motion.div>

            {/* Selected Day Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-3 sm:p-6"
            >
              <div className="flex items-center justify-between sm:block mb-2 sm:mb-0">
                <h3 className="font-display text-sm sm:text-lg font-semibold sm:mb-1">
                  {selectedDay
                    ? selectedDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : 'Select a Day'}
                </h3>
                {selectedDay && (
                  <span className="text-[10px] sm:hidden text-white/40">
                    {selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {selectedDay && (
                <p className="hidden sm:block text-sm text-white/40 mb-4">
                  {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              )}

              {selectedDay && (
                <>
                  {selectedDayPosts.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {selectedDayPosts.map(post => {
                        const isExpanded = expandedPostId === post.id
                        const isCopied = copiedId === post.id

                        return (
                          <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden"
                          >
                            {/* Post Header */}
                            <div className="px-2 sm:px-4 py-1.5 sm:py-3 border-b border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Badge className={`${platformStyles[post.platform].bg} ${platformStyles[post.platform].text} text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2`}>
                                  {post.platform}
                                </Badge>
                                <span className="text-[9px] sm:text-xs text-white/50 font-medium">
                                  {formatTime(post.scheduledFor!)}
                                </span>
                              </div>
                              <span className="hidden sm:inline text-[10px] text-white/30 truncate max-w-[80px]">{getBrandName(post.brandId)}</span>
                            </div>

                            {/* Post Content - hidden on mobile */}
                            <div className="hidden sm:block px-4 py-3">
                              <div
                                className={`text-sm text-white/70 leading-relaxed whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}
                              >
                                {post.content}
                              </div>

                              {post.content.length > 100 && (
                                <button
                                  onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                                  className="text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium"
                                >
                                  {isExpanded ? '← Less' : 'More →'}
                                </button>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="px-2 sm:px-4 py-1.5 sm:py-3 border-t border-white/5 flex items-center gap-1 sm:gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] sm:text-xs h-6 sm:h-8"
                                onClick={() => handleCopy(post)}
                              >
                                {isCopied ? 'Copied' : 'Copy'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[9px] sm:text-xs h-6 sm:h-8 px-1.5 sm:px-3"
                                onClick={() => deletePost(post.id)}
                              >
                                Del
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-8">
                      <p className="text-white/30 text-xs sm:text-sm">No posts</p>
                    </div>
                  )}

                  <Button asChild className="w-full mt-2 sm:mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold shadow-lg shadow-amber-500/20 text-[10px] sm:text-sm h-7 sm:h-10">
                    <Link to="/dashboard">Schedule</Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Optimal Times - Hidden on mobile to save space */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden sm:block rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-4 sm:p-6"
            >
              <h3 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white/80">Best Times to Post</h3>

              <div className="space-y-3 sm:space-y-4">
                {(Object.entries(OPTIMAL_TIMES) as [Platform, typeof OPTIMAL_TIMES[Platform]][]).map(([platform, data]) => (
                  <div
                    key={platform}
                    className={`pb-3 sm:pb-4 border-b border-white/5 last:border-0 last:pb-0 transition-opacity ${
                      selectedPlatform !== 'all' && selectedPlatform !== platform ? 'opacity-30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm ${platformStyles[platform].bg}`} />
                      <span className="font-semibold text-xs sm:text-sm text-white/90">{platform}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/40 mb-1.5 sm:mb-2 leading-relaxed">{data.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {data.times.map(time => (
                        <span
                          key={time}
                          className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/5 text-white/60 font-medium"
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

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
