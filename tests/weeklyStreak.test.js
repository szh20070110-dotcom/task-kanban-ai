import { describe, expect, it } from 'vitest'
import { computeStreakDays, getWeeklyStats } from '../src/utils/weeklyStats.js'

const NOW = new Date(2026, 10, 4, 12, 0, 0) // 2026-11-04 周三中午

function task(id, completedAt) {
  return {
    id,
    title: id,
    description: '',
    category: 'work',
    columnId: completedAt ? 'done' : 'todo',
    starred: false,
    urgent: false,
    createdAt: completedAt ?? new Date(2026, 9, 1).getTime(),
    updatedAt: completedAt ?? new Date(2026, 9, 1).getTime(),
    completedAt: completedAt ?? null,
  }
}

const at = (month, day, hour = 10) => new Date(2026, month, day, hour).getTime()

describe('computeStreakDays', () => {
  it('没有任何完成记录时为 0', () => {
    expect(computeStreakDays([task('a', null)], NOW)).toBe(0)
  })

  it('今天完成算 1 天', () => {
    expect(computeStreakDays([task('a', at(10, 4))], NOW)).toBe(1)
  })

  it('今天没做但昨天做了，连续从昨天往回数', () => {
    const tasks = [task('a', at(10, 3)), task('b', at(10, 2)), task('c', at(10, 1))]
    expect(computeStreakDays(tasks, NOW)).toBe(3)
  })

  it('中间断一天就截断', () => {
    const tasks = [task('a', at(10, 4)), task('b', at(10, 2)), task('c', at(10, 1))]
    expect(computeStreakDays(tasks, NOW)).toBe(1)
  })

  it('今天和昨天都没做，连续归零（哪怕前天做过）', () => {
    const tasks = [task('a', at(10, 2)), task('b', at(10, 1))]
    expect(computeStreakDays(tasks, NOW)).toBe(0)
  })

  it('同一天多条完成只算一天', () => {
    const tasks = [task('a', at(10, 4, 9)), task('b', at(10, 4, 18))]
    expect(computeStreakDays(tasks, NOW)).toBe(1)
  })

  it('getWeeklyStats 会带上 streakDays 字段', () => {
    const stats = getWeeklyStats([task('a', at(10, 4))], NOW)
    expect(stats.streakDays).toBe(1)
  })
})
