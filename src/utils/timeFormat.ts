const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  if (!Number.isFinite(timestamp)) return ''

  const diff = Math.max(0, now - timestamp)
  if (diff < 30 * 1000) return '刚刚'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} 分钟前`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`
  if (diff < WEEK) return `${Math.floor(diff / DAY)} 天前`

  const date = new Date(timestamp)
  const current = new Date(now)
  const monthDay = `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  if (date.getFullYear() === current.getFullYear()) return monthDay
  return `${date.getFullYear()} 年 ${monthDay}`
}

export function formatDateTime(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}