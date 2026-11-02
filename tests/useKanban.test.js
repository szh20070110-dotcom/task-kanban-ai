import { beforeEach, describe, expect, it } from 'vitest'
import { useKanban } from '../src/composables/useKanban.js'
import { STORAGE_KEY } from '../src/utils/storage.js'

describe('useKanban', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('首次使用加载 6 条示例任务并写入本地存储', () => {
    const { tasks } = useKanban()

    expect(tasks.value).toHaveLength(6)
    expect(localStorage.getItem(STORAGE_KEY)).toContain('seed-1')
  })

  it('拖入已完成时记录完成时间，拖出时清空', () => {
    const { addTask, moveTask } = useKanban()
    const task = addTask({ title: '验证完成时间' })

    expect(task.completedAt).toBeNull()

    moveTask(task.id, 'done', 0)
    expect(task.completedAt).toEqual(expect.any(Number))

    moveTask(task.id, 'doing', 0)
    expect(task.completedAt).toBeNull()
  })

  it('直接创建到已完成列时立即记录完成时间', () => {
    const { addTask } = useKanban()
    const task = addTask({ title: '直接完成任务', columnId: 'done' })

    expect(task.completedAt).toEqual(expect.any(Number))
  })
})