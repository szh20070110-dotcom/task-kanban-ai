import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  clearState,
  createId,
  loadState,
  saveState,
} from '../src/utils/storage.js'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('没有本地数据时返回 null', () => {
    expect(loadState()).toBeNull()
  })

  it('保存后可以完整读回任务数据', () => {
    const tasks = [
      {
        id: 'task-1',
        title: '编写项目文档',
        description: '补充使用说明',
        category: '文档',
        columnId: 'doing',
        starred: true,
        urgent: false,
        createdAt: 1700000000000,
      },
    ]

    expect(saveState({ tasks })).toBe(true)

    const state = loadState()
    expect(state).not.toBeNull()
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0]).toMatchObject({
      id: 'task-1',
      title: '编写项目文档',
      description: '补充使用说明',
      category: '文档',
      columnId: 'doing',
      starred: true,
      urgent: false,
      createdAt: 1700000000000,
    })
  })

  it('JSON 损坏时降级返回 null', () => {
    localStorage.setItem(STORAGE_KEY, '{ this is not json')
    expect(loadState()).toBeNull()
  })

  it('数据结构不合法时降级返回 null', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    expect(loadState()).toBeNull()
  })

  it('过滤非法任务并补全缺失字段', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tasks: [
          { id: 'ok-1', title: '合法任务' },
          { id: '', title: '缺少 ID' },
          { title: '缺少标题' },
          null,
          { id: 'ok-2', title: '  带空格标题  ', columnId: 'unknown' },
        ],
      }),
    )

    const state = loadState()
    expect(state.tasks).toHaveLength(2)
    expect(state.tasks[0]).toMatchObject({
      id: 'ok-1',
      title: '合法任务',
      columnId: 'todo',
      starred: false,
      urgent: false,
    })
    expect(state.tasks[1].title).toBe('带空格标题')
    expect(state.tasks[1].columnId).toBe('todo')
  })

  it('createId 生成的 ID 不重复', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId()))
    expect(ids.size).toBe(500)
    ids.forEach((id) => expect(typeof id).toBe('string'))
  })

  it('clearState 可以清除本地数据', () => {
    saveState({ tasks: [{ id: 't-1', title: '任务' }] })
    expect(loadState()).not.toBeNull()

    expect(clearState()).toBe(true)
    expect(loadState()).toBeNull()
  })
})