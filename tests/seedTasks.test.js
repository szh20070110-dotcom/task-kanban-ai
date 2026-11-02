import { describe, expect, it } from 'vitest'
import { createSeedTasks } from '../src/config/seedTasks.js'

const NOW = new Date(2026, 5, 10, 12, 0, 0).getTime()
const tasks = createSeedTasks(NOW)

describe('seedTasks', () => {
  it('提供 6 条 ID 与标题均唯一的示例任务', () => {
    expect(tasks).toHaveLength(6)
    expect(new Set(tasks.map((task) => task.id)).size).toBe(6)
    expect(new Set(tasks.map((task) => task.title)).size).toBe(6)
    tasks.forEach((task) => {
      expect(task.title.trim()).not.toBe('')
      expect(task.createdAt).toBeLessThanOrEqual(NOW)
    })
  })

  it('覆盖三列并为已完成任务提供合法完成时间', () => {
    expect(tasks.filter((task) => task.columnId === 'todo')).toHaveLength(2)
    expect(tasks.filter((task) => task.columnId === 'doing')).toHaveLength(2)
    expect(tasks.filter((task) => task.columnId === 'done')).toHaveLength(2)

    tasks.forEach((task) => {
      if (task.columnId === 'done') {
        expect(task.completedAt).toBeGreaterThanOrEqual(task.createdAt)
        expect(task.completedAt).toBeLessThanOrEqual(NOW)
      } else {
        expect(task.completedAt).toBeNull()
      }
    })
  })
})