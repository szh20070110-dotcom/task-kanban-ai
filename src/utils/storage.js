export const STORAGE_KEY = 'task-kanban-state'
export const STATE_VERSION = 1
export const COLUMN_IDS = ['todo', 'doing', 'done']

let idCounter = 0

export function createId() {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }
  idCounter += 1
  return `${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isTaskLike(task) {
  return (
    task !== null &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    task.id.trim() !== '' &&
    typeof task.title === 'string' &&
    task.title.trim() !== ''
  )
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title.trim(),
    description: typeof task.description === 'string' ? task.description.trim() : '',
    category: typeof task.category === 'string' ? task.category.trim() : '',
    columnId: COLUMN_IDS.includes(task.columnId) ? task.columnId : 'todo',
    starred: Boolean(task.starred),
    urgent: Boolean(task.urgent),
    createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now(),
    completedAt: Number.isFinite(task.completedAt) ? task.completedAt : null,
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const rawTasks = Array.isArray(parsed)
      ? parsed
      : parsed && Array.isArray(parsed.tasks)
        ? parsed.tasks
        : null

    if (!rawTasks) return null

    return {
      tasks: rawTasks.filter(isTaskLike).map(normalizeTask),
      savedAt: parsed && Number.isFinite(parsed.savedAt) ? parsed.savedAt : null,
    }
  } catch (error) {
    console.warn('[storage] 读取本地数据失败，已降级为默认状态', error)
    return null
  }
}

export function saveState(state) {
  try {
    const tasks = state && Array.isArray(state.tasks) ? state.tasks : []
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STATE_VERSION,
        tasks,
        savedAt: Date.now(),
      }),
    )
    return true
  } catch (error) {
    console.warn('[storage] 保存本地数据失败', error)
    return false
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('[storage] 清除本地数据失败', error)
    return false
  }
}