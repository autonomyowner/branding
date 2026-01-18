import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useData, type Post, type Platform } from "../context/DataContext"
import { Button } from "../components/ui/button"
import { Logo } from "../components/ui/Logo"
import { MobileNav } from "../components/dashboard/MobileNav"

// Optimal posting times based on 2025 research
const OPTIMAL_TIMES: Record<Platform, { times: string[]; days: string[]; description: string }> = {
  Instagram: {
    times: ["7:00 AM", "12:00 PM", "5:00 PM", "7:00 PM"],
    days: ["Monday", "Tuesday", "Wednesday"],
    description: "Best: Tue-Wed, 7AM or 12PM"
  },
  Twitter: {
    times: ["8:00 AM", "12:00 PM", "5:00 PM", "9:00 PM"],
    days: ["Tuesday", "Wednesday", "Thursday"],
    description: "Best: Weekdays 8AM-10AM"
  },
  LinkedIn: {
    times: ["7:00 AM", "10:00 AM", "12:00 PM", "5:00 PM"],
    days: ["Tuesday", "Wednesday", "Thursday"],
    description: "Best: Tue-Thu, 10AM-12PM"
  },
  TikTok: {
    times: ["7:00 AM", "12:00 PM", "3:00 PM", "7:00 PM", "9:00 PM"],
    days: ["Tuesday", "Thursday", "Friday"],
    description: "Best: Thu 7PM, Fri 5PM"
  },
  Facebook: {
    times: ["9:00 AM", "1:00 PM", "4:00 PM"],
    days: ["Wednesday", "Thursday", "Friday"],
    description: "Best: Wed-Thu 1-4PM"
  }
}

const platformColors: Record<Platform, { primary: string; glow: string; bg: string }> = {
  Instagram: { primary: "#E1306C", glow: "rgba(225, 48, 108, 0.4)", bg: "rgba(225, 48, 108, 0.15)" },
  Twitter: { primary: "#1DA1F2", glow: "rgba(29, 161, 242, 0.4)", bg: "rgba(29, 161, 242, 0.15)" },
  LinkedIn: { primary: "#0A66C2", glow: "rgba(10, 102, 194, 0.4)", bg: "rgba(10, 102, 194, 0.15)" },
  TikTok: { primary: "#ffffff", glow: "rgba(255, 255, 255, 0.3)", bg: "rgba(255, 255, 255, 0.1)" },
  Facebook: { primary: "#1877F2", glow: "rgba(24, 119, 242, 0.4)", bg: "rgba(24, 119, 242, 0.15)" }
}

interface DayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
}

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setDisplayValue(Math.floor(progress * value))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{displayValue}</span>
}

