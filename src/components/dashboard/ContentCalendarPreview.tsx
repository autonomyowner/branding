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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{t('dashboard.calendarPreview')}</h2>
        <Button variant="ghost" size="sm" asChild>
          <a href="/calendar">{t('dashboard.viewCalendar')}</a>
        </Button>
      </div>

      <div className="space-y-3">
        {weekDays.map((day, index) => (
          <div
            key={day.day}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              index === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'
            }`}
          >
            {/* Day */}
            <div className="w-12 text-center">
              <span className={`text-sm font-medium ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                {day.day}
              </span>
            </div>

            {/* Posts indicator */}
            <div className="flex-1">
              {day.count > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {Array.from({ length: Math.min(day.count, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-card"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {day.count} post{day.count > 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{t('dashboard.noPosts')}</span>
              )}
            </div>

            {/* Status */}
            {day.count > 0 && (
              <div className="w-2 h-2 rounded-full bg-green-500" title="Scheduled" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Add */}
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={onSchedulePost}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('quickActions.generate')}
        </Button>
      </div>
    </Card>
  )
}
