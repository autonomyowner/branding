import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  minDate?: Date
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Calendar({ selectedDate, onDateSelect, minDate = new Date() }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  const [direction, setDirection] = useState(0)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const minDateTime = useMemo(() => {
    const d = new Date(minDate)
    d.setHours(0, 0, 0, 0)
    return d
  }, [minDate])

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysArray: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      daysArray.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i))
    }

    return daysArray
  }, [currentMonth])

  const navigateMonth = (delta: number) => {
    setDirection(delta)
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + delta)
      return newDate
    })
  }

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true
    return date < minDateTime
  }

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {daysInMonth.map((date, index) => (
            <motion.button
              key={index}
              onClick={() => date && !isDateDisabled(date) && onDateSelect(date)}
              disabled={isDateDisabled(date)}
              whileHover={!isDateDisabled(date) ? { scale: 1.1 } : {}}
              whileTap={!isDateDisabled(date) ? { scale: 0.95 } : {}}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all relative
                ${!date ? 'invisible' : ''}
                ${isDateDisabled(date) ? 'text-muted-foreground/30 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
                ${isDateSelected(date) ? 'bg-primary text-primary-foreground' : ''}
                ${isToday(date) && !isDateSelected(date) ? 'border border-primary/50' : ''}
              `}
            >
              {date?.getDate()}
              {isToday(date) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface TimePickerProps {
  selectedTime: { hour: number; minute: number }
  onTimeSelect: (time: { hour: number; minute: number }) => void
}

export function TimePicker({ selectedTime, onTimeSelect }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-muted-foreground">Select Time</label>
        <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {hours.map(hour =>
            minutes.map(minute => (
              <motion.button
                key={`${hour}-${minute}`}
                onClick={() => onTimeSelect({ hour, minute })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-2 py-2 rounded-lg text-xs font-medium transition-all
                  ${selectedTime.hour === hour && selectedTime.minute === minute
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border hover:border-white/30'
                  }
                `}
              >
                {formatTime(hour, minute)}
              </motion.button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface DateTimePickerProps {
  selectedDateTime: Date | null
  onDateTimeSelect: (date: Date) => void
  minDate?: Date
}

export function DateTimePicker({ selectedDateTime, onDateTimeSelect, minDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(selectedDateTime)
  const [selectedTime, setSelectedTime] = useState({
    hour: selectedDateTime?.getHours() || 9,
    minute: selectedDateTime?.getMinutes() || 0
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const newDateTime = new Date(date)
    newDateTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0)
    onDateTimeSelect(newDateTime)
  }

  const handleTimeSelect = (time: { hour: number; minute: number }) => {
    setSelectedTime(time)
    if (selectedDate) {
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(time.hour, time.minute, 0, 0)
      onDateTimeSelect(newDateTime)
    }
  }

  const formatSelectedDateTime = () => {
    if (!selectedDate) return null
    const date = new Date(selectedDate)
    date.setHours(selectedTime.hour, selectedTime.minute, 0, 0)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Selected DateTime Display */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground mb-1">Scheduled for</p>
          <p className="text-lg font-semibold text-primary">{formatSelectedDateTime()}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="p-4 rounded-xl bg-background border border-border">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            minDate={minDate}
          />
        </div>

        {/* Time Picker */}
        <div className="p-4 rounded-xl bg-background border border-border">
          <TimePicker
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
          />
        </div>
      </div>
    </div>
  )
}
