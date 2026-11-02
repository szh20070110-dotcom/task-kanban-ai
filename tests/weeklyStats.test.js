import { describe, expect, it } from 'vitest'
import {
  formatWeekLabel,
  getWeeklyStats,
  startOfWeek,
} from '../src/utils/weeklyStats.js'

const NOW = new Date(2026, 5, 10, 12, 0, 0)

function at(month, day, hour = 9, minute = 0) {
  return new Date(2026, month, day, hour, minute).getTime()
}

function sampleTasks() {
  return [
    {
      id: 'a',
      title: '本周创建并完成',
      columnId: 'done',
      createdAt: at(5, 8, 9),
      completedAt: at(5, 9, 10),
    },
    {
      id: 'b',
      title: '本周创建进行中',
      columnId: 'doing',
      createdAt: at(5, 9, 8),
      completedAt: null,
    },
    {
      id: 'c',
      title: '上周创建并完成',
      columnId: 'done',
      createdAt: at(5, 3, 8),
      completedAt: at(5, 4, 11),
    },
    {
      id: 'd',
      title: '今天创建并完成',
      columnId: 'done',
      createdAt: at(5, 10, 9),
      completedAt: at(5, 10, 11),
    },
    {
      id: 'e',
      title: '很久以前的待办',
      columnId: 'todo',
      createdAt: at(3, 1, 10),
      completedAt: null,
    },
  ]
}

describe('weeklyStats', () => {
  it('startOfWeek 以周一为一周起点并处理跨年', () => {
    const monday = startOfWeek(NOW)
    expect(monday.getFullYear()).toBe(2026)
    expect(monday.getMonth()).toBe(5)
    expect(monday.getDate()).toBe(8)
    expect(monday.getHours()).toBe(0)

    const sunday = startOfWeek(new Date(2026, 5, 14, 23, 59))
    expect(sunday.getDate()).toBe(8)

    const crossYear = startOfWeek(new Date(2026, 0, 1, 10))
    expect(crossYear.getFullYear()).toBe(2025)
    expect(crossYear.getMonth()).toBe(11)
    expect(crossYear.getDate()).toBe(29)

    expect(startOfWeek(new Date('not-a-date'))).toBeNull()
  })

  it('统计本周新增、完成、进行中与整体完成率', () => {
    const stats = getWeeklyStats(sampleTasks(), NOW)

    expect(stats.label).toBe('6 月 8 日 - 6 月 14 日')
    expect(stats.created).toBe(3)
    expect(stats.completed).toBe(2)
    expect(stats.total).toBe(5)
    expect(stats.done).toBe(3)
    expect(stats.active).toBe(2)
    expect(stats.completionRate).toBe(60)
    expect(stats.previous).toEqual({ created: 1, completed: 1 })
    expect(stats.change).toEqual({ created: 200, completed: 100 })
  })

  it('按天拆分新增与完成数据并找出最活跃的一天', () => {
    const stats = getWeeklyStats(sampleTasks(), NOW)

    expect(stats.daily).toHaveLength(7)
    expect(stats.daily.map((day) => day.label)).toEqual([
      '周一',
      '周二',
      '周三',
      '周四',
      '周五',
      '周六',
      '周日',
    ])
    expect(stats.daily.map((day) => day.created)).toEqual([1, 1, 1, 0, 0, 0, 0])
    expect(stats.daily.map((day) => day.completed)).toEqual([0, 1, 1, 0, 0, 0, 0])
    expect(stats.maxDaily).toBe(1)
    expect(stats.busiestDay).toMatchObject({ label: '周二', total: 2 })
  })

  it('周日仍归属于本周且边界时间判断准确', () => {
    const sundayNow = new Date(2026, 5, 14, 23, 0, 0)
    const boundaryTasks = [
      { id: '1', columnId: 'todo', createdAt: at(5, 8, 0), completedAt: null },
      { id: '2', columnId: 'todo', createdAt: at(5, 14, 22), completedAt: null },
      { id: '3', columnId: 'todo', createdAt: at(5, 7, 23, 59), completedAt: null },
    ]

    const stats = getWeeklyStats(boundaryTasks, sundayNow)

    expect(stats.weekStart).toBe(new Date(2026, 5, 8).getTime())
    expect(stats.created).toBe(2)
    expect(stats.daily[6].created).toBe(1)
  })

  it('上周数据为 0 时环比使用 100 与 0 的安全语义', () => {
    const stats = getWeeklyStats(
      [
        {
          id: 'a',
          columnId: 'done',
          createdAt: at(5, 8, 9),
          completedAt: at(5, 8, 10),
        },
      ],
      NOW,
    )

    expect(stats.previous).toEqual({ created: 0, completed: 0 })
    expect(stats.change.created).toBe(100)
    expect(stats.change.completed).toBe(100)
  })

  it('无任务或非法数据时返回零值而不抛错', () => {
    const empty = getWeeklyStats([], NOW)
    expect(empty.created).toBe(0)
    expect(empty.completed).toBe(0)
    expect(empty.completionRate).toBe(0)
    expect(empty.busiestDay).toBeNull()
    expect(empty.daily).toHaveLength(7)

    const invalid = getWeeklyStats(
      [null, 'bad', { createdAt: NaN, completedAt: '2026-06-09' }],
      NOW,
    )
    expect(invalid.created).toBe(0)
    expect(invalid.completed).toBe(0)
    expect(invalid.done).toBe(0)

    const notArray = getWeeklyStats(undefined, NOW)
    expect(notArray.total).toBe(0)
    expect(notArray.created).toBe(0)
  })

  it('formatWeekLabel 输出可读的周区间', () => {
    expect(formatWeekLabel(new Date(2026, 5, 8))).toBe('6 月 8 日 - 6 月 14 日')
    expect(formatWeekLabel(new Date(2026, 11, 28))).toBe('12 月 28 日 - 1 月 3 日')
    expect(formatWeekLabel(null)).toBe('')
  })
})