<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import KanbanColumn from './components/KanbanColumn.vue'
import WeeklyStatsPanel from './components/WeeklyStatsPanel.vue'
import AddTaskModal from './components/AddTaskModal.vue'
import FunToast from './components/FunToast.vue'
import Celebration from './components/Celebration.vue'
import { useKanban } from './composables/useKanban'
import { useToast } from './composables/useToast'
import { pickMessage } from './config/toastMessages'

const {
  columns,
  tasks,
  stats,
  categories,
  getColumnTasks,
  addTask,
  removeTask,
  toggleTask,
  moveTask,
  reset,
} = useKanban()

const { success, info } = useToast()

const modalOpen = ref(false)
const targetColumnId = ref('todo')
const draggingId = ref(null)
const celebrationVisible = ref(false)
const celebrationEffect = ref('confetti')
const celebrationEffects = ['confetti', 'stars', 'hearts']

function openAdd(columnId = 'todo') {
  targetColumnId.value = columns.some((column) => column.id === columnId) ? columnId : 'todo'
  modalOpen.value = true
}

function closeAdd() {
  modalOpen.value = false
}

function handleSubmit(payload) {
  const task = addTask(payload)
  if (!task) return
  modalOpen.value = false
  success(pickMessage('add'))
}

function handleToggle(taskId, field) {
  const task = toggleTask(taskId, field)
  if (!task) return
  if (field === 'starred') {
    success(pickMessage(task.starred ? 'star' : 'unstar'))
  } else if (field === 'urgent') {
    success(pickMessage(task.urgent ? 'urgent' : 'urgent-off'))
  }
}

function handleRemove(taskId) {
  if (removeTask(taskId)) {
    success(pickMessage('delete'))
  }
}

function handleMove(taskId, columnId, index) {
  const result = moveTask(taskId, columnId, index)
  if (!result) return

  if (columnId === 'done' && result.previousColumnId !== 'done') {
    celebrationEffect.value =
      celebrationEffects[Math.floor(Math.random() * celebrationEffects.length)]
    celebrationVisible.value = true
  }

  success(pickMessage('move'))
}

function handleReset() {
  if (tasks.value.length === 0) {
    info('看板已经是空的啦 🌿')
    return
  }
  if (typeof window !== 'undefined' && !window.confirm('确定要清空所有任务吗？此操作不可撤销。')) {
    return
  }
  reset()
  success(pickMessage('reset'))
}

function onGlobalKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
    event.preventDefault()
    openAdd('todo')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <div class="app-shell">
    <div class="ambient ambient--one" aria-hidden="true"></div>
    <div class="ambient ambient--two" aria-hidden="true"></div>

    <NavBar :tasks="tasks" @add-task="openAdd('todo')" @reset="handleReset" />

    <main class="board-wrap">
      <div class="board-head">
        <div>
          <p class="eyebrow">WORKSPACE</p>
          <h2 class="board-title">今天想推进什么？</h2>
        </div>
        <div class="board-meta">
          <span class="progress-label">
            完成度
            <strong>{{ stats.completion }}%</strong>
          </span>
          <span class="shortcut-hint">Ctrl + N 快速新增</span>
        </div>
      </div>

      <WeeklyStatsPanel :tasks="tasks" />

      <div class="board" data-test="board">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :task-list="getColumnTasks(column.id)"
          :dragging-id="draggingId"
          @move="handleMove"
          @toggle="handleToggle"
          @remove="handleRemove"
          @add-task="openAdd"
          @drag-start="draggingId = $event"
          @drag-end="draggingId = null"
        />
      </div>
    </main>

    <footer class="app-footer">
      <span>数据自动保存在浏览器本地</span>
      <span class="footer-dot" aria-hidden="true">·</span>
      <span>拖拽卡片即可流转状态</span>
    </footer>

    <AddTaskModal
      v-if="modalOpen"
      :columns="columns"
      :existing-categories="categories"
      :initial-column-id="targetColumnId"
      @submit="handleSubmit"
      @close="closeAdd"
    />

    <FunToast />
    <Celebration
      :visible="celebrationVisible"
      :effect="celebrationEffect"
      @complete="celebrationVisible = false"
    />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.ambient {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
  transition: background-color var(--transition-slow);
}

.ambient--one {
  top: -160px;
  right: -120px;
  width: 420px;
  height: 420px;
  background: var(--color-primary-soft);
}

.ambient--two {
  bottom: -180px;
  left: -140px;
  width: 380px;
  height: 380px;
  background: var(--color-success-soft);
}

.board-wrap {
  position: relative;
  z-index: var(--z-base);
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-6) var(--space-7);
  flex: 1;
}

.board-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: var(--color-primary);
}

.board-title {
  margin-top: 4px;
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.board-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.progress-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.progress-label strong {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--color-success);
}

.shortcut-hint {
  padding: 4px 10px;
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  align-items: start;
}

.app-footer {
  position: relative;
  z-index: var(--z-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6) var(--space-6);
  font-size: 11px;
  color: var(--color-text-muted);
}

.footer-dot {
  opacity: 0.6;
}

@media (max-width: 900px) {
  .board-wrap {
    padding: var(--space-4) var(--space-4) var(--space-6);
  }

  .board {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }

  .board-head {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-2);
  }

  .board-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 620px) {
  .shortcut-hint {
    display: none;
  }
}
</style>