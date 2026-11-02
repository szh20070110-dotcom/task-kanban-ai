import { computed, ref, watch } from 'vue'
import { COLUMN_IDS, createId, loadState, saveState } from '../utils/storage.js'
import { createSeedTasks } from '../config/seedTasks.js'

export const columns = [
  { id: 'todo', title: '待办', color: 'var(--color-text-muted)' },
  { id: 'doing', title: '进行中', color: 'var(--color-warning)' },
  { id: 'done', title: '已完成', color: 'var(--color-success)' },
]

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function useKanban() {
  const tasks = ref([])
  const restored = loadState()
  if (restored) {
    tasks.value = restored.tasks
  } else {
    tasks.value = createSeedTasks()
    saveState({ tasks: tasks.value })
  }

  const columnCounts = computed(() => {
    const counts = { todo: 0, doing: 0, done: 0 }
    tasks.value.forEach((task) => {
      counts[task.columnId] = (counts[task.columnId] ?? 0) + 1
    })
    return counts
  })

  const categories = computed(() => {
    const seen = new Set()
    tasks.value.forEach((task) => {
      if (task.category) seen.add(task.category)
    })
    return [...seen].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  })

  const stats = computed(() => {
    const total = tasks.value.length
    const done = columnCounts.value.done
    return {
      total,
      todo: columnCounts.value.todo,
      doing: columnCounts.value.doing,
      done,
      urgent: tasks.value.filter((task) => task.urgent).length,
      starred: tasks.value.filter((task) => task.starred).length,
      completion: total === 0 ? 0 : Math.round((done / total) * 100),
    }
  })

  function getColumnTasks(columnId) {
    return tasks.value.filter((task) => task.columnId === columnId)
  }

  function addTask(payload) {
    const title = cleanText(payload && payload.title)
    if (!title) return null

    const columnId = COLUMN_IDS.includes(payload.columnId) ? payload.columnId : 'todo'
    const task = {
      id: createId(),
      title,
      description: cleanText(payload.description),
      category: cleanText(payload.category),
      columnId,
      starred: Boolean(payload.starred),
      urgent: Boolean(payload.urgent),
      createdAt: Date.now(),
      completedAt: columnId === 'done' ? Date.now() : null,
    }

    tasks.value.push(task)
    return task
  }

  function removeTask(taskId) {
    const index = tasks.value.findIndex((task) => task.id === taskId)
    if (index === -1) return false
    tasks.value.splice(index, 1)
    return true
  }

  function toggleTask(taskId, field) {
    if (field !== 'starred' && field !== 'urgent') return null
    const task = tasks.value.find((item) => item.id === taskId)
    if (!task) return null
    task[field] = !task[field]
    return task
  }

  function moveTask(taskId, columnId, dropIndex) {
    if (!COLUMN_IDS.includes(columnId)) return null

    const index = tasks.value.findIndex((task) => task.id === taskId)
    if (index === -1) return null

    const [task] = tasks.value.splice(index, 1)
    const previousColumnId = task.columnId
    task.columnId = columnId

    if (columnId === 'done' && previousColumnId !== 'done') {
      task.completedAt = Date.now()
    } else if (columnId !== 'done') {
      task.completedAt = null
    }

    const siblings = tasks.value.filter((item) => item.columnId === columnId)
    const targetIndex = Number.isInteger(dropIndex)
      ? Math.min(Math.max(dropIndex, 0), siblings.length)
      : siblings.length

    if (siblings.length === 0) {
      tasks.value.push(task)
      return { task, previousColumnId }
    }

    if (targetIndex >= siblings.length) {
      const lastIndex = tasks.value.indexOf(siblings[siblings.length - 1])
      tasks.value.splice(lastIndex + 1, 0, task)
    } else {
      const beforeIndex = tasks.value.indexOf(siblings[targetIndex])
      tasks.value.splice(beforeIndex, 0, task)
    }

    return { task, previousColumnId }
  }

  function reset() {
    tasks.value.splice(0, tasks.value.length)
  }

  watch(
    tasks,
    () => {
      saveState({ tasks: tasks.value })
    },
    { deep: true },
  )

  return {
    columns,
    tasks,
    columnCounts,
    categories,
    stats,
    getColumnTasks,
    addTask,
    removeTask,
    toggleTask,
    moveTask,
    reset,
  }
}