

const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function isInRange(timestamp, start, end) {
  return (
    Number.isFinite(timestamp) &&
    timestamp >= start.getTime() &&
    timestamp < end.getTime()
  )
}

function findDayIndex(daily, timestamp) {
  const target = new Date(timestamp)
  return daily.findIndex((day) => {
    const date = new Date(day.date)
    return (
      date.getFullYear() === target.getFullYear() &&
      date.getMonth() === target.getMonth() &&
      date.getDate() === target.getDate()
    )
  })
}

function percentageChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 100)
}

function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 连续打卡：从今天（或昨天）往回数，连续「有完成任务」的天数
export function computeStreakDays(tasks, now = new Date()) {
  const doneDays = new Set()
  ;(tasks || []).forEach((task) => {
    if (!task || !task.completedAt) return
    const ts = new Date(task.completedAt)
    if (!Number.isFinite(ts.getTime())) return
    doneDays.add(dayKey(ts))
  })
  if (doneDays.size === 0) return 0

  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!doneDays.has(dayKey(cursor))) {
    cursor = addDays(cursor, -1)
    if (!doneDays.has(dayKey(cursor))) return 0
  }

  let streak = 0
  while (doneDays.has(dayKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function startOfWeek(input = new Date()) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return null

  const offset = (date.getDay() + 6) % 7
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset)
  start.setHours(0, 0, 0, 0)
  return start
}

export function formatWeekLabel(weekStart) {
  if (!(weekStart instanceof Date) || Number.isNaN(weekStart.getTime())) return ''
  const lastDay = addDays(weekStart, 6)
  return `${weekStart.getMonth() + 1} 月 ${weekStart.getDate()} 日 - ${
    lastDay.getMonth() + 1
  } 月 ${lastDay.getDate()} 日`
}

export function getWeeklyStats(tasks, now = new Date()) {
  const weekStart = startOfWeek(now)
  const safeTasks = Array.isArray(tasks) ? tasks.filter((task) => task && typeof task === 'object') : []
  const weekEnd = weekStart ? addDays(weekStart, 7) : null
  const previousStart = weekStart ? addDays(weekStart, -7) : null

  if (!weekStart) {
    return {
      weekStart: null,
      weekEnd: null,
      label: '',
      total: safeTasks.length,
      done: 0,
      active: 0,
      created: 0,
      completed: 0,
      completionRate: 0,
      streakDays: 0,
      previous: { created: 0, completed: 0 },
      change: { created: 0, completed: 0 },
      daily: [],
      busiestDay: null,
      maxDaily: 1,
    }
  }

  const daily = Array.from({ length: 7 }, (_, index) => {
    const dayStart = addDays(weekStart, index)
    return {
      date: dayStart.getTime(),
      label: DAY_LABELS[dayStart.getDay()],
      created: 0,
      completed: 0,
      total: 0,
    }
  })

  let created = 0
  let completed = 0
  let previousCreated = 0
  let previousCompleted = 0

  safeTasks.forEach((task) => {
    const createdInWeek = isInRange(task.createdAt, weekStart, weekEnd)
    const completedInWeek = isInRange(task.completedAt, weekStart, weekEnd)

    if (createdInWeek) {
      created += 1
      const bucket = daily[findDayIndex(daily, task.createdAt)]
      if (bucket) bucket.created += 1
    }

    if (completedInWeek) {
      completed += 1
      const bucket = daily[findDayIndex(daily, task.completedAt)]
      if (bucket) bucket.completed += 1
    }

    if (isInRange(task.createdAt, previousStart, weekStart)) previousCreated += 1
    if (isInRange(task.completedAt, previousStart, weekStart)) previousCompleted += 1
  })

  daily.forEach((day) => {
    day.total = day.created + day.completed
  })

  const total = safeTasks.length
  const done = safeTasks.filter((task) => task.columnId === 'done').length
  const busyCandidate = daily.reduce(
    (best, day) => (day.total > best.total ? day : best),
    { total: 0, label: '', date: null },
  )

  return {
    weekStart: weekStart.getTime(),
    weekEnd: weekEnd.getTime(),
    label: formatWeekLabel(weekStart),
    total,
    done,
    active: safeTasks.filter((task) => task.columnId !== 'done').length,
    created,
    completed,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    streakDays: computeStreakDays(safeTasks, now),
    previous: { created: previousCreated, completed: previousCompleted },
    change: {
      created: percentageChange(created, previousCreated),
      completed: percentageChange(completed, previousCompleted),
    },
    daily,
    busiestDay: busyCandidate.total > 0 ? busyCandidate : null,
    maxDaily: Math.max(1, ...daily.map((day) => Math.max(day.created, day.completed))),
  }
}