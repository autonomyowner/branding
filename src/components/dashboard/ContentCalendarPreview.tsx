import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { useData } from "../../context/DataContext"
import { useMemo } from "react"

interface ContentCalendarPreviewProps {
  onSchedulePost?: () => void
}

export function ContentCalendarPreview({ onSchedulePost }: ContentCalendarPreviewProps) {
  const { t } = useTranslation()
  const { posts } = useData()

  // Get the next 7 days and count scheduled posts for each day
  const weekDays = useMemo(() => {
    const days: { day: string; date: Date; count: number; posts: string[] }[] = []
    const now = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      // Find scheduled posts for this day
      const dayPosts = posts.filter(p => {
        if (p.status !== 'scheduled' || !p.scheduledFor) return false
        const postDate = new Date(p.scheduledFor)
        return postDate >= date && postDate < nextDay
      })

      const dayName = i === 0 ? 'Today' :
        i === 1 ? 'Tomorrow' :
        date.toLocaleDateString('en-US', { weekday: 'short' })

      days.push({
        day: dayName,
        date,
        count: dayPosts.length,
        posts: dayPosts.map(p => {
          const time = new Date(p.scheduledFor!).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })
          return `${p.platform} ${time}`
        })
      })
    }

    return days
  }, [posts])

  return (
    <Card className="p-3 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold">{t('dashboard.calendarPreview')}</h2>
        <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3">
          <a href="/calendar">{t('dashboard.viewCalendar')}</a>
        </Button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {weekDays.map((day, index) => (
          <div
            key={day.day}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors ${
              index === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'
            }`}
          >
            {/* Day */}
            <div className="w-10 sm:w-12 text-center flex-shrink-0">
              <span className={`text-xs sm:text-sm font-medium ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                {day.day}
              </span>
            </div>

            {/* Posts indicator */}
            <div className="flex-1 min-w-0">
              {day.count > 0 ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex -space-x-1">
                    {Array.from({ length: Math.min(day.count, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-card"
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {day.count} post{day.count > 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <span className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.noPosts')}</span>
              )}
            </div>

            {/* Status */}
            {day.count > 0 && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0" title="Scheduled" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Add */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full text-xs sm:text-sm"
          size="sm"
          onClick={onSchedulePost}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 me-1.5 sm:me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('quickActions.generate')}
        </Button>
      </div>
    </Card>
  )
}