export function CalendarPage() {
  const { t } = useTranslation()
  const { posts, brands, deletePost } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [direction, setDirection] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

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
      if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) return false
      const postDate = new Date(p.scheduledFor)
      return postDate >= dayStart && postDate <= dayEnd
    }).sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
  }, [selectedDay, posts, selectedPlatform])

  // Weekly stats
  const weekStats = useMemo(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    let weekTotal = 0
    const platformCounts: Partial<Record<Platform, number>> = {}
    const dailyCounts: number[] = [0, 0, 0, 0, 0, 0, 0]

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
          dailyCounts[i]++
          platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1
        }
      })
    }

    return { weekTotal, platformCounts, dailyCounts }
  }, [posts])

  // Monthly stats
  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

    return posts.filter(p => {
      if (p.status !== 'scheduled' || !p.scheduledFor) return false
      const postDate = new Date(p.scheduledFor)
      return postDate >= monthStart && postDate <= monthEnd
    }).length
  }, [posts, currentDate])

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

  const isOptimalDay = (platform: Platform, date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return OPTIMAL_TIMES[platform].days.includes(dayName)
  }

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      {/* Background grid pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251, 191, 36, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 191, 36, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-amber-500/[0.03] rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-12">
            <Logo />
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-[13px] text-white/40 hover:text-white transition-colors tracking-wide uppercase font-medium">{t('nav.dashboard')}</Link>
              <Link to="/posts" className="text-[13px] text-white/40 hover:text-white transition-colors tracking-wide uppercase font-medium">{t('nav.posts')}</Link>
              <Link to="/calendar" className="text-[13px] text-amber-400 tracking-wide uppercase font-medium relative">
                {t('nav.calendar')}
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500"
                />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-32 md:pb-8 relative">
        {/* Hero Section - Month Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentDate.toISOString()}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -30 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white leading-none"
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                </motion.h1>
              </AnimatePresence>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl sm:text-3xl text-white/20 font-light tracking-tight">
                  {currentDate.getFullYear()}
                </span>
                <div className="h-6 w-px bg-white/10" />
                <span className="text-sm text-amber-400/80 font-mono tracking-wider">
                  {monthStats} SCHEDULED
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth(-1)}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 flex items-center justify-center transition-all group"
              >
                <span className="text-white/50 group-hover:text-white text-xl">←</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDirection(0)
                  setCurrentDate(new Date())
                }}
                className="px-6 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-mono text-sm tracking-wider transition-all"
              >
                TODAY
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth(1)}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 flex items-center justify-center transition-all group"
              >
                <span className="text-white/50 group-hover:text-white text-xl">→</span>
              </motion.button>
            </div>
          </div>

          {/* Platform Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlatform('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all whitespace-nowrap flex-shrink-0 border ${
                selectedPlatform === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-transparent shadow-lg shadow-amber-500/25'
                  : 'bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.05] hover:text-white hover:border-white/10'
              }`}
            >
              ALL PLATFORMS
            </motion.button>
            {(Object.keys(OPTIMAL_TIMES) as Platform[]).map(platform => (
              <motion.button
                key={platform}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all whitespace-nowrap flex-shrink-0 border ${
                  selectedPlatform === platform
                    ? 'text-white border-transparent shadow-lg'
                    : 'bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.05] hover:text-white hover:border-white/10'
                }`}
                style={selectedPlatform === platform ? {
                  background: platformColors[platform].bg,
                  borderColor: platformColors[platform].primary,
                  boxShadow: `0 4px 20px ${platformColors[platform].glow}`
                } : {}}
              >
                {platform.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

          {/* Week Stats Bar - Full width on mobile, spans 8 cols on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white/30 tracking-[0.2em] uppercase">This Week</h3>
              <span className="text-xs text-amber-400/60 font-mono">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Week Activity Bars */}
            <div className="flex items-end gap-2 sm:gap-3 h-24 sm:h-32">
              {dayNames.map((day, i) => {
                const count = weekStats.dailyCounts[i]
                const maxCount = Math.max(...weekStats.dailyCounts, 1)
                const height = (count / maxCount) * 100
                const isToday = new Date().getDay() === i

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 8)}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                      className={`w-full rounded-t-lg relative overflow-hidden ${
                        isToday
                          ? 'bg-gradient-to-t from-amber-500/80 to-amber-400'
                          : count > 0
                            ? 'bg-gradient-to-t from-white/20 to-white/10'
                            : 'bg-white/[0.04]'
                      }`}
                      style={{ minHeight: '8px' }}
                    >
                      {count > 0 && (
                        <span className="absolute inset-x-0 top-1 text-center text-[10px] font-bold text-black/60">
                          {count}
                        </span>
                      )}
                    </motion.div>
                    <span className={`text-[10px] sm:text-xs font-medium tracking-wider ${isToday ? 'text-amber-400' : 'text-white/30'}`}>
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Total Posts Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-5 sm:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <h3 className="text-xs font-semibold text-amber-400/50 tracking-[0.2em] uppercase mb-2">Weekly Total</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter" style={{ fontFamily: "'Inter', system-ui" }}>
                <AnimatedCounter value={weekStats.weekTotal} />
              </span>
              <span className="text-lg text-white/30">posts</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.entries(weekStats.platformCounts) as [Platform, number][]).map(([platform, count]) => (
                <span
                  key={platform}
                  className="text-[10px] px-2 py-1 rounded-md font-medium"
                  style={{
                    background: platformColors[platform].bg,
                    color: platformColors[platform].primary
                  }}
                >
                  {platform}: {count}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Calendar Grid - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block lg:col-span-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] overflow-hidden"
          >
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-white/[0.04]">
              {dayNames.map((day, i) => (
                <div key={day} className={`py-4 text-center text-[11px] font-semibold tracking-[0.15em] ${
                  i === 0 || i === 6 ? 'text-white/20' : 'text-white/40'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDate.toISOString()}
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -20 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-7"
              >
                {calendarDays.map((day, index) => {
                  const isSelected = selectedDay?.getTime() === day.date.getTime()
                  const hasOptimal = selectedPlatform !== 'all' && isOptimalDay(selectedPlatform, day.date)
                  const isHovered = hoveredDay === index

                  return (
                    <motion.button
                      key={index}
                      onMouseEnter={() => setHoveredDay(index)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setSelectedDay(day.date)}
                      className={`
                        relative aspect-square p-2 border-r border-b border-white/[0.03] transition-all duration-200
                        ${day.isCurrentMonth ? '' : 'opacity-30'}
                        ${day.isToday ? 'bg-amber-500/[0.08]' : ''}
                        ${isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                        ${hasOptimal && day.isCurrentMonth ? 'bg-emerald-500/[0.05]' : ''}
                      `}
                    >
                      {/* Date */}
                      <div className={`
                        text-sm font-semibold mb-1 flex items-center gap-1
                        ${day.isToday ? 'text-amber-400' : day.isCurrentMonth ? 'text-white/70' : 'text-white/30'}
                      `}>
                        <span className={day.isToday ? 'w-7 h-7 flex items-center justify-center rounded-full bg-amber-500 text-black font-bold' : ''}>
                          {day.date.getDate()}
                        </span>
                        {hasOptimal && day.isCurrentMonth && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>

                      {/* Posts */}
                      {day.posts.length > 0 && (
                        <div className="space-y-1">
                          {day.posts.slice(0, 3).map((post, i) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="h-1.5 rounded-full"
                              style={{
                                background: platformColors[post.platform].primary,
                                boxShadow: isHovered ? `0 0 8px ${platformColors[post.platform].glow}` : 'none'
                              }}
                            />
                          ))}
                          {day.posts.length > 3 && (
                            <span className="text-[9px] text-white/40 font-medium">+{day.posts.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Selected indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="selected-day"
                          className="absolute inset-0 border-2 border-amber-500/50 rounded-lg pointer-events-none"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Mobile: Vertical Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sm:hidden col-span-full rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] p-4 max-h-[60vh] overflow-y-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDate.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                {calendarDays
                  .filter(day => day.isCurrentMonth)
                  .map((day, index) => {
                    const isSelected = selectedDay?.getTime() === day.date.getTime()
                    const hasOptimal = selectedPlatform !== 'all' && isOptimalDay(selectedPlatform, day.date)
                    const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()

                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.015 }}
                        onClick={() => setSelectedDay(day.date)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-xl transition-all
                          ${day.isToday ? 'bg-amber-500/10 border border-amber-500/20' : 'border border-transparent'}
                          ${isSelected ? 'bg-white/[0.06] border-white/10' : 'hover:bg-white/[0.03]'}
                        `}
                      >
                        {/* Date Block */}
                        <div className={`
                          w-14 h-14 flex flex-col items-center justify-center rounded-xl flex-shrink-0 font-mono
                          ${day.isToday
                            ? 'bg-amber-500 text-black'
                            : 'bg-white/[0.04] text-white/70'}
                        `}>
                          <span className="text-[10px] font-medium opacity-60">{dayName}</span>
                          <span className="text-xl font-bold leading-none">{day.date.getDate()}</span>
                        </div>

                        {/* Posts */}
                        <div className="flex-1 min-w-0">
                          {day.posts.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {day.posts.map((post) => (
                                <span
                                  key={post.id}
                                  className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                                  style={{
                                    background: platformColors[post.platform].bg,
                                    color: platformColors[post.platform].primary
                                  }}
                                >
                                  {post.platform} {formatTime(post.scheduledFor!)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-white/20 font-medium">No posts</span>
                          )}
                        </div>

                        {/* Optimal Badge */}
                        {hasOptimal && (
                          <span className="text-[9px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold tracking-wider flex-shrink-0">
                            PRIME
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Selected Day Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-4 lg:row-span-2 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] p-5 sm:p-6 flex flex-col"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay?.toISOString() || 'none'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col"
              >
                {selectedDay ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
                      </h3>
                      <p className="text-sm text-white/30 font-mono mt-1">
                        {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {selectedDayPosts.length > 0 ? (
                      <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                        {selectedDayPosts.map((post, i) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-xl border overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${platformColors[post.platform].bg}, transparent)`,
                              borderColor: `${platformColors[post.platform].primary}30`
                            }}
                          >
                            <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: platformColors[post.platform].primary }}
                                />
                                <span className="text-sm font-semibold text-white/90">{post.platform}</span>
                                <span className="text-xs text-white/40 font-mono">{formatTime(post.scheduledFor!)}</span>
                              </div>
                              <span className="text-[10px] text-white/30 truncate max-w-[80px]">{getBrandName(post.brandId)}</span>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{post.content}</p>
                            </div>
                            <div className="px-4 py-3 flex gap-2 border-t border-white/[0.04]">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 text-xs h-8"
                                onClick={() => handleCopy(post)}
                              >
                                {copiedId === post.id ? 'Copied!' : 'Copy'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-xs h-8 px-3"
                                onClick={() => deletePost(post.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                          <span className="text-2xl opacity-30">📅</span>
                        </div>
                        <p className="text-white/30 text-sm mb-1">No posts scheduled</p>
                        <p className="text-white/20 text-xs">Click below to create one</p>
                      </div>
                    )}

                    <Button asChild className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold shadow-lg shadow-amber-500/20 text-sm h-11">
                      <Link to="/dashboard">Schedule Post</Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-white/30">Select a day to view details</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Best Times Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block lg:col-span-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] p-5 sm:p-6"
          >
            <h3 className="text-xs font-semibold text-white/30 tracking-[0.2em] uppercase mb-5">Optimal Posting Times</h3>
            <div className="grid grid-cols-5 gap-4">
              {(Object.entries(OPTIMAL_TIMES) as [Platform, typeof OPTIMAL_TIMES[Platform]][]).map(([platform, data]) => (
                <div
                  key={platform}
                  className={`rounded-xl p-4 transition-all border ${
                    selectedPlatform !== 'all' && selectedPlatform !== platform
                      ? 'opacity-30'
                      : ''
                  }`}
                  style={{
                    background: platformColors[platform].bg,
                    borderColor: `${platformColors[platform].primary}20`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: platformColors[platform].primary }}
                    />
                    <span className="text-xs font-bold text-white/90">{platform}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mb-3 leading-relaxed">{data.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {data.times.slice(0, 3).map(time => (
                      <span key={time} className="text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-white/50 font-mono">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
